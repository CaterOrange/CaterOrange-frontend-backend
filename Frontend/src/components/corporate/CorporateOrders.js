// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { CheckCircleIcon, MinusCircleIcon, UserCircleIcon } from '@heroicons/react/solid';
// import axios from 'axios';
// import { Loader } from 'lucide-react';
// import OrderDashboard from '../events/myorders';
// import { VerifyToken } from '../../MiddleWare/verifyToken';
// import Footer from './Footer';
// import {
//   Package,
//   Truck,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   ShoppingBag,
//   MapPin,
//   ChevronDown,
//   ChevronUp,
//   Calendar,
//   Box,
//   UserCheck,
//   XCircle,
//   Modal,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';
// import RescheduleDaysSelector from '../PauseDays';

// const Navbar = ({ activeTab, toggleSidenav, cartCount }) => {
//   return (
//     <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-20">
//       <div className="flex items-center justify-between relative">
//         <div className="absolute left-0">
//           <UserCircleIcon
//             className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity"
//             onClick={toggleSidenav}
//           />
//         </div>

//         <div className="flex-1 flex justify-center">
//           <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
//             My Orders
//           </h2>
//         </div>
//       </div>
//     </header>
//   );
// };

// // Sidenav Component
// const Sidenav = ({ isOpen, onClose, sidenavRef, userDP }) => {
//   const navigate = useNavigate();
 
//   const getInitials = (name) => {
//     if (!name) return '';
//     const names = name.split(' ');
//     return names.map((n) => n[0]).join('').toUpperCase();
//   };

//   const handleNavigation = (path) => {
//     onClose();
//     navigate(path);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userDP');
//     localStorage.removeItem('address');
//     window.location.href = '/';
//   };

//   return (
//     <>
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30"
//           onClick={onClose}
//           aria-hidden="true"
//         />
//       )}
//       <div
//         ref={sidenavRef}
//         className={`fixed top-0 left-0 h-full w-72 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="p-4 bg-teal-800 text-white">
//           <div className="flex justify-end p-2">
//             <button
//               className="text-white hover:opacity-80 transition-opacity"
//               onClick={onClose}
//               aria-label="Close menu"
//             >
//               <span className="text-2xl">✕</span>
//             </button>
//           </div>

//           <div className="flex flex-col items-center">
//             {userDP.picture ? (
//               <img
//                 src={userDP.picture}
//                 alt="Profile"
//                 className="rounded-full w-16 h-16 object-cover"
//                 referrerPolicy="no-referrer"
//               />
//             ) : (
//               <div className="rounded-full w-16 h-16 bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
//                 {getInitials(userDP.name)}
//               </div>
//             )}

//             <h3 className="mt-2 font-medium">{userDP.name || 'Hello'}</h3>
//             {userDP.phone && <p className="text-sm mt-1">{userDP.phone}</p>}
//             <p className="text-sm mt-1">{userDP.email || 'Email Address'}</p>
//           </div>
//         </div>

//         <nav>
//           <ul className="p-2 space-y-1">
//             {[
//               {label:'Home', path:'/home'},
//               { label: 'My Orders', path: '/orders' },
//               { label: 'Contact Us', path: '/contact' },
//               // { label: 'Wallet', path: '/wallet' },
//               { label: 'Settings', path: '/settings' }
//             ].map((item) => (
//               <li key={item.path}>
//                 <button
//                   className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
//                   onClick={() => handleNavigation(item.path)}
//                 >
//                   {item.label}
//                 </button>
//               </li>
//             ))}
//             <li>
//               <button
//                 className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </>
//   );
// };

// // Modal Component for Reschedule Days
// const RescheduleModal = ({ isOpen, onClose, corporateOrderId, onSaveRescheduleDays, onError }) => {
//   if (!isOpen) return null;

//   return (
//     <>
//       <div 
//         className="fixed inset-0 bg-black/50 z-50"
//         onClick={onClose}
//         aria-hidden="true"
//       />
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div 
//           className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//             <h3 className="text-lg font-semibold text-gray-800">Reschedule Days</h3>
//             <button
//               onClick={onClose}
//               className="text-gray-500 hover:text-gray-700 transition-colors"
//               aria-label="Close modal"
//             >
//               <XCircle size={24} />
//             </button>
//           </div>

