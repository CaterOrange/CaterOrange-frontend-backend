// import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import axios from 'axios';
// import React, { useContext, useEffect, useState } from 'react';
// import ReactCardFlip from 'react-card-flip';
// import { MdLocationPin } from 'react-icons/md';
// import { add_address, corporate_category } from '../../services/context_state_management/actions/action';
// import { StoreContext } from '../../services/contexts/store';
// import { FaCalendarAlt, FaUtensils } from 'react-icons/fa';
// import DateComponent from './DateComponents';
// import AddressForm from '../Address/AddressForm';
// import HomePage from '../HomePage';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
// import { isTokenExpired, VerifyToken} from '../../MiddleWare/verifyToken';


// const Body = ({ isSidenavOpen, activeTab, setActiveTab }) => {
//   const { state, dispatch } = useContext(StoreContext);
//   const [flipped, setFlipped] = useState([]);
//   const [quantities, setQuantities] = useState([]);
//   const [foodData, setFoodData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showMap, setShowMap] = useState(false);
//   const [address, setAddress] = useState([]);
//   const [displayAddress, setDisplayAddress] = useState('');
//   const [addressToSend, setAddressToSend] = useState([]);
//   const [quantityNotifications,setQuantityNotifications]=useState({});
//   const [errorMessages, setErrorMessages] = useState({});
//   const navigate = useNavigate(); 

//   VerifyToken();
//   useEffect(() => {
//     // VerifyToken();
//     fetchFoodData();
//     const storedAddress = localStorage.getItem('address');
//     if (!storedAddress) {
//       fetchAddress();
//     } else {
//       try {
//         const parsedAddress = JSON.parse(storedAddress);
//         const formattedAddress = `${parsedAddress.tag}, ${parsedAddress.line1}, ${parsedAddress.pincode}`;
//         setDisplayAddress(formattedAddress);
//       } catch (error) {
//         console.error('Error parsing address from localStorage:', error);
//       }
//     }
//   }, []);

  

//   const fetchAddress = async () => {
//     const token = localStorage.getItem('token');
//     console.log("istokenexpired:-",isTokenExpired(token));
//     if (!token ) {
//       navigate('/'); 
//       return;
//     }
    

//     try {
//       const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`, {
//         headers: { 'token':token },
//       });
     
//       setAddress(response.data.address);
//       if (response.data.address && response.data.address.length > 0) {
//         const addressData = response.data.address[response.data.address.length - 1];
//         setAddressToSend(addressData);
//         const formattedAddress = `${addressData.tag}, ${addressData.line1}, ${addressData.line2}, ${addressData.pincode}`;
//         localStorage.setItem('address', JSON.stringify(addressData));
//         setDisplayAddress(formattedAddress);
//       }
//     } catch (error) {
//       console.error('Error fetching address:', error);
//     }
//   };

//   const fetchFoodData = async () => {
//     setIsLoading(true);
//     try {
//       const data = await corporate_category(dispatch);
//       setFoodData(data);
//       setFlipped(Array(data.length).fill(false));
//       setQuantities(Array(data.length).fill(0));
//       setError(null);
//     } catch (error) {
//       setError('Failed to fetch food data. Please try again later.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleAddressUpdate = () => {
//     fetchAddress();
//     setShowMap(false);
//   };

//   const handleAddressSelect = (newAddress) => {
//     const formattedAddress = `${newAddress.tag}, ${newAddress.line1}, ${newAddress.line2}, ${newAddress.pincode}`;
//     localStorage.setItem('address', JSON.stringify(newAddress));
//     setAddressToSend(newAddress);
//     setDisplayAddress(formattedAddress);
//     setShowMap(false);
//   };

//   const handleFlip = (index) => {
//     if(isTokenExpired(localStorage.getItem('token')))
//     {
//       navigate('/');
//     }
//     const newFlipped = [...flipped];
//     newFlipped[index] = !newFlipped[index];
//     setFlipped(newFlipped);
//      // Clear notification when flipped
//      if (newFlipped[index]) {
//       setQuantityNotifications(prev => {
//         const newNotifications = { ...prev };
//         delete newNotifications[index];
//         return newNotifications;
//       });
//     }
//   };

