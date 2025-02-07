// import { CakeIcon, CalendarIcon, CheckCircleIcon, HomeIcon, MinusCircleIcon } from '@heroicons/react/solid';
// import axios from 'axios';
// import React, { useCallback, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import OrderDashboard from '../events/myorders';
// import { VerifyToken } from '../../MiddleWare/verifyToken';
// import { CloudCog, Loader } from 'lucide-react';

// const CorporateOrders = () => {
//   const [showCorporate, setShowCorporate] = useState(true);
//   const [expandedOrders, setExpandedOrders] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [orderData, setOrderData] = useState(null);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   VerifyToken();
// function parseNestedJSON(input) {
//   if (typeof input !== 'string') return input;

//   try {
//     const parsed = JSON.parse(input);
    
//     if (typeof parsed === 'string') {
//       return parseNestedJSON(parsed);
//     }
    
//     return parsed;
//   } catch (error) {
//     console.error('Failed to parse JSON', input);
//     return input; 
//   }
// }

// useEffect(() => {
//   const fetchOrders = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
      
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/myorders`, {
//         headers: { token: token },
//       });
//       console.log("response orders",response.data)

//       const parsedOrders = parseNestedJSON(response.data.data);

//       if (parsedOrders && parsedOrders.length > 0) {
//         const ordersWithCategoryNames = await Promise.all(
//           parsedOrders.map(async (order) => {
//             const orderDetails = typeof order.order_details === 'string' 
//               ? JSON.parse(order.order_details) 
//               : order.order_details;

//             const updatedOrderDetails = await Promise.all(
//               orderDetails.map(async (detail) => {
//                 const categoryName = await fetchCategoryName(detail.category_id);
                
//                 return { ...detail, category_name: categoryName };
//               })
//             );

//             return { ...order, order_details: updatedOrderDetails };
//           })
//         );

//         setOrderData(ordersWithCategoryNames);
//       } else {
//         setError('No corporate orders found.');
//         setOrderData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching corporate order data:', error);
//       setError('Failed to fetch orders. Please try again later.');
//       setOrderData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };
   
//   fetchOrders();
// }, []);
//   const fetchCategoryName = async (categoryId) => {
//     console.log('in my orders', categoryId)
//     try {

//       const response = await axios.post(
//         `${process.env.REACT_APP_URL}/api/customer/getcategorynameById`,
//         { categoryId},{headers:{token:localStorage.getItem('token')} }
//       );
//       console.log('cat name',response.data.categoryname.category_name)
//       return response.data.categoryname.category_name;
//     } catch (error) {
//       console.error('Error fetching category name:', error);
//       return 'Unknown Category';
//     }
//   };

//   const toggleOrderDetails = useCallback((orderId) => {
//     setExpandedOrders(prev => {
//       const newExpandedOrders = prev.includes(orderId)
//         ? prev.filter(id => id !== orderId)
//         : [...prev, orderId];
//       console.log('Toggled order:', orderId, 'New expanded orders:', newExpandedOrders);
//       return newExpandedOrders;
//     });
//   }, []);

//   const handleViewHome = () => {
//     if(showCorporate){
//       navigate('/home');
//     }else{
//       navigate('/home'); 
//     }
//   };

//   const renderProgressIcons = (progress) => {
//     const stages = ['processing', 'shipped', 'delivered'];
//     const activeIndex = stages.indexOf(progress);
    
//     return (
//       <div className="flex justify-between items-center">
//         {stages.map((stage, index) => (
//           <div key={stage} className="flex flex-col items-center">
//             {index <= activeIndex ? (
//               <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
//             ) : (
//               <MinusCircleIcon className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
//             )}
//             <span className={`text-xs ${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
//               {stage.charAt(0).toUpperCase() + stage.slice(1)}
//             </span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderOrder = useCallback((order) => {
//     const isExpanded = expandedOrders.includes(order.corporateorder_generated_id);
//     console.log('Rendering order:', order.corporateorder_generated_id, 'Expanded:', isExpanded);
    
//     return (
//       <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mb-4">
//         {/* <div
//           className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
//           onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
//         >
//           <div className="w-full">
//             <p className="text-lg sm:text-xl font-bold text-teal-800">Order ID: {order.corporateorder_generated_id}</p>
//             <p className="text-xs sm:text-sm text-gray-600 mt-1">
//               Date: {new Date(order.ordered_at).toLocaleDateString('en-GB', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit',
//               })} {new Date(order.ordered_at).toLocaleTimeString('en-GB', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true,
//               })}
//             </p>
//             <p className="text-lg sm:text-xl font-bold text-teal-800">Total Amount: {order.total_amount}</p>

//           </div>
//         </div> */}

// <div
//   className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
//   onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
// >
//   <div className="w-full flex justify-between items-start">
//     <div>
//       <p className="text-lg sm:text-xl font-bold text-teal-800">Order ID: {order.corporateorder_generated_id}</p>
//       <p className="text-xs sm:text-sm text-gray-600 mt-1">
//         Date: {new Date(order.ordered_at).toLocaleDateString('en-GB', {
//           year: 'numeric',
//           month: '2-digit',
//           day: '2-digit',
//         })} {new Date(order.ordered_at).toLocaleTimeString('en-GB', {
//           hour: '2-digit',
//           minute: '2-digit',
//           hour12: true,
//         })}
//       </p>
//     </div>

//     <div className="text-right">
//       <p className="text-lg sm:text-xl font-bold text-blue-100 bg-teal-700 px-3 py-1 rounded-lg shadow-md">
//        Total : ₹ {order.total_amount}
//       </p>
//     </div>
//   </div>
// </div>


//         {isExpanded && (
//           <div className="p-4 sm:p-6 overflow-x-auto">
//             <table className="w-full bg-white min-w-max">
//               <thead className="bg-gray-100 text-left text-xs sm:text-sm">
//                 <tr>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
//                   <th className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/3 text-center">Progress</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {order.order_details.map((detail, i) => (
//                   <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
//                       {detail.category_name || 'Unknown Category'}
//                     </td>
//                     <td className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/4">
//                       {renderProgressIcons(detail.delivery_status)}
//                     </td>
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
//                     <td
//                       className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
//                         detail.accept_status === 'rejected' ? 'text-red-500' : 'text-green-500'
//                       }`}
//                     >
//                       {detail.accept_status}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     );
//   }, [expandedOrders, toggleOrderDetails]);

  
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Left blank space - visible only on desktop */}
//       <div className="hidden lg:block w-[15%] bg-gray-50"></div>