//           <div className="p-6">
//             <RescheduleDaysSelector
//               corporateOrderId={corporateOrderId}
//               onSaveRescheduleDays={(payload) => {
//                 onSaveRescheduleDays(payload);
//                 onClose();
//               }}
//               onError={(error) => {
//                 onError(error);
//                 // Keep modal open on error so user can try again
//               }}
//             />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// // Image Modal Component
// const ImageModal = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }) => {
//   if (!isOpen) return null;

//   return (
//     <>
//       <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
//         <div className="relative bg-white rounded-lg shadow-lg max-w-3xl w-full overflow-hidden">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
//             aria-label="Close modal"
//           >
//             <XCircle size={24} />
//           </button>
//           <div className="flex items-center justify-center p-4">
//             <button
//               onClick={onPrev}
//               className="text-gray-500 hover:text-gray-700 transition-colors"
//               aria-label="Previous image"
//             >
//               <ChevronLeft size={32} />
//             </button>
//             <img
//               src={images[currentIndex].url}
//               alt={`Image ${currentIndex + 1}`}
//               className="max-h-[80vh] object-contain mx-4"
//             />
//             <button
//               onClick={onNext}
//               className="text-gray-500 hover:text-gray-700 transition-colors"
//               aria-label="Next image"
//             >
//               <ChevronRight size={32} />
//             </button>
//           </div>
//           {images[currentIndex].tag && (
//             <div className="text-center text-gray-700 p-2">
//               {images[currentIndex].tag}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// // Status Step Component for Delivery Progress
// const StatusStep = ({ status, isActive, isCompleted, icon: Icon, title, description, timestamp, isLast }) => (
//   <div className="flex items-start relative">
//     {/* Vertical line - only show if not the last item */}
//     {!isLast && (
//       <div className="absolute left-4 top-8 h-full w-0.5 bg-gray-200">
//         <div
//           className={`w-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
//           style={{ height: isActive ? '50%' : isCompleted ? '100%' : '0%' }}
//         />
//       </div>
//     )}
   
//     {/* Status circle and content */}
//     <div className="flex items-start z-10">
//       <div className={`rounded-full p-2 ${
//         isCompleted ? 'bg-green-500 text-white' :
//         isActive ? 'bg-blue-500 text-white' :
//         'bg-gray-200 text-gray-500'
//       }`}>
//         <Icon size={20} />
//       </div>
//       <div className="ml-4">
//         <h4 className={`font-semibold ${
//           isCompleted ? 'text-green-600' :
//           isActive ? 'text-blue-600' :
//           'text-gray-500'
//         }`}>
//           {title}
//         </h4>
//         <p className="text-sm text-gray-500">{description}</p>
//         {timestamp && (
//           <p className="text-xs text-gray-400 mt-1">
//             {new Date(timestamp).toLocaleString()}
//           </p>
//         )}
//       </div>
//     </div>
//   </div>
// );

// // Delivery Progress Component
// const DeliveryProgress = ({ status, details }) => {
//   const steps = [
//     {
//       status: 'pending',
//       icon: Clock,
//       title: 'Order Placed',
//       description: 'Your order has been placed successfully'
//     },
//     {
//       status: 'accepted',
//       icon: UserCheck,
//       title: 'Order Confirmed',
//       description: 'Seller has processed your order'
//     },
//     {
//       status: 'shipped',
//       icon: Truck,
//       title: 'Shipped',
//       description: 'Your order is on the way'
//     },
//     {
//       status: 'delivered',
//       icon: CheckCircle,
//       title: 'Delivered',
//       description: 'Order has been delivered'
//     }
//   ];

//   const statusIndex = steps.findIndex(step => step.status === status.toLowerCase());
 
//   // If the current status is "delivered", mark it as completed
//   const isDelivered = status.toLowerCase() === 'delivered';

//   return (
//     <div className="space-y-8 py-6">
//       {steps.map((step, index) => (
//         <StatusStep
//           key={step.status}
//           {...step}
//           isCompleted={isDelivered && step.status === 'delivered' ? true : index < statusIndex}
//           isActive={index === statusIndex}
//           timestamp={index <= statusIndex ? (index === 0 ? details.addedat : details.processing_date ? new Date(details.processing_date) : new Date()) : null}
//           isLast={index === steps.length - 1}
//         />
//       ))}
//     </div>
//   );
// };

// // Order Card Component
// const OrderCard = ({ order, orderDetails }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
//   const [isImageModalOpen, setIsImageModalOpen] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [currentImages, setCurrentImages] = useState([]);

//   const handleItemClick = (index) => {
//     setSelectedItemIndex(selectedItemIndex === index ? null : index);
//   };

