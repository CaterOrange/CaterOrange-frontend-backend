


// import React, { useState, useEffect } from 'react';
// import { Check } from 'lucide-react';
// import { FaPhone, FaUtensils, FaCheckSquare } from 'react-icons/fa';
// import axios from 'axios';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { VerifyToken } from '../../../MiddleWare/verifyToken';

// const SuccessPage = () => {
//   const [animationState, setAnimationState] = useState('initial');
//   const [orderid, setOrderId] = useState('');
//   const navigate = useNavigate(); 
//   const location = useLocation();
//   const { order_id } = location.state;
//   const [currentDateTime, setCurrentDateTime] = useState('');

//   useEffect(() => {  useEffect(() => {
//     const getordergenid = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_URL}/api/corporate/getOrdergenId`, {
//           headers: { 'token': localStorage.getItem('token') },
//         });
//         setOrderId(response.data.order_genid.corporateorder_generated_id); 
//       } catch (error) {
//         console.error('Error in fetching order generated id', error);
//       }
//     };

//     getordergenid();

//     const timer = setTimeout(() => {
//       setAnimationState('animated');
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, []);

//     const now = new Date();
//     const formattedDate = now.toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'long',
//       year: 'numeric',
//     });
//     const formattedTime = now.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//     setCurrentDateTime(`${formattedDate} at ${formattedTime}`);
//   }, []);
//   useEffect(() => {
//     VerifyToken();
//   }, []);
   

//   const timer = setTimeout(() => {
//     setAnimationState('animated');
//   }, 3000);
//   useEffect(() => {
//     const navigateTimer = setTimeout(() => {
//       navigate('/orders'); 
//     }, 6000); 

//     return () => clearTimeout(navigateTimer);
//   }, [navigate]); 


//   return (
//     <div className="h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden">
//       <div
//         className={`w-full h-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out
//           ${animationState === 'animated' ? 'rounded-full w-45 h-70 -translate-y-24 bg-teal-800' : 'bg-teal-600'}`}
//       >
//         <div className="flex items-center justify-center bg-teal-100 bg-opacity-50 rounded-full w-24 h-24">
//           <div className="flex items-center justify-center bg-white w-13 h-13 rounded-md">
//             <Check className="text-green-500 w-8 h-8" />
//           </div>
//         </div>

//         <p className="text-white text-lg mt-2">Order Successful</p>
//         <p className="text-white text-sm">{currentDateTime}</p>
//         <p className="text-white font-bold text-sm">Order Id: {order_id}</p>
//       </div>

//       {animationState === 'animated' && (
//         <div className="mb-14 w-80 bg-white rounded-lg shadow-md p-4 animate-fade-in border border-yellow-800">
//           <h2 className="text-lg font-semibold mb-2">Booking Status</h2>
//           <ul className="space-y-2">
//             <div className="bg-white shadow-md p-3 flex items-center justify-between">
//               <div className="flex items-center">
//                 <FaPhone className="block text-black w-5 h-5 mr-3" />
//                 {/* Text Container */}
//                 <div className="flex flex-col">
//                   <span className="block">Payment Received</span>
//                   <span className="text-xs text-gray-500">We have received your payment</span>
//                 </div>
//               </div>
//               {/* Number Indicator */}
//               <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white">1</span>
//             </div>

//             <div className="bg-white shadow-md p-3 flex items-center justify-between">
//               <div className="flex items-center">
//                 {/* Utensils Icon */}
//                 <FaUtensils className="block text-black w-5 h-5 mr-3" />
//                 {/* Text Container */}
//                 <div className="flex flex-col">
//                   <span className="block">Confirm from CaterOrange</span>
//                   <span className="text-xs text-gray-500">(It will take Maximum 2-3 minutes)</span>
//                 </div>
//               </div>
//               {/* Number Indicator */}
//               <span className="w-6 h-6 bg-green-300 rounded-full flex items-center justify-center text-white">2</span>
//             </div>

