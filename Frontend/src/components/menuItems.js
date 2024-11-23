import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse'; // Import PapaParse for CSV parsing
import { VerifyToken } from '../MiddleWare/verifyToken';

// ToggleSwitch Component
const ToggleSwitch = ({ isOn, onToggle }) => (
  <div
    className={`w-8 h-4 flex items-center rounded-full p-1 cursor-pointer ${isOn ? 'bg-green-500' : 'bg-gray-300'}`}
    onClick={onToggle}
  >
    <div
      className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${isOn ? 'translate-x-4' : 'translate-x-0'}`}
    ></div>
  </div>
);

// MenuItem Component
const MenuItem = ({ item, checked, unit, onToggleUnit, onCheck, mainToggleOn }) => {
  const shouldDisplayToggle = item.isdual === 'TRUE';

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200">
      <div className="flex items-center flex-grow">
        <img src={item.image} alt={item['product_name']} className="w-16 h-16 object-cover rounded mr-4" />
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{item['product_name']}</h3>
          <input
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="ml-2"
          />
        </div>
      </div>
      <div className={`flex items-center ${mainToggleOn ? 'justify-end' : 'justify-start'}`}>
        {/* Display the corresponding unit text above the toggle */}
        <div className="text-sm text-gray-600 mr-2">
          {unit}
        </div>
        {shouldDisplayToggle && (
          <div className="flex items-center">
            <ToggleSwitch
              isOn={unit === item['unit_1']}
              onToggle={onToggleUnit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// MenuCategory Component
const MenuCategory = ({ category_name, items, checkedItems, units, onToggleUnit, onCheck, mainToggleOn }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 bg-white rounded-lg shadow">
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800">{category_name}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div>
          {items.map(item => (
            <MenuItem
              key={item['product_id']}
              item={item}
              checked={checkedItems[item['product_id']] || false}
              unit={units[item['product_id']] || item['unit_1']}
              onToggleUnit={() => onToggleUnit(item['product_id'])}
              onCheck={() => onCheck(item['product_id'])}
              mainToggleOn={mainToggleOn}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// CartSidebar Component
const CartSidebar = ({ isOpen, onClose, cartItems, numberOfPlates, onUpdateQuantity, onToggleUnit }) => {
  const categoriesWithoutToggle = ['BREAKFAST ITEMS', 'WELCOME DRINKS'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');

  // Handle input value change
  const handleInputChange = (itemId, value) => {
    const newQuantity = value === '' ? '' : Number(value); 
    onUpdateQuantity(itemId, newQuantity); 
  };

  // Reset to minimum if the input is invalid or empty on blur
  const handleBlur = (itemId, quantity, minUnitsPerPlate) => {
    const newQuantity = quantity < minUnitsPerPlate ? minUnitsPerPlate : quantity;
    onUpdateQuantity(itemId, newQuantity); 
  };

  // Calculate the total item cost
  function calculateTotalItemCost(item, numberOfPlates, selectedUnit, enteredValue) {
    let totalItemCost = 0;
    
    if (selectedUnit === item['unit_1']) {
      const pricePerUnit = item['price_per_unit1'];
      totalItemCost = numberOfPlates * pricePerUnit * item.quantity;
    } 
    if (item['price_category'] === 'kg' || item['price_category'] === 'lt') {
      totalItemCost = enteredValue * item['price_per_unit_1'];
    } else if (selectedUnit === item['unit__2']) {
      const costPerSmallerUnit = item['price_per_unit2'] / item['min_unit2_per_plate'];
      totalItemCost = costPerSmallerUnit * enteredValue * numberOfPlates;
    } else if (selectedUnit === item['unit_1']) {
      const pricePerUnit = item['price_per_unit1'];
      totalItemCost = numberOfPlates * pricePerUnit * item.quantity;
    } 

    return totalItemCost.toFixed(2);
  }

  // Calculate total amount
  const totalAmount = cartItems.reduce((sum, item) => {
    const selectedUnit = item.unit; 
    const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, item.quantity);
    return sum + parseFloat(totalItemCost);
  }, 0).toFixed(2);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/pay', {
        amount: totalAmount
      });
      
      if (response.data && response.data.redirectUrl) {
        setRedirectUrl(response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
      } else {
        setError('Unexpected response format.');
      }
    } catch (err) {
      setError(`err.response ? Error: ${err.response.data.message || 'An error occurred. Please try again.'} : 'Network error or no response from the server.'`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Cart</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-lg">
              Your cart is empty. Fill the cart to proceed.
            </div>
          ) : (
            cartItems.map(item => {
              const minUnitsPerPlate = item['min_unit2_per_plate'] || 1;
              const displayPricePerUnit = item.unit === item['unit_1'] 
               ? item['price_per_unit1'] 
               : (item.unit === item['unit_2'] 
               ? item['price_per_unit2'] / item['min_unit2_per_plate'] 
               : item['price_per_unit2']);
              const totalItemCost = calculateTotalItemCost(item, numberOfPlates, item.unit, item.quantity);
              const isPcs = item['unit_1'] === 'pcs';
              const isKgOrLt = item['price_category'] === 'kg' || item['price_category'] === 'lt';
              const isSmallerUnit = item['unit_2'] === 'gms' || item['unit_2'] === 'ml';

              return (
                <div key={item['product_id']} className="flex flex-col mb-4 border-b border-gray-200 pb-4">
                  <div className="flex flex-col items-center mb-2">
                    <img src={item['image']} alt={item['product_name']} className="w-24 h-24 object-cover rounded mb-2" />
                    <div className="text-lg font-semibold text-gray-800">{item['product_name']}</div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-600 text-sm">
                      Unit: {item.unit === 'unit_1' ? item['unit_1'] : item['unit_2']} - ${displayPricePerUnit.toFixed(2)} per {item.unit === 'unit_1' ? 'unit' : item['unit_2']}
                    </div>
                    <div className="text-gray-600 text-sm">
                      <input
                        type="number"
                        min={minUnitsPerPlate}
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(item['product_id'], e.target.value)}
                        onBlur={() => handleBlur(item['product_id'], item.quantity, minUnitsPerPlate)}
                        className="border border-gray-300 rounded px-2 py-1 w-20 text-center"
                      />
                      {item.unit === 'unit_1' ? ' pcs' : ' gms/ml'}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-gray-600 text-sm">Total Cost: ${totalItemCost}</div>
                    <button
                      onClick={() => onToggleUnit(item['product_id'])}
                      className={`ml-4 px-4 py-2 rounded text-white ${item.unit === item['unit_1'] ? 'bg-green-500' : 'bg-gray-500'}`}
                    >
                      {item.unit === item['unit_1'] ? 'Toggle to ' + item['unit_2'] : 'Toggle to ' + item['unit_1']}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold text-gray-800">Total Amount</div>
            <div className="text-lg font-bold text-gray-800">`${totalAmount}`</div>
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white ${loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Menu Component
const Menu = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [units, setUnits] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [numberOfPlates, setNumberOfPlates] = useState(1);
  const [mainToggleOn, setMainToggleOn] = useState(false);
  VerifyToken();
  useEffect(() => {
    // Fetch CSV Data
    Papa.parse('/path/to/your/file.csv', {
      download: true,
      header: true,
      complete: (result) => {
        setData(result.data);
        // Filter menu data based on CSV
        setFilteredData(result.data.filter(item => item['category_name']));
      },
      error: (error) => console.error('CSV parsing error:', error),
    });
  }, []);

  useEffect(() => {
    // Extract categories from data
    const categories = [...new Set(data.map(item => item['category_name']))];
    setCategories(categories);
  }, [data]);

  // Handle item check
  const handleCheck = (itemId) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Handle unit toggle
  const handleToggleUnit = (itemId) => {
    setUnits(prev => {
      const item = data.find(i => i['product_id'] === itemId);
      const newUnit = item.unit === item['unit_1'] ? item['unit_2'] : item['unit_1'];
      return { ...prev, [itemId]: newUnit };
    });
  };

  // Handle form submit
  const handleUpdateQuantity = (itemId, quantity) => {
    setCartItems(prev => prev.map(item =>
      item['product_id'] === itemId ? { ...item, quantity } : item
    ));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg"
      >
        <ShoppingCart size={24} />
      </button>
      
      <div className="p-4">
        {categories.map(category => (
          <MenuCategory
            key={category}
            category_name={category}
            items={filteredData.filter(item => item['category_name'] === category)}
            checkedItems={checkedItems}
            units={units}
            onToggleUnit={handleToggleUnit}
            onCheck={handleCheck}
            mainToggleOn={mainToggleOn}
          />
        ))}
      </div>

      <CartSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        cartItems={cartItems}
        numberOfPlates={numberOfPlates}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleUnit={handleToggleUnit}
      />
    </div>
  );
};

export default Menu;