//       {/* Main content - full width on mobile, 70% on desktop */}
//       <div className="w-full lg:w-[70%] relative">
//         {/* Header */}
//         <header className="fixed top-0 w-full lg:w-[70%] lg:left-[15%] bg-teal-800 h-16 flex items-center pl-4 z-50">
//           <HomeIcon 
//             className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2 cursor-pointer" 
//             onClick={handleViewHome}
//           /> 
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">
//             My Orders
//           </h1>
//         </header>
    
//         {/* Fixed Button Group below the header */}
//          {/* <div className="fixed top-16 w-full lg:w-[70%] lg:left-[15%] bg-white shadow-md z-40">
//           <div className="flex justify-center gap-4 sm:gap-6 py-4">
//             <button
//               className={`py-2 px-4 sm:py-3 sm:px-8 w-full max-w-[200px] rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
//                 showCorporate ? 'bg-teal-800 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
//               }`}
//               onClick={() => setShowCorporate(true)}
//             >
//               <CakeIcon className="h-5 w-5 inline-block mr-2" />
//               Corporate
//             </button>
//             <button
//               className={`py-2 px-4 sm:py-3 sm:px-8 w-full max-w-[200px] rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
//                 !showCorporate ? 'bg-teal-800 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
//               }`}
//               onClick={() => setShowCorporate(false)}
//             >
//               <CalendarIcon className="h-5 w-5 inline-block mr-2" />
//               Events
//             </button>
//           </div>
//         </div> */}
    