//   const handleImageClick = (images, index) => {
//     setCurrentImages(images);
//     setCurrentImageIndex(index);
//     setIsImageModalOpen(true);
//   };

//   const handleNextImage = () => {
//     setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
//   };

//   const handlePrevImage = () => {
//     setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentImages.length) % currentImages.length);
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     switch(status.toLowerCase()) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//       case 'accepted':
//         return 'bg-blue-100 text-blue-800 border-blue-300';
//       case 'shipped':
//         return 'bg-purple-100 text-purple-800 border-purple-300';
//       case 'delivered':
//         return 'bg-green-100 text-green-800 border-green-300';
//       case 'cancelled by user':
//       case 'cancelled by admin':
//         return 'bg-red-100 text-red-800 border-red-300';
//       default:
//         return 'bg-gray-100 text-gray-800 border-gray-300';
//     }
//   };

//   // Format date to display correctly accounting for timezone
//   const formatProcessingDate = (dateString) => {
//     if (!dateString) return "N/A";
    
//     // Create a date object using the string
//     const date = new Date(dateString);
    
//     // Format the date to YYYY-MM-DD
//     return date.toLocaleDateString('en-CA'); // en-CA uses YYYY-MM-DD format
//   };

//   // Parse media JSON and get the first image URL
//   const getImageUrl = (mediaString) => {
//     try {
//       if (!mediaString) return null;
      
//       // Parse the JSON if it's a string
//       const mediaData = typeof mediaString === 'string' 
//         ? JSON.parse(mediaString) 
//         : mediaString;
      
//       // Check if items array exists and has elements
//       if (mediaData && mediaData.items && mediaData.items.length > 0) {
//         return mediaData.items[0].url;
//       }
      
//       return null;
//     } catch (error) {
//       console.error("Error parsing media data:", error);
//       return null;
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
//       {/* Order Header */}
//       <div className="p-6 border-b">
//         <div className="flex justify-between items-start">
//           <div>
//             <div className="flex items-center space-x-3">
//               <ShoppingBag className="text-teal-600" size={24} />
//               <h3 className="text-lg font-semibold text-gray-800">
//                 {order.corporateorder_generated_id}
//               </h3>
//               <button 
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setIsRescheduleModalOpen(true);
//                 }}
//                 className="flex items-center space-x-1 text-sm text-teal-600 hover:text-teal-800 border border-teal-300 hover:border-teal-500 rounded-full px-3 py-1 transition-colors"
//               >
//                 <Calendar size={14} />
//                 <span>Reschedule</span>
//               </button>
//             </div>
//             <p className="text-sm text-gray-500 mt-1">
//               Ordered on {new Date(order.ordered_at).toLocaleDateString()}
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="text-xl font-bold text-teal-600">
//               ₹{order.total_amount}
//             </span>
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="focus:outline-none"
//             >
//               {isExpanded ? <ChevronUp /> : <ChevronDown />}
//             </button>
//           </div>
//         </div>

//         {/* Delivery Address Preview */}
//         {order.customer_address && (
//           <div className="mt-4 flex items-start space-x-2 text-sm text-gray-600">
//             <MapPin size={16} className="flex-shrink-0 mt-1" />
//             <p>{order.customer_address.line1}, {order.customer_address.line2}</p>
//           </div>
//         )}
//       </div>

//       {/* Expanded Content */}
//       {isExpanded && (
//         <div className="divide-y divide-gray-100">
//           {orderDetails.map((item, index) => {
//             // Get image URL from media field
//             const imageUrl = getImageUrl(item.media);
//             const mediaData = typeof item.media === 'string' ? JSON.parse(item.media) : item.media;

