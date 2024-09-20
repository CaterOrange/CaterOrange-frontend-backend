import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

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
const MenuItem = ({ item, isdual,checked, unit, onToggleUnit, onCheck, mainToggleOn }) => {
  // const shouldDisplayToggle = isdual === 'true';
  const shouldDisplayToggle = item['units'] !== null && item['units2'] !== null;
  const [toggleState, setToggleState] = useState(false);

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200">
      <div className="flex items-center flex-grow">
        <img src={item.image} alt={item['productname']} className="w-16 h-16 object-cover rounded mr-4" />
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{item['productname']}</h3>

          <input
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="ml-2"
          />
        </div>
      </div>
      {shouldDisplayToggle && ( // Conditionally render the toggle bar
        // <div className={`flex items-center ${mainToggleOn ? alert(`hello`) : `justify-start`}`}>
          <div className="flex items-center">
            <ToggleSwitch
              isOn={toggleState[item['productid']] === 'units2'}
              onToggle={() => {
                setToggleState((prevState) => ({
                  ...prevState,
                  [item['productid']]: prevState[item['productid']] === 'units2' ? 'units' : 'units2',
                }));
              }}
            />
           
          </div>
        // </div>
        
      )}
       <p>
      {toggleState[item['productid']] === 'units2' ? item['units2'] : item['units']}
      </p>
      
</div>
);
};