//         {/* Content Container */}
//         <div className="pt-32 sm:pt-48 px-4 lg:px-0">
//           <div className="bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg">
//             {showCorporate ? (
//               <div className="space-y-4 sm:space-y-8 w-full p-4">
//                 {isLoading ? (
//                     <div className="flex justify-center items-center h-64">
//                     <Loader />
//                     </div>    
//                 ) : error ? (
//                   <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
//                   <span className="block sm:inline">{error}</span>
//                 </div>                ) : orderData ? (
//                   orderData.map(renderOrder)
//                 ) : (
//                   <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
//                   <span className="block sm:inline">No corporate orders found.</span>
//                 </div>                )}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <OrderDashboard />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Right blank space - visible only on desktop */}
//       <div className="hidden lg:block w-[15%] bg-gray-50"></div>
//     </div>
//   );
// };

// export default CorporateOrders;

// import { CakeIcon, CalendarIcon, CheckCircleIcon, HomeIcon, MinusCircleIcon } from '@heroicons/react/solid';
// import axios from 'axios';
// import React, { useCallback, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import OrderDashboard from '../events/myorders';
// import { VerifyToken } from '../../MiddleWare/verifyToken';
// import { CloudCog } from 'lucide-react';

// const CorporateOrders = () => {
//   const [showCorporate, setShowCorporate] = useState(true);
//   const [expandedOrders, setExpandedOrders] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [orderData, setOrderData] = useState(null);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
  
//   VerifyToken();

//   function parseNestedJSON(input) {
//     if (typeof input !== 'string') return input;

//     try {
//       const parsed = JSON.parse(input);
      
//       // If the parsed result is a string, try parsing again
//       if (typeof parsed === 'string') {
//         return parseNestedJSON(parsed);
//       }
      
//       return parsed;
//     } catch (error) {
//       console.error('Failed to parse JSON', input);
//       return input; // Return original input if parsing fails
//     }
//   }