//   const handleQuantityChange = (index, newValue) => {
//     const newQuantities = [...quantities];
//     newQuantities[index] = newValue;
//     setQuantities(newQuantities);
    
//     if (newValue > 0) {
//       // Show notification
//       setQuantityNotifications(prev => ({
//         ...prev,
//         [index]: true
//       }));
//     } else {
//       // Clear notification
//       setQuantityNotifications(prev => {
//         const newNotifications = { ...prev };
//         delete newNotifications[index];
//         return newNotifications;
//       });
//     }
//   };

//   const incrementQuantity = (index) => {
//     handleQuantityChange(index, quantities[index] + 1);
//   };

//   const decrementQuantity = (index) => {
//     if (quantities[index] > 0) {
//       handleQuantityChange(index, quantities[index] - 1);
//     }
//   };

//   const handleSaveSuccess = (index) => {
//     setTimeout(() => {
//       handleFlip(index);
//     }, 100);
//     setErrorMessages(prevErrors => {
//       const newErrors = { ...prevErrors };
//       delete newErrors[index];
//       return newErrors;
//     });
//   };

//   const handleError = (index, message) => {
//     setErrorMessages(prevErrors => ({
//       ...prevErrors,
//       [index]: message
//     }));
//     setTimeout(() => {
//       setErrorMessages(prevErrors => {
//         const newErrors = { ...prevErrors };
//         delete newErrors[index];
//         return newErrors;
//       });
//     }, 5000);
//   };

//   const handleRemove = () => {
//     setShowMap(false);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center mt-8">
//         <div className="w-8 h-8 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-center mt-8 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="relative pb-20 min-h-screen">
//       {/* {showCartMessage && (
//         <div className="fixed top-0 left-0 right-0 bg-white-500 text-black py-2 text-center z-50">
//           1 item added to cart
//         </div>
//       )} */}

//       <div className={`content ${activeTab === 'corporate' ? '' : 'hidden'}`}>
//         {!showMap ? (
//              <div>
//              <div className="bg-white shadow-lg shadow-slate-400 mt-5 rounded-lg p-4 mb-6 flex items-center">
//                <MdLocationPin className="mr-2 text-gray-500" size={20} />
//                <div>
//                  {displayAddress ? (
//                    <p className="text-sm font-semibold">{displayAddress}</p>
//                  ) : (
//                    <p className="text-sm font-semibold text-red-500">Address is not added</p>
//                  )}
//                </div>
//                <button
//                  className="ml-auto text-white bg-teal-800 w-24 h-10 text-sm"
//                  onClick={() => setShowMap(true)}
//                >
//                  {displayAddress ? 'Change' : 'Add Address'}
//                </button>
//              </div>
//              <div className={`relative ${isSidenavOpen ? 'blur-sm' : ''} z-10`}>
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-6 mt-1">
//     {foodData.map((food, index) => (
//       <ReactCardFlip key={index} isFlipped={flipped[index]} flipDirection="horizontal">
//         <div className="relative w-full h-full sm:h-96 p-4 rounded-lg border border-teal-700 shadow-xl shadow-slate-400 flex flex-col justify-between mt-4 mx-2">
//           {quantityNotifications[index] && (
//             <div className="absolute top-0 left-0 right-0 bg-teal-100 border border-teal-200 text-teal-800 px-4 py-3 rounded-t-lg text-center text-sm">
//               Click the flip icon to select dates
//             </div>
//           )}
          
//           <h2 className={`text-lg sm:text-2xl font-bold ${quantityNotifications[index] ? 'mt-14' : 'mt-3'}`}>
//             {food.category_name}
//           </h2>

//           <button
//             onClick={() => handleFlip(index)}
//             className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none"
//           >
//             <FontAwesomeIcon icon={faSyncAlt} size='2xs' />
//           </button>