//             return (
//               <div key={item.order_detail_id} className="p-4">
//                 <div
//                   className="cursor-pointer"
//                   onClick={() => handleItemClick(index)}
//                 >
//                   <div className="flex justify-between items-center">
//                     <div className="flex items-center space-x-4">
//                       {/* Show image if available, otherwise show package icon */}
//                       {imageUrl ? (
//                         <div className="w-16 h-16 rounded-lg overflow-hidden">
//                           <img 
//                             src={imageUrl} 
//                             alt={item.category_name} 
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               // Fallback to icon if image fails to load
//                               e.target.onerror = null;
//                               e.target.style.display = 'none';
//                               e.target.parentNode.innerHTML = `<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M16 16h.01"></path><path d="M12 16h.01"></path><path d="M8 16h.01"></path><path d="M4 8h16"></path></svg></div>`;
//                             }}
//                           />
//                         </div>
//                       ) : (
//                         <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
//                           <Package size={24} className="text-gray-400" />
//                         </div>
//                       )}
//                       <div>
//                         <h4 className="font-medium text-gray-800">
//                           {item.category_name}
//                         </h4>
//                         <p className="text-sm text-gray-500">
//                           Qty: {item.quantity}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           Date: {formatProcessingDate(item.processing_date)}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-3">
//                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                         getStatusColor(item.delivery_status)
//                       }`}>
//                         {item.delivery_status}
//                       </span>
//                       {selectedItemIndex === index ? <ChevronUp /> : <ChevronDown />}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Delivery Progress */}
//                 {selectedItemIndex === index && (
//                   <div className="mt-6 pl-20">
//                     <DeliveryProgress
//                       status={item.delivery_status}
//                       details={item}
//                     />
//                   </div>
//                 )}

//                 {/* Show all media images when item is expanded */}
//                 {selectedItemIndex === index && item.media && (
//                   <div className="mt-4 pl-20">
//                     <h5 className="font-medium text-gray-700 mb-2">Order Images</h5>
//                     {mediaData.items && mediaData.items.length > 0 ? (
//                       <div className="flex flex-wrap gap-2">
//                         {mediaData.items.map((mediaItem, idx) => (
//                           <div key={idx} className="relative group">
//                             <img
//                               src={mediaItem.url}
//                               alt={`Image ${idx + 1}`}
//                               className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer"
//                               onClick={() => handleImageClick(mediaData.items, idx)}
//                             />
//                             {mediaItem.tag && (
//                               <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
//                                 {mediaItem.tag}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">No order images found</p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           {/* Order Summary */}
//           <div className="p-6 bg-gray-50">
//             <h4 className="font-medium text-gray-800 mb-4">Order Summary</h4>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Total Items</span>
//                 <span className="font-medium">
//                   {orderDetails.reduce((acc, item) => acc + item.quantity, 0)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className="text-gray-600">Total Amount</span>
//                 <span className="font-medium">₹{order.total_amount}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reschedule Modal */}
//       <RescheduleModal
//         isOpen={isRescheduleModalOpen}
//         onClose={() => setIsRescheduleModalOpen(false)}
//         corporateOrderId={order.corporateorder_generated_id}
//         onSaveRescheduleDays={(payload) => {
//           console.log("Days rescheduled:", payload);
//           // Add any success notification here if needed
//         }}
//         onError={(error) => {
//           console.error("Reschedule error:", error);
//           // Add any error notification here if needed
//         }}
//       />

//       {/* Image Modal */}
//       <ImageModal
//         isOpen={isImageModalOpen}
//         onClose={() => setIsImageModalOpen(false)}
//         images={currentImages}
//         currentIndex={currentImageIndex}
//         onNext={handleNextImage}
//         onPrev={handlePrevImage}
//       />
//     </div>
//   );
// };

// // Main CorporateOrders Component
// const CorporateOrders = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [orderData, setOrderData] = useState([]);
//   const [error, setError] = useState(null);
//   const [isSidenavOpen, setIsSidenavOpen] = useState(false);
//   const [userDP, setUserDP] = useState({});
//   const sidenavRef = useRef(null);
//   const navigate = useNavigate();

//   VerifyToken();

//   // Load user display picture
//   useEffect(() => {
//     const userDPData = localStorage.getItem('userDP');
//     if (userDPData) {
//       setUserDP(JSON.parse(userDPData));
//     }
//   }, []);

//   // Handle sidenav click outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
//         setIsSidenavOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Process order data
//   const processOrderData = (rawData) => {
//     // Group by corporateorder_generated_id
//     const groupedOrders = {};
    
//     rawData.forEach(item => {
//       const orderId = item.corporateorder_generated_id;
      
//       if (!groupedOrders[orderId]) {
//         groupedOrders[orderId] = {
//           orderInfo: {
//             corporateorder_generated_id: item.corporateorder_generated_id,
//             total_amount: item.total_amount,
//             ordered_at: item.ordered_at,
//             customer_address: item.customer_address // Ensure customer_address is included
//           },
//           orderDetails: []
//         };
//       }
      
//       // Add order detail
//       groupedOrders[orderId].orderDetails.push({
//         order_detail_id: item.order_detail_id,
//         delivery_status: item.delivery_status,
//         category_id: item.category_id,
//         category_name: item.category_name,
//         quantity: item.quantity,
//         active_quantity: item.active_quantity,
//         processing_date: item.processing_date,
//         addedat: item.addedat,
//         media: item.media
//       });
//     });
    