//   const fetchCategoryName = async (categoryId) => {
//     console.log('in my orders', categoryId)
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_URL}/api/customer/getcategorynameById`,
//         { categoryId },
//         { headers: { token: localStorage.getItem('token') } }
//       );
//       console.log('cat name', response.data.categoryname.category_name)
//       return response.data.categoryname.category_name;
//     } catch (error) {
//       console.error('Error fetching category name:', error);
//       return 'Unknown Category';
//     }
//   };

//   useEffect(() => {
//     const fetchOrders = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/myorders`, {
//           headers: { token: token },
//         });

//         const parsedOrders = parseNestedJSON(response.data.data);
        
//         if(parsedOrders.length === 0){
//           setOrderData([]);
//           return;
//         }
        
//         if (parsedOrders && parsedOrders.length > 0) {
//           const ordersWithCategoryNames = await Promise.all(
//             parsedOrders.map(async (order) => {
//               // Parse order_details string into an array if it's a string
//               const orderDetails = typeof order.order_details === 'string' 
//                 ? JSON.parse(order.order_details) 
//                 : order.order_details;

//               const updatedOrderDetails = await Promise.all(
//                 orderDetails.map(async (detail) => {
//                   const categoryName = await fetchCategoryName(detail.category_id);
                  
//                   return { ...detail, category_name: categoryName };
//                 })
//               );

//               return { ...order, order_details: updatedOrderDetails };
//             })
//           );

//           setOrderData(ordersWithCategoryNames);
//         } else {
//           setOrderData([]);
//         }
//       } catch (error) {
//         console.error('Error fetching corporate order data:', error);
//         setError('Failed to fetch orders. Please try again later.');
//         setOrderData(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };
     
//     fetchOrders();
//   }, []);

//   const toggleOrderDetails = useCallback((orderId) => {
//     setExpandedOrders(prev => {
//       const newExpandedOrders = prev.includes(orderId)
//         ? prev.filter(id => id !== orderId)
//         : [...prev, orderId];
//       console.log('Toggled order:', orderId, 'New expanded orders:', newExpandedOrders);
//       return newExpandedOrders;
//     });
//   }, []);

//   const handleViewHome = () => {
//     if(showCorporate){
//       navigate('/home');
//     }else{
//       navigate('/menu'); 
//     }
//   };

//   const renderProgressIcons = (progress) => {
//     const stages = ['processing', 'shipped', 'delivered'];
//     const activeIndex = stages.indexOf(progress);
    
//     return (
//       <div className="flex justify-between items-center">
//         {stages.map((stage, index) => (
//           <div key={stage} className="flex flex-col items-center">
//             {index <= activeIndex ? (
//               <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
//             ) : (
//               <MinusCircleIcon className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
//             )}
//             <span className={text-xs `${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
//               {stage.charAt(0).toUpperCase() + stage.slice(1)}
//             </span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   const renderOrder = useCallback((order) => {
//     const isExpanded = expandedOrders.includes(order.corporateorder_generated_id);
//     console.log('Rendering order:', order.corporateorder_generated_id, 'Expanded:', isExpanded);
    
//     return (
//       <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mb-4">
//         <div
//           className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
//           onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
//         >
//           <div className="w-full">
//             <p className="text-lg sm:text-xl font-bold text-blue-700">Order ID: {order.corporateorder_generated_id}</p>
//             <p className="text-xs sm:text-sm text-gray-600 mt-1">
//               Date: {new Date(order.ordered_at).toLocaleDateString('en-GB', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit',
//               })} {new Date(order.ordered_at).toLocaleTimeString('en-GB', {
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true,
//               })}
//             </p>
//           </div>
//         </div>

//         {isExpanded && (
//           <div className="p-4 sm:p-6 overflow-x-auto">
//             <table className="w-full bg-white min-w-max">
//               <thead className="bg-gray-100 text-left text-xs sm:text-sm">
//                 <tr>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
//                   <th className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/3 text-center">Progress</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
//                   <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {order.order_details.map((detail, i) => (
//                   <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
//                       {detail.category_name || 'Unknown Category'}
//                     </td>
//                     <td className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/4">
//                       {renderProgressIcons(detail.delivery_status)}
//                     </td>
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
//                     <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
//                     <td
//                       className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
//                         detail.status === 'cancelled' ? 'text-red-500' : 'text-green-500'
//                       }`}
//                     >
//                       {detail.status}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     );
//   }, [expandedOrders, toggleOrderDetails]);

//   // Render method for corporate orders section
//   const renderCorporateOrders = () => {
//     if (isLoading) {
//       return <p className="text-center text-gray-600 py-8">Loading orders...</p>;
//     }

//     if (error) {
//       return <p className="text-center text-red-500 py-8">{error}</p>;
//     }

//     if (!orderData || orderData.length === 0) {
//       return (
//         <div className="text-center py-8 bg-white rounded-lg shadow-md">
//           <CloudCog className="mx-auto h-16 w-16 text-gray-400 mb-4" />
//           <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
//             No Corporate Orders Yet
//           </h2>
//           <p className="text-gray-500 mb-4">
//             Looks like you haven't placed any corporate orders.
//           </p>
//           <button 
//             className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors"
//             onClick={() => navigate('/home')}
//           >
//             Browse Menu
//           </button>
//         </div>
//       );
//     }

//     return orderData.map(renderOrder);
//   };
  
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Left blank space - visible only on desktop */}
//       <div className="hidden lg:block w-[15%] bg-gray-50"></div>

//       {/* Main content - full width on mobile, 70% on desktop */}
//       <div className="w-full lg:w-[70%] relative">
//         {/* Header */}
//         <header className="fixed top-0 w-full lg:w-[70%] lg:left-[15%] bg-green-500 h-16 flex items-center pl-4 z-50">
//           <HomeIcon 
//             className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2 cursor-pointer" 
//             onClick={handleViewHome}
//           /> 
//           <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">
//             My Orders
//           </h1>
//         </header>
    
