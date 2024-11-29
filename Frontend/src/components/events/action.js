
import axios from 'axios';
import { useState } from 'react';

export const getCartFromOrderId = async (orderId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_URL}/api/orders/${orderId}/cart`, {
      headers: {
        'token':localStorage.getItem('token'),
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      console.log('Cart data fetched successfully:', response.data);
      return response.data.cart; // Assuming the cart data is under the 'cart' field in the response
    } else {
      console.error(`Error: Received status code ${response.status}`);
      return null;
    }
  } catch (err) {
    if (err.response) {
      console.error("Error fetching cart data:", err.response.data);
    } else {
      console.error("Error fetching cart data:", err.message);
    }
    return null;
  }
};


export const addtocart = async(payload)=>{
try {   
    const token = localStorage.getItem('token');
  console.log("payload action",payload);
    const response = await axios.post(`${process.env.REACT_APP_URL}/api/cart/add`, payload, {
      headers: {
        token:token
      
      }
    });
    console.log("Response from backend:", response.data);  
    if (response.status === 200) {
      console.log('Cart items successfully posted to the backend');
      return response.data.cart_id;
    } else {
      console.error(`Error: Received status code ${response.status}`);
    }
  } catch (err) {
    if (err.response) {
      console.error("Error posting:", err.response.data); 
    } else {
      console.error("Error posting cart items:", err.message);  
    }
  }}
  

  export const cartToOrder = async(totalAmount,cartDetails,numberOfPlates,selectedDate,selectedTime,address)=>{
   console.log("in action",totalAmount,cartDetails,numberOfPlates,selectedDate,selectedTime,address)
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/api/transfer-cart-to-order`, {
      
    
          delivery_status:"pending",
          total_amount:totalAmount,
          PaymentId:null,
          delivery_details:null,
          event_order_details:JSON.stringify(cartDetails),
          event_media:null,
          customer_address:JSON.stringify(address),
          payment_status:"pending",
          event_order_status:"delivered",
          number_of_plates:numberOfPlates,
          processing_date:selectedDate,
          processing_time:selectedTime
      }, {
        headers: {
            token: `${localStorage.getItem('token')}` ,
          'Content-Type': 'application/json'  
        }
      });
      console.log("response from cart",response);
      return response.data;
    } catch (err) {
      console.log(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
    }
  }



export const myorders = async()=>{
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${process.env.REACT_APP_URL}/api/myorders`,{
        headers: {
          token:token
        
        }
      });
      console.log("response in myorders",response)
            
            if (response) {
          
                return response.data;
            } else {
              console.log('No data received from the server.');
              
            }
            
          } catch (error) {
            console.log('Failed to fetch orders. Please try again later.');
            
          } 
   }
  export const removeFromCart = async (productid, eventcart_id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'token':localStorage.getItem('token'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productid,eventcart_id }),
      });
      
      const data = await response.json();
      if (response.ok) {
        console.log('Item removed:', data);
      } else {
        console.error('Error removing item:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
export const orderbuyagain = async(cartData)=>{
  console.log("in action.js:",cartData);
  try {
    const response = await axios.post(`${process.env.REACT_APP_URL}/api/orderbuyagain`,cartData,{
      headers: {
        'token':localStorage.getItem('token'),
        'Content-Type': 'application/json'  
      }
    });
   
    if (response) {
     console.log("ordered placed successfully");
      
    } else {
      console.log('No data added from the server.');
      
    }
  } catch (error) {
    console.log('Failed to fetch orders. Please try again later.');
    
  } 

}