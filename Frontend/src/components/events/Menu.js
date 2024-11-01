import React, { useEffect, useState } from 'react';
import {UserCircle, Trash, ChevronDown, ChevronUp, Plus, Minus, MapPin, ShoppingCart, X } from 'lucide-react';
import { Navigate, useLocation,Link, useNavigate } from 'react-router-dom';
import { addtocart, cartToOrder, removeFromCart } from './action';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// ToggleSwitch Component
const ToggleSwitch = ({ isOn, onToggle }) => (
  <div
    className={`w-8 h-4 flex items-center rounded-full p-1 cursor-pointer ${isOn ? `bg-red-500` : `bg-gray-300`}`}
    onClick={onToggle}
  >
    <div
      className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${isOn ? `translate-x-4` : `translate-x-0`}`}
    ></div>
  </div>
);

// MenuItem Component
const MenuItem = ({ item, checked, toggleState, onToggleUnit, onCheck, mainToggleOn }) => {
  const shouldDisplayToggle = item['plate_units'] !== null && item['wtorvol_units'] !== null;
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4 flex flex-col border-b-2 border-green-700">
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={handleToggle}
      >
       <div className="flex items-center flex-grow">
            <img src={item.Image} alt={item['productname']} className="w-16 h-16 object-cover rounded mr-4" />
            <div className="flex items-center">
              <h3 className="font-semibold text-gray-800">{item['productname']}</h3>
              <input
                type="checkbox"
                checked={checked}
                onChange={onCheck}
                className="ml-2 w-12" 
                style={{ margin: '0 0 2px 0', width: '12px', height: '12px', margin: '7px' }} 
              />
            </div>
          </div>
        {shouldDisplayToggle && (
          <div className="flex items-center">
            <ToggleSwitch
              isOn={toggleState[item['productid']] === 'wtorvol_units'}
              onToggle={() => onToggleUnit(item['productid'])}
            />
          </div>
        )}
        <p className="ml-2">
          {toggleState[item['productid']] === 'wtorvol_units' ? item['wtorvol_units'] : item['plate_units']}
        </p>
        {isOpen ? (
          <ChevronUp size={20} className="text-gray-600 ml-2" />
        ) : (
          <ChevronDown size={20} className="text-gray-600 ml-2" />
        )}
      </div>
      {isOpen && (
        <div className="p-4 bg-gray-50">
          <p className="text-gray-600">Details about {item['productname']}</p>
        </div>
      )}
    </div>
  );
};

// MenuCategory Component
const MenuCategory = ({ category, items, checkedItems, toggleState, onToggleUnit, onCheck, mainToggleOn }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 bg-white rounded-lg shadow ">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800">{category}</span>
        <div className="flex items-center">
          <span className="mr-2 text-green-700 font-medium">{items.length} </span>
          {isOpen ? (
            <ChevronUp size={20} className="text-green-700" />
          ) : (
            <ChevronDown size={20} className="text-green-700" />
          )}
        </div>
      </button>
      {isOpen && (
        <div>
          {items.map(item => (
            <MenuItem
              key={item['productid']}
              item={item}
              checked={checkedItems[item['productid']] || false}
              toggleState={toggleState}
              onToggleUnit={onToggleUnit}
              onCheck={() => onCheck(item['productid'])}
              mainToggleOn={mainToggleOn}
            />
          ))}
        </div>
      )}
    </div>
  );
};




const CartSidebar = ({ isOpen, onClose, cartItems, numberOfPlates, selectedDate, onUpdateQuantity, toggleState, onToggleUnit, address,selectedTime, onRemoveItem}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartId, setCartId] = useState(0);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [localQuantities, setLocalQuantities] = useState({});
  const navigate = useNavigate();

  const calculateTotalItemCost = (item, numberOfPlates, selectedUnit, quantity) => {
    let totalCost;
  
    if (selectedUnit === 'plate_units') {
      const priceperunit = item['priceperunit'];
      console.log("priceperunit",priceperunit);
      // const minunitsperplate = item['minunitsperplate'];
      totalCost = (priceperunit * numberOfPlates * quantity).toFixed(2);
      
    } 
    else if (selectedUnit === 'wtorvol_units') {
      const price_per_wtorvol_units = item['price_per_wtorvol_units'];
      const min_wtorvol_units_per_plate = item['min_wtorvol_units_per_plate'];
      
       const costperkg = price_per_wtorvol_units * 1000;
       console.log("huhu",costperkg)
        // totalCost = costperkg;
       if (quantity<1){
        totalCost=quantity * costperkg * numberOfPlates
        console.log("quantity:",quantity);
        console.log("costperkg:",costperkg);
        console.log("numberofplates:",numberOfPlates);
        console.log("TOTALcOST:",totalCost);
       }
       else{
        totalCost=costperkg*quantity
       }
      
       console.log("total",totalCost);
    } else {
      throw new Error('Invalid selected unit');
    }
  
    return totalCost; 
  };


  const totalAmount = cartItems.reduce((sum, item) => {
    const selectedUnit = toggleState[item['productid']] || item['plate_units'] || item['wtorvol_units'];
    const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, localQuantities[item.productid] || item.quantity);
    return sum + parseFloat(totalItemCost);
  }, 0).toFixed(2);

  const cartData = cartItems.map(item => ({
    addedat: item.addedat,
    category_name: item.category_name,
    image: item.image,
    isdual: item.isdual,
    price_category: item.price_category,
    minunitsperplate: item.minunitsperplate || 1,
    priceperunit: item.priceperunit,
    min_wtorvol_units_per_plate : item.min_wtorvol_units_per_plate,
    price_per_wtorvol_units:item.price_per_wtorvol_units,
    productid: item.productid,
    product_id: item.product_id,
    productname: item.productname,
    quantity: item.quantity,
    unit: toggleState[item['productid']] || item['plate_units'] || item['wtorvol_units']
  }));

  const cart = { totalAmount, cartData, address, numberOfPlates, selectedDate , selectedTime};

  console.log("cartdata:",cartData);


  const handleInputChange = (itemId, value) => {
    const newQuantity = value === '' ? '' : Number(value);
    setLocalQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleBlur = (itemId, quantity, minunitsperplate) => {
    if (quantity < 1) {
      return; // Keep the value as it is
    }
    const newQuantity = quantity < minunitsperplate ? minunitsperplate : quantity;
    setLocalQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    onUpdateQuantity(itemId, newQuantity);
  };

  const updateQuantity = (itemId, newQuantity) => {
    setLocalQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleIncrease = (itemId) => {
    const currentQuantity = localQuantities[itemId] || 1;
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecrease = (itemId) => {
    const currentQuantity = localQuantities[itemId] || 1;
    const newQuantity = Math.max(currentQuantity - 1, 1);
    updateQuantity(itemId, newQuantity);
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      const {cart_id} = await addtocart(cart);
      setCartId(cart_id);
    }, 1000);
    return () => clearTimeout(delay);
  }, [cartItems]);

  const handleSubmit = async (e) => {
    setLoading(true);
    try {
      const respond = await cartToOrder(cartId);
      const response = await axios.post('http://localhost:4000/pay', {
        amount: totalAmount,
        corporateorder_id: respond.eventorder_generated_id
      }, { headers: { token: `${localStorage.getItem('token')}` } });

      if (response.data && response.data.redirectUrl) {
        setRedirectUrl(response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
      } else {
        console.log('Unexpected response format.');
      }
    } catch (err) {
      setError(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productid) => {
    try {
      await removeFromCart(productid, cartId);
      onRemoveItem(productid);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-b from-[#008000] to-[#70c656] p-2">
          <div className="relative">
            <div className="absolute right-0 flex flex-col items-end">
              <button onClick={onClose} className="text-white hover:text-gray-200 ">
                <X size={24} />
              </button>
              <button 
                onClick={() => navigate('/changeaddress')}  
                className="bg-pink-100 text-pink-500 px-1 py-1 rounded-full mt-14"
              >
                Change Address
              </button>
            </div>
            <div className="flex items-center mt-2">
              <ShoppingCart size={24} className="text-white mr-2" />
              <h2 className="text-xl font-bold text-white">My Cart</h2>
            </div>
            <div className="text-white flex items-center mt-5">
              <MapPin size={20} className="mr-2" />
              <div>
                <p>{address.line1}</p>
                <p>{address.line2}</p>
                <p>{address.pincode}</p>
              </div>
            </div>
          </div>    
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {cartItems.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-full text-gray-600 text-lg">
                Your cart is empty. Fill the cart to proceed.
              </div>
            ) : (
              cartItems.map(item => {
                const minunitsperplate = item['minunitsperplate'] || 1;
                const selectedUnit = toggleState[item['productid']] || item['plate_units'] || item['wtorvol_units'];

                return (
                  <div key={item['productid']} className="flex flex-col border border-pink-500 rounded-lg shadow-sm p-2">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center top-7 right-8"> 
                        <img src={item.Image} alt={item['productname']} className="w-17 h-17 object-cover rounded mr-2" />
                        <button 
                          onClick={() => handleDelete(item['productid'])}
                          className="text-red-500 right-5 hover:text-red-700" 
                          title="Remove from cart" 
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">{item['productname']}</h3>                
                      {item['plate_units'] && item['wtorvol_units'] && (
                        <div className="flex items-center mb-2">
                          <ToggleSwitch
                            isOn={toggleState[item['productid']] === 'wtorvol_units'}
                            onToggle={() => onToggleUnit(item['productid'])}
                          />
                          <p className="ml-2">
                            {toggleState[item['productid']] === 'wtorvol_units' ? (
                              item['wtorvol_units'] && item['wtorvol_units'].toLowerCase().includes('grams') ? (
                                item['wtorvol_units'].replace('grams', 'kg')
                              ) : item['wtorvol_units'].toLowerCase().includes('ml') ? (
                                item['wtorvol_units'].replace('ml', 'L')
                              ) : (
                                item['wtorvol_units']
                              )
                            ) : (
                              item['plate_units']
                            )}
                          </p>        
                        </div>
                      )}
                      {!item['wtorvol_units'] && <p>{item['plate_units']}</p>}
                      <p className="text-sm text-gray-600 mb-1 flex flex-col items-center">
                      <span className="text-gray-700 mt-1">
                        {(() => {
                          const selectedUnit = toggleState[item['productid']] === 'wtorvol_units' ? 'wtorvol_units' : 'plate_units';
                          const quantity = item.quantity; 
                          const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, quantity);

                          let calculationString;
                          let totalCost;
                          if (selectedUnit === 'plate_units') {
                            const priceperunit = item['priceperunit'];
                            calculationString = `${quantity} * ${priceperunit} * ${numberOfPlates} = `;
                          } else if (selectedUnit === 'wtorvol_units') {
                            const price_per_wtorvol_units = item['price_per_wtorvol_units'];
                            const costperkg = price_per_wtorvol_units * 1000; 
                            if (quantity<1){
                              totalCost=quantity * costperkg * numberOfPlates
                             
                              // calculationString = `${quantity} * ${numberOfPlates} * ${costPerKg} =`
                              calculationString=`${quantity} * ${costperkg}=`
                             }
                             else{
                              totalCost=costperkg*quantity
                              calculationString = `${costperkg} * ${quantity} =`
                             }
                            
                          }

                          return (
                            <>
                              {calculationString}
                              <span className="text-gray-800 font-semibold">₹{totalItemCost}</span>
                            </>
                          );
                        })()}
                      </span>
                    </p>
                    </div>
                      
                    <div className="flex items-center justify-center mb-2">
                      <button 
                        onClick={() => handleDecrease(item['productid'])} 
                        className="p-1 bg-green-500 text-white rounded-l"
                      >
                        <Minus size={14} />
                      </button>
                      <input 
                        type="number" 
                        value={localQuantities[item.productid] || item.quantity} 
                        onChange={(e) => handleInputChange(item['productid'], e.target.value)} 
                        onBlur={() => handleBlur(item['productid'], localQuantities[item.productid] || item.quantity, minunitsperplate)} 
                        className="w-12 text-center px-2 py-1 border"
                        min="1"
                      />      
                      <button 
                        onClick={() => handleIncrease(item['productid'])} 
                        className="p-1 bg-green-500 text-white rounded-r"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t">
            <div className="text-xl font-bold text-gray-800 mb-2">
              Total Amount: ₹{totalAmount}
            </div>
            <button 
              onClick={handleSubmit} 
              className="w-full py-2 px-4 bg-yellow-500 text-gray-800 font-bold rounded"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );

  
};