//         {/* Fixed Button Group below the header */}
//         <div className="fixed top-16 w-full lg:w-[70%] lg:left-[15%] bg-white shadow-md z-40">
//           <div className="flex justify-center gap-4 sm:gap-6 py-4">
//             <button
//               className={`py-2 px-4 sm:py-3 sm:px-8 w-full max-w-[200px] rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
//                 showCorporate ? 'bg-yellow-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
//               }`}
//               onClick={() => setShowCorporate(true)}
//             >
//               <CakeIcon className="h-5 w-5 inline-block mr-2" />
//               Corporate
//             </button>
//             <button
//               className={`py-2 px-4 sm:py-3 sm:px-8 w-full max-w-[200px] rounded-full font-semibold text-sm sm:text-lg transition-all duration-300 transform ${
//                 !showCorporate ? 'bg-green-500 text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-700 hover:scale-105'
//               }`}
//               onClick={() => setShowCorporate(false)}
//             >
//               <CalendarIcon className="h-5 w-5 inline-block mr-2" />
//               Events
//             </button>
//           </div>
//         </div>
    
//         {/* Content Container */}
//         <div className="pt-32 sm:pt-48 px-4 lg:px-0">
//           <div className="bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg">
//             {showCorporate ? (
//               <div className="space-y-4 sm:space-y-8 w-full p-4">
//                 {renderCorporateOrders()}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <OrderDashboard />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Right blank space - visible only on desktop */}
//       <div className="hidden lg:block w-[15%] bg-gray-50"></div>
//     </div>
//   );
// };

// export default CorporateOrders;




