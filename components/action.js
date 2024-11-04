
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';


const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IlRlc3RlcjEyNEBnbWFpbC5jb20iLCJpZCI6IkMwMDAwMDQiLCJpYXQiOjE3MzA1NDc2OTcsImV4cCI6MTczMDYzNDA5N30.uEvw9RACX6w7Xjpt0zFda3KBd021APMTyzBhDAXkVc4';
// Function to store the token in AsyncStorage
const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
    // console.log('Token stored successfully');
  } catch (error) {
    console.log('Failed to store the token:', error);
    Alert.alert('Error', 'Failed to store the token. Please try again.');
  }
};

// console.log("token in storage",token);

// Call the function to store the token
storeToken(token);

const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:4000'  
  : 'http://localhost:4000'; 


export const myorders = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    // console.log("token in async",token);
    const response = await axios.get(`${BASE_URL}/api/myorders`, {
      headers: {
        token: token,
      },
    });
    
    // console.log("response in myorders", response);
    
    if (response?.data) {
      return response.data;
    } else {
      console.log('No data received from the server.');
      return [];
    }
  } catch (error) {
    console.log('Failed to fetch orders:', error);
    Alert.alert(
      'Error',
      'Failed to fetch orders. Please try again later.',
      [{ text: 'OK' }]
    );
    return [];
  }
};


// Optional: Add a test connection function
export const testConnection = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/myorders`);
    console.log('Connection test response:', response.data);
    return true;
  } catch (error) {
    console.log('Connection test error:', error);
    Alert.alert(
      'Connection Error',
      'Could not connect to the server. Please check if the backend is running.',
      [{ text: 'OK' }]
    );
    return false;
  }
};