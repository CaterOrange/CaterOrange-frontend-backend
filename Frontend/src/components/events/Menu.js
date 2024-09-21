import React, { useEffect, useState } from 'react';
import { Trash, ChevronDown, ChevronUp, Plus, Minus, MapPin, ShoppingCart, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { addtocart, cartToOrder, removeFromCart } from './action';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

// ToggleSwitch Component
const ToggleSwitch = ({ isOn, onToggle }) => (
  <div
    className={`w-8 h-4 flex items-center rounded-full p-1 cursor-pointer ${isOn ? `bg-green-500` : `bg-gray-300`}`}
    onClick={onToggle}
  >
    <div
      className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${isOn ? `translate-x-4` : `translate-x-0`}`}
    ></div>
  </div>
);

// MenuItem Component
const MenuItem = ({ item, checked, toggleState, onToggleUnit, onCheck, mainToggleOn }) => {
  const shouldDisplayToggle = item['units'] !== null && item['units2'] !== null;
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-4 flex flex-col border-b border-gray-200">
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex items-center flex-grow">
          <img src={item.image} alt={item['productname']} className="w-16 h-16 object-cover rounded mr-4" />
          <div className="flex items-center">
            <h3 className="font-semibold text-gray-800">{item['productname']}</h3>
            <input
              type="checkbox"
              checked={checked}
              onChange={onCheck}
              className="ml-2"
            />
          </div>
        </div>
        {shouldDisplayToggle && (
          <div className="flex items-center">
            <ToggleSwitch
              isOn={toggleState[item['productid']] === 'units2'}
              onToggle={() => onToggleUnit(item['productid'])}
            />
          </div>
        )}
        <p className="ml-2">
          {toggleState[item['productid']] === 'units2' ? item['units2'] : item['units']}
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
    <div className="mb-4 bg-white rounded-lg shadow pt-4">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800">{category}</span>
        {isOpen ? <ChevronUp size={20} className="text-green-700" /> : <ChevronDown size={20} className="text-green-700"/>}
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

// CartSidebar Component
const CartSidebar = ({ isOpen, onClose, cartItems, numberOfPlates, selectedDate, onUpdateQuantity, toggleState, onToggleUnit, address, onRemoveItem }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartId, setCartId] = useState(0);
  const [redirectUrl, setRedirectUrl] = useState('');

  const calculateTotalItemCost = (item, numberOfPlates, selectedUnit, quantity) => {
    const pricePerUnit = selectedUnit === 'units2' ? item['priceperunits2'] : item['priceperunit'];
    return (pricePerUnit * quantity * numberOfPlates).toFixed(2);
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const selectedUnit = toggleState[item['productid']] || item['units'] || item['units2'];
    const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, item.quantity);
    return sum + parseFloat(totalItemCost);
  }, 0).toFixed(2);

  const cartData = cartItems.map(item => ({
    addedat: item.addedat,
    category_name: item.category_name,
    image: item.image,
    isdual: item.isdual,
    minunitsperplate: item.minunitsperplate || 1,
    price_category: item.price_category,
    priceperunit: item.priceperunit,
    product_id_from_csv: item.product_id_from_csv,
    productid: item.productid,
    productname: item.productname,
    quantity: item.quantity,
    unit: toggleState[item['productid']] || item['units'] || item['units2']
  }));

  const cart = { totalAmount, cartData, address, numberOfPlates, selectedDate };

  const handleInputChange = (itemId, value) => {
    const newQuantity = value === '' ? '' : Number(value);
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleBlur = (itemId, quantity, minUnitsPerPlate) => {
    const newQuantity = quantity < minUnitsPerPlate ? minUnitsPerPlate : quantity;
    onUpdateQuantity(itemId, newQuantity);
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      const { cart_id } = await addtocart(cart);
      setCartId(cart_id);
    }, 1000);
    return () => clearTimeout(delay);
  }, [cart]);

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

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const customer_id = decoded.id;

      // Call removeFromCart function to handle backend/database removal
      await removeFromCart(productId,cartId);

      // Call onRemoveItem to update parent state and local storage
      onRemoveItem(productId);
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="bg-gradient-to-b from-[#008000] to-[#70c656] p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart size={24} className="text-white mr-2" />
              <h2 className="text-xl font-bold text-white">My Cart</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          <div className="mt-2 text-white flex items-center">
            <MapPin size={20} className="mr-2" />
            <div>
              <p>{address.line1}</p>
              <p>{address.line2}</p>
              <p>{address.pincode}</p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cartItems.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-full text-gray-600 text-lg">
                Your cart is empty. Fill the cart to proceed.
              </div>
            ) : (
              cartItems.map(item => {
                const minUnitsPerPlate = item['minunitsperplate'] || 1;
                const selectedUnit = toggleState[item['productid']] || item['units'] || item['units2'];
                const selectedUnitPrice = selectedUnit === 'units2' ? item['priceperunits2'] : item['priceperunit'];
                const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, item.quantity);

                return (
                  <div key={item['productid']} className="flex flex-col mb-4 border rounded-lg shadow-sm p-4">
                    <div className="flex flex-col items-center mb-2">
                      <h3 className="font-semibold text-gray-800 mb-1">{item['productname']}</h3>
                      <img src={item.image} alt={item['productname']} className="w-24 h-24 object-cover rounded mb-2" />
                      <button 
                        onClick={() => handleDelete(item['productid'])}
                        className="text-red-500 hover:text-red-700 mb-2"
                        title="Remove from cart"
                      >
                        <Trash size={20} />
                      </button>
                      {item['units'] && item['units2'] && (
                        <div className="flex items-center mb-2">
                          <ToggleSwitch
                            isOn={toggleState[item['productid']] === 'units2'}
                            onToggle={() => onToggleUnit(item['productid'])}
                          />
                          <p className="ml-2">
                            {toggleState[item['productid']] === 'units2' ? item['units2'] : item['units']}
                          </p>
                        </div>
                      )}
                      {!item['units2'] && <p>{item['units']}</p>}
                      <p className="text-sm text-gray-600 mb-2 flex flex-col items-center">
                        <span className="text-gray-700 mt-1">
                          {`${selectedUnitPrice} * ${item.quantity} * ${numberOfPlates} = `}
                          <span className="text-gray-800 font-semibold">${totalItemCost}</span>
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-center mb-2">
                      <button 
                        onClick={() => onUpdateQuantity(item['productid'], Math.max(item.quantity - 1, 1))} 
                        className="p-1 bg-green-500 text-white rounded-l"
                      >
                        <Minus size={14} />
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={(e) => handleInputChange(item['productid'], e.target.value)} 
                        onBlur={() => handleBlur(item['productid'], item.quantity, minUnitsPerPlate)} 
                        className="w-12 text-center px-2 py-1 border"
                        min="0"
                      />
                      <button 
                        onClick={() => onUpdateQuantity(item['productid'], item.quantity + 1)} 
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
              Total Amount: ${totalAmount}
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





// Menu Component
const Menu = () => {
  const [menuData, setMenuData] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [toggleState, setToggleState] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mainToggleOn, setMainToggleOn] = useState(false);
  const location = useLocation();
  const numberOfPlates = location.state?.numberOfPlates || 1;
  const selectedDate = location.state?.selectedDate;
  const address = location.state?.address || {
    line1: 'address.line1',
    line2: 'address.line2',
    pincode: 'address.pincode',
  };

  // Handle unit toggle
  const onToggleUnit = (productId) => {
    const newToggleState = {
      ...toggleState,
      [productId]: toggleState[productId] === 'units2' ? 'units' : 'units2'
    };
    setToggleState(newToggleState);
    localStorage.setItem('toggleState', JSON.stringify(newToggleState));
  };

  useEffect(() => {
    // Load cart data from local storage
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCheckedItems(parsedCart.checkedItems || {});
      setQuantities(parsedCart.quantities || {});
    }

    // Load toggle state from local storage
    const storedToggleState = localStorage.getItem('toggleState');
    if (storedToggleState) {
      setToggleState(JSON.parse(storedToggleState));
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transformedData = data.reduce((acc, item) => {
          const category = item['category_name'];
          if (!acc[category]) {
            acc[category] = { category, items: [] };
          }

          acc[category].items.push(item);
          return acc;
        }, {});

        setMenuData(Object.values(transformedData));

        // Initialize toggle state for new items
        const initialToggleState = { ...toggleState };
        data.forEach(item => {
          if (!(item['productid'] in initialToggleState)) {
            initialToggleState[item['productid']] = 'units';
          }
        });
        setToggleState(initialToggleState);
        localStorage.setItem('toggleState', JSON.stringify(initialToggleState));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (mainToggleOn) {
      const newToggleState = Object.keys(toggleState).reduce((acc, itemId) => {
        acc[itemId] = 'units2';
        return acc;
      }, {});
      setToggleState(newToggleState);
      localStorage.setItem('toggleState', JSON.stringify(newToggleState));
    } else {
      const newToggleState = Object.keys(toggleState).reduce((acc, itemId) => {
        acc[itemId] = 'units';
        return acc;
      }, {});
      setToggleState(newToggleState);
      localStorage.setItem('toggleState', JSON.stringify(newToggleState));
    }
  }, [mainToggleOn]);

  const updateQuantity = (itemId, newQuantity) => {
    const newQuantities = { ...quantities, [itemId]: newQuantity };
    setQuantities(newQuantities);
    updateLocalStorage(checkedItems, newQuantities);
  };

  const handleCheck = (itemId) => {
    const newCheckedItems = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(newCheckedItems);
    const newQuantities = { ...quantities };
    if (!checkedItems[itemId]) {
      newQuantities[itemId] = 1;
    } else {
      delete newQuantities[itemId];
    }
    setQuantities(newQuantities);
    updateLocalStorage(newCheckedItems, newQuantities);
  };

  const updateLocalStorage = (checkedItems, quantities) => {
    localStorage.setItem('cartItems', JSON.stringify({ checkedItems, quantities }));
  };

  const removeItem = (productId) => {
    // Update checkedItems
    const newCheckedItems = { ...checkedItems };
    delete newCheckedItems[productId];
    setCheckedItems(newCheckedItems);

    // Update quantities
    const newQuantities = { ...quantities };
    delete newQuantities[productId];
    setQuantities(newQuantities);

    // Update local storage
    updateLocalStorage(newCheckedItems, newQuantities);
  };

  const cartItems = menuData.flatMap(category =>
    category.items
      .filter(item => quantities[item['productid']] > 0)
      .map(item => ({
        ...item,
        quantity: quantities[item['productid']],
        unit: toggleState[item['productid']] || item['units']
      }))
  );

  return (
    <div className="bg-gradient-to-b from-[#008000]">
      <div className="top-0 left-0 w-full bg-gradient-to-b from-[#008000] to-[#70c656] z-50">
        <div className="flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-bold text-white">EVENT MENU CARD</h1>
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative bg-green-500 text-white p-2 rounded"
          >
            <div>
              <ShoppingCart size={24} />
            </div>
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      
        <div className="flex justify-end py-2 mr-6">
          <ToggleSwitch
            isOn={mainToggleOn} 
            onToggle={() => setMainToggleOn(prev => !prev)}
          />
        </div>
      </div>
      <div className="p-6">
        {menuData.map(category => (
          <MenuCategory
            key={category.category}
            category={category.category}
            items={category.items}
            checkedItems={checkedItems}
            toggleState={toggleState}
            onToggleUnit={onToggleUnit} 
            onCheck={handleCheck}
            mainToggleOn={mainToggleOn}  
          />
        ))}
      </div>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        numberOfPlates={numberOfPlates}  
        onUpdateQuantity={updateQuantity}
        toggleState={toggleState}
        onToggleUnit={onToggleUnit} 
        mainToggleOn={mainToggleOn}
        address={address} 
        selectedDate={selectedDate}
        onRemoveItem={removeItem}
      />
    </div>
  );
};

export default Menu;