import { CakeIcon, CalendarIcon, CheckCircleIcon, HomeIcon, MinusCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDashboard from '../events/myorders';
import { VerifyToken } from '../../MiddleWare/verifyToken';
import { Loader } from 'lucide-react'; // Assuming you have a Loader component

const CorporateOrders = () => {
  const [showCorporate, setShowCorporate] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  VerifyToken();

  function parseNestedJSON(input) {
    if (typeof input !== 'string') return input;

    try {
      const parsed = JSON.parse(input);

      if (typeof parsed === 'string') {
        return parseNestedJSON(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse JSON', input);
      return input;
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/myorders`, {
          headers: { token: token },
        });
        console.log("response orders", response.data);

        const parsedOrders = parseNestedJSON(response.data.data);

        if (parsedOrders && parsedOrders.length > 0) {
          const ordersWithCategoryNames = await Promise.all(
            parsedOrders.map(async (order) => {
              const orderDetails = typeof order.order_details === 'string'
                ? JSON.parse(order.order_details)
                : order.order_details;

              const updatedOrderDetails = await Promise.all(
                orderDetails.map(async (detail) => {
                  const categoryName = await fetchCategoryName(detail.category_id);

                  return { ...detail, category_name: categoryName };
                })
              );

              return { ...order, order_details: updatedOrderDetails };
            })
          );

          setOrderData(ordersWithCategoryNames);
        } else {
          setError('No corporate orders found.');
          setOrderData(null);
        }
      } catch (error) {
        console.error('Error fetching corporate order data:', error);
        setError('Failed to fetch orders. Please try again later.');
        setOrderData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const fetchCategoryName = async (categoryId) => {
    console.log('in my orders', categoryId);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/customer/getcategorynameById`,
        { categoryId }, { headers: { token: localStorage.getItem('token') } }
      );
      console.log('cat name', response.data.categoryname.category_name);
      return response.data.categoryname.category_name;
    } catch (error) {
      console.error('Error fetching category name:', error);
      return 'Unknown Category';
    }
  };

  const toggleOrderDetails = useCallback((orderId) => {
    setExpandedOrders(prev => {
      const newExpandedOrders = prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId];
      console.log('Toggled order:', orderId, 'New expanded orders:', newExpandedOrders);
      return newExpandedOrders;
    });
  }, []);

  const handleViewHome = () => {
    navigate('/home');
  };

  const renderProgressIcons = (progress) => {
    const stages = ['processing', 'shipped', 'delivered'];
    const activeIndex = stages.indexOf(progress);

    return (
      <div className="flex justify-between items-center">
        {stages.map((stage, index) => (
          <div key={stage} className="flex flex-col items-center">
            {index <= activeIndex ? (
              <CheckCircleIcon className="text-green-500 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
            ) : (
              <MinusCircleIcon className="text-gray-400 h-4 w-4 sm:h-6 sm:w-6 mb-1 transition-transform transform hover:scale-110" />
            )}
            <span className={`text-xs ${index <= activeIndex ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
              {stage.charAt(0).toUpperCase() + stage.slice(1)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderOrder = useCallback((order) => {
    const isExpanded = expandedOrders.includes(order.corporateorder_generated_id);
    console.log('Rendering order:', order.corporateorder_generated_id, 'Expanded:', isExpanded);

    return (
      <div key={order.corporateorder_generated_id} className="w-full bg-white rounded-lg border shadow-md hover:shadow-xl transition-shadow duration-300 mb-4">
        <div
          className="flex justify-between items-center p-4 sm:p-6 bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors rounded-t-lg"
          onClick={() => toggleOrderDetails(order.corporateorder_generated_id)}
        >
          <div className="w-full flex justify-between items-start">
            <div>
              <p className="text-lg sm:text-xl font-bold text-teal-800">Order ID: {order.corporateorder_generated_id}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Date: {new Date(order.ordered_at).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })} {new Date(order.ordered_at).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg sm:text-xl font-bold text-blue-100 bg-teal-700 px-3 py-1 rounded-lg shadow-md">
                Total: ₹ {order.total_amount}
              </p>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full bg-white min-w-max">
              <thead className="bg-gray-100 text-left text-xs sm:text-sm">
                <tr>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Category Name</th>
                  <th className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/3 text-center">Progress</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Date</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Qty</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Active Qty</th>
                  <th className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {order.order_details.map((detail, i) => (
                  <tr key={i} className="border-t text-xs sm:text-sm hover:bg-gray-50">
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">
                      {detail.category_name || 'Unknown Category'}
                    </td>
                    <td className="p-2 sm:p-6 lg:p-4 whitespace-nowrap w-1/4">
                      {renderProgressIcons(detail.delivery_status)}
                    </td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.processing_date}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.quantity}</td>
                    <td className="p-2 sm:p-3 lg:p-4 whitespace-nowrap">{detail.active_quantity}</td>
                    <td
                      className={`p-2 sm:p-3 lg:p-4 font-bold whitespace-nowrap ${
                        detail.accept_status === 'rejected' ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {detail.accept_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }, [expandedOrders, toggleOrderDetails]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="fixed top-0 w-full bg-teal-800 h-16 flex items-center pl-4 z-50">
        <HomeIcon
          className="h-6 w-6 sm:h-8 sm:w-8 text-white mr-2 cursor-pointer"
          onClick={handleViewHome}
        />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white">My Orders</h1>
      </header>

      <div className="pt-24 px-4 lg:px-8 flex-grow">
        <div className="bg-gradient-to-r from-blue-50 to-white shadow-xl rounded-lg p-4">
          {showCorporate ? (
            <div className="space-y-4 sm:space-y-8 w-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader />
                </div>
              ) : error ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col items-center" role="alert">
                <span className="block sm:inline">Go and place an order to see it here.</span>
                <button
                  className="mt-4 bg-teal-800 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                  onClick={handleViewHome}
                >
                  Order Now
                </button>
              </div>
              ) : orderData && orderData.length > 0 ? (
                orderData.map(renderOrder)
              ) : (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex flex-col items-center" role="alert">
                <span className="block sm:inline">Go and place an order to see it here.</span>
                <button
                  className="mt-4 bg-teal-800 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                  onClick={handleViewHome}
                >
                  Order Now
                </button>
              </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <OrderDashboard />
            </div>
          )}
        </div>
      </div>

      <footer className="bg-teal-800 text-white text-center py-4">
        <p>Good food is just an order away! 🍜📦</p>
      </footer>
    </div>
  );
};

export default CorporateOrders;