//     return Object.values(groupedOrders);
//   };

//   // Fetch orders data
//   useEffect(() => {
//     const fetchOrders = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(
//           `${process.env.REACT_APP_URL}/api/customer/corporate/myorders`,
//           { headers: { token } }
//         );

//         if (response.data && response.data.data && response.data.data.length > 0) {
//           const processedData = processOrderData(response.data.data);
//           setOrderData(processedData);
//         } else {
//           setError('No corporate orders found.');
//         }
//       } catch (error) {
//         console.error('Error fetching corporate order data:', error);
//         setError('Failed to fetch orders. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   return (
//     <>
//     <div className="min-h-screen bg-gray-50">
//       <Navbar
//         activeTab="orders"
//         toggleSidenav={() => setIsSidenavOpen(!isSidenavOpen)}
//         cartCount={0}
//       />
//       <Sidenav
//         isOpen={isSidenavOpen}
//         onClose={() => setIsSidenavOpen(false)}
//         sidenavRef={sidenavRef}
//         userDP={userDP}
//       />
//       <div className="max-w-7xl mx-auto px-4 py-8 pt-20">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
//           <button
//             onClick={() => navigate('/home')}
//             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg
//                      transition-colors duration-200 flex items-center space-x-2"
//           >
//             <ShoppingBag size={20} />
//             <span>Place New Order</span>
//           </button>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
//           </div>
//         ) : error ? (
//           <div className="bg-white rounded-lg p-8 text-center">
//             <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">{error}</h2>
//             <button
//               onClick={() => navigate('/home')}
//               className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
//             >
//               Start Ordering
//             </button>
//           </div>
//         ) : orderData && orderData.length > 0 ? (
//           <div className="space-y-6">
//             {orderData.map(orderGroup => (
//               <OrderCard
//                 key={orderGroup.orderInfo.corporateorder_generated_id}
//                 order={orderGroup.orderInfo}
//                 orderDetails={orderGroup.orderDetails}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg p-8 text-center">
//             <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">
//               No orders yet
//             </h2>
//             <p className="text-gray-500 mb-6">
//               Start shopping to see your orders here
//             </p>
//             <button
//               onClick={() => navigate('/home')}
//               className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
//             >
//               Browse Products
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//     <Footer/>
//     </>
//   );
// };

// export default CorporateOrders;
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, MinusCircleIcon, UserCircleIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { Loader } from 'lucide-react';
import OrderDashboard from '../events/myorders';
import { VerifyToken } from '../../MiddleWare/verifyToken';
import Footer from './Footer';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ChevronUp,
  Calendar,
  Box,
  UserCheck,
  XCircle,
  Modal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import RescheduleDaysSelector from '../PauseDays';

const Navbar = ({ activeTab, toggleSidenav, cartCount }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-20">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0">
          <UserCircleIcon
            className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={toggleSidenav}
          />
        </div>

        <div className="flex-1 flex justify-center">
          <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
            My Orders
          </h2>
        </div>
      </div>
    </header>
  );
};