// MenuCategory Component
const MenuCategory = ({ category, items, checkedItems, units, onToggleUnit, onCheck, mainToggleOn }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 bg-white rounded-lg shadow">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800">{category}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div>
          {items.map(item => (
            <MenuItem
              key={item['productid']}
              item={item}
              isdual={item['isdual'] === 'true'}
              checked={checkedItems[item['productid']] || false}
              unit={units[item['productid']] || item['units']}
              onToggleUnit={() => onToggleUnit(item['productid'])}
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
const CartSidebar = ({isOpen, onClose, cartItems, numberOfPlates, onUpdateQuantity,mainToggleOn,address }) => {
  // const shouldDisplayToggle = item['units'] !== null && item['units2'] !== null;
  const [toggleState, setToggleState] = useState({});

  function calculateTotalItemCost(item, numberOfPlates, selectedUnit, quantity) {
    let totalItemCost = 0;
    console.log("units",item['units']);
    console.log("numberofplates",numberOfPlates);
    console.log("selectedunits_1",selectedUnit);
    console.log("quantity",quantity);
  
    if (selectedUnit === item['units']) {
      const priceperunit = item['priceperunit'];
      totalItemCost = numberOfPlates * priceperunit * quantity;
      console.log("total",totalItemCost)
    } else if (selectedUnit === 'units2') {
      // const costPerSmallerUnit = item['priceperunit'] / item['minunitsperplate'];
      totalItemCost = item['priceperunits2'] * quantity * numberOfPlates;
      console.log("total cost",totalItemCost)

      // totalItemCost = costPerSmallerUnit * quantity * numberOfPlates;
      // console.log("total2",totalItemCost);
    } else if (item['price_category'] === 'wt/qty' || item['price_category'] === 'lt') {
      totalItemCost = quantity * item['priceperunit'];
    }
    // console.log()
  
    return totalItemCost.toFixed(2);
  }
  // Calculate total amount

  const totalAmount = cartItems.reduce((sum, item) => {
    const selectedUnit = toggleState[item['productid']] || item['units'] || item['units2'];
    console.log("item",item);
    console.log("numberofplates",numberOfPlates);
    console.log("selectedunits_1",selectedUnit);
    console.log("quantity",item.quantity);
     
    const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, item.quantity);
    console.log("in total",totalItemCost);
    return sum + parseFloat(totalItemCost);
  }, 0).toFixed(2);
 
  useEffect(() => {
    const postCartItems = async () => {
      // Construct the address, total amount, and cart order details
      const address = {
        street: "123 Main St",
        city: "New York",
        zip_code: "10001",
        country: "USA"
      };

      
  
      const cartOrderDetails = cartItems.map(item => ({
        product_id: item.productid, // Ensure the product id is correct
        product_name: item.productname,
        quantity: item.quantity,
        unit: item.unit,
        price_per_unit: item.priceperunit
      }));
  
     
      const payload = {
        total_amount: totalAmount,  // Total amount from your calculation
        cart_order_details: cartOrderDetails,  // Map cart items into the required format
        address  // Address information
      };
      console.log("payload",payload);
      try {
        console.log("kukuku")
        // Send the data as JSON to the backend
        const response = await axios.post('http://localhost:5000/api/cart/add', payload, {
          headers: {
            'Content-Type': 'application/json'  // Ensure the request is sent as JSON
          }
        });
        console.log("huhuhu")
        
        console.log("Response from backend:", response.data.cartItem);  
        cartdata = response.data.cartItem.eventcart_id;
  
        if (response.status === 200) {
          console.log('Cart items successfully posted to the backend');
        } else {
          console.error(`Error: Received status code ${response.status}`);
        }
      } catch (err) {
        if (err.response) {
          console.error("Error posting:", err.response.data); 
        } else {
          console.error("Error posting cart items:", err.message);  
        }
      }
    };
  
    postCartItems();
  }, [cartItems, totalAmount]);  

let cartdata;

  
const AddressCard = ({ address }) => (
  <div className="bg-white shadow-md rounded-lg p-4 mb-4">
    <h3 className="text-lg font-bold text-gray-800 mb-2 ">Delivery Address:</h3>
    {/* <p className="text-gray-600">{address.street}</p> */}
    <p className="text-gray-600">{address.city}</p>
    <p className="text-gray-600">{address.zip_code}</p>
    <p className="text-gray-600">{address.country}</p>
  </div>
);
  
  // const navigate = useNavigate();
 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  // Handle input value change
// Allow free input without restrictions
const handleInputChange = (itemId, value) => {
  // Allow empty string input but don't update the quantity just yet
  const newQuantity = value === '' ? '' : Number(value); 
  onUpdateQuantity(itemId, newQuantity); // Update the quantity in state
};


const handleToggle = (itemId) => {
  setToggleState((prevState) => ({
    ...prevState,
    [itemId]: prevState[itemId] === 'units2' ? 'units' : 'units2',
  }));
};

// Reset to minimum if the input is invalid or empty on blur
const handleBlur = (itemId, quantity, minUnitsPerPlate) => {
  // Reset to the minimum allowed quantity if the input is empty or less than the min
  const newQuantity = quantity < minUnitsPerPlate ? minUnitsPerPlate : quantity;
  onUpdateQuantity(itemId, newQuantity); // Update the quantity to the correct value
};

  // Handle form submission
  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setError('');

    console.log(id)
    console.log("up cartitems",cartItems)

    const cartOrderDetails = cartItems.map(item => ({
      product_id: item.productid, 
      product_name: item.productname,
      quantity: item.quantity,
      unit: item.unit,
      price_per_unit: item.priceperunit
    }));

   
    const payload = {
      total_amount: totalAmount,  
      cart_order_details: cartOrderDetails,  
      address  
    };
    try {
      const response = await axios.post('http://localhost:5000/api/transfer-cart-to-order', {
        cartId: id,   
        items: cartItems 
      }, {
        headers: {
          'Content-Type': 'application/json'  
        }
      });

      console.log(response);
    } catch (err) {
      setError(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
    }
    console.log("down cartitems",cartItems)
    let id=1;
    // try {
    //   const response = await axios.post('http://localhost:5000/api/pay', {
    //     userid : 123,
    //     amount: totalAmount,
        
    //   });
      
    //   if (response.data && response.data.redirectUrl) {
    //     setRedirectUrl(response.data.redirectUrl);
    //     window.location.href = response.data.redirectUrl;
    //   } else {
    //     setError('Unexpected response format.');
    //   }
    // } catch (err) {
    //   setError(`err.response ? Error: ${err.response.data.message || 'An error occurred. Please try again.'} : 'Network error or no response from the server.'`);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex flex-col h-full p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-left text-yellow-600">Your Cart</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>
        <AddressCard address={address} />
        <div className="flex-1 overflow-y-auto p-4">
         <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-lg">
              Your cart is empty. Fill the cart to proceed.
            </div>
          ) : (
            cartItems.map(item => {
              console.log("gulula",item);
              const minUnitsPerPlate = item['minunitsperplate'] || 1;
              const selectedUnit = toggleState[item['productid']] || item['units'] || item['units2'];
              const displaypriceperunit = toggleState[item['productid']] === 'units2'
              ? item['priceperunits2'] 
              : item['priceperunit'];
              const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, item.quantity);              
              return (
                <div key={item['productid']} className="flex flex-col mb-4 border-b border-gray-200 pb-4">
                  <div className="flex flex-col items-center mb-2">
                    <h3 className="font-semibold text-gray-800 mb-1">{item['productname']}</h3>
                    <img src={item.image} alt={item['productname']} className="w-24 h-24 object-cover rounded mb-2" />
                    {item['units'] && item['units2'] && (
                   <div className="flex items-center mb-2">
          
          <ToggleSwitch
            isOn={toggleState[item['productid']] === 'units2'}
            onToggle={() => {
              setToggleState((prevState) => ({
            ...prevState,
             [item['productid']]: prevState[item['productid']] === 'units2' ? 'units' : 'units2',
             }));
            }}
            />

                      <p className="ml-2">
                      {toggleState[item['productid']] === 'units2' ? item['units2'] : item['units']}
                       </p>
                     </div>
                     )}
                    {!item['units2'] && (
                   <p>{item['units']}</p>
      )}
                    <p className="text-sm text-gray-600 mb-2 flex flex-col items-center">
                    <span className="text-gray-700 mt-1">
                     {toggleState[item['productid']] === 'units2'
                   ? (item['units2'] === 'gms' || item['units2'] === 'ml' )
                    ? `${displaypriceperunit} * ${item.quantity}* ${numberOfPlates}  = `
                   : `${displaypriceperunit} * ${item.quantity} = `
                   : item['units'] === 'pcs'|| item['units'] === 'ml'
                   ? `${item.quantity} * ${displaypriceperunit} * ${numberOfPlates} = `
                  : item['price_category'] === 'pcs' || item['price_category'] === 'Liter' ||item['price_category']==='wt'||item['price_category']=== 'wt/qty' || item['price_category']==='Liter/qty'
                  ? `${displaypriceperunit} * ${item.quantity} = `
                     : `${displaypriceperunit} * ${item.quantity} * ${numberOfPlates} = `}
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
                      onChange={(e) => handleInputChange(item['productid'], e.target.value, minUnitsPerPlate)} 
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
          <div className="flex flex-col justify-end mt-4">
            <div className="text-xl font-bold text-gray-800 ">
              Total Amount: ${totalAmount}
            </div>
            <button 
              onClick={handleSubmit} 
              className="py-2 px-4 bg-yellow-500 text-gray-800 font-bold rounded"
            >
              Pay Now
            </button>
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
    const [units, setUnits] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mainToggleOn, setMainToggleOn] = useState(false);
    const location = useLocation();
    const numberOfPlates = location.state?.numberOfPlates || 1;
  
    const address = location.state?.address || {
      street: '123 Main St',
      city: 'Hyderabad',
      zip_code: '10001',
      country: 'Telangana'
    };
  
    // Handle unit toggle
    const onToggleUnit = (productId) => {
      setUnits(prevUnits => ({
        ...prevUnits,
        [productId]: mainToggleOn ? 'units2' : (prevUnits[productId] === 'units' ? 'units2' : 'units')
      }));
    };
  
    useEffect(() => {
      if (mainToggleOn) {
        setUnits(prevUnits => 
          Object.keys(prevUnits).reduce((acc, itemId) => {
            acc[itemId] = 'units2';
            return acc;
          }, {})
        );
      } else {
        setUnits(prevUnits => 
          Object.keys(prevUnits).reduce((acc, itemId) => {
            acc[itemId] = 'units'; // or any default value
            return acc;
          }, {})
        );
      }
    }, [mainToggleOn]);
  
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/products');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          const transformedData = data.reduce((acc, item) => {
            const category = item['category_name'];
            if (!acc[category]) {
              acc[category] = { category, items: [] };
            }
  
            const isdual = item['isdual'] === 'true';
            acc[category].items.push(item);
            return acc;
          }, {});
  
          setMenuData(Object.values(transformedData));
  
          const initialUnits = {};
          data.forEach(item => {
            initialUnits[item['productid']] = item['units'];
          });
          setUnits(initialUnits);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchProducts();
    }, []);
  
    const updateQuantity = (itemId, newQuantity) => {
      setQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    };
  
    const handleCheck = (itemId) => {
      const newCheckedItems = { ...checkedItems, [itemId]: !checkedItems[itemId] };
      setCheckedItems(newCheckedItems);
      if (!checkedItems[itemId]) {
        setQuantities(prev => ({ ...prev, [itemId]: 1 }));
      } else {
        setQuantities(prev => ({ ...prev, [itemId]: 0 }));
      }
    };
  
    const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  
    const cartItems = menuData.flatMap(category =>
      category.items
        .filter(item => quantities[item['productid']] > 0)
        .map(item => ({
          ...item,
          quantity: quantities[item['productid']],
          unit: units[item['productid']] || item['units']
        }))
    );


  console.log("menudata",cartItems);

  return (
    <div className="bg-gradient-to-b from-[#008000]">
      <div className="bg-gradient-to-b from-[#008000] to-[#70c656]">
        <div className="flex justify-between items-center bg-gradient-to-b from-[#008000] to-[#70c656] py-4 px-6">
          <h1 className="text-2xl font-bold text-white">EVENT MENU CARD</h1>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-green-500 text-white p-2 rounded"
          >
            <ShoppingCart size={24} />
            {totalQuantity > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
                {totalQuantity}
              </span>
            )}
          </button>
        </div>
        {/* Main Toggle Switch */}
        <div className="flex justify-center py-2">
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
             units={units}
             onToggleUnit={onToggleUnit} // Pass the function as a prop
             onCheck={handleCheck}
             mainToggleOn={mainToggleOn}  // Passing the main toggle state
           />
        ))}
      </div>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        numberOfPlates={numberOfPlates}  // Number of plates from location state
        onUpdateQuantity={updateQuantity}
        onToggleUnit={onToggleUnit} 
        address={address} 
        // units={units}
      />
    </div>
  );
};

export default Menu;