//           <div className="w-full flex items-center mb-20">
//             <div className="w-full max-w-[200px] sm:max-w-[300px] aspect-square overflow-hidden flex justify-center items-center sm:mt-3">
//               <img
//                 src={food.category_media}
//                 className="w-full h-full object-cover rounded-lg"
//                 alt="Food"
//               />
//             </div>
//             <div className="mt-4 w-full sm:w-auto ml-5">
//               <p className="text-sm sm:text-base text-gray-600 mt-2">{food.category_description}</p>
//               <p className="mt-2">
//                 Price Per Plate: <span className="text-teal-800">{food.category_price}/-</span>
//               </p>
//               <div className="mt-2 flex items-center">
//                 Quantity:
//                 <button className="text-red-500 text-3xl ml-3" onClick={() => decrementQuantity(index)}>-</button>
//                 <input
//                   type="number"
//                   placeholder='0'
//                   value={quantities[index] === 0 ? '' : quantities[index]}
//                   onChange={(e) => {
//                     const parsedValue = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
//                     handleQuantityChange(index, parsedValue >= 0 ? parsedValue : 0);
//                   }}
//                   className="mx-4 text-lg bg-teal-100 h-7 w-10 text-center rounded-lg"
//                   min="0"
//                 />
//                 <button className="text-red-500 text-3xl ml-1" onClick={() => incrementQuantity(index)}>+</button>
//               </div>
//             </div>
//           </div>

//           {errorMessages[index] && (
//             <div className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               {errorMessages[index]}
//             </div>
//           )}
//         </div>
//         {/* Back Side */}
//         <div className="relative w-full h-full sm:h-96 p-4 rounded-lg border border-teal-700 shadow-xl shadow-slate-400 flex flex-col justify-between overflow-hidden">
//           <button onClick={() => handleFlip(index)} className="absolute top-4 right-4 text-blue-500 text-lg rounded-full focus:outline-none">
//             <FontAwesomeIcon icon={faSyncAlt} size='2xs' />
//           </button>
//           <div className="flex-grow overflow-hidden mt-5">
//             <DateComponent 
//               foodtype={food} 
//               quantity={quantities[index]}
//               onSaveSuccess={() => handleSaveSuccess(index)}
//               onError={(message) => handleError(index, message)}
//             />
//           </div>
//           {errorMessages[index] && (
//             <div className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//               {errorMessages[index]}
//             </div>
//           )}
//         </div>
//       </ReactCardFlip>
//     ))}
//   </div>
// </div>
//           </div>
//         ) : (
//           <AddressForm onAddressAdd={handleAddressUpdate} onAddressSelect={handleAddressSelect} onClose={handleRemove} />
//         )}
//       </div>

//       <div className={`content ${activeTab === 'events' ? '' : 'hidden'}`}>
//         <HomePage />
//       </div>

//       {/* Fixed Footer */}

//        {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-md flex justify-around p-2 z-40">
//         <button 
//           onClick={() => setActiveTab('corporate')} 
//           className={`flex-1 text-center py-2 px-4 font-semibold rounded-full border-2 ${activeTab === 'corporate' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-green-500'}`}
//         >
//           <FaCalendarAlt className="inline mr-1" /> Corporate
//         </button>
//         <button 
//           onClick={() => setActiveTab('events')} 
//           className={`flex-1 text-center py-2 px-4 font-semibold rounded-full border-2 ${activeTab === 'events' ? 'bg-teal-800 text-white' : 'bg-teal-100 text-green-500'}`}
//         >
//           <FaUtensils className="inline mr-1" /> Events
//         </button>
//       </div> */}
//     </div>
//   );
// };

