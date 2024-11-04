
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Easing,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import AddressModal from './AddressModal';

const { width, height } = Dimensions.get('window');

const IMAGES = {
  rice: 'https://cdn-icons-png.flaticon.com/512/2718/2718216.png',
  biryani: 'https://cdn-icons-png.flaticon.com/512/2921/2921828.png',
  gulabJamun: 'https://cdn-icons-png.flaticon.com/512/2718/2718224.png',
  curd: 'https://cdn-icons-png.flaticon.com/512/1205/1205756.png',
  curry: 'https://cdn-icons-png.flaticon.com/512/1046/1046751.png',
  pattern: 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png'
};

export const WelcomeScreen = ({ navigation }) => {
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const buttonScaleValue = useRef(new Animated.Value(1)).current;
  const rotationValue = useRef(new Animated.Value(0)).current;
  
  const foodItems = useRef([
    { key: 'rice' },
    { key: 'biryani' },
    { key: 'gulabJamun' },
    { key: 'curd' },
    { key: 'curry' },
  ]).current;

  const foodAnimations = useRef(
    foodItems.reduce((acc, item) => {
      acc[item.key] = {
        scale: new Animated.Value(0),
        individualRotation: new Animated.Value(0),
      };
      return acc;
    }, {})
  ).current;

  useEffect(() => {
    if (initialAnimationComplete) {
      const timer = setTimeout(() => {
        Animated.sequence([
          Animated.timing(buttonScaleValue, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(buttonScaleValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          navigation.navigate('EventForm');
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [initialAnimationComplete, navigation]);

  useEffect(() => {
    // Initial appear animation
    const appearAnimation = Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      ...Object.values(foodAnimations).map(anim =>
        Animated.spring(anim.scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      ),
    ]);

    // Start circular rotation
    const startCircularRotation = () => {
      Animated.loop(
        Animated.timing(rotationValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Individual rotations
      Object.values(foodAnimations).forEach(anim => {
        Animated.loop(
          Animated.timing(anim.individualRotation, {
            toValue: 1,
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      });
    };

    // Start all animations
    appearAnimation.start(() => {
      setInitialAnimationComplete(true);
      startCircularRotation();
    });

    return () => {
      rotationValue.setValue(0);
      Object.values(foodAnimations).forEach(anim => {
        anim.individualRotation.setValue(0);
      });
    };
  }, []);

  const getCircularPosition = (index, total, radius = width * 0.25) => {
    const angle = (index * 2 * Math.PI) / total;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#E8F5E9' }]}>
      <Animated.View style={[styles.welcomeContainer, { transform: [{ scale: scaleValue }] }]}>
        <Text style={styles.welcomeTitle}>Welcome to</Text>
        <Text style={styles.eventsTitle}>Cater Orange</Text>
        <Text style={styles.eventsSubtitle}>Event Menu Builder</Text>

        <View style={styles.thaliContainer}>
          <Image
            source={{ uri: IMAGES.pattern }}
            style={styles.pattern}
          />

          {foodItems.map((item, index) => {
            const basePosition = getCircularPosition(index, foodItems.length);
            const animations = foodAnimations[item.key];
            
            // Create rotating movement
            const rotateAngle = rotationValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            });

            // Individual rotation
            const itemRotation = animations.individualRotation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            });

            return (
              <Animated.Image
                key={item.key}
                source={{ uri: IMAGES[item.key] }}
                style={[
                  styles.foodItem,
                  {
                    transform: [
                      { scale: animations.scale },
                      { rotate: itemRotation },
                      { translateX: basePosition.x },
                      { translateY: basePosition.y },
                      { rotate: rotateAngle },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScaleValue }] }}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('EventForm')}
          >
            <Text style={styles.getStartedText}>Customize Your Thali</Text>
            <Icon name="restaurant-menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

// export const EventFormScreen = () => {
//   const [date, setDate] = useState(new Date());
//   const [time, setTime] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const [address, setAddress] = useState('');
//   const [guests, setGuests] = useState('');
//   const [fadeAnims] = useState({
//     title: new Animated.Value(0),
//     form: new Animated.Value(0),
//   });
//   const [slideAnim] = useState(new Animated.Value(height));

//   useEffect(() => {
//     Animated.sequence([
//       Animated.timing(fadeAnims.title, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.parallel([
//         Animated.timing(fadeAnims.form, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           tension: 30,
//           friction: 7,
//           useNativeDriver: true,
//         }),
//       ]),
//     ]).start();
//   }, []);

//   const onDateChange = (event, selectedDate) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       setDate(selectedDate);
//     }
//   };

//   const onTimeChange = (event, selectedTime) => {
//     setShowTimePicker(Platform.OS === 'ios');
//     if (selectedTime) {
//       setTime(selectedTime);
//     }
//   };

//   const handleAddressSubmit = (addressData) => {
//     // Combine address data into a single string
//     const { state, city, pincode, landmark, phoneNumber } = addressData;
//     setAddress(`${landmark}, ${city}, ${state} - ${pincode} | Phone: ${phoneNumber}`);
//   };

  

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={styles.formContainer}
//       >
//         <ScrollView showsVerticalScrollIndicator={false}>
//           <Animated.Text
//             style={[
//               styles.formTitle,
//               { opacity: fadeAnims.title }
//             ]}
//           >
//             Plan Your Event
//           </Animated.Text>

//           <Animated.View
//             style={[
//               styles.formContent,
//               {
//                 opacity: fadeAnims.form,
//                 transform: [{ translateY: slideAnim }]
//               }
//             ]}
//           >
//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Event Date</Text>
//               <TouchableOpacity
//                 style={styles.dateTimeButton}
//                 onPress={() => setShowDatePicker(true)}
//               >
//                 <Icon name="event" size={24} color="#2E7D32" />
//                 <Text style={styles.dateTimeText}>
//                   {date.toLocaleDateString('en-US', {
//                     weekday: 'long',
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                   })}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Event Time</Text>
//               <TouchableOpacity
//                 style={styles.dateTimeButton}
//                 onPress={() => setShowTimePicker(true)}
//               >
//                 <Icon name="access-time" size={24} color="#2E7D32" />
//                 <Text style={styles.dateTimeText}>
//                   {time.toLocaleTimeString('en-US', {
//                     hour: 'numeric',
//                     minute: '2-digit',
//                     hour12: true
//                   })}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.label}>Number of Plates</Text>
//               <View style={styles.guestInputContainer}>
//                 <Icon name="local-dining" size={24} color="#2E7D32" />
//                 <TextInput
//                   style={styles.guestInput}
//                   placeholder="Enter number of plates"
//                   value={guests}
//                   onChangeText={setGuests}
//                   keyboardType="number-pad"
//                   placeholderTextColor="green" // Add this line
//                 />
//               </View>
//             </View>

        
//             <TouchableOpacity
//                   style={styles.addressButton}
//                   onPress={() => setShowAddressModal(true)}
//                 >
//                   <View style={styles.buttonContent}>
//                     <Icon name="add-circle-outline" size={24} color="#2E7D32" />
//                     <Text style={styles.addressButtonText}>
//                       {address ? "Add New Address" : "Add Address"}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//             {/* Displaying the submitted address below the button */}
//             {address && (
//               <View style={styles.addressContainer}>
//          <Text style={styles.label}><Icon name="location-on" size={24} color="#2E7D32" />Delivery Address</Text>

//                 <Text style={styles.addressText}>{address}</Text>
//               </View>
//             )}


//             <TouchableOpacity style={styles.submitButton}>
//               <Text style={styles.submitButtonText}>Continue</Text>
//               <Icon name="arrow-forward" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
//           </Animated.View>
//         </ScrollView>

//         {(showDatePicker || showTimePicker) && (
//           <DateTimePicker
//             value={showDatePicker ? date : time}
//             mode={showDatePicker ? "date" : "time"}
//             is24Hour={false}
//             display="default"
//             onChange={showDatePicker ? onDateChange : onTimeChange}
//             minimumDate={new Date()}
//           />
//         )}

//       <AddressModal
//         visible={showAddressModal}
//         onClose={() => setShowAddressModal(false)}
//         onSubmit={handleAddressSubmit}
//       />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };



export const EventFormScreen = () => {
    const navigation = useNavigation();
    const [date, setDate] = useState(null); // Set initial state to null
    const [time, setTime] = useState(null); // Set initial state to null
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [address, setAddress] = useState('');
    const [guests, setGuests] = useState('');
    
    const [fadeAnims] = useState({
      title: new Animated.Value(0),
      form: new Animated.Value(0),
    });
    const [slideAnim] = useState(new Animated.Value(height));
  
    useEffect(() => {
      Animated.sequence([
        Animated.timing(fadeAnims.title, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(fadeAnims.form, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 30,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);
  
    const onDateChange = (event, selectedDate) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        setDate(selectedDate);
      }
    };
  
    const onTimeChange = (event, selectedTime) => {
      setShowTimePicker(Platform.OS === 'ios');
      if (selectedTime) {
        setTime(selectedTime);
      }
    };
  
    const handleAddressSubmit = (addressData) => {
      // Combine address data into a single string
      const { state, city, pincode, landmark, phoneNumber } = addressData;
      setAddress(`${landmark}, ${city}, ${state} - ${pincode} | Phone: ${phoneNumber}`);
    };
  
    const handleSubmit = () => {
      // Validation
      if (!date && !time && !guests && !address) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Please fill all fields.',
          position: 'top',
        });
        return; // Stop further processing if all fields are empty
      }
  
      let errorMessage = '';
  
      if (!date) {
        errorMessage = 'Event Date should not be empty.';
      } else if (!time) {
        errorMessage = 'Event Time should not be empty.';
      } else if (!guests) {
        errorMessage = 'Number of Plates should not be empty.';
      } else if (!address) {
        errorMessage = 'Delivery Address should not be empty.';
      }
  
      if (errorMessage) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorMessage,
          position: 'top',
        });
        return; 
      }
  
      // Proceed with form submission if all fields are filled
      console.log('Form submitted successfully:', { date, time, guests, address });
      // You can add your form submission logic here
      navigation.navigate('Menu');
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Animated.Text
              style={[
                styles.formTitle,
                { opacity: fadeAnims.title }
              ]}
            >
              Plan Your Event
            </Animated.Text>
  
            <Animated.View
              style={[
                styles.formContent,
                {
                  opacity: fadeAnims.form,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Event Date</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="event" size={24} color="#2E7D32" />
                  <Text style={styles.dateTimeText}>
                    {date ? date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Select Date'}
                  </Text>
                </TouchableOpacity>
              </View>
  
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Event Time</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Icon name="access-time" size={24} color="#2E7D32" />
                  <Text style={styles.dateTimeText}>
                    {time ? time.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }) : 'Select Time'}
                  </Text>
                </TouchableOpacity>
              </View>
  
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Number of Plates</Text>
                <View style={styles.guestInputContainer}>
                  <Icon name="local-dining" size={24} color="#2E7D32" />
                  <TextInput
                    style={styles.guestInput}
                    placeholder="Enter number of plates"
                    value={guests}
                    onChangeText={setGuests}
                    keyboardType="number-pad"
                    placeholderTextColor="green"
                  />
                </View>
              </View>
  
              <TouchableOpacity
                style={styles.addressButton}
                onPress={() => setShowAddressModal(true)}
              >
                <View style={styles.buttonContent}>
                  <Icon name="add-circle-outline" size={24} color="#2E7D32" />
                  <Text style={styles.addressButtonText}>
                    {address ? "Add New Address" : "Add Address"}
                  </Text>
                </View>
              </TouchableOpacity>
  
              {address && (
                <View style={styles.addressContainer}>
                  <Text style={styles.label}><Icon name="location-on" size={24} color="#2E7D32" />Delivery Address</Text>
                  <Text style={styles.addressText}>{address}</Text>
                </View>
              )}
  
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Continue</Text>
                <Icon name="arrow-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
  
          {(showDatePicker || showTimePicker) && (
            <DateTimePicker
              value={showDatePicker ? (date || new Date()) : (time || new Date())} // Use existing date/time or current date/time
              mode={showDatePicker ? "date" : "time"}
              is24Hour={false}
              display="default"
              onChange={showDatePicker ? onDateChange : onTimeChange}
              minimumDate={new Date()}
            />
          )}
  
          <AddressModal
            visible={showAddressModal}
            onClose={() => setShowAddressModal(false)}
            onSubmit={handleAddressSubmit}
          />
        </KeyboardAvoidingView>
  
        <Toast ref={(ref) => Toast.setRef(ref)} /> {/* Set the Toast reference */}
      </SafeAreaView>
    );
  };
const styles = StyleSheet.create({

  addressButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2, // Add this line for border width
    borderColor: '#A5D6A7', // Change this to the desired green color
  },
  addressButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A5D6A7',
  },

  addressContainer: {
    marginTop: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center', // Align items vertically in the center
  },
  
  addressButtonText: {
    marginLeft: 10, // Add some space between the icon and the text
    fontSize: 18,
    color: '#2E7D32',
    // marginBottom: 8,
    fontWeight: 'bold',

  },
  addressText: {
    fontSize: 16,
    color: '#333',
  },
  foodIconsContainer: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
  },
  foodIcon: {
    width: width * 0.3,
    height: width * 0.3,
    position: 'absolute',
  },
  decorationImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.05,
    zIndex: -1,
  },
  getStartedButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F0FFF0',
  },
  formContent: {
    padding: 20,
  },
  formTitle: {
    fontSize: 32,
    color: '#1B5E20',
    fontWeight: 'bold',
    marginVertical: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 18,
    color: '#2E7D32',
    marginBottom: 8,
    fontWeight: 'bold',

  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  dateTimeText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#4CAF50',
    flex: 1,
  },
  guestInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#81C784',
  },
  guestInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  addressInputContainer: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#81C784',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#4CAF50',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },


  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#2E7D32',
    fontWeight: '300',
    marginBottom: 8,
  },
  eventsTitle: {
    fontSize: 40,
    color: '#1B5E20',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  foodIconsContainer: {
    width: width * 0.8,
    height: width * 0.8,
    position: 'relative',
  },
  foodIcon: {
    width: width * 0.25,
    height: width * 0.25,
    position: 'absolute',
  },
  topIcon: {
    top: 0,
    left: '50%',
    marginLeft: -(width * 0.125), // Half of the icon width
  },
  bottomIcon: {
    bottom: 0,
    left: '50%',
    marginLeft: -(width * 0.125),
  },
  leftIcon: {
    left: 0,
    top: '50%',
    marginTop: -(width * 0.125),
  },
  rightIcon: {
    right: 0,
    top: '50%',
    marginTop: -(width * 0.125),
  },
  decorationImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.05,
    zIndex: -1,
  },
 

  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    color: '#2E7D32',
    fontWeight: '300',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  eventsTitle: {
    fontSize: 40,
    color: '#1B5E20',
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  eventsSubtitle: {
    fontSize: 24,
    color: '#388E3C',
    marginBottom: 40,
    fontWeight: '500',
  },

  pattern: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.1,
  },
  bananaLeaf: {
    width: width * 0.85,
    height: width * 0.85,
    position: 'absolute',
    resizeMode: 'contain',
  },
  thaliPlate: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'absolute',
    resizeMode: 'contain',
  },

  
  getStartedButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  

container: {
  flex: 1,
  backgroundColor: '#E8F5E9',
},
thaliContainer: {
  width: width * 0.9,
  height: width * 0.9,
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
},
foodItem: {
  width: width * 0.15,
  height: width * 0.15,
  position: 'absolute',
  resizeMode: 'contain',
},

});
