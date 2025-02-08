

// import axios from 'axios';
// import { ChevronLeft, Loader, Minus, Plus, ShoppingCart, ShoppingCartIcon, Trash2 } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useCart } from '../../services/contexts/CartContext';
// import { jwtDecode } from 'jwt-decode';
// import AddressForm from '../Address/AddressForm';
// import { VerifyToken } from '../../MiddleWare/verifyToken';
// import { io } from 'socket.io-client';

// const MyCart = () => {
//   const [Total, setTotal] = useState(0);
//   const [CartData, setCartData] = useState([]);
//   const [sortedData, setSortedData] = useState([]);
//   const [redirectUrl, setRedirectUrl] = useState('');
//   const [error, setError] = useState('');
//   const [Address, setAddress] = useState([]);
//   const OrderData = [];
//   const { updateCartCount } = useCart();
//   const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//   const tokens = localStorage.getItem('token');
//   const decodedToken = jwtDecode(tokens);
//   const emails = decodedToken.email;

//   var parsedAddress;
//   const [userAddressDetails, setUserAddressDetails] = useState({
//     Name: '',
//     phonenumber: '',
//     address: ''
//   });
//   VerifyToken();
//   const [userData, setUserData] = useState({
//     Name: '',
//     email: '',
//     PhoneNumber: '',
//     address: '',
//     id: ''
//   });

//   const [isLoading, setIsLoading] = useState(true);
//   const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
//   const navigate = useNavigate();

