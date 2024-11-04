

import React, { useState,useEffect } from 'react';
import axios from 'axios'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,Button,Alert,ActivityIndicator
} from 'react-native';
import phonepeSDK from 'react-native-phonepe-pg';
import Base64 from 'react-native-base64';
import sha256 from 'sha256';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';
// import { useCart } from '../CartContext';
import paymentSuccessAnimation from '../assets/paymentSuccess.json';
import paymentFailureAnimation from '../assets/paymentFailure.json';


const CONFIG = {
    environment: 'SANDBOX',
    merchantId: 'PGTESTPAYUAT86',
    appId: '1',
    enableLogging: true,
    saltKey: '96434309-7796-489d-8924-ab56988a6076',
    saltIndex: '1',
    callbackUrl: 'https://webhook.site/callback-url'
  };

  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return MT${timestamp}${random};
  };
// import LottieView from 'lottie-react-native';


const userId = "C000001"
CartItem.propTypes = {
  foodType: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  date: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

   const CONFIG = {
    environment: 'SANDBOX',
    merchantId: 'PGTESTPAYUAT86',
    appId: '1',
    enableLogging: true,
    saltKey: '96434309-7796-489d-8924-ab56988a6076',
    saltIndex: '1',
    callbackUrl: 'https://webhook.site/callback-url'
  };
  
  const generateTransactionId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return MT${timestamp}${random};
  };



  const generateChecksum = (payload) => {
    try {
      // Step 1: Convert payload to Base64
      const payloadBase64 = Base64.encode(JSON.stringify(payload));
      
      // Step 2: Concatenate in correct order: base64 + /pg/v1/pay + saltKey
      // Note: No additional characters or spaces between concatenated strings
      const stringToHash = payloadBase64 + "/pg/v1/pay" + CONFIG.saltKey;
      
      // Step 3: Generate SHA256 hash
      const hash = sha256(stringToHash);
      
      // Step 4: Append salt index with ### separator
      const checksum = ${hash}###${CONFIG.saltIndex};

      console.log('Auth Debug:', {
        originalPayload: payload,
        payloadBase64,
        stringToHash,
        finalChecksum: checksum
      });

      return {
        payloadBase64,
        checksum
      };
    } catch (error) {
      console.error('Checksum Generation Error:', error);
      throw error;
    }
  };


  const recordPayment = async (paymentDetails) => {
    try {
      // Construct the payment details object based on your backend's expected payload
      const paymentPayload = {
        paymentType: paymentDetails.paymentType || 'PhonePe', // Default payment type
        merchantTransactionId: paymentDetails.merchantTransactionId,
        phonePeReferenceId: paymentDetails.phonePeReferenceId,
        paymentFrom: paymentDetails.paymentFrom || 'Online', // Default payment source
        instrument: paymentDetails.instrument || 'Digital', // Default instrument
        bankReferenceNo: paymentDetails.bankReferenceNo,
        amount: paymentDetails.amount,
        customer_id: paymentDetails.customerId, // Make sure to pass the customer ID
        corporateorder_id: paymentDetails.corporateOrderId // Pass the corporate order ID
      };
  
      // Make the axios POST request
      const response = await axios.post('http://192.168.1.15:4000/api/insert-payment', paymentPayload, {
        headers: {
          'Content-Type': 'application/json'
          // Add any additional headers like authorization if needed
          // 'Authorization': Bearer ${token}
        }
      });
  
      // Handle successful payment recording
      console.log('Payment recorded successfully:', response.data);
      
      // You might want to return the generated payment ID or do additional processing
      return response.data.payment_id;
  
    } catch (error) {
      // Handle any errors during payment recording
      console.error('Error recording payment:', error.response ? error.response.data : error.message);
      
      // Optionally show an alert or handle the error
      Alert.alert('Payment Recording Error', 'Could not record payment details');
      
      throw error; // Re-throw to allow caller to handle if needed
    }
  };


  const handlePayment = async () => { 
    try {
      const order = await transferCartToOrder();
      const order_generated_id=order.corporateorder_id
      const orderDetails=order.order_details
      console.log(orderDetails)
      if (!order_generated_id) {
        throw new Error('Failed to create order');
      }
      // 1. Initialize SDK
      const initResponse = await phonepeSDK.init(
        CONFIG.environment,
        CONFIG.merchantId,
        CONFIG.appId,
        CONFIG.enableLogging
      );

      if (!initResponse) {
        throw new Error('SDK initialization failed');
      }

      // 2. Prepare request body according to PhonePe specifications
      const requestBody = {
        merchantId: CONFIG.merchantId,
        merchantTransactionId: generateTransactionId(),
        merchantUserId: MUID${Date.now()},
        amount: Math.round(Number(getTotalPrice()) * 100), // Ensure amount is integer
        mobileNumber: 9490489044,
        callbackUrl: CONFIG.callbackUrl,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // 3. Generate checksum and get base64 payload
      const { payloadBase64, checksum } = generateChecksum(requestBody);

      console.log('Transaction Request:', {
        requestBody,
        payloadBase64,
        checksum
      });

      // 4. Start transaction with correct parameters
      const transactionResponse = await phonepeSDK.startTransaction(
        payloadBase64,
        checksum,
        null,
        null
      );

      console.log('Transaction Response:', transactionResponse);

      if (transactionResponse.status === 'SUCCESS') {
        const paymentDetails = {
          paymentType: 'PhonePe',
          merchantTransactionId: requestBody.merchantTransactionId,
          phonePeReferenceId: transactionResponse.transactionId, // Adjust based on actual response
          paymentFrom: 'Online',
          instrument: 'Digital',
          bankReferenceNo: transactionResponse.bankReferenceNumber, // Adjust based on actual response
          amount: requestBody.amount / 100, // Convert back to original amount
          customerId: "C000001", // Implement this function to get current user ID
          corporateOrderId: order_generated_id
        };
        const generatedPaymentId = await recordPayment(paymentDetails);
        if(generatedPaymentId)
          {
            
              await sendOrderDetails(orderDetails,order_generated_id);
            
          } 
        Alert.alert('Success', 'Transaction initiated successfully!');
        setAnimationSource(paymentSuccessAnimation);
        
      } else {
        throw new Error(transactionResponse.error || 'Transaction failed');
        setAnimationSource(paymentFailureAnimation);

      }
      setShowAnimation(true);

    } catch (error) {
      console.error('Payment Error:', error);
      let errorMessage = 'Transaction failed. ';
      
      // Parse PhonePe error message if available
      if (error.message && error.message.includes('key_error_result')) {
        try {
          const errorJson = JSON.parse(
            error.message.split('key_error_result:')[1]
          );
          errorMessage += Error ${errorJson.code}: ${errorJson.message || 'Please verify credentials'};
        } catch (e) {
          errorMessage += error.message;
        }
      } else {
        errorMessage += error.message;
      }

      Alert.alert('Error', errorMessage);
      setAnimationSource(paymentFailureAnimation);
      setShowAnimation(true);
    } 
  };


  const sendOrderDetails = async (orderDetails,order_generated_id) => {
    try {
      let response;
      let details = orderDetails;
      
      console.log(details)
      // Loop through each order detail and send to API
      for (let i = 0; i < details.length; i++) {
        response = await axios.post('http://192.168.1.15:4000/api/customer/corporateOrderDetails', {
          corporateorder_id:order_generated_id,
          processing_date: details[i].date,
          delivery_status: 'Ordered',
          category_id: details[i].category_id,
          quantity: details[i].quantity,
          active_quantity: details[i].quantity,
          media: null,
          delivery_details:null
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

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(http://192.168.1.15:4000/cart/${userId});
      
      // Convert the Redis hash response to an array of cart items
      const items = Object.entries(response.data).map(([id, itemString]) => ({
        id,
        ...JSON.parse(itemString)
      }));
      
      setCartItems(items);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to fetch cart items');
      Alert.alert('Error', 'Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateQuantity = async (itemId, change) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) return;

      const newQuantity = item.quantity + change;
      if (newQuantity < 1) return;

      // Calculate new total based on base price and new quantity
      const basePrice = item.price;
      const numberOfDays = item.dates.length;
      const newTotal = basePrice * newQuantity * numberOfDays;

      const updatedItem = {
        ...item,
        quantity: newQuantity,
        total: newTotal // Update the total price
      };

      // Update in Redis
      await axios.post(http://192.168.1.15:4000/cart/update, {
        userId,
        itemId,
        item: updatedItem
      });

      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? updatedItem : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(http://192.168.1.15:4000/cart/${userId}/${itemId});
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  // Corrected checksum generation according to PhonePe specifications
  const generateChecksum = (payload) => {
    try {
      // Step 1: Convert payload to Base64
      const payloadBase64 = Base64.encode(JSON.stringify(payload));
      
      // Step 2: Concatenate in correct order: base64 + /pg/v1/pay + saltKey
      // Note: No additional characters or spaces between concatenated strings
      const stringToHash = payloadBase64 + "/pg/v1/pay" + CONFIG.saltKey;
      
      // Step 3: Generate SHA256 hash
      const hash = sha256(stringToHash);
      
      // Step 4: Append salt index with ### separator
      const checksum = ${hash}###${CONFIG.saltIndex};

      console.log('Auth Debug:', {
        originalPayload: payload,
        payloadBase64,
        stringToHash,
        finalChecksum: checksum
      });

      return {
        payloadBase64,
        checksum
      };
    } catch (error) {
      console.error('Checksum Generation Error:', error);
      throw error;
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showAnimation ? (
        <>
          <LottieView
            source={animationSource}
            autoPlay
            loop={false}
            onAnimationFinish={() => setShowAnimation(false)}
            style={styles.animation}
          />
          <Text style={styles.orderStatus}>
            {animationSource === paymentSuccessAnimation ? 'Order Successful' : 'Order Failed'}
          </Text>
        </>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.header}>Your Cart</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : cartItems.length === 0 ? (
              <Text style={styles.emptyCart}>Your cart is empty</Text>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onUpdateQuantity={(change) => handleUpdateQuantity(item.id, change)}
                  onRemove={() => handleRemoveItem(item.id)}
                />
              ))
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{getTotalPrice().toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.payButton, (!cartItems.length || loading) && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!cartItems.length || loading}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );

};



  const transferCartToOrder = async () => {
    try {
      const transformedData = cartItems.flatMap(item =>
        item.dates.map(date => ({
            foodType: item.foodType,
            price: item.price,
            date: date,
            image: item.image,
            quantity: 1,
            category_id: item.category_id
        }))
    );
      const orderPayload = {
        customer_generated_id: 'C000001', // Replace with actual customer ID from your auth
        order_details: cartItems,
        total_amount: getTotalPrice(),
        paymentid: null, // Initially null as specified
        customer_address: null, // Replace with actual address
        payment_status: 'pending' // Initially pending as specified
      };

      const response = await axios.post(
        'http://192.168.1.15:4000/api/customer/corporate/transfer-cart-to-order',
        orderPayload,
        {
          headers: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InB1bm5ldGhrMjQ1QGdtYWlsLmNvbSIsImlkIjoiQzAwMDAwMSIsImlhdCI6MTczMDQ1NjIxMCwiZXhwIjoxNzMwNTQyNjEwfQ.0PTNq9C13mVlJ4rzpXR-YqOAtGYrKc8ugqTHERkWDQQ',
          },
        }
      );

      if (response.status === 200) {
        return response.data.order;
      } else {
        throw new Error('Failed to transfer cart to order');
      }
    } catch (error) {
      console.error('Error transferring cart to order:', error);
      throw error;
    }
  };

  const recordPayment = async (paymentDetails) => {
    try {
      // Construct the payment details object based on your backend's expected payload
      const paymentPayload = {
        paymentType: paymentDetails.paymentType || 'PhonePe', // Default payment type
        merchantTransactionId: paymentDetails.merchantTransactionId,
        phonePeReferenceId: paymentDetails.phonePeReferenceId,
        paymentFrom: paymentDetails.paymentFrom || 'Online', // Default payment source
        instrument: paymentDetails.instrument || 'Digital', // Default instrument
        bankReferenceNo: paymentDetails.bankReferenceNo,
        amount: paymentDetails.amount,
        customer_id: paymentDetails.customerId, // Make sure to pass the customer ID
        corporateorder_id: paymentDetails.corporateOrderId // Pass the corporate order ID
      };
  
      // Make the axios POST request
      const response = await axios.post('http://192.168.1.15:4000/api/insert-payment', paymentPayload, {
        headers: {
          'Content-Type': 'application/json'
          // Add any additional headers like authorization if needed
          // 'Authorization': Bearer ${token}
        }
      });
  
      // Handle successful payment recording
      console.log('Payment recorded successfully:', response.data);
      
      // You might want to return the generated payment ID or do additional processing
      return response.data.payment_id;
  
    } catch (error) {
      // Handle any errors during payment recording
      console.error('Error recording payment:', error.response ? error.response.data : error.message);
      
      // Optionally show an alert or handle the error
      Alert.alert('Payment Recording Error', 'Could not record payment details');
      
      throw error; // Re-throw to allow caller to handle if needed
    }
  };

  const handlePayment = async () => { 
    try {
      const order = await transferCartToOrder();
      const order_generated_id=order.corporateorder_id
      const orderDetails=order.order_details
      console.log(orderDetails)
      if (!order_generated_id) {
        throw new Error('Failed to create order');
      }
      // 1. Initialize SDK
      const initResponse = await phonepeSDK.init(
        CONFIG.environment,
        CONFIG.merchantId,
        CONFIG.appId,
        CONFIG.enableLogging
      );

      if (!initResponse) {
        throw new Error('SDK initialization failed');
      }

      // 2. Prepare request body according to PhonePe specifications
      const requestBody = {
        merchantId: CONFIG.merchantId,
        merchantTransactionId: generateTransactionId(),
        merchantUserId: MUID${Date.now()},
        amount: Math.round(Number(getTotalPrice()) * 100), // Ensure amount is integer
        mobileNumber: 9490489044,
        callbackUrl: CONFIG.callbackUrl,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      // 3. Generate checksum and get base64 payload
      const { payloadBase64, checksum } = generateChecksum(requestBody);

      console.log('Transaction Request:', {
        requestBody,
        payloadBase64,
        checksum
      });

      // 4. Start transaction with correct parameters
      const transactionResponse = await phonepeSDK.startTransaction(
        payloadBase64,
        checksum,
        null,
        null
      );

      console.log('Transaction Response:', transactionResponse);

      if (transactionResponse.status === 'SUCCESS') {
        const paymentDetails = {
          paymentType: 'PhonePe',
          merchantTransactionId: requestBody.merchantTransactionId,
          phonePeReferenceId: transactionResponse.transactionId, // Adjust based on actual response
          paymentFrom: 'Online',
          instrument: 'Digital',
          bankReferenceNo: transactionResponse.bankReferenceNumber, // Adjust based on actual response
          amount: requestBody.amount / 100, // Convert back to original amount
          customerId: "C000001", // Implement this function to get current user ID
          corporateOrderId: order_generated_id
        };
        const generatedPaymentId = await recordPayment(paymentDetails);
        if(generatedPaymentId)
          {
            
              await sendOrderDetails(orderDetails,order_generated_id);
            
          } 
        Alert.alert('Success', 'Transaction initiated successfully!');
        setAnimationSource(paymentSuccessAnimation);
        
      } else {
        throw new Error(transactionResponse.error || 'Transaction failed');
        setAnimationSource(paymentFailureAnimation);

      }
      setShowAnimation(true);

    } catch (error) {
      console.error('Payment Error:', error);
      let errorMessage = 'Transaction failed. ';
      
      // Parse PhonePe error message if available
      if (error.message && error.message.includes('key_error_result')) {
        try {
          const errorJson = JSON.parse(
            error.message.split('key_error_result:')[1]
          );
          errorMessage += Error ${errorJson.code}: ${errorJson.message || 'Please verify credentials'};
        } catch (e) {
          errorMessage += error.message;
        }
      } else {
        errorMessage += error.message;
      }

      Alert.alert('Error', errorMessage);
      setAnimationSource(paymentFailureAnimation);
      setShowAnimation(true);
    } 
  };


  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      {showAnimation ? (
        <>
          <LottieView
            source={animationSource}
            autoPlay
            loop={false}
            onAnimationFinish={() => setShowAnimation(false)}
            style={styles.animation}
          />
          <Text style={styles.orderStatus}>
            {animationSource === paymentSuccessAnimation ? 'Order Successful' : 'Order Failed'}
          </Text>
        </>
      ) : (
        <>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.header}>Your Cart</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
            ) : cartItems.length === 0 ? (
              <Text style={styles.emptyCart}>Your cart is empty</Text>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  {...item}
                  onUpdateQuantity={(change) => handleUpdateQuantity(item.id, change)}
                  onRemove={() => handleRemoveItem(item.id)}
                />
              ))
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{getTotalPrice().toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.payButton, (!cartItems.length || loading) && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={!cartItems.length || loading}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  animation:{
    flex:1
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  cartItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  foodType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    maxWidth: '70%',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'right',
    color: '#007AFF',
  },
  removeButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  payButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  }, datesContainer: {
    marginVertical: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dates: {
    fontSize: 12,
    color: '#888',
  },
  dateCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyCart: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40,
  },
  loader: {
    marginTop: 40,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  orderStatus: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  }
});

export default Cart;

