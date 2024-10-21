
import { faArrowRight, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import { FaCalendarAlt, FaUtensils } from 'react-icons/fa';
import { MdLocationPin } from 'react-icons/md';
import { corporate_category } from '../../services/context_state_management/actions/action';
import { StoreContext } from '../../services/contexts/store';
import AddressForm from '../Address/AddressForm';
import HomePage from '../HomePage';
import DateComponent from './DateComponents';

const Body = ({ isSidenavOpen, activeTab, setActiveTab }) => {
  const { state, dispatch } = useContext(StoreContext);
  const [flipped, setFlipped] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [foodData, setFoodData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState([]);
  const [displayAddress, setDisplayAddress] = useState('');
  const [addressToSend, setAddressToSend] = useState([]);
  // const [showCartMessage, setShowCartMessage] = useState(false);
  // const [count, setCount]=useState(0)

  useEffect(() => {
    fetchFoodData();
    const storedAddress = localStorage.getItem('address');
    if (!storedAddress) {
      fetchAddress();
    } else {
      try {
        const parsedAddress = JSON.parse(storedAddress);
        const formattedAddress = `${parsedAddress.tag}, ${parsedAddress.line1}, ${parsedAddress.pincode}`;
        setDisplayAddress(formattedAddress);
      } catch (error) {
        console.error('Error parsing address from localStorage:', error);
      }
    }
  }, []);

  const fetchAddress = async () => {
    try {
      const response = await axios.get('http://localhost:4000/customer/corporate/customerAddress', {
        headers: { token: localStorage.getItem('token') },
      });
      setAddress(response.data.address);
      if (response.data.address && response.data.address.length > 0) {
        const addressData = response.data.address[response.data.address.length - 1];
        setAddressToSend(addressData);
        const formattedAddress = `${addressData.tag}, ${addressData.line1}, ${addressData.line2}, ${addressData.pincode}`;
        localStorage.setItem('address', JSON.stringify(addressData));
        setDisplayAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchFoodData = async () => {
    setIsLoading(true);
    try {
      const data = await corporate_category(dispatch);
      setFoodData(data);
      setFlipped(Array(data.length).fill(false));
      setQuantities(Array(data.length).fill(0));
      setError(null);
    } catch (error) {
      setError('Failed to fetch food data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressUpdate = () => {
    fetchAddress();
    setShowMap(false);
  };

  const handleAddressSelect = (newAddress) => {
    const formattedAddress = `${newAddress.tag}, ${newAddress.line1}, ${newAddress.line2}, ${newAddress.pincode}`;
    localStorage.setItem('address', JSON.stringify(newAddress));
    setAddressToSend(newAddress);
    setDisplayAddress(formattedAddress);
    setShowMap(false);
  };

  const handleFlip = (index) => {
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
  };

  const incrementQuantity = (index) => {
    const newQuantities = [...quantities];
    newQuantities[index] += 1;
    setQuantities(newQuantities);
  };

  const decrementQuantity = (index) => {
    const newQuantities = [...quantities];
    if (newQuantities[index] > 0) {
      newQuantities[index] -= 1;
      setQuantities(newQuantities);
    }
  };

  const handleSaveSuccess = (index) => {
   
    
    setTimeout(() => {
      handleFlip(index);
    }, 100);
    // setTimeout(() => {
    //   setShowCartMessage(false);
    // }, 5000);
  
  };

  const handleRemove = () => {
    setShowMap(false);
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="relative pb-20 min-h-screen">
      {/* {showCartMessage && (
        <div className="fixed top-0 left-0 right-0 bg-white-500 text-black py-2 text-center z-50">
          1 item added to cart
        </div>
      )} */}

      <div className={`content ${activeTab === 'corporate' ? '' : 'hidden'}`}>
        {!showMap ? (
          <div>
            <div className="bg-white shadow-lg shadow-slate-400 mt-5 rounded-lg p-4 mb-6 flex items-center">
              <MdLocationPin className="mr-2 text-gray-500" size={20} />
              <div>
                {displayAddress ? (
                  <p className="text-sm font-semibold">{displayAddress}</p>
                ) : (
                  <p className="text-sm font-semibold text-red-500">Address is not added</p>
                )}
              </div>
              <button
                className="ml-auto text-white bg-green-700 w-24 h-10 text-sm"
                onClick={() => setShowMap(true)}
              >
                {displayAddress ? 'Change' : 'Add Address'}
              </button>
            </div>
            <div className={`relative ${isSidenavOpen ? 'blur-sm' : ''} z-10`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6 mt-8">
                {foodData.map((food, index) => (
                  <ReactCardFlip key={index} isFlipped={flipped[index]} flipDirection="horizontal">
                    {/* Front Side */}
                    <div className="relative w-full h-auto sm:h-96 p-4 rounded-lg shadow-xl shadow-slate-400 flex flex-col justify-between mt-4">
                      <h2 className="text-lg sm:text-2xl font-bold mt-3">{food.category_name}</h2>
                      <div className="relative">
                            {/* Flip button */}
                            <button
                              onClick={() => handleFlip(index)}
                              className="absolute top-2 right-2 text-blue-500 text-lg rounded-full focus:outline-none"
                            >
                              <FontAwesomeIcon icon={faSyncAlt} size="lg" />
                            </button>
                            
                            {/* Straight arrow pointing to flip icon */}
                            <div className="absolute top-2 right-12 flex">
                            <p>Dates </p><FontAwesomeIcon icon={faArrowRight} size="lg" className="text-gray-500" />
                            </div>
                          </div>

                      <div className="w-full flex items-center mb-6">
                      {/* Image container */}
                      <div className="w-full max-w-[150px] sm:max-w-[300px] aspect-square overflow-hidden flex justify-center items-center sm:mt-3">
                        <img
                          src={food.category_media}
                          className="w-full h-full object-cover rounded-lg"
                          alt="Food"
                        />
                      </div>

                      {/* Content container */}
                      <div className="mt-4 w-full sm:w-auto ml-5">
                        <p className="text-sm sm:text-base text-gray-600 mt-2">{food.category_description}</p>
                        <p className="mt-2">
                          Price Per Plate: <span className="text-green-500">{food.category_price}/-</span>
                        </p>
                        <div className="mt-2 flex items-center">
                          Quantity:
                          <button className="text-red-500 text-3xl ml-3" onClick={() => decrementQuantity(index)}>
                            -
                          </button>
                          <input
                      type="number"
                      placeholder='0'
                      value={quantities[index] === 0 ? '' : quantities[index]}  // Avoid displaying leading 0
                      onChange={(e) => {
                        const newQuantities = [...quantities];
                        const value = e.target.value;  // Capture the raw input value as a string first

                        // Parse value as an integer, and prevent leading 0s
                        const parsedValue = value === '' ? 0 : parseInt(value, 10);
                        newQuantities[index] = parsedValue >= 0 ? parsedValue : 0;  // Ensure no negative values
                        setQuantities(newQuantities);
                      }}
                      className="mx-4 text-lg bg-red-200 h-7 w-10 text-center rounded-lg"
                      min="0"
                    />

                          <button className="text-red-500 text-3xl ml-1" onClick={() => incrementQuantity(index)}>
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    </div>

                    {/* Back Side */}
                    <div className="relative w-full h-auto sm:h-80 p-4 rounded-lg shadow-xl shadow-slate-400 overflow-auto">
                      <button onClick={() => handleFlip(index)} className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none">
                        <FontAwesomeIcon icon={faSyncAlt} size="md" />
                      </button>
                      <div className="mt-5">
                        <DateComponent 
                          foodtype={food} 
                          quantity={quantities[index]}
                          onSaveSuccess={() => handleSaveSuccess(index)}
                        />
                      </div>
                    </div>
                  </ReactCardFlip>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <AddressForm onAddressAdd={handleAddressUpdate} onAddressSelect={handleAddressSelect} onClose={handleRemove} />
        )}
      </div>

      <div className={`content ${activeTab === 'events' ? '' : 'hidden'}`}>
        <HomePage />
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md flex justify-around p-2 z-40">
        <button 
          onClick={() => setActiveTab('corporate')} 
          className={`flex-1 text-center py-2 px-4 font-semibold rounded-full border-2 ${activeTab === 'corporate' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-500'}`}
        >
          <FaCalendarAlt className="inline mr-1" /> Corporate
        </button>
        <button 
          onClick={() => setActiveTab('events')} 
          className={`flex-1 text-center py-2 px-4 font-semibold rounded-full border-2 ${activeTab === 'events' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-500'}`}
        >
          <FaUtensils className="inline mr-1" /> Events
        </button>
      </div>
    </div>
  );
};

export default Body;