//             <div className="bg-white shadow-md p-3 flex items-center justify-between">
//               <div className="flex items-center">
//                 {/* Check Square Icon */}
//                 <FaCheckSquare className="block text-black w-5 h-5 mr-3" />
//                 {/* Text Container */}
//                 <div className="flex flex-col">
//                   <span className="block">Booking Confirmed</span>
//                   <span className="text-xs text-gray-500">Your Booking is confirmed now</span>
//                 </div>
//               </div>
//               {/* Number Indicator */}
//               <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">3</span>
//             </div>
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SuccessPage;






import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { FaPhone, FaUtensils, FaCheckSquare } from 'react-icons/fa';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { VerifyToken } from '../../../MiddleWare/verifyToken';

const SuccessPage = () => {
  const [animationState, setAnimationState] = useState('initial');
  const [orderid, setOrderId] = useState('');
  const navigate = useNavigate(); 
  const location = useLocation();
  const { order_id } = location.state;
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setCurrentDateTime(`${formattedDate} at ${formattedTime}`);
  }, []);
  VerifyToken();
  // useEffect(() => {
  //   const getordergenid = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_URL}/api/corporate/getOrdergenId`, {
  //         headers: { 'token': localStorage.getItem('token') },
  //       });
  //       setOrderId(response.data.order_genid.corporateorder_generated_id); 
  //     } catch (error) {
  //       console.error('Error in fetching order generated id', error);
  //     }
  //   };

  //   getordergenid();

  //   const timer = setTimeout(() => {
  //     setAnimationState('animated');
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, []);
  const timer = setTimeout(() => {
    setAnimationState('animated');
  }, 3000);
  useEffect(() => {
    const navigateTimer = setTimeout(() => {
      navigate('/orders'); 
    }, 6000); 

    return () => clearTimeout(navigateTimer);
  }, [navigate]); 


  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden">
      <div
        className={`w-full h-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out
          ${animationState === 'animated' ? 'rounded-full w-45 h-70 -translate-y-24 bg-teal-800' : 'bg-teal-600'}`}
      >
        <div className="flex items-center justify-center bg-teal-100 bg-opacity-50 rounded-full w-24 h-24">
          <div className="flex items-center justify-center bg-white w-13 h-13 rounded-md">
            <Check className="text-green-500 w-8 h-8" />
          </div>
        </div>

        <p className="text-white text-lg mt-2">Order Successful</p>
        <p className="text-white text-sm">{currentDateTime}</p>
        <p className="text-white font-bold text-sm">Order Id: {order_id}</p>
      </div>

      {animationState === 'animated' && (
        <div className="mb-14 w-80 bg-white rounded-lg shadow-md p-4 animate-fade-in border border-yellow-800">
          <h2 className="text-lg font-semibold mb-2">Booking Status</h2>
          <ul className="space-y-2">
            <div className="bg-white shadow-md p-3 flex items-center justify-between">
              <div className="flex items-center">
                <FaPhone className="block text-black w-5 h-5 mr-3" />
                {/* Text Container */}
                <div className="flex flex-col">
                  <span className="block">Payment Received</span>
                  <span className="text-xs text-gray-500">We have received your payment</span>
                </div>
              </div>
              {/* Number Indicator */}
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white">1</span>
            </div>

            <div className="bg-white shadow-md p-3 flex items-center justify-between">
              <div className="flex items-center">
                {/* Utensils Icon */}
                <FaUtensils className="block text-black w-5 h-5 mr-3" />
                {/* Text Container */}
                <div className="flex flex-col">
                  <span className="block">Confirm from CaterOrange</span>
                  <span className="text-xs text-gray-500">(It will take Maximum 2-3 minutes)</span>
                </div>
              </div>
              {/* Number Indicator */}
              <span className="w-6 h-6 bg-green-300 rounded-full flex items-center justify-center text-white">2</span>
            </div>

            <div className="bg-white shadow-md p-3 flex items-center justify-between">
              <div className="flex items-center">
                {/* Check Square Icon */}
                <FaCheckSquare className="block text-black w-5 h-5 mr-3" />
                {/* Text Container */}
                <div className="flex flex-col">
                  <span className="block">Booking Confirmed</span>
                  <span className="text-xs text-gray-500">Your Booking is confirmed now</span>
                </div>
              </div>
              {/* Number Indicator */}
              <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">3</span>
            </div>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;

