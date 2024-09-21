// 
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AddressForm from '../Address/AddressForm';
// import AddressForm from '../Address/AddressForm';

const MyCart = () => {
 const [Total, setTotal] = useState(0);
 const [CartData, setCartData] = useState([]);
 const [sortedData, setSortedData] = useState([]);
 const [cartIndividualData, setCartIndividualData] = useState([]);
 const [redirectUrl, setRedirectUrl] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [Address, setAddress] = useState([]);
 const OrderData = [];
 var parsedAddress;
 const [userAddressDetails,setUserAddressDetails]=useState({
 Name:'',
 phonenumber:'',
 address:''
 })

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

 useEffect(() => {
 const fetchCart = async () => {
 setIsLoading(true);
 try {
 const response = await axios.get('http://localhost:4000/customer/getCorporateCarts', {
 headers: { token: `${localStorage.getItem('token')}` },
 });
 console.log('in carts', response.data);
 setCartData(response.data || []);
 } catch (error) {
 console.error('Error fetching cart data:', error);
 } finally {
 setIsLoading(false);
 }
 };
 
 fetchCart();
 }, []);

 useEffect(() => {
 const fetchCustomer = async () => {
 try {
  console.log('hiii im in cart')
 const response = await axios.get('http://localhost:4000/customer/getCustomerDetails', {
 headers: { token: `${localStorage.getItem('token')}` },
 });
 console.log('user', response.data);
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
 PhoneNumber: parsedAddress.ship_to_phone_number || prevData.PhoneNumber,
 address: formattedAddress
 }));
 } catch (error) {
 console.error('Error parsing address from localStorage:', error);
 }
 }else{
 setUserAddressDetails(prevData => ({
 ...prevData,
 Name: userData.Name,
 PhoneNumber: userData.PhoneNumber,
 address:userData.address
 }));
 }
 }, []);

 useEffect(() => {
 const totalAmount = sortedData.reduce(
 (sum, item) => sum + (item.price * item.quantity),
 0
 );
 setTotal(totalAmount);
 }, [sortedData]);

 useEffect(() => {
 let tempCartData = [];
 CartData.forEach(cart => {
 cart.cart_order_details.forEach(detail => {
 tempCartData.push({
 id: cart.corporatecart_id,
 content: detail
 });
 });
 });
 setCartIndividualData(tempCartData);
 }, [CartData]);

 useEffect(() => {
 if (cartIndividualData.length > 0) {
 console.log('each data', cartIndividualData);
 const flattenedData = cartIndividualData.map(cart => ({
 id: cart.id,
 ...cart.content
 }));
 const sortedCartItems = flattenedData.sort((a, b) => new Date(a.date) - new Date(b.date));
 console.log('sorted', sortedCartItems);
 setSortedData(sortedCartItems);
 }
 }, [cartIndividualData]);

 const handleIncrement = async (index) => {
 setSortedData((prevItems) => {
 const updatedItems = prevItems.map((item, i) =>
 i === index ? { ...item, quantity: parseInt(item.quantity, 10) + 1 } : item
 );
 const updatedItem = updatedItems[index];
 const updateBackend = async () => {
 try {
 const res = await axios.put(
 `http://localhost:4000/customer/updateCartItem/${updatedItem.id}`,
 {
 date: updatedItem.date,
 quantity: updatedItem.quantity
 }
 );
 console.log('Update successful:', res.data);
 } catch (error) {
 console.error('Error updating cart item quantity:', error);
 }
 };
 updateBackend();
 return updatedItems;
 });
 };

 const handleDecrement = async (index) => {
 setSortedData((prevItems) => {
 const updatedItems = prevItems.map((item, i) =>
 i === index ? { ...item, quantity: Math.max(parseInt(item.quantity, 10) - 1, 0) } : item
 );
 const updatedItem = updatedItems[index];
 const updateBackend = async () => {
 try {
 const res = await axios.put(
 `http://localhost:4000/customer/updateCartItem/${updatedItem.id}`,
 {
 date: updatedItem.date,
 quantity: updatedItem.quantity,
 }
 );
 console.log('Update successful:', res.data);
 } catch (error) {
 console.error('Error updating cart item quantity:', error);
 }
 };
 updateBackend();
 return updatedItems;
 });
 };

 const handleRemove = async (index) => {
 if (index < 0 || index >= sortedData.length) {
 console.error('Index out of bounds:', index);
 return;
 }
 const itemToRemove = sortedData[index];
 if (!itemToRemove || !itemToRemove.date) {
 console.error('Item or date is undefined:', itemToRemove);
 return;
 }
 console.log('Item to remove:', itemToRemove.date);
 setSortedData((prevItems) => prevItems.filter((_, i) => i !== index));
 try {
 await axios.delete(`http://localhost:4000/customer/removeCartItem/${itemToRemove.id}`, {
 data: { date: itemToRemove.date }
 });
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
 for (let i = 0; i < cartIndividualData.length; i++) {
 const content = cartIndividualData[i].content;
 const Data = {
 category_id: content.category_id,
 processing_date: content.date,
 delivery_status: 'shipped',
 quantity: content.quantity,
 active_quantity: content.quantity,
 media: null,
 delivery_details: null
 };
 OrderData.push(Data);
 }
 const OrderDataJSON = JSON.stringify(OrderData);
 console.log('parsed',localStorage.getItem('address'))
 console.log('orderdatajson',OrderDataJSON)
 const response = await axios.post('http://localhost:4000/customer/corporate/transfer-cart-to-order', {
  customer_generated_id: userData.id,
  order_details: OrderDataJSON,
  total_amount: Total,
  paymentid: null,
  customer_address: localStorage.getItem('address'),
  payment_status: 'pending'
 });
 if (response.status === 200) {
   await PaymentDetails(response.data.order.corporateorder_generated_id);
  console.log("payment over",response.data)

  await sendOrderDetails(response.data.order);
  
 console.log('Cart details added to orders', response.data);
 }  else {
  console.error('Failed to add details to order_table:', response.data);
}
} catch (error) {
console.error('Error adding details to order_table:', error);
}
};



