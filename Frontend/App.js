
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LoginScreen from './customer/SignInForm'; // Adjust the path as necessary
import SignupScreen from './customer/SignUpForm'; // Adjust the path as necessary
// import HomeScreen from './customer/home'; // Adjust the path as necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddressForm from './customer/address_corporate';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('loading');

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setCurrentScreen('address');
      } else {
        setCurrentScreen('login');
      }
    };
    checkToken();
  }, []);

  const toggleScreen = () => {
    setCurrentScreen((prev) => (prev === 'login' ? 'signup' : 'login'));
  };

  const onLoginSuccess = () => {
    setCurrentScreen('address');
  };

  const onSignupSuccess = () => {
    setCurrentScreen('address');
  };

  const onLogout = () => {
    AsyncStorage.removeItem('token'); // Clear the token on logout
    setCurrentScreen('login');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'loading' && (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      )}
      
      {currentScreen === 'login' && (
        <LoginScreen 
          onLoginSuccess={onLoginSuccess}
          toggleScreen={toggleScreen}
        />
      )}
      
      {currentScreen === 'signup' && (
        <SignupScreen 
          onSignupSuccess={onSignupSuccess}
          toggleScreen={toggleScreen}
        />
      )}
      
      {currentScreen === 'address' && (
        <AddressForm onLogout={onLogout} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;


// // App.js
// import React from 'react';
// import { SafeAreaView, StyleSheet } from 'react-native';
// import LeafletMap from './customer/example';

// const App = () => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <LeafletMap />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;