//   const fetchCart = async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       navigate('/');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_URL}/api/cart`, {
//         headers: { token },
//       });
//       setCartData(response.data);
//       setIsLoading(false);
//     } catch (error) {
//       console.error('Error fetching cart data:', error);
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const socket = io(process.env.REACT_APP_URL, {
//       transports: ['websocket', 'polling']
//     });
//     socket.on('connect', () => {
//       console.log(`Connected to server with socket id: ${socket.id}`);
//       socket.emit('message', 'Hello, server!');
//     });
//     socket.on('cartUpdated', (data) => {
//       console.log('Cart updated:', data);
//       fetchCart();
//     });

//     socket.on('message', (data) => {
//       console.log(`Message from server: ${data}`);
//     });

//     socket.on('disconnect', () => {
//       console.log('Disconnected from server');
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     fetchCart();
//   }, [navigate]);

//   useEffect(() => {
//     const fetchCustomer = async () => {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/');
//         return;
//       }
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/getCustomerDetails`, {
//           headers: { "token": token },
//         });
//         setUserData(response.data);
//       } catch (error) {
//         console.error('Error fetching customer data:', error);
//       }
//     };

//     fetchCustomer();

//     const storedAddress = localStorage.getItem('address');
//     if (storedAddress) {
//       try {
//         parsedAddress = JSON.parse(storedAddress);
//         const formattedAddress = `${parsedAddress.tag}, ${parsedAddress.line1}, ${parsedAddress.pincode}`;
//         setUserAddressDetails(prevData => ({
//           ...prevData,
//           Name: parsedAddress.ship_to_name || parsedAddress.default_name || prevData.Name,
//           phonenumber: parsedAddress.ship_to_phone_number || prevData.PhoneNumber,
//           address: formattedAddress
//         }));
//       } catch (error) {
//         console.error('Error parsing address from localStorage:', error);
//       }
//     } else {
//       setUserAddressDetails(prevData => ({
//         ...prevData,
//         Name: userData.Name,
//         phonenumber: userData.PhoneNumber,
//         address: userData.address
//       }));
//     }
//   }, []);

//   const parseNestedJSON = (data) => {
//     if (!data) return null;
//     let parsedData = data;
//     while (typeof parsedData === 'string') {
//       try {
//         parsedData = JSON.parse(parsedData);
//       } catch (e) {
//         break;
//       }
//     }
//     return parsedData;
//   };

//   useEffect(() => {
//     if (!CartData || Object.keys(CartData).length === 0) return;

//     let tempCartData = [];

//     try {
//       Object.entries(CartData).forEach(([key, value]) => {
//         const parsedCart = parseNestedJSON(value);
//         if (!parsedCart || typeof parsedCart !== 'object') {
//           console.error('Invalid cart data format');
//           return;
//         }

//         const orderDetails = parseNestedJSON(parsedCart.cart_order_details);

//         if (Array.isArray(orderDetails)) {
//           orderDetails.forEach(detail => {
//             tempCartData.push({
//               id: key,
//               ...detail,
//             });
//           });
//         }
//       });

//       const sortedCartItems = tempCartData.sort((a, b) => new Date(a.date) - new Date(b.date));
//       setSortedData(sortedCartItems);
//     } catch (error) {
//       console.error('Error processing cart data:', error);
//       setSortedData([]);
//     }
//   }, [CartData]);

//   useEffect(() => {
//     const totalAmount = sortedData.reduce(
//       (sum, item) => sum + Number(item.price) * Number(item.quantity),
//       0
//     );
//     setTotal(totalAmount);

//     const count = sortedData.reduce(
//       (sum, item) => sum + (Number(item.quantity) || 0),
//       0
//     );
//     updateCartCount(count);

//     const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//     const updatedUserDP = {
//       ...storedUserDP,
//       cartCount: count,
//     };
//     localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
//   }, [sortedData]);

//   useEffect(() => {
//     const handleStorageChange = () => {
//       const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//       if (storedUserDP.cartCount !== undefined) {
//         updateCartCount(storedUserDP.cartCount);
//       }
//     };

//     window.addEventListener('storage', handleStorageChange);

//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   const handleDecrement = async (index) => {
//     setSortedData((prevItems) => {
//       const updatedItems = [...prevItems];
//       if (updatedItems[index].quantity > 1) {
//         const updatedItem = {
//           ...updatedItems[index],
//           quantity: updatedItems[index].quantity - 1,
//         };
//         updatedItems[index] = updatedItem;

//         try {
//           const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
//             const parsedValue = parseNestedJSON(value);
//             if (!parsedValue || !parsedValue.cart_order_details) return false;

//             const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
//             if (!Array.isArray(orderDetails)) return false;

//             return orderDetails.some(detail =>
//               detail.date === updatedItem.date &&
//               key === updatedItem.id
//             );
//           });

//           if (matchingCartItem) {
//             const [itemKey, itemValue] = matchingCartItem;
//             const parsedItemValue = parseNestedJSON(itemValue);
//             const cartDetails = parseNestedJSON(parsedItemValue.cart_order_details);

//             if (Array.isArray(cartDetails)) {
//               const updatedCartDetails = cartDetails.map(detail => {
//                 if (detail.date === updatedItem.date) {
//                   return {
//                     ...detail,
//                     quantity: updatedItem.quantity
//                   };
//                 }
//                 return detail;
//               });

//               const newTotalAmount = updatedCartDetails.reduce(
//                 (sum, detail) => sum + (detail.price * detail.quantity),
//                 0
//               );

//               const updatedCartItem = {
//                 cart_order_details: updatedCartDetails,
//                 total_amount: newTotalAmount
//               };

//               updateCartItem(itemKey, updatedCartItem);

//               const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//               const updatedUserDP = {
//                 ...storedUserDP,
//                 cartCount: sortedData.reduce((sum, item) => sum + item.quantity, 0)
//               };
//               localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
//               updateCartCount(updatedUserDP.cartCount);
//             }
//           }
//         } catch (error) {
//           console.error('Error updating cart:', error);
//         }

//         return updatedItems;
//       }
//       return prevItems;
//     });
//   };

//   const formatCartItem = (cartOrderDetails, totalAmount) => {
//     return {
//       cart_order_details: cartOrderDetails,
//       total_amount: totalAmount
//     };
//   };

//   const handleIncrement = async (index) => {
//     setSortedData((prevItems) => {
//       const updatedItems = [...prevItems];
//       const updatedItem = {
//         ...updatedItems[index],
//         quantity: parseInt(updatedItems[index].quantity) + 1,
//       };
//       updatedItems[index] = updatedItem;

//       try {
//         const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
//           const parsedValue = parseNestedJSON(value);
//           if (!parsedValue || !parsedValue.cart_order_details) return false;

//           const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
//           if (!Array.isArray(orderDetails)) return false;

//           return orderDetails.some(detail =>
//             detail.date === updatedItem.date &&
//             key === updatedItem.id
//           );
//         });

//         if (matchingCartItem) {
//           const [itemKey, itemValue] = matchingCartItem;
//           const parsedItemValue = parseNestedJSON(itemValue);
//           const cartDetails = parseNestedJSON(parsedItemValue.cart_order_details);

//           if (Array.isArray(cartDetails)) {
//             const updatedCartDetails = cartDetails.map(detail => {
//               if (detail.date === updatedItem.date) {
//                 return {
//                   ...detail,
//                   quantity: updatedItem.quantity
//                 };
//               }
//               return detail;
//             });

//             const newTotalAmount = updatedCartDetails.reduce(
//               (sum, detail) => sum + (detail.price * detail.quantity),
//               0
//             );

//             const updatedCartItem = formatCartItem(updatedCartDetails, newTotalAmount);
//             updateCartItem(itemKey, updatedCartItem);
//           }
//         }
//       } catch (error) {
//         console.error('Error updating cart:', error);
//       }

//       return updatedItems;
//     });
//   };

//   const updateCartItem = async (itemId, updatedCartItem) => {
//     try {
//       const token = localStorage.getItem('token');
//       const itemToSend = typeof updatedCartItem === 'string'
//         ? updatedCartItem
//         : JSON.stringify(updatedCartItem);

//       const response = await axios.post(
//         `${process.env.REACT_APP_URL}/api/cart/update`,
//         {
//           itemId,
//           item: itemToSend,
//         },
//         {
//           headers: {
//             'token': token,
//           },
//         }
//       );

//       if (!response.data.success) {
//         console.error('Failed to update cart:', response.data.message);
//       }
//     } catch (error) {
//       console.error('Error updating cart item:', error);
//     }
//   };

//   const handleRemove = async (index) => {
//     const itemToRemove = sortedData[index];

//     try {
//       const token = localStorage.getItem('token');
//       const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
//         const parsedValue = parseNestedJSON(value);
//         if (!parsedValue || !parsedValue.cart_order_details) return false;

//         const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
//         if (!Array.isArray(orderDetails)) return false;

//         return orderDetails.some(detail =>
//           detail.date === itemToRemove.date &&
//           key === itemToRemove.id
//         );
//       });

//       if (matchingCartItem) {
//         const [itemId] = matchingCartItem;

//         const response = await axios.delete(
//           `${process.env.REACT_APP_URL}/api/cart/${itemId}`,
//           {
//             headers: { 'token': token }
//           }
//         );

//         if (response.data.success) {
//           setSortedData(prevItems => prevItems.filter((_, i) => i !== index));

//           setCartData(prevData => {
//             const newData = { ...prevData };
//             delete newData[itemId];
//             return newData;
//           });

//           const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//           const updatedCount = (storedUserDP.cartCount || 0) - itemToRemove.quantity;
//           const updatedUserDP = {
//             ...storedUserDP,
//             cartCount: Math.max(0, updatedCount)
//           };
//           localStorage.setItem('userDP', JSON.stringify(updatedUserDP));

//           updateCartCount(Math.max(0, updatedCount));
//         }
//       } else {
//         console.error('Could not find matching cart item to remove');
//       }
//     } catch (error) {
//       console.error('Error removing cart item:', error);
//     }
//   };

//   const handleViewHome = () => {
//     navigate('/home');
//   };

//   const handleAddressFormToggle = () => {
//     setIsAddressFormOpen(!isAddressFormOpen);
//   };

//   const handleViewPayment = async () => {
//     try {
//       for (let i = 0; i < sortedData.length; i++) {
//         const Data = {
//           category_id: sortedData[i].category_id,
//           processing_date: sortedData[i].date,
//           delivery_status: 'processing',
//           quantity: sortedData[i].quantity,
//           active_quantity: sortedData[i].quantity,
//           media: null,
//           delivery_details: null,
//           accept_status: 'pending'
//         };
//         OrderData.push(Data);
//       }
//       const OrderDataJSON = JSON.stringify(OrderData);

//       const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporate/transfer-cart-to-order`, {
//         customer_generated_id: decodedToken.id,
//         order_details: OrderDataJSON,
//         total_amount: Total,
//         paymentid: null,
//         customer_address: localStorage.getItem('address'),
//         payment_status: 'pending',
//       }, {
//         headers: { 'token': localStorage.getItem('token') }
//       });

//       if (response.status === 200) {
//         await PaymentDetails(response.data.order.corporateorder_generated_id);
//         await sendOrderDetails(response.data.order);
//       } else {
//         console.error('Failed to add details to order_table:', response.data);
//       }
//     } catch (error) {
//       console.error('Error adding details to order_table:', error);
//     }
//   };

//   const sendOrderDetails = async (orderDetails) => {
//     try {
//       let response;
//       let details = orderDetails.order_details;

//       for (let i = 0; i < details.length; i++) {
//         response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporateOrderDetails`, {
//           headers: { token: localStorage.getItem('token') }
//         },
//           {
//             corporateorder_id: orderDetails.corporateorder_id,
//             processing_date: details[i].processing_date,
//             delivery_status: details[i].delivery_status,
//             category_id: details[i].category_id,
//             quantity: details[i].quantity,
//             active_quantity: details[i].active_quantity,
//             media: details[i].media,
//             delivery_details: details[i].delivery_details
//           });
//       }

//       if (response) {
//         console.log('Order details successfully added:', response.data);
//       } else {
//         console.error('Failed to add details to order_table:', response.data);
//       }
//     } catch (error) {
//       console.error('Error sending order details:', error);
//     }
//   };

//   // const handleViewPayment = async () => {
//   //   console.log("hiiiii")
//   //   const decodedToken = jwtDecode(tokens);

//   //   try {

//   //     for (let i = 0; i < sortedData.length; i++) {

//   //       const Data = {
//   //         category_id: sortedData[i].category_id,
//   //         processing_date: sortedData[i].date,
//   //         delivery_status: 'processing',
//   //         quantity: sortedData[i].quantity,
//   //         active_quantity: sortedData[i].quantity,
//   //         media: null,
//   //         delivery_details: null,
//   //         accept_status:'pending'
//   //       };
//   //       OrderData.push(Data);
//   //     }
//   //     const OrderDataJSON = JSON.stringify(OrderData);
//   //  console.log('orderdata',OrderDataJSON)
//   //     const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporate/transfer-cart-to-order`, {
//   //       customer_generated_id: decodedToken.id,
//   //       order_details: OrderDataJSON,
//   //       total_amount: Total,
//   //       paymentid: null,
//   //       customer_address: localStorage.getItem('address'),
//   //       payment_status: 'pending',

//   //     }, {
//   //       headers: { 'token': localStorage.getItem('token') }
//   //     }
//   //     );

//   //     console.log('corporate ',response.data)
//   //     if (response.status === 200) {
//   //       await PaymentDetails(response.data.order.corporateorder_generated_id);
//   //       await sendOrderDetails(response.data.order);

//   //       console.log('Cart details added to orders', response.data);
//   //     } else {
//   //       console.error('Failed to add details to order_table:', response.data);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error adding details to order_table:', error);
//   //   }
//   // };



//   // const PaymentDetails = async (corporateorder_generated_id) => {
//   //   try {
//   //     console.log('corporate orders ',corporateorder_generated_id)
//   //     // const token=localStorage.getItem('token')

//   //     const response = await axios.post(`${process.env.REACT_APP_URL}/api/pay`,
//   //       { amount: Total, corporateorder_id: corporateorder_generated_id },
//   //       { headers: { token: localStorage.getItem('token') } });
//   //     setSortedData([]);
//   //     setCartData([]);
//   //     setCartIndividualData([]);
//   //     setTotal(0);

//   //     // Get user-specific details from local storage
//   //     const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//   //     const updatedUserDP = {
//   //       ...storedUserDP,
//   //       cartCount: 0, // Update the cart count for the specific user to 0 after payment
//   //     };

//   //     // Update local storage with updated user cart count
//   //     localStorage.setItem('userDP', JSON.stringify(updatedUserDP));

//   //     // Update cart count in context
//   //     updateCartCount(0);

//   //     // Redirect to the payment URL if available
//   //     if (response.data && response.data.redirectUrl) {
//   //       setRedirectUrl(response.data.redirectUrl);
//   //       window.location.href = response.data.redirectUrl;
//   //     } else {
//   //       setError('Unexpected response format.');
//   //     }
//   //   } catch (err) {
//   //     // Check for specific error details
//   //     if (err.response) {
//   //       setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
//   //     } else {
//   //       setError('Network error or no response from the server.');
//   //     }
//   //   } 
//   // }


  
//   const PaymentDetails = async (corporateorder_generated_id) => {
//     const message = "";
//     const responsepay = {};
//     try {
//       try {
//         if (!window.Razorpay) {
//           alert("Razorpay SDK failed to load. Check your internet connection.");
//           return;
//         }

//         const { data } = await axios.post(`${process.env.REACT_APP_URL}/api/create-order`, {
//           amount: Total,
//           currency: "INR",
//         });

//         const options = {
//           key:'rzp_live_L9ioBuAQZXSBDm',
//           amount: data.amount,
//           currency: data.currency,
//           name: "CaterOrange",
//           description: "Payment",
//           order_id: data.id,
//           handler: async (response) => {
//             console.log("hii",response
//             const verifyRes = await axios.post(`${process.env.REACT_APP_URL}/api/verify-payment`, response);
//             const paymentPayload = {
//               paymentType: "Net",
//               merchantTransactionId: "mer123",
//               phonePeReferenceId: response.razorpay_payment_id,
//               paymentFrom: "RazorPay",
//               instrument: 'N/A',
//               bankReferenceNo: 'N/A',
//               amount: Total,
//               customer_id: decodedToken.id,
//               corporateorder_id: corporateorder_generated_id
//             };
//             await axios.post(`${process.env.REACT_APP_URL}/api/insert-payment`, paymentPayload);
//           },
//          prefill: {
//             name: userAddressDetails.Name,
//             email: emails,
//             contact: userAddressDetails.phonenumber,
//           },
//           theme: { color: "#3399cc" },
//         };

//         const razor = new window.Razorpay(options);
//         razor.open();
//       } catch (error) {
//         console.error(error);
//         alert("Payment Failed!");
//       }

//       setSortedData([]);
//       setCartData([]);
//       setCartIndividualData([]);
//       setTotal(0);

//       const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//       const updatedUserDP = {
//         ...storedUserDP,
//         cartCount: 0,
//       };

//       localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
//       updateCartCount(0);

//       if (response.data && response.data.redirectUrl) {
//         setRedirectUrl(response.data.redirectUrl);
//         window.location.href = response.data.redirectUrl;
//       } else {
//         setError('Unexpected response format.');
//       }
//     } catch (err) {
//       if (err.response) {
//         setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
//       } else {
//         setError('Network error or no response from the server.');
//       }
//     }
//   };

//   const handleAddressAdd = () => {
//     fetchAddress();
//     handleAddressFormToggle();
//   };

//   const fetchAddress = async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`, {
//         headers: { token: localStorage.getItem('token') }
//       });

//       setAddress(response.data.address);
//       const myAddresses = response.data.address;
//       const ChangedAddress = myAddresses[myAddresses.length - 1];
//       localStorage.setItem('address', JSON.stringify(ChangedAddress));
//       if (response.data.address && response.data.address.length > 0) {
//         setUserAddressDetails(prevData => ({
//           ...prevData,
//           Name: ChangedAddress.ship_to_name || ChangedAddress.default_name || prevData.Name,
//           phonenumber: ChangedAddress.ship_to_phone_number || prevData.PhoneNumber,
//           address: `${ChangedAddress.line1}, ${ChangedAddress.line2}, ${ChangedAddress.pincode}`
//         })

//         );

//       }
//     } catch (error) {
//       console.error('Error fetching address:', error);
//     }
//   };

//   const handleAddressSelect = (address) => {
//     console.log('Address selected:', address);
//     localStorage.setItem('address', JSON.stringify(address));
//     setUserAddressDetails(prevData => ({
//       ...prevData,
//       Name: address.ship_to_name || address.default_name || prevData.Name,
//       phonenumber: address.ship_to_phone_number || prevData.PhoneNumber,
//       address: `${address.line1}, ${address.line2}, ${address.pincode}`
//     }));
//     handleAddressFormToggle();
//   };
//   // if (isLoading) {
//   //   return <div className="text-center mt-8">Loading...</div>;
//   // }
//   const handleQuantityChange = (index, value) => {
//     // Handle empty input
//     if (value === '') {
//       setSortedData((prevItems) => {
//         const updatedItems = [...prevItems];
//         updatedItems[index] = {
//           ...updatedItems[index],
//           quantity: '',
//         };
//         return updatedItems;
//       });
//       return;
//     }
//     const newQuantity = parseInt(value, 10);
//     if (!isNaN(newQuantity) && newQuantity > 0) {
//       setSortedData((prevItems) => {
//         const updatedItems = [...prevItems];
//         const updatedItem = {
//           ...updatedItems[index],
//           quantity: newQuantity,
//         };
//         updatedItems[index] = updatedItem;

//         try {
//           // Find the matching cart item
//           const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
//             const parsedValue = parseNestedJSON(value);
//             if (!parsedValue || !parsedValue.cart_order_details) return false;

//             const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
//             if (!Array.isArray(orderDetails)) return false;

//             return orderDetails.some(detail =>
//               detail.date === updatedItem.date &&
//               key === updatedItem.id
//             );
//           });

//           if (matchingCartItem) {
//             const [itemKey, itemValue] = matchingCartItem;
//             const parsedItemValue = parseNestedJSON(itemValue);
//             const cartDetails = parseNestedJSON(parsedItemValue.cart_order_details);

//             if (Array.isArray(cartDetails)) {
//               const updatedCartDetails = cartDetails.map(detail => {
//                 if (detail.date === updatedItem.date) {
//                   return {
//                     ...detail,
//                     quantity: newQuantity
//                   };
//                 }
//                 return detail;
//               });

//               // Calculate new total amount
//               const newTotalAmount = updatedCartDetails.reduce(
//                 (sum, detail) => sum + (detail.price * detail.quantity),
//                 0
//               );

//               // Format and update cart item
//               const updatedCartItem = {
//                 cart_order_details: updatedCartDetails,
//                 total_amount: newTotalAmount
//               };

//               // Update in Redis
//               updateCartItem(itemKey, updatedCartItem);
//             }
//           }
//         } catch (error) {
//           console.error('Error updating cart:', error);
//         }

//         return updatedItems;
//       });
//     }
//   };

// console.log('length',CartData.length,CartData)

//   const isDisabled = userAddressDetails.address === '' || sortedData.length === 0;
//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       <header className="bg-teal-800 shadow-lg p-4 fixed top-0 left-0 right-0 z-20">
//         <div className="flex justify-between items-center max-w-6xl mx-auto">
//           <div className="flex items-center">
//             <Link to="/home">
//               <ChevronLeft size={24} className="cursor-pointer text-white" onClick={handleViewHome} />
//             </Link>
//             <h1 className="text-xl text-white font-bold ml-3">My Cart</h1>
//           </div>
//           <div className="h-10 w-10 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
//             <ShoppingCartIcon size={24} className="text-white" />
//           </div>
//         </div>
//       </header>
  
//       <main className="flex-grow mt-20 mb-20 p-6">
//         <div className="max-w-6xl mx-auto">
//         <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 mb-4 mt--2 border border-gray-200 ">
//   <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center">
//     <span className="mr-2 text-teal-700">🚚</span> Shipping Details
//   </h2>

//   {!userAddressDetails.Name && (
//     <p className="text-red-500 font-medium mb-3 text-sm flex items-center">
//       ⚠️ *Shipping details are required to proceed with payment.
//     </p>
//   )}

//   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
//     <div className="p-2  rounded-md">
//       <p className="font-semibold text-gray-800">Name:</p>
//       <p className="text-gray-600">{userAddressDetails.Name || '-'}</p>
//     </div>
//     <div className="p-2 rounded-md">
//       <p className="font-semibold text-gray-800">Email:</p>
//       <p className="text-gray-600">{userAddressDetails.Name ? emails : '-'}</p>
//     </div>
//     <div className="p-2  rounded-md">
//       <p className="font-semibold text-gray-800">Phone Number:</p>
//       <p className="text-gray-600">{userAddressDetails.phonenumber || '-'}</p>
//     </div>
//     <div className="p-2  rounded-md">
//       <p className="font-semibold text-gray-800">Address:</p>
//       <p className="text-gray-600">{userAddressDetails.address || '-'}</p>
//     </div>
//   </div>

//   <button
//     onClick={handleAddressFormToggle}
//     className="mt-4 w-full sm:w-auto bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-all shadow-md font-medium"
//   >
//     {userAddressDetails.Name ? 'Change Address' : 'Add Address'}
//   </button>
// </div>
  
//           {isLoading ? (
//             <div className="flex justify-center items-center">
//               <Loader />
//             </div>
//           ) : Object.keys(CartData).length === 0 ? (
//             <div className="bg-white p-6 rounded-xl shadow-md text-center border border-teal-800">
//               <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
//               <p className="text-gray-600">No items added yet. Start shopping now!</p>
//               <button
//                   onClick={() => navigate('/home')}
//                   className="mt-4 bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition shadow-md"
//                 >
//                   Add Items
//                 </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
//               {sortedData.map((item, index) => (
//                 <div key={index} className="relative bg-white rounded-xl shadow-lg p-5 border border-teal-800">
//                   <button
//                     className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
//                     onClick={() => handleRemove(index, sortedData[index].quantity)}
//                   >
//                     <Trash2 size={18} />
//                   </button>
//                   <h3 className="font-semibold text-lg text-gray-900">{item.type}</h3>
//                   <p className="text-sm text-gray-500 mt-1">Date: {item.date}</p>
  
//                   <div className="flex items-center space-x-3 mt-3">
//                     <button
//                       className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
//                       onClick={() => handleDecrement(index)}
//                     >
//                       <Minus size={16} />
//                     </button>
//                     <input
//                       type="number"
//                       min="1"
//                       value={sortedData[index].quantity || ''}
//                       onChange={(e) => handleQuantityChange(index, e.target.value, sortedData[index].quantity)}
//                       className="w-12 text-center border border-gray-300 rounded-md p-1"
//                     />
//                     <button
//                       className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
//                       onClick={() => handleIncrement(index)}
//                     >
//                       <Plus size={16} />
//                     </button>
//                   </div>
  
//                   <div className="text-sm text-gray-700 mt-3">
//                     <p>Price Per Plate: ₹{item.price}</p>
//                     <p>Quantity: {item.quantity}</p>
//                     <p className="font-bold text-gray-900">Amount: ₹{item.price * item.quantity}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </main>
  
//       <footer className="bg-white shadow-lg p-4 fixed bottom-0 left-0 right-0 z-20">
//         <div className="flex justify-between items-center max-w-6xl mx-auto">
//           <h2 className="text-xl font-semibold">Total: ₹{Total}/-</h2>
//           <button
//             className={`p-3 px-6 rounded-lg transition shadow-md ${
//               isDisabled
//                 ? 'bg-gray-300 cursor-not-allowed'
//                 : 'bg-teal-700 text-white hover:bg-teal-600'
//             }`}
//             onClick={handleViewPayment}
//             disabled={isDisabled}
//           >
//             Pay Now
//           </button>
//         </div>
//       </footer>
  
//       {isAddressFormOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <AddressForm
//                 onAddressAdd={handleAddressAdd}
//                 onAddressSelect={handleAddressSelect}
//                 onClose={handleAddressFormToggle}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
  
// };

// export default MyCart;










import axios from 'axios';
import { ChevronLeft, Loader, Minus, Plus, ShoppingCart, ShoppingCartIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../services/contexts/CartContext';
import { jwtDecode } from 'jwt-decode';
import AddressForm from '../Address/AddressForm';
import { VerifyToken } from '../../MiddleWare/verifyToken';
import { io } from 'socket.io-client';

const MyCart = () => {
  const [Total, setTotal] = useState(0);
  const [CartData, setCartData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [error, setError] = useState('');
  const [Address, setAddress] = useState([]);
  const OrderData = [];
  const { updateCartCount } = useCart();
  const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
  const tokens = localStorage.getItem('token');
  const decodedToken = jwtDecode(tokens);
  const emails = decodedToken.email;

  var parsedAddress;
  const [userAddressDetails, setUserAddressDetails] = useState({
    Name: '',
    phonenumber: '',
    address: ''
  });
  VerifyToken();
  const [userData, setUserData] = useState({
    Name: '',
    email: '',
    PhoneNumber: '',
    address: '',
    id: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/cart`, {
        headers: { token },
      });
      setCartData(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = io(process.env.REACT_APP_URL, {
      transports: ['websocket', 'polling']
    });
    socket.on('connect', () => {
      console.log(`Connected to server with socket id: ${socket.id}`);
      socket.emit('message', 'Hello, server!');
    });
    socket.on('cartUpdated', (data) => {
      console.log('Cart updated:', data);
      fetchCart();
    });

    socket.on('message', (data) => {
      console.log(`Message from server: ${data}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchCart();
  }, [navigate]);

  useEffect(() => {
    const fetchCustomer = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/getCustomerDetails`, {
          headers: { "token": token },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    };

    fetchCustomer();

    const storedAddress = localStorage.getItem('address');
    if (storedAddress) {
      try {
        parsedAddress = JSON.parse(storedAddress);
        const formattedAddress = `${parsedAddress.tag}, ${parsedAddress.line1}, ${parsedAddress.pincode}`;
        setUserAddressDetails(prevData => ({
          ...prevData,
          Name: parsedAddress.ship_to_name || parsedAddress.default_name || prevData.Name,
          phonenumber: parsedAddress.ship_to_phone_number || prevData.PhoneNumber,
          address: formattedAddress
        }));
      } catch (error) {
        console.error('Error parsing address from localStorage:', error);
      }
    } else {
      setUserAddressDetails(prevData => ({
        ...prevData,
        Name: userData.Name,
        phonenumber: userData.PhoneNumber,
        address: userData.address
      }));
    }
  }, []);

  const parseNestedJSON = (data) => {
    if (!data) return null;
    let parsedData = data;
    while (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (e) {
        break;
      }
    }
    return parsedData;
  };

  useEffect(() => {
    if (!CartData || Object.keys(CartData).length === 0) return;

    let tempCartData = [];

    try {
      Object.entries(CartData).forEach(([key, value]) => {
        const parsedCart = parseNestedJSON(value);
        if (!parsedCart || typeof parsedCart !== 'object') {
          console.error('Invalid cart data format');
          return;
        }

        const orderDetails = parseNestedJSON(parsedCart.cart_order_details);

        if (Array.isArray(orderDetails)) {
          orderDetails.forEach(detail => {
            tempCartData.push({
              id: key,
              ...detail,
            });
          });
        }
      });

      const sortedCartItems = tempCartData.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSortedData(sortedCartItems);
    } catch (error) {
      console.error('Error processing cart data:', error);
      setSortedData([]);
    }
  }, [CartData]);

  useEffect(() => {
    const totalAmount = sortedData.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );
    setTotal(totalAmount);

    const count = sortedData.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
    updateCartCount(count);

    const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
    const updatedUserDP = {
      ...storedUserDP,
      cartCount: count,
    };
    localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
  }, [sortedData]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
      if (storedUserDP.cartCount !== undefined) {
        updateCartCount(storedUserDP.cartCount);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDecrement = async (index) => {
    setSortedData((prevItems) => {
      const updatedItems = [...prevItems];
      if (updatedItems[index].quantity > 1) {
        const updatedItem = {
          ...updatedItems[index],
          quantity: updatedItems[index].quantity - 1,
        };
        updatedItems[index] = updatedItem;

        try {
          const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
            const parsedValue = parseNestedJSON(value);
            if (!parsedValue || !parsedValue.cart_order_details) return false;

            const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
            if (!Array.isArray(orderDetails)) return false;

            return orderDetails.some(detail =>
              detail.date === updatedItem.date &&
              key === updatedItem.id
            );
          });

          if (matchingCartItem) {
            const [itemKey, itemValue] = matchingCartItem;
            const parsedItemValue = parseNestedJSON(itemValue);
            const cartDetails = parseNestedJSON(parsedItemValue.cart_order_details);

            if (Array.isArray(cartDetails)) {
              const updatedCartDetails = cartDetails.map(detail => {
                if (detail.date === updatedItem.date) {
                  return {
                    ...detail,
                    quantity: updatedItem.quantity
                  };
                }
                return detail;
              });

              const newTotalAmount = updatedCartDetails.reduce(
                (sum, detail) => sum + (detail.price * detail.quantity),
                0
              );

              const updatedCartItem = {
                cart_order_details: updatedCartDetails,
                total_amount: newTotalAmount
              };

              updateCartItem(itemKey, updatedCartItem);

              const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
              const updatedUserDP = {
                ...storedUserDP,
                cartCount: sortedData.reduce((sum, item) => sum + item.quantity, 0)
              };
              localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
              updateCartCount(updatedUserDP.cartCount);
            }
          }
        } catch (error) {
          console.error('Error updating cart:', error);
        }

        return updatedItems;
      }
      return prevItems;
    });
  };

  const formatCartItem = (cartOrderDetails, totalAmount) => {
    return {
      cart_order_details: cartOrderDetails,
      total_amount: totalAmount
    };
  };

  const handleIncrement = async (index) => {
    setSortedData((prevItems) => {
      const updatedItems = [...prevItems];
      const updatedItem = {
        ...updatedItems[index],
        quantity: parseInt(updatedItems[index].quantity) + 1,
      };
      updatedItems[index] = updatedItem;

      try {
        const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
          const parsedValue = parseNestedJSON(value);
          if (!parsedValue || !parsedValue.cart_order_details) return false;

          const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
          if (!Array.isArray(orderDetails)) return false;

          return orderDetails.some(detail =>
            detail.date === updatedItem.date &&
            key === updatedItem.id
          );
        });

        if (matchingCartItem) {
          const [itemKey, itemValue] = matchingCartItem;
          const parsedItemValue = parseNestedJSON(itemValue);
          const cartDetails = parseNestedJSON(parsedItemValue.cart_order_details);

          if (Array.isArray(cartDetails)) {
            const updatedCartDetails = cartDetails.map(detail => {
              if (detail.date === updatedItem.date) {
                return {
                  ...detail,
                  quantity: updatedItem.quantity
                };
              }
              return detail;
            });

            const newTotalAmount = updatedCartDetails.reduce(
              (sum, detail) => sum + (detail.price * detail.quantity),
              0
            );

            const updatedCartItem = formatCartItem(updatedCartDetails, newTotalAmount);
            updateCartItem(itemKey, updatedCartItem);
          }
        }
      } catch (error) {
        console.error('Error updating cart:', error);
      }

      return updatedItems;
    });
  };

  const updateCartItem = async (itemId, updatedCartItem) => {
    try {
      const token = localStorage.getItem('token');
      const itemToSend = typeof updatedCartItem === 'string'
        ? updatedCartItem
        : JSON.stringify(updatedCartItem);

      const response = await axios.post(
        `${process.env.REACT_APP_URL}/api/cart/update`,
        {
          itemId,
          item: itemToSend,
        },
        {
          headers: {
            'token': token,
          },
        }
      );

      if (!response.data.success) {
        console.error('Failed to update cart:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleRemove = async (index) => {
    const itemToRemove = sortedData[index];

    try {
      const token = localStorage.getItem('token');
      const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
        const parsedValue = parseNestedJSON(value);
        if (!parsedValue || !parsedValue.cart_order_details) return false;

        const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
        if (!Array.isArray(orderDetails)) return false;

        return orderDetails.some(detail =>
          detail.date === itemToRemove.date &&
          key === itemToRemove.id
        );
      });

      if (matchingCartItem) {
        const [itemId] = matchingCartItem;

        const response = await axios.delete(
          `${process.env.REACT_APP_URL}/api/cart/${itemId}`,
          {
            headers: { 'token': token }
          }
        );

        if (response.data.success) {
          setSortedData(prevItems => prevItems.filter((_, i) => i !== index));

          setCartData(prevData => {
            const newData = { ...prevData };
            delete newData[itemId];
            return newData;
          });

          const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
          const updatedCount = (storedUserDP.cartCount || 0) - itemToRemove.quantity;
          const updatedUserDP = {
            ...storedUserDP,
            cartCount: Math.max(0, updatedCount)
          };
          localStorage.setItem('userDP', JSON.stringify(updatedUserDP));

          updateCartCount(Math.max(0, updatedCount));
        }
      } else {
        console.error('Could not find matching cart item to remove');
      }
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
  };

  const handleViewHome = () => {
    navigate('/home');
  };

  const handleAddressFormToggle = () => {
    setIsAddressFormOpen(!isAddressFormOpen);
  };

  const handleViewPayment = async () => {
    try {
      for (let i = 0; i < sortedData.length; i++) {
        const Data = {
          category_id: sortedData[i].category_id,
          processing_date: sortedData[i].date,
          delivery_status: 'processing',
          quantity: sortedData[i].quantity,
          active_quantity: sortedData[i].quantity,
          media: null,
          delivery_details: null,
          accept_status: 'pending'
        };
        OrderData.push(Data);
      }
      const OrderDataJSON = JSON.stringify(OrderData);

      const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporate/transfer-cart-to-order`, {
        customer_generated_id: decodedToken.id,
        order_details: OrderDataJSON,
        total_amount: Total,
        paymentid: null,
        customer_address: localStorage.getItem('address'),
        payment_status: 'pending',
      }, {
        headers: { 'token': localStorage.getItem('token') }
      });

      if (response.status === 200) {
        await PaymentDetails(response.data.order.corporateorder_generated_id);
        await sendOrderDetails(response.data.order);
      } else {
        console.error('Failed to add details to order_table:', response.data);
      }
    } catch (error) {
      console.error('Error adding details to order_table:', error);
    }
  };

  const sendOrderDetails = async (orderDetails) => {
    try {
      let response;
      let details = orderDetails.order_details;

      for (let i = 0; i < details.length; i++) {
        response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporateOrderDetails`, {
          headers: { token: localStorage.getItem('token') }
        },
          {
            corporateorder_id: orderDetails.corporateorder_id,
            processing_date: details[i].processing_date,
            delivery_status: details[i].delivery_status,
            category_id: details[i].category_id,
            quantity: details[i].quantity,
            active_quantity: details[i].active_quantity,
            media: details[i].media,
            delivery_details: details[i].delivery_details
          });
      }

      if (response) {
        console.log('Order details successfully added:', response.data);
      } else {
        console.error('Failed to add details to order_table:', response.data);
      }
    } catch (error) {
      console.error('Error sending order details:', error);
    }
  };

  // const handleViewPayment = async () => {
  //   console.log("hiiiii")
  //   const decodedToken = jwtDecode(tokens);

  //   try {

  //     for (let i = 0; i < sortedData.length; i++) {

  //       const Data = {
  //         category_id: sortedData[i].category_id,
  //         processing_date: sortedData[i].date,
  //         delivery_status: 'processing',
  //         quantity: sortedData[i].quantity,
  //         active_quantity: sortedData[i].quantity,
  //         media: null,
  //         delivery_details: null,
  //         accept_status:'pending'
  //       };
  //       OrderData.push(Data);
  //     }
  //     const OrderDataJSON = JSON.stringify(OrderData);
  //  console.log('orderdata',OrderDataJSON)
  //     const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporate/transfer-cart-to-order`, {
  //       customer_generated_id: decodedToken.id,
  //       order_details: OrderDataJSON,
  //       total_amount: Total,
  //       paymentid: null,
  //       customer_address: localStorage.getItem('address'),
  //       payment_status: 'pending',

  //     }, {
  //       headers: { 'token': localStorage.getItem('token') }
  //     }
  //     );

  //     console.log('corporate ',response.data)
  //     if (response.status === 200) {
  //       await PaymentDetails(response.data.order.corporateorder_generated_id);
  //       await sendOrderDetails(response.data.order);

  //       console.log('Cart details added to orders', response.data);
  //     } else {
  //       console.error('Failed to add details to order_table:', response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error adding details to order_table:', error);
  //   }
  // };



  // const PaymentDetails = async (corporateorder_generated_id) => {
  //   try {
  //     console.log('corporate orders ',corporateorder_generated_id)
  //     // const token=localStorage.getItem('token')

  //     const response = await axios.post(`${process.env.REACT_APP_URL}/api/pay`,
  //       { amount: Total, corporateorder_id: corporateorder_generated_id },
  //       { headers: { token: localStorage.getItem('token') } });
  //     setSortedData([]);
  //     setCartData([]);
  //     setCartIndividualData([]);
  //     setTotal(0);

  //     // Get user-specific details from local storage
  //     const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
  //     const updatedUserDP = {
  //       ...storedUserDP,
  //       cartCount: 0, // Update the cart count for the specific user to 0 after payment
  //     };

  //     // Update local storage with updated user cart count
  //     localStorage.setItem('userDP', JSON.stringify(updatedUserDP));

  //     // Update cart count in context
  //     updateCartCount(0);

  //     // Redirect to the payment URL if available
  //     if (response.data && response.data.redirectUrl) {
  //       setRedirectUrl(response.data.redirectUrl);
  //       window.location.href = response.data.redirectUrl;
  //     } else {
  //       setError('Unexpected response format.');
  //     }
  //   } catch (err) {
  //     // Check for specific error details
  //     if (err.response) {
  //       setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
  //     } else {
  //       setError('Network error or no response from the server.');
  //     }
  //   } 
  // }


  
  const PaymentDetails = async (corporateorder_generated_id) => {
    const message = "";
    const responsepay = {};
    try {
      try {
        if (!window.Razorpay) {
          alert("Razorpay SDK failed to load. Check your internet connection.");
          return;
        }

        const { data } = await axios.post(`${process.env.REACT_APP_URL}/api/create-order`, {
          amount: Total,
          currency: "INR",
        });

        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "CaterOrange",
          description: "ORDER Payment",
          order_id: data.id,
          handler: async (response) => {
            console.log("huyt",response)
            const verifyRes = await axios.post(`${process.env.REACT_APP_URL}/api/verify-payment`, response);
            console.log("verifyyy:",verifyRes)
            const paymentPayload = {
              paymentType: "Net",
              merchantTransactionId: "mer123",
              phonePeReferenceId: response.razorpay_payment_id,
              paymentFrom: "RazorPay",
              instrument: 'N/A',
              bankReferenceNo: 'N/A',
              amount: Total,
              customer_id: decodedToken.id,
              corporateorder_id: corporateorder_generated_id
            };
            console.log("pajldsjkskjdk:",paymentPayload)
           const res= await axios.post(`${process.env.REACT_APP_URL}/api/insert-payment`, paymentPayload);
           console.log("insertpayment:",res);
          },
          prefill: {
            name: userAddressDetails.Name,
            email: emails,
            contact: userAddressDetails.phonenumber,
          },
          theme: { color: "#3399cc" },
        };

        const razor = new window.Razorpay(options);
        razor.open();
      } catch (error) {
        console.error(error);
        alert("Payment Failed!");
      }

      setSortedData([]);
      setCartData([]);
      setCartIndividualData([]);
      setTotal(0);

      const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
      const updatedUserDP = {
        ...storedUserDP,
        cartCount: 0,
      };

      localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
      updateCartCount(0);

      if (response.data && response.data.redirectUrl) {
        setRedirectUrl(response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
      } else {
        setError('Unexpected response format.');
      }
    } catch (err) {
      if (err.response) {
        setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
      } else {
        setError('Network error or no response from the server.');
      }
    }
  };

  const handleAddressAdd = () => {
    fetchAddress();
    handleAddressFormToggle();
  };

  const fetchAddress = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`, {
        headers: { token: localStorage.getItem('token') }
      });

      setAddress(response.data.address);
      const myAddresses = response.data.address;
      const ChangedAddress = myAddresses[myAddresses.length - 1];
      localStorage.setItem('address', JSON.stringify(ChangedAddress));
      if (response.data.address && response.data.address.length > 0) {
        setUserAddressDetails(prevData => ({
          ...prevData,
          Name: ChangedAddress.ship_to_name || ChangedAddress.default_name || prevData.Name,
          phonenumber: ChangedAddress.ship_to_phone_number || prevData.PhoneNumber,
          address: `${ChangedAddress.line1}, ${ChangedAddress.line2}, ${ChangedAddress.pincode}`
        })

        );

      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleAddressSelect = (address) => {
    console.log('Address selected:', address);
    localStorage.setItem('address', JSON.stringify(address));
    setUserAddressDetails(prevData => ({
      ...prevData,
      Name: address.ship_to_name || address.default_name || prevData.Name,
      phonenumber: address.ship_to_phone_number || prevData.PhoneNumber,
      address: `${address.line1}, ${address.line2}, ${address.pincode}`
    }));
    handleAddressFormToggle();
  };
  // if (isLoading) {
  //   return <div className="text-center mt-8">Loading...</div>;
  // }
  const handleQuantityChange = (index, value) => {
    // Handle empty input
    if (value === '') {
      setSortedData((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index] = {
          ...updatedItems[index],
          quantity: '',
        };
        return updatedItems;
      });
      return;
    }
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setSortedData((prevItems) => {
        const updatedItems = [...prevItems];
        const updatedItem = {
          ...updatedItems[index],
          quantity: newQuantity,
        };
        updatedItems[index] = updatedItem;

        try {
          // Find the matching cart item
          const matchingCartItem = Object.entries(CartData).find(([key, value]) => {
            const parsedValue = parseNestedJSON(value);
            if (!parsedValue || !parsedValue.cart_order_details) return false;

            const orderDetails = parseNestedJSON(parsedValue.cart_order_details);
            if (!Array.isArray(orderDetails)) return false;

            return orderDetails.some(detail =>
              detail.date === updatedItem.date &&
              key === updatedItem.id
            );
          });

          if (matchingCartItem) {
            const [itemKey, itemValue] = matchingCartItem;
            const parsedItemValue = parseNestedJSON(itemValue);
            const cartDetails = parseNestedJSON(parsedItemValue.cart_order_details);

            if (Array.isArray(cartDetails)) {
              const updatedCartDetails = cartDetails.map(detail => {
                if (detail.date === updatedItem.date) {
                  return {
                    ...detail,
                    quantity: newQuantity
                  };
                }
                return detail;
              });

              // Calculate new total amount
              const newTotalAmount = updatedCartDetails.reduce(
                (sum, detail) => sum + (detail.price * detail.quantity),
                0
              );

              // Format and update cart item
              const updatedCartItem = {
                cart_order_details: updatedCartDetails,
                total_amount: newTotalAmount
              };

              // Update in Redis
              updateCartItem(itemKey, updatedCartItem);
            }
          }
        } catch (error) {
          console.error('Error updating cart:', error);
        }

        return updatedItems;
      });
    }
  };

console.log('length',CartData.length,CartData)

  const isDisabled = userAddressDetails.address === '' || sortedData.length === 0;
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-teal-800 shadow-lg p-4 fixed top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center">
            <Link to="/home">
              <ChevronLeft size={24} className="cursor-pointer text-white" onClick={handleViewHome} />
            </Link>
            <h1 className="text-xl text-white font-bold ml-3">My Cart</h1>
          </div>
          <div className="h-10 w-10 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
            <ShoppingCartIcon size={24} className="text-white" />
          </div>
        </div>
      </header>
  
      <main className="flex-grow mt-20 mb-20 p-6">
        <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 mb-4 mt--2 border border-gray-200 ">
  <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center">
    <span className="mr-2 text-teal-700">🚚</span> Shipping Details
  </h2>

  {!userAddressDetails.Name && (
    <p className="text-red-500 font-medium mb-3 text-sm flex items-center">
      ⚠️ *Shipping details are required to proceed with payment.
    </p>
  )}

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
    <div className="p-2  rounded-md">
      <p className="font-semibold text-gray-800">Name:</p>
      <p className="text-gray-600">{userAddressDetails.Name || '-'}</p>
    </div>
    <div className="p-2 rounded-md">
      <p className="font-semibold text-gray-800">Email:</p>
      <p className="text-gray-600">{userAddressDetails.Name ? emails : '-'}</p>
    </div>
    <div className="p-2  rounded-md">
      <p className="font-semibold text-gray-800">Phone Number:</p>
      <p className="text-gray-600">{userAddressDetails.phonenumber || '-'}</p>
    </div>
    <div className="p-2  rounded-md">
      <p className="font-semibold text-gray-800">Address:</p>
      <p className="text-gray-600">{userAddressDetails.address || '-'}</p>
    </div>
  </div>

  <button
    onClick={handleAddressFormToggle}
    className="mt-4 w-full sm:w-auto bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition-all shadow-md font-medium"
  >
    {userAddressDetails.Name ? 'Change Address' : 'Add Address'}
  </button>
</div>
  
          {isLoading ? (
            <div className="flex justify-center items-center">
              <Loader />
            </div>
          ) : Object.keys(CartData).length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md text-center border border-teal-800">
              <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-600">No items added yet. Start shopping now!</p>
              <button
                  onClick={() => navigate('/home')}
                  className="mt-4 bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition shadow-md"
                >
                  Add Items
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
              {sortedData.map((item, index) => (
                <div key={index} className="relative bg-white rounded-xl shadow-lg p-5 border border-teal-800">
                  <button
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    onClick={() => handleRemove(index, sortedData[index].quantity)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <h3 className="font-semibold text-lg text-gray-900">{item.type}</h3>
                  <p className="text-sm text-gray-500 mt-1">Date: {item.date}</p>
  
                  <div className="flex items-center space-x-3 mt-3">
                    <button
                      className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
                      onClick={() => handleDecrement(index)}
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={sortedData[index].quantity || ''}
                      onChange={(e) => handleQuantityChange(index, e.target.value, sortedData[index].quantity)}
                      className="w-12 text-center border border-gray-300 rounded-md p-1"
                    />
                    <button
                      className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition"
                      onClick={() => handleIncrement(index)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
  
                  <div className="text-sm text-gray-700 mt-3">
                    <p>Price Per Plate: ₹{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p className="font-bold text-gray-900">Amount: ₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
  
      <footer className="bg-white shadow-lg p-4 fixed bottom-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h2 className="text-xl font-semibold">Total: ₹{Total}/-</h2>
          <button
            className={`p-3 px-6 rounded-lg transition shadow-md ${
              isDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-700 text-white hover:bg-teal-600'
            }`}
            onClick={handleViewPayment}
            disabled={isDisabled}
          >
            Pay Now
          </button>
        </div>
      </footer>
  
      {isAddressFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <AddressForm
                onAddressAdd={handleAddressAdd}
                onAddressSelect={handleAddressSelect}
                onClose={handleAddressFormToggle}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
};

export default MyCart;