// export default Body;




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
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';


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
    console.log("istokenexpired:-", isTokenExpired(token));
    if (!token) {
      navigate('/'); // Redirect to login if token is not found
      return;
    }


    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`, {
        headers: { 'token': token },
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

  useEffect(() => {
    const isJustSignedUp = localStorage.getItem('newSignup');
    console.log('isJustSignedUp:', isJustSignedUp);
    if (isJustSignedUp === 'true') {
      console.log('Showing welcome preview');
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
    return (
      <div className="flex justify-center items-center mt-8">
        <div className="w-8 h-8 border-4 border-teal-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="relative mb-5 min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      {showWelcome && <WelcomePreview onClose={() => setShowWelcome(false)} />}
      {/* <div className="bg-gradient-to-r from-teal-700 to-crimson-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Welcome to FoodieHub</h1>
          <p className="text-teal-100">Discover and order delicious meals for your corporate events</p>
        </div>
      </div> */}

      <div className={`content ${activeTab === 'corporate' ? '' : 'hidden'}`}>
        {!showMap ? (
          <div className="max-w-7xl mx-auto px-4">
            {/* Address Card */}
            <div className="bg-white shadow-lg rounded-xl p-6 mb-6 mt-6 transform hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-teal-100 p-3 rounded-full">
                  <MdLocationPin className="text-teal-700" size={24} />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 font-serif">Delivery Address</h3>
                  {displayAddress ? (
                    <p className="text-gray-600  text-lg font-serif">{displayAddress}</p>
                  ) : (
                    <p className="text-red-500 font-serif">Please add your delivery address</p>
                  )}
                </div>
                <button
                  onClick={() => setShowMap(true)}
                  className="px-6 py-2 bg-teal-700 font-serif font-bold text-md text-white rounded-lg hover:bg-teal-800 transition-colors duration-300"
                >
                  {displayAddress ? 'Change' : 'Add Address'}
                </button>
              </div>
            </div>

            {/* Food Cards Grid */}
            <div className={`relative ${isSidenavOpen ? 'blur-sm' : ''} z-10`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {foodData.map((food, index) => (
                  <ReactCardFlip key={index} isFlipped={flipped[index]} flipDirection="horizontal">
                    {/* Front Card */}
                    <div className="bg-white rounded-xl border-l-2 border-b-2 border-teal-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      {quantityNotifications[index] && (
                        <div className="bg-teal-50 border-l-2 border-teal-700 p-2 text-sm text-teal-900">
                          Click the flip icon to select dates
                        </div>
                      )}
                      
                      <div className="relative p-6">
                        <button
                          onClick={() => handleFlip(index)}
                          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-teal-50 hover:bg-teal-100 rounded-full transition-colors duration-300"
                        >
                          <FontAwesomeIcon icon={faSyncAlt} className="text-teal-700" />
                        </button>

                        <img
                          src={food.category_media}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          alt={food.category_name}
                        />

                        <h2 className="text-xl font-bold text-gray-800 mb-2 font-serif">{food.category_name}</h2>
                        <p className="text-gray-600 mb-4 font-serif">{food.category_description}</p>

                        <div className="flex justify-between items-center py-3 border-t border-gray-100">
                          <span className="text-lg font-semibold text-teal-700">₹{food.category_price}/-</span>
                          <div className="flex items-center space-x-3">
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
                              placeholder='0'
                            />
                            <button 
                              onClick={() => incrementQuantity(index)}
                              className="w-8 h-8 flex items-center text-xl justify-center bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-full"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
        
                    </div>

                    {/* Back Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <button
                        onClick={() => handleFlip(index)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-teal-50 hover:bg-teal-100 rounded-full"
                      >
                        <FontAwesomeIcon icon={faSyncAlt} className="text-teal-700" />
                      </button>
                      <div className="mt-2">
                        <DateComponent 
                          foodtype={food} 
                          quantity={quantities[index]}
                          onSaveSuccess={() => handleSaveSuccess(index)}
                          onError={(message) => handleError(index, message)}
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

      {/* Navigation Tabs */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => setActiveTab('corporate')} 
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'corporate' 
                ? 'bg-teal-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaCalendarAlt />
            <span>Corporate</span>
          </button>
          <button 
            onClick={() => setActiveTab('events')} 
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'events' 
                ? 'bg-teal-700 text-white shadow-lg transform scale-105' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaUtensils />
            <span>Events</span>
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Body;