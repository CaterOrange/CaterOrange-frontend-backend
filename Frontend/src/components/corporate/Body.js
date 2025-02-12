
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
import WelcomePreview from './WelcomePreview';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

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
  const [quantityNotifications, setQuantityNotifications] = useState({});
  const [errorMessages, setErrorMessages] = useState({});
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();
  const windowSize = useWindowSize();

  VerifyToken();

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
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`, {
        headers: { 'token': token },
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

  useEffect(() => {
    const isJustSignedUp = localStorage.getItem('newSignup');
    if (isJustSignedUp === 'true') {
      setShowWelcome(true);
      setTimeout(() => {
        localStorage.removeItem('newSignup');
      }, 1000);
    } else {
      setShowWelcome(false);
    }
  }, []);

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
    if (isTokenExpired(localStorage.getItem('token'))) {
      navigate('/');
      return;
    }
    const newFlipped = [...flipped];
    newFlipped[index] = !newFlipped[index];
    setFlipped(newFlipped);
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
      setQuantityNotifications(prev => ({
        ...prev,
        [index]: true
      }));
    } else {
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

  const renderCard = (food, index) => (
    <ReactCardFlip key={index} isFlipped={flipped[index]} flipDirection="horizontal">
      {/* Front Card */}
      <div className="bg-white rounded-xl border-l-2 border-b-2 border-teal-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 w-full h-auto min-h-[420px] flex flex-col">
        <div className="relative p-4 flex-1 flex flex-col">
          <img
            src={food.category_media}
            className="w-full h-48 sm:h-52 object-cover rounded-lg mb-3"
            alt={food.category_name}
          />
          <h2 className="text-lg font-bold text-gray-800 mb-2 font-serif">{food.category_name}</h2>
          <p className="text-gray-600 font-serif text-sm flex-1">{food.category_description}</p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-t border-gray-100 gap-2">
            <span className="text-lg font-semibold text-teal-700">₹{food.category_price}/-</span>
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => decrementQuantity(index)}
                className="w-8 h-8 flex items-center justify-center bg-red-50 text-3xl hover:bg-red-100 text-red-600 rounded-full"
              >
                -
              </button>
              <input
                type="number"
                value={quantities[index] === 0 ? '' : quantities[index]}
                onChange={(e) => {
                  const parsedValue = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                  handleQuantityChange(index, parsedValue >= 0 ? parsedValue : 0);
                }}
                className="w-14 h-8 text-center bg-gray-50 rounded-lg border border-gray-500"
                min="0"
                placeholder="0"
              />
              <button
                onClick={() => incrementQuantity(index)}
                className="w-8 h-8 flex items-center text-xl justify-center bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-full"
              >
                +
              </button>
            </div>
          </div>
          {quantities[index] > 0 && (
            <button
              onClick={() => handleFlip(index)}
              className="w-full mt-2 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <span>Select Dates</span>
              <FontAwesomeIcon icon={faSyncAlt} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Back Card */}
      <div className="bg-white rounded-xl shadow-lg p-4 w-full h-auto min-h-[420px] flex flex-col">
        <button
          onClick={() => handleFlip(index)}
          className="self-end w-8 h-8 flex items-center justify-center bg-teal-50 hover:bg-teal-100 rounded-full"
        >
          <FontAwesomeIcon icon={faSyncAlt} className="text-teal-700" />
        </button>
        <div className="mt-2 flex-1">
          <DateComponent
            foodtype={food}
            quantity={quantities[index]}
            onSaveSuccess={() => handleSaveSuccess(index)}
            onError={(message) => handleError(index, message)}
          />
        </div>
      </div>
    </ReactCardFlip>
  );

  const renderCards = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center mt-8">
          <div className="w-8 h-8 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
        </div>
      );
    }

    const gridClasses = {
      1: "grid grid-cols-1 max-w-md mx-auto",
      2: "grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto",
      3: "grid grid-cols-1 sm:grid-cols-3 gap-6",
      4: "grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto",
      5: "space-y-6",
      default: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    };

    const totalCards = foodData.length;

    if (totalCards === 5) {
      return (
        <div className={gridClasses[5]}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {foodData.slice(0, 3).map((food, index) => (
              <div key={index} className="w-full">
                {renderCard(food, index)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:w-2/3 mx-auto">
            {foodData.slice(3, 5).map((food, index) => (
              <div key={index + 3} className="w-full">
                {renderCard(food, index + 3)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={gridClasses[totalCards] || gridClasses.default}>
        {foodData.map((food, index) => (
          <div key={index} className="w-full">
            {renderCard(food, index)}
          </div>
        ))}
      </div>
    );
  };

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="relative mb-5 min-h-screen bg-teal-50">
      {showWelcome && <WelcomePreview onClose={() => setShowWelcome(false)} />}
      
      <div className={`content ${activeTab === 'corporate' ? '' : 'hidden'}`}>
        {!showMap ? (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className={`relative ${isSidenavOpen ? 'blur-sm' : ''} z-10`}>
              {renderCards()}
            </div>
          </div>
        ) : (
          <AddressForm onAddressAdd={handleAddressUpdate} onAddressSelect={handleAddressSelect} onClose={handleRemove} />
        )}
      </div>

      <div className={`content ${activeTab === 'events' ? '' : 'hidden'}`}>
        <HomePage />
      </div>
    </div>
  );
};

export default Body;