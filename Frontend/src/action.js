import axios from 'axios';
import { useState } from 'react';

// Function to get cart details from an order ID
export const getCartFromOrderId = async (orderId) => {
  try {
    // Replace the URL with your actual API endpoint
    const response = await axios.get(`http://localhost:5000/api/orders/${orderId}/cart`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response is successful and return the cart data
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
  console.log("payload action",payload);
    const response = await axios.post('http://localhost:5000/api/cart/add', payload, {
      headers: {
        'Content-Type': 'application/json'  
      }
    });
    console.log("Response from backend:", response.data);  
    if (response.status === 200) {
      console.log('Cart items successfully posted to the backend');
      return response.data;
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



  export const cartToOrder = async(eventcart_id)=>{
    try {
      const response = await axios.post('http://localhost:5000/api/transfer-cart-to-order', {
      eventcart_id
      }, {
        headers: {
          'Content-Type': 'application/json'  
        }
      });
      console.log("response from cart",response);
    } catch (err) {
      console.log(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
    }
  }



export const myorders = async()=>{
  try {
            const response = await fetch('http://localhost:5000/api/myorders');
            const data = await response.json();
            if (response) {
          
              return data;
            } else {
              console.log('No data received from the server.');
              
            }
          } catch (error) {
            console.log('Failed to fetch orders. Please try again later.');
            
          } 
   }

export const orderbuyagain = async(cartData)=>{
  console.log("in action.js:",cartData);
  try {
    const response = await axios.post('http://localhost:5000/api/orderbuyagain',cartData,{
      headers: {
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



