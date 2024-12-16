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
import HomePage from '../HomePage';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { isTokenExpired, VerifyToken} from '../../MiddleWare/verifyToken';


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
  const [quantityNotifications,setQuantityNotifications]=useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const navigate = useNavigate(); 

  VerifyToken();
  useEffect(() => {
    // VerifyToken();
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
    const token = localStorage.getItem('token');
    console.log("istokenexpired:-",isTokenExpired(token));
    if (!token ) {
      navigate('/'); // Redirect to login if token is not found
      return;
    }
    

    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`, {
        headers: { 'token':token },
      });
      console.log("hii sneha")
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
    if(isTokenExpired(localStorage.getItem('token')))
    {
      navigate('/');
    }
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
     // Clear notification when flipped
     if (newFlipped[index]) {
      setQuantityNotifications(prev => {
        const newNotifications = { ...prev };
        delete newNotifications[index];
        return newNotifications;
      });
    }
  };

  const handleQuantityChange = (index, newValue) => {
    const newQuantities = [...quantities];
    newQuantities[index] = newValue;
    setQuantities(newQuantities);
    
    if (newValue > 0) {
      // Show notification
      setQuantityNotifications(prev => ({
        ...prev,
        [index]: true
      }));
    } else {
      // Clear notification
      setQuantityNotifications(prev => {
        const newNotifications = { ...prev };
        delete newNotifications[index];
        return newNotifications;
      });
    }
  };

  const incrementQuantity = (index) => {
    handleQuantityChange(index, quantities[index] + 1);
  };

  const decrementQuantity = (index) => {
    if (quantities[index] > 0) {
      handleQuantityChange(index, quantities[index] - 1);
    }
  };

  const handleSaveSuccess = (index) => {
    setTimeout(() => {
      handleFlip(index);
    }, 100);
    setErrorMessages(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[index];
      return newErrors;
    });
  };

  const handleError = (index, message) => {
    setErrorMessages(prevErrors => ({
      ...prevErrors,
      [index]: message
    }));
    setTimeout(() => {
      setErrorMessages(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[index];
        return newErrors;
      });
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
                 className="ml-auto text-white bg-teal-800 w-24 h-10 text-sm"
                 onClick={() => setShowMap(true)}
               >
                 {displayAddress ? 'Change' : 'Add Address'}
               </button>
             </div>
            <div className={`relative ${isSidenavOpen ? 'blur-sm' : ''} z-10`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6 mt-1">
                {foodData.map((food, index) => (
                  <ReactCardFlip key={index} isFlipped={flipped[index]} flipDirection="horizontal">
<div className="relative w-full h-full sm:h-96 p-4 rounded-lg shadow-xl shadow-slate-400 flex flex-col justify-between mt-4 mx-2">
                      {quantityNotifications[index] && (
                        <div className="absolute top-0 left-0 right-0 bg-teal-100 border border-teal-200 text-teal-800 px-4 py-3 rounded-t-lg text-center text-sm">
                          Click the flip icon to select dates
                        </div>
                      )}
                      
                      <h2 className={`text-lg sm:text-2xl font-bold ${quantityNotifications[index] ? 'mt-14' : 'mt-3'}`}>
                        {food.category_name}
                      </h2>

                      <button
                        onClick={() => handleFlip(index)}
                        className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none"
                      >
                        <FontAwesomeIcon icon={faSyncAlt} size='2xs' />
                      </button>

                      <div className="w-full flex items-center mb-20">
                        <div className="w-full max-w-[200px] sm:max-w-[300px] aspect-square overflow-hidden flex justify-center items-center sm:mt-3">
                          <img
                            src={food.category_media}
                            className="w-full h-full object-cover rounded-lg"
                            alt="Food"
                          />
                        </div>
                        <div className="mt-4 w-full sm:w-auto ml-5">
                          <p className="text-sm sm:text-base text-gray-600 mt-2">{food.category_description}</p>
                          <p className="mt-2">
                            Price Per Plate: <span className="text-teal-800">{food.category_price}/-</span>
                          </p>
                          <div className="mt-2 flex items-center">
                            Quantity:
                            <button className="text-red-500 text-3xl ml-3" onClick={() => decrementQuantity(index)}>-</button>
                            <input
                              type="number"
                              placeholder='0'
                              value={quantities[index] === 0 ? '' : quantities[index]}
                              onChange={(e) => {
                                const parsedValue = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                handleQuantityChange(index, parsedValue >= 0 ? parsedValue : 0);
                              }}
                              className="mx-4 text-lg bg-teal-100 h-7 w-10 text-center rounded-lg"
                              min="0"
                            />
                            <button className="text-red-500 text-3xl ml-1" onClick={() => incrementQuantity(index)}>+</button>
                          </div>
                        </div>
                      </div>

                      {errorMessages[index] && (
                        <div className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          {errorMessages[index]}
                        </div>
                      )}
                    </div>
                    {/* Back Side */}
                    <div className="relative w-full h-full sm:h-96 p-4 rounded-lg shadow-xl shadow-slate-400 flex flex-col justify-between overflow-hidden">
                      <button onClick={() => handleFlip(index)} className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none">
                        <FontAwesomeIcon icon={faSyncAlt} size='2xs' />
                      </button>
                      <div className="flex-grow overflow-hidden mt-5">
                        <DateComponent 
                          foodtype={food} 
                          quantity={quantities[index]}
                          onSaveSuccess={() => handleSaveSuccess(index)}
                          onError={(message) => handleError(index, message)}
                        />
                      </div>
                      {errorMessages[index] && (
                        <div className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                          {errorMessages[index]}
                        </div>
                      )}
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
          className={`flex-1 text-center py-2 px-4 font-semibold rounded-full border-2 ${activeTab === 'corporate' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-green-500'}`}
        >
          <FaCalendarAlt className="inline mr-1" /> Corporate
        </button>
        <button 
          onClick={() => setActiveTab('events')} 
          className={`flex-1 text-center py-2 px-4 font-semibold rounded-full border-2 ${activeTab === 'events' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-green-500'}`}
        >
          <FaUtensils className="inline mr-1" /> Events
        </button>
      </div>
    </div>
  );
};

export default Body;