// Sidenav Component
const Sidenav = ({ isOpen, onClose, sidenavRef, userDP }) => {
  const navigate = useNavigate();
 
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  const handleNavigation = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDP');
    localStorage.removeItem('address');
    window.location.href = '/';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={sidenavRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 bg-teal-800 text-white">
          <div className="flex justify-end p-2">
            <button
              className="text-white hover:opacity-80 transition-opacity"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            {userDP.picture ? (
              <img
                src={userDP.picture}
                alt="Profile"
                className="rounded-full w-16 h-16 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="rounded-full w-16 h-16 bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
                {getInitials(userDP.name)}
              </div>
            )}

            <h3 className="mt-2 font-medium">{userDP.name || 'Hello'}</h3>
            {userDP.phone && <p className="text-sm mt-1">{userDP.phone}</p>}
            <p className="text-sm mt-1">{userDP.email || 'Email Address'}</p>
          </div>
        </div>

        <nav>
          <ul className="p-2 space-y-1">
            {[
              {label:'Home', path:'/home'},
              { label: 'My Orders', path: '/orders' },
              { label: 'Contact Us', path: '/contact' },
              // { label: 'Wallet', path: '/wallet' },
              { label: 'Settings', path: '/settings' }
            ].map((item) => (
              <li key={item.path}>
                <button
                  className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

// Modal Component for Reschedule Days
const RescheduleModal = ({ isOpen, onClose, corporateOrderId, onSaveRescheduleDays, onError }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Reschedule Days</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <XCircle size={24} />
            </button>
          </div>

          <div className="p-6">
            <RescheduleDaysSelector
              corporateOrderId={corporateOrderId}
              onSaveRescheduleDays={(payload) => {
                onSaveRescheduleDays(payload);
                onClose();
              }}
              onError={(error) => {
                onError(error);
                // Keep modal open on error so user can try again
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Image Modal Component
const ImageModal = ({ isOpen, onClose, images, currentIndex, onNext, onPrev }) => {
  const videoRef = useRef(null);
  const modalContentRef = useRef(null);

  // Use a useCallback to memoize the playback logic
  const handleVideoPlayback = useCallback((media) => {
    if (media && videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('Error playing video:', error);
      });
    }
  }, []);

  // Handle click outside
  const handleClickOutside = useCallback((event) => {
    if (modalContentRef.current && 
        !modalContentRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  // Add click outside listener
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  // Separate effect for handling video playback
  useEffect(() => {
    if (!isOpen) return;

    const currentMedia = images[currentIndex];
    const isVideo = currentMedia.url.toLowerCase().includes('.mp4') || 
                    currentMedia.url.toLowerCase().includes('.mov') || 
                    currentMedia.url.toLowerCase().includes('.webm');

    if (isVideo) {
      handleVideoPlayback(currentMedia);
    }
  }, [isOpen, currentIndex, images, handleVideoPlayback]);

  if (!isOpen) return null;

  const currentMedia = images[currentIndex];
  const isVideo = currentMedia.url.toLowerCase().includes('.mp4') || 
                  currentMedia.url.toLowerCase().includes('.mov') || 
                  currentMedia.url.toLowerCase().includes('.webm');

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div 
        ref={modalContentRef}
        className="relative bg-black rounded-lg shadow-lg max-w-4xl w-full overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close modal"
        >
          <XCircle size={24} />
        </button>
        <div className="flex items-center justify-center p-4">
          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={onPrev}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Previous media"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          
          {/* Media display */}
          {isVideo ? (
            <video 
              ref={videoRef}
              controls 
              autoPlay
              className="max-h-[80vh] max-w-full object-contain mx-4"
              key={currentMedia.url}
            >
              <source 
                src={currentMedia.url} 
                type={`video/${currentMedia.url.split('.').pop()}`} 
              />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={currentMedia.url}
              alt="Media"
              className="max-h-[80vh] max-w-full object-contain mx-4"
            />
          )}
          
          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={onNext}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Next media"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </div>
        {currentMedia.tag && (
          <div className="text-center text-white bg-black/50 p-2">
            {currentMedia.tag}
          </div>
        )}
      </div>
    </div>
  );
};

// Status Step Component for Delivery Progress
const StatusStep = ({ status, isActive, isCompleted, icon: Icon, title, description, timestamp, isLast }) => (
  <div className="flex items-start relative">
    {/* Vertical line - only show if not the last item */}
    {!isLast && (
      <div className="absolute left-4 top-8 h-full w-0.5 bg-gray-200">
        <div
          className={`w-full ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
          style={{ height: isActive ? '50%' : isCompleted ? '100%' : '0%' }}
        />
      </div>
    )}
   
    {/* Status circle and content */}
    <div className="flex items-start z-10">
      <div className={`rounded-full p-2 ${
        isCompleted ? 'bg-green-500 text-white' :
        isActive ? 'bg-blue-500 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        <Icon size={20} />
      </div>
      <div className="ml-4">
        <h4 className={`font-semibold ${
          isCompleted ? 'text-green-600' :
          isActive ? 'text-blue-600' :
          'text-gray-500'
        }`}>
          {title}
        </h4>
        <p className="text-sm text-gray-500">{description}</p>
        {timestamp && (
          <p className="text-xs text-gray-400 mt-1">
            {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Delivery Progress Component
const DeliveryProgress = ({ status, details }) => {
  const steps = [
    {
      status: 'pending',
      icon: Clock,
      title: 'Order Placed',
      description: 'Your order has been placed successfully'
    },
    {
      status: 'accepted',
      icon: UserCheck,
      title: 'Order Confirmed',
      description: 'Seller has processed your order'
    },
    {
      status: 'shipped',
      icon: Truck,
      title: 'Shipped',
      description: 'Your order is on the way'
    },
    {
      status: 'delivered',
      icon: CheckCircle,
      title: 'Delivered',
      description: 'Order has been delivered'
    }
  ];

  const statusIndex = steps.findIndex(step => step.status === status.toLowerCase());
 
  // If the current status is "delivered", mark it as completed
  const isDelivered = status.toLowerCase() === 'delivered';

  return (
    <div className="space-y-8 py-6">
      {steps.map((step, index) => (
        <StatusStep
          key={step.status}
          {...step}
          isCompleted={isDelivered && step.status === 'delivered' ? true : index < statusIndex}
          isActive={index === statusIndex}
          timestamp={index <= statusIndex ? (index === 0 ? details.addedat : details.processing_date ? new Date(details.processing_date) : new Date()) : null}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
};

const OrderCard = ({ order, orderDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);

  const handleItemClick = (index) => {
    setSelectedItemIndex(selectedItemIndex === index ? null : index);
  };

  const handleImageClick = (images, index) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setIsImageModalOpen(true);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentImages.length) % currentImages.length);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled by user':
      case 'cancelled by admin':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format date to display correctly accounting for timezone
  const formatProcessingDate = (dateString) => {
    if (!dateString) return "N/A";
    
    // Create a date object using the string
    const date = new Date(dateString);
    
    // Format the date to YYYY-MM-DD
    return date.toLocaleDateString('en-CA'); // en-CA uses YYYY-MM-DD format
  };

  // Parse media JSON and get the first image URL
  const getImageUrl = (mediaString) => {
    try {
      if (!mediaString) return null;
      
      // Parse the JSON if it's a string
      const mediaData = typeof mediaString === 'string' 
        ? JSON.parse(mediaString) 
        : mediaString;
      
      // Check if items array exists and has elements
      if (mediaData && mediaData.items && mediaData.items.length > 0) {
        return mediaData.items[0].url;
      }
      
      return null;
    } catch (error) {
      console.error("Error parsing media data:", error);
      return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
   
 <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3" onClick={() => setIsExpanded(!isExpanded)}>
              <div className="flex items-center space-x-2 w-full" >
                <ShoppingBag className="text-teal-600 hidden sm:block" size={24} />
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex-grow">
                  {order.corporateorder_generated_id}
                </h3>
              </div>
              <div className="flex justify-between w-full items-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRescheduleModalOpen(true);
                  }}
                  className="flex items-center space-x-1 text-xs sm:text-sm text-teal-600 hover:text-teal-800 border border-teal-300 hover:border-teal-500 rounded-full px-2 sm:px-3 py-1 transition-colors"
                >
                  <Calendar size={14} />
                  <span>Reschedule</span>
                </button>
                <span className="text-base sm:text-xl font-bold text-teal-600">
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Ordered on {new Date(order.ordered_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Delivery Address Preview */}
        {order.customer_address && (
          <div className="mt-4 flex items-start space-x-2 text-xs sm:text-sm text-gray-600">
            <MapPin size={16} className="flex-shrink-0 mt-1" />
            <p className="truncate">{order.customer_address.line1}, {order.customer_address.line2}</p>
          </div>
        )}
      </div>
      {/* Expanded Content */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {orderDetails.map((item, index) => {
            // Get image URL from media field
            const imageUrl = getImageUrl(item.media);
            const mediaData = typeof item.media === 'string' ? JSON.parse(item.media) : item.media;

            return (
              <div key={item.order_detail_id} className="p-4">
                <div
                  className="cursor-pointer"
                  onClick={() => handleItemClick(index)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {/* Show image if available, otherwise show package icon */}
                      {imageUrl ? (
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <img 
                            src={imageUrl} 
                            alt={item.category_name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = `<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="M16 16h.01"></path><path d="M12 16h.01"></path><path d="M8 16h.01"></path><path d="M4 8h16"></path></svg></div>`;
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {item.category_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-500">
                          Date: {formatProcessingDate(item.processing_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(item.delivery_status)
                      }`}>
                        {item.delivery_status}
                      </span>
                      {selectedItemIndex === index ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>
                </div>

                {/* Delivery Progress */}
                {selectedItemIndex === index && (
                  <div className="mt-6 pl-20">
                    <DeliveryProgress
                      status={item.delivery_status}
                      details={item}
                    />
                  </div>
                )}

                {/* Show all media images when item is expanded */}
{selectedItemIndex === index && item.media && (
  <div className="mt-4 pl-20">
    <h5 className="font-medium text-gray-700 mb-2">Order Media</h5>
    {mediaData.items && mediaData.items.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {mediaData.items.map((mediaItem, idx) => {
          const isVideo = mediaItem.url.toLowerCase().includes('.mp4') || mediaItem.url.toLowerCase().includes('.mov');
          
          return (
            <div key={idx} className="relative group">
              {isVideo ? (
                <div 
                  className="w-24 h-24 bg-gray-200 rounded-lg border border-gray-200 cursor-pointer flex items-center justify-center relative"
                  onClick={() => handleImageClick(mediaData.items, idx)}
                >
                  <img 
                    src={mediaItem.url} 
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="z-10">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              ) : (
                <img
                  src={mediaItem.url}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer"
                  onClick={() => handleImageClick(mediaData.items, idx)}
                />
              )}
              {mediaItem.tag && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                  {mediaItem.tag}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-sm text-gray-500">No order media found</p>
    )}
  </div>
)}
          {/* Order Summary */}
          <div className="p-6 bg-gray-50">
            <h4 className="font-medium text-gray-800 mb-4">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items</span>
                <span className="font-medium">
                  {orderDetails.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        corporateOrderId={order.corporateorder_generated_id}
        onSaveRescheduleDays={(payload) => {
          console.log("Days rescheduled:", payload);
          // Add any success notification here if needed
        }}
        onError={(error) => {
          console.error("Reschedule error:", error);
        }}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={currentImages}
        currentIndex={currentImageIndex}
        onNext={handleNextImage}
        onPrev={handlePrevImage}
      />
    </div>
  );
};

const CorporateOrders = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState([]);
  const [error, setError] = useState(null);
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [userDP, setUserDP] = useState({});
  const sidenavRef = useRef(null);
  const navigate = useNavigate();

  VerifyToken();

  // Load user display picture
  useEffect(() => {
    const userDPData = localStorage.getItem('userDP');
    if (userDPData) {
      setUserDP(JSON.parse(userDPData));
    }
  }, []);

  // Handle sidenav click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
        setIsSidenavOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Process order data
  const processOrderData = (rawData) => {
    // Group by corporateorder_generated_id
    const groupedOrders = {};
    
    rawData.forEach(item => {
      const orderId = item.corporateorder_generated_id;
      
      if (!groupedOrders[orderId]) {
        groupedOrders[orderId] = {
          orderInfo: {
            corporateorder_generated_id: item.corporateorder_generated_id,
            total_amount: item.total_amount,
            ordered_at: item.ordered_at,
            customer_address: item.customer_address // Ensure customer_address is included
          },
          orderDetails: []
        };
      }
      
      // Add order detail
      groupedOrders[orderId].orderDetails.push({
        order_detail_id: item.order_detail_id,
        delivery_status: item.delivery_status,
        category_id: item.category_id,
        category_name: item.category_name,
        quantity: item.quantity,
        active_quantity: item.active_quantity,
        processing_date: item.processing_date,
        addedat: item.addedat,
        media: item.media
      });
    });
    
    return Object.values(groupedOrders);
  };

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/customer/corporate/myorders`,
          { headers: { token } }
        );

        if (response.data && response.data.data && response.data.data.length > 0) {
          const processedData = processOrderData(response.data.data);
          setOrderData(processedData);
        } else {
          setError('No corporate orders found.');
        }
      } catch (error) {
        console.error('Error fetching corporate order data:', error);
        setError('Failed to fetch orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <Navbar
        activeTab="orders"
        toggleSidenav={() => setIsSidenavOpen(!isSidenavOpen)}
        cartCount={0}
      />
      <Sidenav
        isOpen={isSidenavOpen}
        onClose={() => setIsSidenavOpen(false)}
        sidenavRef={sidenavRef}
        userDP={userDP}
      />
<div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 pt-20">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-0">My Orders</h1>
          <button
            onClick={() => navigate('/home')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg
                     transition-colors duration-200 flex items-center space-x-2 w-full sm:w-auto text-center justify-center"
          >
            <ShoppingBag size={20} />
            <span>Place New Order</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{error}</h2>
            <button
              onClick={() => navigate('/home')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Start Ordering
            </button>
          </div>
        ) : orderData && orderData.length > 0 ? (
          <div className="space-y-6">
            {orderData.map(orderGroup => (
              <OrderCard
                key={orderGroup.orderInfo.corporateorder_generated_id}
                order={orderGroup.orderInfo}
                orderDetails={orderGroup.orderDetails}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start shopping to see your orders here
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CorporateOrders;
