import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import { MdLocationPin } from 'react-icons/md';
import { add_address, corporate_category } from '../../services/context_state_management/actions/action';
import { StoreContext } from '../../services/contexts/store';
import { FaCalendarAlt, FaUtensils } from 'react-icons/fa';
import DateComponent from './DateComponents';
import AddressForm from '../Address/AddressForm';
import HomePage from '../HomePage'
const Body = ({ isSidenavOpen }) => {
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
  const [showCartMessage, setShowCartMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('corporate');

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
      console.log('address in body', response.data.address);
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
      console.log(data);
      setFoodData(data);
      setFlipped(Array(data.length).fill(false));
      setQuantities(Array(data.length).fill(0));
      setError(null);
    } catch (error) {
      console.error('Error fetching food data:', error);
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
    setShowCartMessage(true);
    setTimeout(() => {
      handleFlip(index);
    }, 100);
    setTimeout(() => {
      setShowCartMessage(false);
    }, 5000);
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
      {showCartMessage && (
        <div className="fixed top-0 left-0 right-0 bg-white-500 text-black py-2 text-center z-50">
          1 item added to cart
        </div>
      )}

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
                className="ml-auto text-blue-500 bg-slate-300 w-24 h-10 text-sm"
                onClick={() => setShowMap(true)}
              >
                {address && address.length > 0 ? 'Change' : 'Add Address'}
              </button>
            </div>
            <div className={`relative ${isSidenavOpen ? 'blur-sm' : ''} z-10`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 mt-8">
                {foodData.map((food, index) => (
                  <ReactCardFlip key={index} isFlipped={flipped[index]} flipDirection="horizontal">
                    {/* Front Side */}
                    <div className="relative w-full h-96 max-h-96 p-4 rounded-lg shadow-xl shadow-slate-400 flex flex-col justify-between">
                      <h2 className="text-xl font-bold">{food.category_name}</h2>
                      <button
                        onClick={() => handleFlip(index)}
                        className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none"
                      >
                        <FontAwesomeIcon icon={faSyncAlt} size="sm" />
                      </button>
                      <div className="w-full h-72 flex space-x-3">
                        <div className="rounded-lg shadow-slate-300 bg-blue-50 shadow-xl overflow-auto w-1/2 flex justify-center items-center">
                          <img src={food.category_media} className="rounded-full" alt="Food" />
                        </div>
                        <div className="w-1/2">
                          <h1>{food.category_description}</h1>
                          <p className="mt-4">
                            Price Per Plate: <span className="text-green-500">{food.category_price}/-</span>
                          </p>
                          <p className="mt-2 flex items-center">
                            Quantity:
                            <button
                              className="text-red-500 text-2xl ml-3"
                              onClick={() => incrementQuantity(index)}
                            >
                              +
                            </button>
                            <span className="mx-4 text-lg bg-red-200 ring-offset-red-500 h-7 w-7 text-center">
                              {quantities[index]}
                            </span>
                            <button
                              className="text-red-500 text-3xl ml-2"
                              onClick={() => decrementQuantity(index)}
                            >
                              -
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Back Side */}
                    <div className="relative w-full h-96 max-h-96 p-4 rounded-lg shadow-xl shadow-slate-400 overflow-auto">
                      <button onClick={() => handleFlip(index)} className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none">
                        <FontAwesomeIcon icon={faSyncAlt} size="sm" />
                      </button>
                      <div className="mt-4">
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
          className={`flex-1 text-center py-2 px-4 font-semibold rounded-full ${activeTab === 'corporate' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'}`}
        >
          <FaCalendarAlt className="inline mr-1" /> Corporate
        </button>
        <button 
          onClick={() => setActiveTab('events')} 
          className={`flex-1 text-center py-2 px-4 font-semibold rounded-full ${activeTab === 'events' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-500'}`}
        >
          <FaUtensils className="inline mr-1" /> Events
        </button>
      </div>
    </div>
  );
};

export default Body;
