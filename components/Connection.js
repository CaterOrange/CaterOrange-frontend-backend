import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';

const MyApp = () => {
  const [message, setMessage] = useState('');
  const [inputValue, setInputValue] = useState('');

  const fetchMessage = async () => {
    try {
      const response = await axios.get('http://192.168.1.41:5000/api/hello'); // Adjust IP as needed
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error fetching message:", error);
    }
  };

  const fetchAndInsertCSVData = async () => {
    try {
      const response = await axios.post('http://192.168.1.41:5000/api/products'); // Adjust IP as needed
      Alert.alert('Success', response.data.message); // Show success message
    } catch (error) {
      console.error('Error fetching CSV data:', error);
      Alert.alert('Error', 'Error fetching CSV data');
    }
  };

  const sendData = async () => {
    try {
      const data = { data: inputValue }; // Send the input value as 'data'
      const response = await axios.post('http://192.168.1.41:5000/api/data', data); // Adjust IP as needed
      console.log('Response:', response.data);
      setInputValue(''); // Clear the input field after sending
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  useEffect(() => {
    fetchMessage();
  }, []);

  return (
    <View>
      <Text>{message}</Text>
      <TextInput
        placeholder="Enter your message"
        value={inputValue}
        onChangeText={setInputValue}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Fetch and Insert CSV Data" onPress={fetchAndInsertCSVData} />
    </View>
  );
};

export default MyApp;
