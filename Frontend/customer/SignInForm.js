
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const LoginScreen = ({ toggleScreen, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values) => {
    try {
      const response = await axios.post('http://10.0.2.2:4000/customer/login', {
        customer_email: values.email,
        customer_password: values.password,
      });

      const token = response.data.token; // Adjust based on your actual response structure
      console.log(token);
      await AsyncStorage.setItem('token', token);
      const a= AsyncStorage.getItem('token');
      console.log('async token', a)
      Alert.alert('Success', response.data.message);
      onLoginSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Login failed. Please check your credentials.');
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <Text style={styles.header}>CaterOrange</Text>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a0a0a0"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#a0a0a0"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIconText}>
                    {showPassword ? '👁️' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={toggleScreen}>
                  <Text style={styles.toggleText}>Forget Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleScreen}>
                  <Text style={styles.toggleText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  container: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    height: 50,
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fafafa',
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    height: 50,
    justifyContent: 'center',
  },
  eyeIconText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  toggleText: {
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
});

export default LoginScreen;
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   StatusBar,
// } from 'react-native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

// const LoginSchema = Yup.object().shape({
//   email: Yup.string().email('Invalid email').required('Email is required'),
//   password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
// });

// const LoginScreen = ({ toggleScreen, onLoginSuccess }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading]= useState(false);
//   const [error, setError]= useState()

//   useEffect(() => {
//     GoogleSignin.configure({
//       // webClientId: '1025589181172-ff5nrnppugboiv90dr90lecv51n73oai.apps.googleusercontent.com', // Replace with your actual web client ID
//       webClientId:'460660697590-i5nv97ls5np5g3dp2vkp84jvrob28vgu.apps.googleusercontent.com',
//       offlineAccess: true,
//       forceCodeForRefreshToken: true,
//     });
//   }, []);

//   const handleLogin = async (values) => {
//     try {
//       const response = await axios.post('https://dev.caterorange.com/api/customer/login', {
//         customer_email: values.email,
//         customer_password: values.password,
//       });

//       console.log('API Response:', response.data); // Debug log

//       const token = response.data.token;
//       if (!token) {
//         throw new Error('Token not received from the server');
//       }

//       await AsyncStorage.setItem('token', token);
//       Alert.alert('Success', response.data.message);
//       onLoginSuccess();
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Login failed. Please check your credentials.');
//     }
//   };

//   // const handleGoogleSignIn = async () => {
//   //   try {
//   //     await GoogleSignin.hasPlayServices();
//   //     console.log("Play services checked");
      
//   //     const userInfo = await GoogleSignin.signIn();
//   //     console.log("User Info:", userInfo);
  
//   //     const token = userInfo.idToken;
//   //     if (!token) {
//   //       throw new Error('Google sign-in token not received');
//   //     }
  
//   //     await AsyncStorage.setItem('token', token);
//   //     Alert.alert('Success', 'Google Sign-In successful!');
//   //     onLoginSuccess();
//   //   } catch (error) {
//   //     console.error("Google Sign-In Error:", error);
//   //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//   //       Alert.alert('Cancelled', 'User cancelled the login flow');
//   //     } else if (error.code === statusCodes.IN_PROGRESS) {
//   //       Alert.alert('In Progress', 'Signing in already in progress');
//   //     } else {
//   //       Alert.alert('Error', 'Something went wrong during Google Sign-In');
//   //     }
//   //   }
//   // };
  


//   const handleGoogleSignIn = async () => {
//     try {
//       setIsLoading(true);
//       setError('');
//       await GoogleSignin.hasPlayServices();
//       await GoogleSignin.signOut();
//       const userInfo = await GoogleSignin.signIn();
//       console.log('User Info:', userInfo); 
//       const { accessToken } = await GoogleSignin.getTokens();
  
//       const user = userInfo.data ? userInfo.data.user : userInfo.user;
//       if (user) {
//         const customerName = user.name || 'Default Name';
//         const customerEmail = user.email || 'Default Email';
        
//         console.log("customerName:", customerName);
//         console.log("customerEmail:", customerEmail);
        
//         const response = await axios.post('https://dev.caterorange.com/api/customer/google_auth', {
//           customer_name: customerName,
//           customer_email: customerEmail,
//           access_token: accessToken
//         });
//         console.log("API Response:", response.data);
        
//         if (response.data.success) {
//           if (response.data.token) {
//             await AsyncStorage.setItem('token', response.data.token);
//           }
  
//           if (userInfo.user) {
//             await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo.user));
//           }
          
//           Alert.alert("Success", "Signed in successfully with Google", [
//              { text: "OK" }
//           ]);
//         } else {
//           console.log("Google sign in failed with message:", response.data.message);
//           throw new Error(response.data.message || 'Google sign in failed');
//         }
//       } else {
//         console.log("userInfo.user is missing in Google response");
//       }
//     } catch (error) {
//       console.log("Error in Google sign-in:", error);
//       let errorMessage = 'An error occurred during Google sign-in';
  
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         errorMessage = 'Sign in cancelled';
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         errorMessage = 'Sign in already in progress';
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         errorMessage = 'Play services not available or needs to be updated';
//       } else {
//         errorMessage = error.message;
//       }
  
//       setError(errorMessage);
//       Alert.alert("Error", errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={styles.background}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <View style={styles.container}>
//         <Text style={styles.header}>CaterOrange</Text>
//         <Formik
//           initialValues={{ email: '', password: '' }}
//           validationSchema={LoginSchema}
//           onSubmit={handleLogin}
//         >
//           {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email"
//                 placeholderTextColor="#a0a0a0"
//                 onChangeText={handleChange('email')}
//                 onBlur={handleBlur('email')}
//                 value={values.email}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />
//               {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}

//               <View style={styles.passwordContainer}>
//                 <TextInput
//                   style={styles.passwordInput}
//                   placeholder="Password"
//                   placeholderTextColor="#a0a0a0"
//                   onChangeText={handleChange('password')}
//                   onBlur={handleBlur('password')}
//                   value={values.password}
//                   secureTextEntry={!showPassword}
//                 />
//                 <TouchableOpacity 
//                   style={styles.eyeIcon}
//                   onPress={() => setShowPassword(!showPassword)}
//                 >
//                   <Text style={styles.eyeIconText}>
//                     {showPassword ? '👁️' : '👁️'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//               {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

//               <TouchableOpacity style={styles.button} onPress={handleSubmit}>
//                 <Text style={styles.buttonText}>Login</Text>
//               </TouchableOpacity>
              
//               <View style={styles.buttonContainer}>
//                 <TouchableOpacity onPress={toggleScreen}>
//                   <Text style={styles.toggleText}>Forget Password?</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={toggleScreen}>
//                   <Text style={styles.toggleText}>Sign Up</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Google Sign-In Button */}
//               <GoogleSigninButton
//                 style={styles.googleButton}
//                 size={GoogleSigninButton.Size.Wide}
//                 color={GoogleSigninButton.Color.Dark}
//                 onPress={handleGoogleSignIn}
//               />
//             </>
//           )}
//         </Formik>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f4f8',
//   },
//   container: {
//     width: '90%',
//     backgroundColor: 'white',
//     borderRadius: 15,
//     padding: 30,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     alignItems: 'center',
//   },
//   header: {
//     fontSize: 28,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 20,
//   },
//   input: {
//     height: 50,
//     width: '100%',
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 10,
//     backgroundColor: '#fafafa',
//   },
//   passwordContainer: {
//     width: '100%',
//     flexDirection: 'row',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   passwordInput: {
//     height: 50,
//     flex: 1,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     marginBottom: 10,
//     backgroundColor: '#fafafa',
//     paddingRight: 50,
//   },
//   eyeIcon: {
//     position: 'absolute',
//     right: 12,
//     height: 50,
//     justifyContent: 'center',
//   },
//   eyeIconText: {
//     fontSize: 20,
//   },
//   button: {
//     backgroundColor: '#007BFF',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//     width: '100%',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   googleButton: {
//     width: '100%',
//     height: 48,
//     marginTop: 10,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginTop: 15,
//   },
//   toggleText: {
//     color: '#007BFF',
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   error: {
//     color: '#D32F2F',
//     fontSize: 12,
//     marginBottom: 5,
//     alignSelf: 'flex-start',
//   },
// });

// export default LoginScreen;
