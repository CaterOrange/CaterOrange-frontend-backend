import axios from 'axios';
import { ChevronLeft, Loader, Minus, Plus, ShoppingCart, ShoppingCartIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../services/contexts/CartContext';
import { jwtDecode } from 'jwt-decode';
import AddressForm from '../Address/AddressForm';
import AddressSelectionModal from '../Address/AddressSelectionModal';
import { VerifyToken } from '../../MiddleWare/verifyToken';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import CollapsibleCart from './CollapsibleCart';
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
 const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
 const [hasAddresses, setHasAddresses] = useState(false);
 const [isAddressLoading, setIsAddressLoading] = useState(true);
 const [addresses, setAddresses] = useState([]);




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

 }, []);



 const checkUserAddresses = async () => {
 setIsAddressLoading(true);
 try {
 const response = await axios.get(
 `${process.env.REACT_APP_URL}/api/customer/corporate/customerAddress`,
 { headers: { token: localStorage.getItem('token') } }
 );

 if (response.data.address && Array.isArray(response.data.address)) {
 setAddresses(response.data.address);
 setHasAddresses(response.data.address.length > 0);

 if (response.data.address.length > 0) {
 const defaultAddress = response.data.address[0];
 setUserAddressDetails({
 Name: defaultAddress.ship_to_name || defaultAddress.default_name,
 phonenumber: defaultAddress.ship_to_phone_number,
 address: `${defaultAddress.line1}, ${defaultAddress.line2 || ''}, ${defaultAddress.pincode}`
 });
 }
 } else {
 setHasAddresses(false);
 setAddresses([]);
 }
 } catch (error) {
 console.error('Error checking addresses:', error);
 setHasAddresses(false);
 setAddresses([]);
 } finally {
 setIsAddressLoading(false);
 }
 };


 // Add useEffect to check addresses on component mount
 useEffect(() => {
 checkUserAddresses();
 }, []);

 useEffect(() => {
 checkUserAddresses();
 }, []);

 const handleAddressFormSubmit = async (addressData) => {
 try {
 // ... (handle address submission)
 await checkUserAddresses(); // Refresh addresses after successful submission
 setIsAddressFormOpen(false);
 setIsAddressModalOpen(false);
 } catch (error) {
 console.error('Error submitting address:', error);
 }
 };


 const renderShippingDetails = () => {
 if (isAddressLoading) {
 return (
 <div className="flex items-center justify-center p-4">
 <Loader className="animate-spin mr-2" />
 <span>Loading address details...</span>
 </div>
 );
 }

 if (!hasAddresses) {
 return (
 <div className="bg-teal-100 border border-teal-500 p-4 rounded-lg text-teal-700 mb-4 text-center">
 <p className="text-sm font-medium mb-2">⚠️ No saved addresses found.</p>
 <p className="text-gray-600 mb-3">Please add an address to proceed with payment.</p>
 <button
 onClick={handleAddressFormToggle}
 className="bg-teal-700 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition shadow-md font-serif"
 >
 Add Address
 </button>
 </div>
 );
 }

 return (
 <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
 <div className="flex-1">
 <p className="text-gray-800 text-lg font-bold font-serif">
 {userAddressDetails?.Name?.replace(/\b\w/g, (char) => char.toUpperCase())}
 </p>
 <p className="text-gray-800 text-md font-serif">
 {userAddressDetails?.phonenumber} | {emails}
 </p>
 <p className="text-gray-800 text-sm font-serif truncate">
 {userAddressDetails?.address
 ?.replace(/\s+/g, " ")
 .replace(/\b\w/g, (char) => char.toUpperCase())}
 </p>
 </div>
 <button
 onClick={() => setIsAddressModalOpen(true)}
 className="bg-teal-700 text-white font-bold px-4 py-2 rounded-md hover:bg-teal-600 transition-all shadow-md font-medium w-full sm:w-auto font-serif"
 >
 Select Address
 </button>
 </div>
 );
 };


 const handleAddressModalOpen = () => {
 if (addresses.length > 0) {
 setIsAddressModalOpen(true);
 } else {
 handleAddressFormToggle();
 }
 };

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
 setIsAddressModalOpen(true);

 };
 // const handleViewPayment = async () => {
 // try {
 // console.log('Initial sortedData:', sortedData);
 
 // // Create the main corporate order first
 // const response = await axios.post(
 // `${process.env.REACT_APP_URL}/api/customer/corporate/transfer-cart-to-order`,
 // {
 // customer_generated_id: decodedToken.id,
 // order_details: [],//JSON.stringify(sortedData), // Send the original sorted data
 // total_amount: Total,
 // paymentid: null,
 // customer_address: localStorage.getItem('address'),
 // payment_status: 'pending',
 // corporate_order_status: 'pending'
 // },
 // {
 // headers: { 'token': localStorage.getItem('token') }
 // }
 // );
 
 // if (response.status === 200) {
 // console.log('Order response data:', response.data);
 
 // // Get the corporate order ID
 // const corporateOrderId = response.data.order.corporateorder_generated_id;
 
 // // Store order details directly in corporateorder_details table
 // await storeOrderDetails(corporateOrderId, sortedData);
 
 // // Process payment details
 // await PaymentDetails(corporateOrderId);
 // }
 // } catch (error) {
 // console.error('Error in handleViewPayment:', error);
 // throw error;
 // }
 // };
 const handleViewPayment = async () => {
 try {
 console.log('Initial sortedData:', sortedData);
 
 // First create the corporate order
 const response = await axios.post(
 `${process.env.REACT_APP_URL}/api/customer/corporate/transfer-cart-to-order`,
 {
 customer_generated_id: decodedToken.id,
 order_details: [], // Initially empty
 total_amount: Total,
 paymentid: null,
 customer_address: localStorage.getItem('address'),
 payment_status: 'pending',
 corporate_order_status: 'pending'
 },
 {
 headers: { 'token': localStorage.getItem('token') }
 }
 );
 
 if (response.status === 200) {
 const corporateOrderId = response.data.order.corporateorder_generated_id;
 
 // Create order details
 for (const item of sortedData) {
 await axios.post(
 `${process.env.REACT_APP_URL}/api/customer/corporateOrderDetails`,
 {
 corporateorder_generated_id: corporateOrderId,
 processing_date: item.date,
 delivery_status: 'Pending',
 category_id: Number(item.category_id),
 quantity: Number(item.quantity),
 active_quantity: Number(item.quantity),
 media: {},
 delivery_details: {}
 },
 {
 headers: {
 'token': localStorage.getItem('token'),
 'Content-Type': 'application/json'
 }
 }
 );
 }
 
 // Update the corporate order to automatically collect all order detail IDs
 await axios.put(
 `${process.env.REACT_APP_URL}/api/customer/corporate/update-order-details/${corporateOrderId}`,
 {}, // No need to send order_details anymore, backend will fetch them
 {
 headers: { 'token': localStorage.getItem('token') }
 }
 );
 
 await PaymentDetails(corporateOrderId);
 }
 } catch (error) {
 console.error('Error in handleViewPayment:', error);
 throw error;
 }
 };

 const PaymentDetails = async (corporateorder_generated_id) => {
 try {
 if (!window.Razorpay) {
 toast.error("Payment gateway not available. Please try again later.");
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
 description: "Corporate Order Payment",
 order_id: data.id,
 handler: async function (response) {
 try {
 // Create payment payload
 const paymentPayload = {
 paymentType: "Net",
 merchantTransactionId: corporateorder_generated_id,
 phonePeReferenceId: response.razorpay_payment_id,
 paymentFrom: "RazorPay",
 instrument: 'N/A',
 bankReferenceNo: 'N/A',
 amount: Total,
 customer_id: decodedToken.id,
 corporateorder_id: corporateorder_generated_id
 };
 
 // Verify payment
 await axios.post(
 `${process.env.REACT_APP_URL}/api/verify-payment`,
 {
 razorpay_order_id: response.razorpay_order_id,
 razorpay_payment_id: response.razorpay_payment_id,
 razorpay_signature: response.razorpay_signature
 }
 );
 
 // Insert payment details
 await axios.post(
 `${process.env.REACT_APP_URL}/api/insert-payment`,
 paymentPayload
 );
 
 // Clear cart and update UI
 await clearCartAndUpdateUI();
 
 // Navigate to success page
 navigate('/success', {
 state: {
 order_id: corporateorder_generated_id,
 payment_id: response.razorpay_payment_id
 }
 });
 } catch (error) {
 console.error('Payment processing error:', error);
 toast.error('Payment processing failed. Please try again.');
 }
 },
 prefill: {
 name: userAddressDetails.Name,
 email: emails,
 contact: userAddressDetails.phonenumber,
 },
 theme: { color: "#3399cc" }
 };
 
 const razor = new window.Razorpay(options);
 razor.open();
 
 } catch (error) {
 console.error('Payment initialization error:', error);
 toast.error('Failed to initialize payment. Please try again.');
 }
 };
 
 const clearCartAndUpdateUI = async () => {
 try {
 const token = localStorage.getItem('token');
 await axios.delete(`${process.env.REACT_APP_URL}/api/cart/clear`, {
 headers: { 'token': token }
 });
 
 // Clear local state
 setSortedData([]);
 setCartData([]);
 setTotal(0);
 
 // Update cart count in localStorage
 const updatedUserDP = {
 ...JSON.parse(localStorage.getItem('userDP') || '{}'),
 cartCount: 0,
 };
 localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
 updateCartCount(0);
 
 } catch (error) {
 console.error('Error clearing cart:', error);
 throw error;
 }
 };

 const handleClearCart = async () => {
 try {
 // First, confirm with the user
 const confirmClear = window.confirm("Are you sure you want to clear all items from your cart?");

 if (!confirmClear) {
 return; // User canceled the operation
 }

 // Get the user's token for authentication
 const token = localStorage.getItem('token');

 if (!token) {
 alert("You must be logged in to clear your cart");
 return;
 }

 // Call the backend API to clear the cart
 const response = await axios.delete(`${process.env.REACT_APP_URL}/api/cart/clear`, {
 headers: {
 'token': token
 }
 });

 if (response.data.success) {
 // Clear the local cart data
 setCartData({});
 setSortedData([]);
 setTotal(0);

 // Show success message
 toast.success("Cart cleared successfully!");
 } else {
 toast.error("Failed to clear cart. Please try again.");
 }
 } catch (error) {
 console.error("Error clearing cart:", error);
 toast.error(error.response?.data?.message || "An error occurred while clearing your cart");
 }
 };
 const handleAddressAdd = async () => {
 await checkUserAddresses();
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



 const handleAddressSelect = async (address) => {
 const formattedAddress = {
 Name: address.ship_to_name || address.default_name,
 phonenumber: address.ship_to_phone_number,
 address: `${address.line1}, ${address.line2 || ''}, ${address.pincode}`
 };
 setUserAddressDetails(formattedAddress);
 localStorage.setItem('address', JSON.stringify(address));
 await checkUserAddresses(); // Refresh addresses after selection
 setIsAddressModalOpen(false);
 };

 const handleAddNewAddress = () => {
 // Close the address selection modal
 setIsAddressModalOpen(false);
 // Open your address form modal/component
 openAddressForm();
 };

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

 console.log('length', CartData.length, CartData)

 const isDisabled = userAddressDetails.address === '' || sortedData.length === 0;

 return (
 <div className="flex flex-col min-h-screen bg-teal-50">
 <header className="bg-gradient-to-r from-teal-700 to-teal-500 shadow-lg p-4 fixed top-0 left-0 right-0 z-20">
 <div className="flex justify-between items-center max-w-6xl mx-auto">
 <div className="flex items-center">
 <Link to="/home">
 <ChevronLeft size={24} className="cursor-pointer text-white" onClick={handleViewHome} />
 </Link>
 <h1 className="text-xl text-white font-bold ml-2 font-serif">My Cart</h1>
 <ShoppingCartIcon size={24} className="ml-3 text-white" />
 </div>

 </div>
 </header>


 <main className="flex-grow mt-20 mb-20 p-6">
 <div className="max-w-6xl mx-auto">
 <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 mb-4 border border-gray-200">
 <h2 className="text-xl font-bold mb-3 text-gray-900 flex items-center">
 <span className="mr-2 text-teal-500 font-serif"></span> Shipping Details
 </h2>
 {renderShippingDetails()}
 </div>

 {Object.keys(CartData).length === 0 ? (
 <div className="bg-white p-8 rounded-xl shadow-md text-center border-2 border-teal-800 transform transition-all duration-300 hover:shadow-xl">
 <h2 className="text-2xl font-semibold mb-4 text-teal-800">Your cart is empty</h2>
 <p className="text-gray-600 mb-6">No items added yet. Start shopping now!</p>
 <button
 onClick={() => navigate('/home')}
 className="mt-4 bg-teal-700 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-all duration-300 shadow-md flex items-center mx-auto group"
 >
 <span className="group-hover:scale-105 transition-transform duration-300">Add Items</span>
 </button>
 </div>
 ) : (
 <div className="space-y-6">
 {/* Clear Cart Button */}
 <div className="flex justify-end">
 <button
 onClick={handleClearCart}
 className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md flex items-center space-x-2"
 >
 <Trash2 size={16} />
 <span>Clear Cart</span>
 </button>
 </div>
 <CollapsibleCart
 sortedData={sortedData}
 handleRemove={handleRemove}
 handleIncrement={handleIncrement}
 handleDecrement={handleDecrement}
 handleQuantityChange={handleQuantityChange}
 />
 </div>
 )}
 </div>
 </main>
 <footer className="bg-gradient-to-r from-teal-700 to-teal-600 shadow-md p-3 fixed bottom-0 left-0 right-0 z-20">
 <div className="flex justify-between items-center max-w-6xl mx-auto text-white">
 <h2 className="text-xl font-semibold drop-shadow-lg">Total: ₹{Total}/-</h2>
 <button
 className={`p-3 px-6 rounded-lg transition-all shadow-lg text-lg font-medium tracking-wide 
 ${isDisabled
 ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
 : 'bg-white text-teal-700 hover:bg-teal-100 hover:shadow-xl transform hover:scale-105 duration-200'
 }`}
 onClick={handleViewPayment}
 disabled={isDisabled}
 >
 Pay Now
 </button>
 </div>
 </footer>
 {isAddressModalOpen && (
 <AddressSelectionModal
 isOpen={isAddressModalOpen}
 onClose={() => setIsAddressModalOpen(false)}
 AddressForm={AddressForm}
 onAddressSelect={handleAddressSelect}
 onAddressSubmit={handleAddressFormSubmit}
 refreshAddresses={checkUserAddresses} // Pass the refresh function
 />
 )}
 </div>

 );
};
export default MyCart;