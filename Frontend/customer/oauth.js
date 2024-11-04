// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from '@react-native-google-signin/google-signin';

// const Oauth = () => {
//   const [isSignedIn, setIsSignedIn] = useState(false);
//   const [userInfo, setUserInfo] = useState(null);

//   useEffect(() => {
//     configureGoogleSignIn();
//     checkSignInStatus();
//   }, [checkSignInStatus]); // Include the checkSignInStatus as a dependency

//   const configureGoogleSignIn = () => {
//     GoogleSignin.configure({
//       // Your web client ID
//       webClientId: '462100837854-sfeev6v5tuac4fl5aevs51ooucgrg1uv.apps.googleusercontent.com',
//       offlineAccess: true,
//       forceCodeForRefreshToken: true,
//     });
//   };

//   const checkSignInStatus = useCallback(async () => {
//     try {
//       const isSignedIn = await GoogleSignin.isSignedIn();
//       setIsSignedIn(isSignedIn);
//       if (isSignedIn) {
//         getCurrentUserInfo();
//       }
//     } catch (error) {
//       console.error('Error checking sign-in status:', error);
//     }
//   }, []); // Empty dependency array, since it doesn't depend on anything

//   const getCurrentUserInfo = async () => {
//     try {
//       const userInfo = await GoogleSignin.signInSilently();
//       setUserInfo(userInfo);
//     } catch (error) {
//       if (error.code === statusCodes.SIGN_IN_REQUIRED) {
//         Alert.alert('Error', 'User needs to sign in');
//       } else {
//         Alert.alert('Error', error.message);
//       }
//     }
//   };

//   const signIn = async () => {
//     try {
//       await GoogleSignin.hasPlayServices();
//       const userInfo = await GoogleSignin.signIn();
//       setUserInfo(userInfo);
//       setIsSignedIn(true);
//       Alert.alert('Success', 'Signed in successfully!');
//     } catch (error) {
//       if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//         Alert.alert('Cancelled', 'User cancelled the sign-in flow');
//       } else if (error.code === statusCodes.IN_PROGRESS) {
//         Alert.alert('In Progress', 'Sign in already in progress');
//       } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//         Alert.alert('Error', 'Play services not available');
//       } else {
//         Alert.alert('Error', error.message);
//         console.error('Sign-in error:', error);
//       }
//     }
//   };

//   const signOut = async () => {
//     try {
//       await GoogleSignin.revokeAccess();
//       await GoogleSignin.signOut();
//       setUserInfo(null);
//       setIsSignedIn(false);
//       Alert.alert('Success', 'Signed out successfully!');
//     } catch (error) {
//       Alert.alert('Error', error.message);
//       console.error('Sign-out error:', error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Google Sign-In Example</Text>
      
//       {!isSignedIn ? (
//         <GoogleSigninButton
//           style={styles.googleButton}
//           size={GoogleSigninButton.Size.Wide}
//           color={GoogleSigninButton.Color.Dark}
//           onPress={signIn}
//         />
//       ) : (
//         <View style={styles.userInfoContainer}>
//           <Text style={styles.userInfo}>
//             Welcome {userInfo?.user?.name}!
//           </Text>
//           <Text style={styles.userInfo}>
//             {userInfo?.user?.email}
//           </Text>
//           <TouchableOpacity
//             style={styles.signOutButton}
//             onPress={signOut}
//           >
//             <Text style={styles.signOutButtonText}>Sign Out</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 30,
//   },
//   googleButton: {
//     width: 240,
//     height: 48,
//   },
//   userInfoContainer: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   userInfo: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   signOutButton: {
//     backgroundColor: '#dc3545',
//     padding: 10,
//     borderRadius: 5,
//     marginTop: 20,
//   },
//   signOutButtonText: {
//     color: 'white',
//     fontSize: 16,
//   },
// });

// export default Oauth;



// import { View, Text,StyleSheet, TouchableOpacity } from 'react-native'
// import React, { useEffect, useState } from 'react';
// import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

// const App = () => {
//   const [user, setUser] = useState({})

//    useEffect(()=>{
//     GoogleSignin.configure({
//        webClientId: '1025589181172-ff5nrnppugboiv90dr90lecv51n73oai.apps.googleusercontent.com',
//        offlineAccess: true,
//        forceCodeForRefreshToken: true,
//     })

//     const isSignedIn = async()=>{
//       const isSignedIn= await GoogleSignin.isSignedIn()
//       if(!isSignedIn){
//         getCurrentUserInfo()
//       }else{
//         console.log("please Login")
//       }
//      }

//      const getCurrentUserInfo= async()=>{
//       try{
//         const userInfo = await GoogleSignin.signInSilently();
//         console.log("edit___", user);
//         setUser(userInfo);
//       }catch(error){
//         if(error.code === statusCodes.SIGN_IN_REQUIRED){
//           alert('User has not signed in yet')
//           console.log('User has not signed in yet')
//         }else{
//           alert('something went wrong');
//           console.log("something went wrong");  
//         }
//       }
//      };
//     isSignedIn();
//    });

//    const signIn= async()=>{
//     try{
//       await GoogleSignin.hasPlayServices();
//       const userInfo= await GoogleSignin.signIn();
//       console.log('due', userInfo)
//       setUser(userInfo);
//     }catch(error){
//         console.log('Message',error.message);
//         if(error.code === statusCodes.SIGN_IN_CANCELLED){
//           console.log('user cancelled the login flow');
//         }
//         else if(error.code === statusCodes.IN_PROGRESS){
//           console.log('Signing In');
//         }
//         else if(error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE){
//           console.log('play services not available');
//         }
//         else{
//           console.log("some other issues");
//         }
//     }
//    }

//    const signOut= async()=>{
//     try{
//       await GoogleSignin.revokeAccess();
//       await GoogleSignin.signOut();
//       setUser({});
//     }catch(error){
//       console.error(error);
//     }
//    }

//   return (
//     <View style={{flex:1 , margin: 50}}>
//      <View style={StyleSheet.main}>
//       {!user.idToken ?
//        <  GoogleSigninButton style={{width:192, height: 48}}
//                              size={GoogleSigninButton.Size.Wide}
//                              color= {GoogleSigninButton.Color.Dark}
//                              onPress={signIn}
//       />:
//       <TouchableOpacity onPress={signOut}>
//         <Text>Signout</Text>
//       </TouchableOpacity>
//     }
//      </View>
//     </View>
//   )
// }

// const styles= StyleSheet.create({
//   main:{
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   }
// })

// export default App