import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { ChevronLeft, ShoppingCart, Plus, Minus, Trash2, ParkingSquareOffIcon } from 'lucide-react';
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
    const updatedItems = [...prevItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: parseInt(updatedItems[index].quantity) + parseInt(1), // Increment the quantity
    };
    var local=localStorage.getItem('count')
    var c=parseInt(local)+1
localStorage.setItem('count',c)
    updateCartItem(updatedItems[index]); // Update cart on server
    return updatedItems;
  });
};



const handleDecrement = async (index) => {
  setSortedData((prevItems) => {
    const updatedItems = [...prevItems];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: updatedItems[index].quantity - 1, // Decrement the quantity
      };
      var local=localStorage.getItem('count')
    var c=parseInt(local)-1
localStorage.setItem('count',c)
      updateCartItem(updatedItems[index]); // Update cart on server
    }
    return updatedItems;
  });
};

    const updateCartItem = async (item) => {
          try {
            await axios.put(
              `http://localhost:4000/customer/updateCartItem/${item.id}`,
              {
                date: item.date,
                quantity: item.quantity
              }
            );
          } catch (error) {
            console.error('Error updating cart item quantity:', error);
          }
        };


  const handleRemove = async (index,old) => {
   
    const itemToRemove = sortedData[index];
    setSortedData((prevItems) => prevItems.filter((_, i) => i !== index));
    try {
      await axios.delete(`http://localhost:4000/customer/removeCartItem/${itemToRemove.id}`, {
        data: { date: itemToRemove.date }
      });
    } catch (error) {
      console.error('Error removing cart item:', error);
    }
    var local=localStorage.getItem('count')
    const localParsed = parseInt(local, 10);
    if (isNaN(localParsed)) {
      console.error('Invalid localStorage value for count');
      return;
    }
  
    // Ensure oldQuantity is a valid number
    const oldQuantityParsed = parseInt(old, 10);
   
    if (isNaN(oldQuantityParsed)) {
      console.error('Invalid oldQuantity value');
      return;
    }
    const updatedQuantity = localParsed - oldQuantityParsed;
   
localStorage.setItem('count',updatedQuantity)
  };
 const handleViewHome = () => {
 navigate('/home');
 };

 const handleAddressFormToggle = () => {
 setIsAddressFormOpen(!isAddressFormOpen);
 };

 const handleViewPayment = async () => {
  // if (!userData ||userData.length === 0) {
  //   // Display a message if userData is not available
  //   alert("Please provide your details before proceeding to payment.");
  //   return;
  // }
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

const handleQuantityChange = (index, value, oldQuantity) => {
  console.log('old1', oldQuantity);
  const oldQuantityParsed = parseInt(oldQuantity, 10);
  console.log("oldbefore",oldQuantityParsed)
  // Check if value is an empty string to allow clearing the input
  if (value === '') {
    setSortedData((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: '', // Set the quantity to an empty string
      };
      return updatedItems;
    });
    return;
  }

  // Parse the input value and local storage value
  const newQuantity = parseInt(value, 10);
  console.log("in text box",newQuantity);
  // Validate and update the state
  if (!isNaN(newQuantity) && newQuantity > 0) {
    setSortedData((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: newQuantity,
      };

      // Call updateCartItem with the updated item
      updateCartItem(updatedItems[index]);

      return updatedItems;
    });
  }
  let local = localStorage.getItem('count');
  const localParsed = parseInt(local, 10); // Make sure local is a valid number
 console.log("local parsed",localParsed)
  // Handle invalid or missing localStorage value
  if (isNaN(localParsed)) {
    console.error('Invalid localStorage value for count');
    return;
  }

  // Ensure oldQuantity is a valid number
 
  console.log("oldafter",oldQuantityParsed)
  // if (isNaN(oldQuantity)) {
  //   console.error('Invalid oldQuantity value');
  //   return;
  // }
console.log('oldparsed',oldQuantityParsed);
  // Calculate the new count v
  const updatedQuantity = localParsed - oldQuantityParsed;
  console.log('updatedQuantity after subtraction', updatedQuantity);

  const newCount = updatedQuantity + newQuantity;
  console.log('newCount after addition', newCount);
  localStorage.setItem('count', newCount);

};




  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 fixed top-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center">
            <Link to="/home">
              <ChevronLeft size={24} className="cursor-pointer" onClick={handleViewHome} />
            </Link>
            <h1 className="text-lg font-bold ml-2">My Cart</h1>
          </div>
          <div className="bg-yellow-500 rounded-full h-8 w-8 flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
        </div>
      </header>

      <main className="flex-grow mt-16 mb-20 p-4">
        <div className="max-w-6xl mx-auto">
          {/* User details section */}
          <div className="bg-white shadow-lg rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold mb-4">Your Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-bold">Name:</p>
                <p>{userAddressDetails.Name}</p>
              </div>
              <div>
                <p className="font-bold">Email:</p>
                <p>{userData.email}</p>
              </div>
              <div>
                <p className="font-bold">Phone Number:</p>
                <p>{userAddressDetails.PhoneNumber}</p>
              </div>
              <div>
                <p className="font-bold">Address:</p>
                <p>{userAddressDetails.address}</p>
              </div>
            </div>
            <button
              onClick={handleAddressFormToggle}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              {userData ? 'Change' : 'Add Address'}
            </button>
          </div>

          {/* Cart items section */}
          {sortedData.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-xl font-bold mb-4">Your cart is empty</h2>
              <p>No items are added to cart. Please add some items to continue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedData.map((item, index) => (
                <div key={index} className="relative bg-white rounded-lg shadow-md p-4">
                  {/* Remove Button */}
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    onClick={() => handleRemove(index , sortedData[index].quantity)}
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Item Details */}
                  <div className="flex items-center">
                    <div className="rounded-lg shadow-slate-300 bg-blue-50 shadow-xl overflow-auto w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 flex justify-center items-center">
                      <img
                        src={item.image}
                        alt={item.type}
                        className=" h-full w-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-4 ml-5">
                      <h3 className="font-bold text-lg md:text-xl text-gray-800">{item.type}</h3>
                      <p className="text-sm text-gray-500">Date: {item.date}</p>

                      {/* Quantity and Increment/Decrement */}
                      <div className="flex  space-x-2 mt-2">
                        <button
                          className="bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300 text-xs"
                          onClick={() => handleDecrement(index)}
                        >
                          <Minus size={12} />
                        </button>
                <input
                  type="number"
                  min="1"
                  value={sortedData[index].quantity || ''} // Ensure this is always a number
                  onChange={(e) => handleQuantityChange(index, e.target.value,sortedData[index].quantity)}
                  className="w-10 text-center border border-gray-300 rounded-md p-1 text-xs"
                />


                        <button
                          className="bg-gray-200 text-gray-700 p-1 rounded-full hover:bg-gray-300 text-xs"
                          onClick={() => handleIncrement(index)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Price, Quantity, and Amount */}
                      <div className="text-sm text-gray-600 mt-2">
                        <p>Price Per Plate: ₹{item.price}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p className="font-bold text-gray-800">Amount: {item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white shadow-md p-4 fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h2 className="text-lg font-bold">Total: ₹{Total}/-</h2>
          <button 
            className="bg-purple-600 text-white p-2 px-4 rounded-lg shadow-md hover:bg-purple-700 transition"
            onClick={handleViewPayment}
          >
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
