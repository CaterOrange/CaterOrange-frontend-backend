import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]+$/, 'Phone number must be only digits')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const SignupScreen = ({ toggleScreen, onSignupSuccess }) => {
  const handleSignup = async (values) => {
    try {
      const response = await axios.post('http://10.0.2.2:4000/customer/register', {
        customer_name: values.name,
        customer_email: values.email,
        customer_password: values.password,
        customer_phonenumber: values.phone,
        confirm_password: values.confirm_password
      });

      const token = response.data.token; 
      await AsyncStorage.setItem('token', token);

      Alert.alert('Success', response.data.message);
      onSignupSuccess();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Signup failed. Please check your details.');
    }
  };

  return (
    <View style={styles.background}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        <Text style={styles.header}>Sign Up</Text>
        <Formik
          initialValues={{ name: '', phone: '', email: '', password: '', confirm_password: '' }}
          validationSchema={SignupSchema}
          onSubmit={handleSignup}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#a0a0a0"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {errors.name && touched.name && <Text style={styles.error}>{errors.name}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor="#a0a0a0"
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                value={values.phone}
                keyboardType="phone-pad"
              />
              {errors.phone && touched.phone && <Text style={styles.error}>{errors.phone}</Text>}

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

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                secureTextEntry
              />
              {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#a0a0a0"
                onChangeText={handleChange('confirm_password')}
                onBlur={handleBlur('confirm_password')}
                value={values.confirm_password}
                secureTextEntry
              />
              {errors.confirm_password && touched.confirm_password && <Text style={styles.error}>{errors.confirm_password}</Text>}

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleScreen}>
                <Text style={styles.toggleText}>Already have an account? Login</Text>
              </TouchableOpacity>
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
  toggleText: {
    color: '#007BFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
  },
  error: {
    color: '#D32F2F',
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
});

export default SignupScreen;


// import React, { useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

// const SignupSchema = Yup.object().shape({
//   name: Yup.string().required('Name is required'),
//   phone: Yup.string()
//     .required('Phone number is required')
//     .matches(/^[0-9]+$/, 'Phone number must be only digits')
//     .min(10, 'Phone number must be at least 10 digits')
//     .max(15, 'Phone number must be at most 15 digits'),
//   email: Yup.string().email('Invalid email').required('Email is required'),
//   password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
// });

// const SignupScreen = ({ toggleScreen, onSignupSuccess }) => {
//   useEffect(() => {
//     GoogleSignin.configure({
//       webClientId: '460660697590-i5nv97ls5np5g3dp2vkp84jvrob28vgu.apps.googleusercontent.com', // Replace with your actual web client ID
//       offlineAccess: true,
//       forceCodeForRefreshToken: true,
//     });
//   }, []);

//   const handleSignup = async (values) => {
//     try {
//       const response = await axios.post('https://dev.caterorange.com/api/customer/signup', {
//         customer_name: values.name,
//         customer_phone: values.phone,
//         customer_email: values.email,
//         customer_password: values.password,
//       });
  
//       const token = response.data.token; // Adjust based on your actual response structure
  
//       if (token) {
//         await AsyncStorage.setItem('token', token);
//         Alert.alert('Success', response.data.message);
//         onSignupSuccess();
//       } else {
//         Alert.alert('Error', 'Token not received from the server');
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Error', 'Signup failed. Please check your details.');
//     }
//   };
  
//   const handleGoogleSignIn = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       console.log('info', userInfo)
//       const token = userInfo.idToken; // Adjust based on your actual response structure
  
//       if (token) {
//         await AsyncStorage.setItem('token', token);
//         Alert.alert('Success', 'Google Sign-In successful!');
//         onSignupSuccess();
//       } else {
//         Alert.alert('Error', 'Google sign-in token not received');
//       }
//     } catch (error) {
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         Alert.alert('Cancelled', 'User cancelled the login flow');
//       } else {
//         Alert.alert('Error', 'Something went wrong during Google Sign-In');
//         console.error(error);
//       }
//     }
//   };
  

//   return (
//     <View style={styles.background}>
//       <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
//       <View style={styles.container}>
//         <Text style={styles.header}>Sign Up</Text>
//         <Formik
//           initialValues={{ name: '', phone: '', email: '', password: '' }}
//           validationSchema={SignupSchema}
//           onSubmit={handleSignup}
//         >
//           {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
//             <>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Name"
//                 placeholderTextColor="#a0a0a0"
//                 onChangeText={handleChange('name')}
//                 onBlur={handleBlur('name')}
//                 value={values.name}
//               />
//               {errors.name && touched.name && <Text style={styles.error}>{errors.name}</Text>}

//               <TextInput
//                 style={styles.input}
//                 placeholder="Phone"
//                 placeholderTextColor="#a0a0a0"
//                 onChangeText={handleChange('phone')}
//                 onBlur={handleBlur('phone')}
//                 value={values.phone}
//                 keyboardType="phone-pad"
//               />
//               {errors.phone && touched.phone && <Text style={styles.error}>{errors.phone}</Text>}

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

//               <TextInput
//                 style={styles.input}
//                 placeholder="Password"
//                 placeholderTextColor="#a0a0a0"
//                 onChangeText={handleChange('password')}
//                 onBlur={handleBlur('password')}
//                 value={values.password}
//                 secureTextEntry
//               />
//               {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}

//               <TouchableOpacity style={styles.button} onPress={handleSubmit}>
//                 <Text style={styles.buttonText}>Sign Up</Text>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={toggleScreen}>
//                 <Text style={styles.toggleText}>Already have an account? Login</Text>
//               </TouchableOpacity>

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
//   toggleText: {
//     color: '#007BFF',
//     textAlign: 'center',
//     fontSize: 16,
//     fontWeight: '500',
//     marginTop: 15,
//   },
//   googleButton: {
//     width: '100%',
//     height: 48,
//     marginTop: 15,
//   },
//   error: {
//     color: '#D32F2F',
//     fontSize: 12,
//     marginBottom: 5,
//     alignSelf: 'flex-start',
//   },
// });

// export default SignupScreen;