const sendOrderDetails = async (orderDetails) => {
  try {
    console.log("in router",orderDetails)
    let response;
    let details = orderDetails.order_details;
    console.log('length', details.length);

    for (let i = 0; i < details.length; i++) {
    response = await axios.post('http://localhost:4000/customer/corporateOrderDetails', {
        corporateorder_id: orderDetails.corporateorder_id,
        processing_date: details[i].processing_date,
        delivery_status: details[i].delivery_status,
        category_id: details[i].category_id,
        quantity: details[i].quantity,
        active_quantity: details[i].active_quantity,
        media: details[i].media,
        delivery_details: details[i].delivery_details
      });
      console.log('Order details sent in loop');
    }

    console.log('Order details sent:', orderDetails);
    if (response) {
      console.log('Order details successfully added:', response.data);
    } else {
      console.error('Failed to add details to order_table:', response.data);
    }
  } catch (error) {
    console.error('Error sending order details:', error);
  }
};

const PaymentDetails= async(corporateorder_generated_id)=>{
  try{

        const token=localStorage.getItem('token')
        const response = await axios.post('http://localhost:4000/pay', 
          {amount: Total,corporateorder_id:corporateorder_generated_id},{headers: { token: `${localStorage.getItem('token')}` },
        });
        if (response.data && response.data.redirectUrl) {
          setRedirectUrl(response.data.redirectUrl);
          // Redirect to the provided URL
          window.location.href = response.data.redirectUrl;
        } else {
          setError('Unexpected response format.');
        }
      } catch (err) {
        // Check for specific error details
        if (err.response) {
          setError(`Error: ${err.response.data.message || 'An error occurred. Please try again.'}`);
        } else {
          setError('Network error or no response from the server.');
        }
      } finally {
        setLoading(false);
      }
}

 const handleAddressAdd = () => {
 fetchAddress();
 handleAddressFormToggle();
 };

 const fetchAddress = async () => {
 try {
 const response = await axios.get('http://localhost:4000/customer/corporate/customerAddress', {
 headers: { token: localStorage.getItem('token') }
 });
 
 setAddress(response.data.address);
 const myAddresses = response.data.address;
 const ChangedAddress = myAddresses[myAddresses.length-1];
 localStorage.setItem('address', JSON.stringify(ChangedAddress));
 if (response.data.address && response.data.address.length > 0) {
 setUserAddressDetails(prevData => ({
 ...prevData,
 Name: ChangedAddress.ship_to_name || ChangedAddress.default_name || prevData.Name,
 PhoneNumber: ChangedAddress.ship_to_phone_number || prevData.PhoneNumber,
 address: `${ChangedAddress.line1}, ${ChangedAddress.line2}, ${ChangedAddress.pincode}`
 }));
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
 PhoneNumber: address.ship_to_phone_number || prevData.PhoneNumber,
 address: `${address.line1}, ${address.line2}, ${address.pincode}`
 }));
 handleAddressFormToggle();
 };
 if (isLoading) {
 return <div className="text-center mt-8">Loading...</div>;
 }

 return (
 <div className="flex flex-col min-h-screen">
 <header className="bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-10">
 <div className="flex justify-between items-center max-w-6xl mx-auto">
 <div className="flex items-center">
 <Link to="/home">
 <ChevronLeft size={24} className="cursor-pointer" onClick={handleViewHome} />
 </Link>
 <h1 className="text-lg text-black font-bold ml-2">My Cart</h1>
 </div>
 <div className="bg-yellow-500 rounded-full h-9 w-9 flex items-center justify-center">
 <ShoppingCart size={24} />
 </div>
 </div>
 </header>

 <main className="flex-grow overflow-y-auto mt-16 mb-20 p-4">
 <div className="max-w-6xl mx-auto">
 <div className="bg-gray-100 shadow-lg rounded-lg p-4 mb-6">
 <h2 className="text-xl font-bold mb-4">Your Details</h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="flex flex-col">
 <p className="text-sm font-bold">Name:</p>
 <p className="text-sm">{userAddressDetails.Name}</p>
 </div>
 <div className="flex flex-col">
 <p className="text-sm font-bold">Email:</p>
 <p className="text-sm">{userData.email}</p>
 </div>
 <div className="flex flex-col">
 <p className="text-sm font-bold">Phone Number:</p>
 <p className="text-sm">{userAddressDetails.PhoneNumber}</p>
 </div>
 <div className="flex flex-col">
 <p className="text-sm font-bold">Address:</p>
 <p className="text-sm">{userAddressDetails.address}</p>
 </div>
 </div>
 <button
 onClick={handleAddressFormToggle}
 className="mt-4 text-blue-500 bg-gray-200 px-4 py-2 rounded-md w-full sm:w-auto"
 >
 Change
 </button>
 </div>

 {sortedData.length === 0 ? (
 <div className="bg-white p-6 rounded-lg shadow-lg text-center">
 <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
 <p>No items are added to cart. Please add some items to continue.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full border-collapse border border-gray-200 bg-white shadow-md rounded-lg">
 <thead className="bg-gray-200 text-gray-700">
 <tr>
 <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Item</th>
 <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Processing Date</th>
 <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Price/Unit</th>
 <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Quantity</th>
 <th className="border border-gray-300 px-4 py-2 text-sm font-medium">Total Price</th>
 </tr>
 </thead>
 <tbody>
 {sortedData.map((item, index) => (
 <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
 <td className="border px-4 py-2 flex items-center gap-3">
 <img src={item.image} alt='food' className='rounded-full h-8 w-8 object-cover' />
 <span className="text-sm">{item.type}</span>
 </td>
 <td className="border px-4 py-2 text-sm">{item.date}</td>
 <td className="border px-4 py-2 text-sm">{item.price}</td>
 <td className="border px-4 py-2">
 <div className="flex items-center justify-center gap-2">
 <button
 className="bg-gray-200 text-black px-2 py-1 rounded-l-lg text-sm"
 onClick={() => handleDecrement(index)}
 >
 -
 </button>
 <span className="px-4 text-sm">{item.quantity}</span>
 <button
 className="bg-gray-200 text-black px-2 py-1 rounded-r-lg text-sm"
 onClick={() => handleIncrement(index)}
 >
 +
 </button>
 </div>
 </td>
 <td className="border px-4 py-2 text-sm">
 {item.quantity} x {item.price} = {item.price * item.quantity}
 <button
 className="ml-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
 onClick={() => handleRemove(index)}
 >
 <FontAwesomeIcon icon={faTrash} />
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </main>

 <footer className="bg-gray-300 text-black p-4 fixed bottom-0 left-0 right-0 z-10">
 <div className="flex justify-between items-center max-w-6xl mx-auto">
 <h2 className="text-lg font-bold bg-yellow-400 p-2 rounded-md shadow-md">
 Total: {Total}/-
 </h2>
 <button className="bg-purple-600 text-white p-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition" onClick={handleViewPayment}>
 Pay Now
 </button>
 </div>
 </footer>

 {isAddressFormOpen && (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
 <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
 <div className="p-4 overflow-y-auto flex-grow">
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