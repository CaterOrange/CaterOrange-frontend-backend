import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  FlatList,
} from 'react-native';

const AddressModal = ({ visible, onClose, onSubmit }) => {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [zoomAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isNewAddress, setIsNewAddress] = useState(true); // State to track if it's a new address

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(zoomAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(zoomAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    // Check if the current input matches any saved addresses
    const isMatch = savedAddresses.some((addr) => 
      addr.landmark === landmark && 
      addr.city === city && 
      addr.state === state && 
      addr.pincode === pincode && 
      addr.phoneNumber === phoneNumber
    );
    setIsNewAddress(!isMatch); // Set to false if there's a match
  }, [landmark, city, state, pincode, phoneNumber, savedAddresses]);

  const handleSubmit = () => {
    const addressData = selectedAddress || { state, city, pincode, landmark, phoneNumber };

    // Check if this address is already in the savedAddresses
    if (!savedAddresses.some((addr) => addr.landmark === addressData.landmark)) {
      setSavedAddresses((prevAddresses) => [...prevAddresses, addressData]);
      console.log('Address saved:', addressData); // Debugging log
    }

    onSubmit(addressData);
    onClose(); // Close modal after submission

    // Clear form fields
    setState('');
    setCity('');
    setPincode('');
    setLandmark('');
    setPhoneNumber('');
    setSelectedAddress(null); // Reset selected address after submission
  };

  const handleViewAddresses = () => {
    setShowSavedAddresses((prev) => !prev);
    console.log('Show saved addresses:', !showSavedAddresses); // Debugging log
  };

  const handleSelectAddress = (address) => {
    if (selectedAddress === address) {
      setSelectedAddress(null);
      setState('');
      setCity('');
      setPincode('');
      setLandmark('');
      setPhoneNumber('');
      setIsNewAddress(true); // Reset to new address mode
    } else {
      setSelectedAddress(address);
      setState(address.state);
      setCity(address.city);
      setPincode(address.pincode);
      setLandmark(address.landmark);
      setPhoneNumber(address.phoneNumber);
      setIsNewAddress(false); // Not a new address anymore
    }
  };

  const isFormValid = () => {
    return (state && city && pincode && landmark && phoneNumber) || selectedAddress;
  };

  return (
    <Modal transparent={true} animationType="none" visible={visible}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: zoomAnim }], opacity: fadeAnim }]}>
          <Text style={styles.title}>Delivery Address</Text>

          <TextInput
            style={styles.input}
            placeholder="State"
            value={state}
            onChangeText={setState}
            placeholderTextColor="green"
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            placeholderTextColor="green"
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            placeholderTextColor="green"
          />
          <TextInput
            style={styles.input}
            placeholder="Landmark"
            value={landmark}
            onChangeText={setLandmark}
            placeholderTextColor="green"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholderTextColor="green"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, !isFormValid() && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={!isFormValid()}
            >
              <Text style={styles.submitButtonText}>
                {selectedAddress ? 'Use Selected Address' : (isNewAddress ? 'Save Address' : 'Update Address')}
              </Text>
            </TouchableOpacity>
            {savedAddresses.length > 0 && (
              <TouchableOpacity
                style={styles.viewButton}
                onPress={handleViewAddresses}
              >
                <Text style={styles.viewButtonText}>View Addresses</Text>
              </TouchableOpacity>
            )}
          </View>

          {showSavedAddresses && (
            <View style={styles.savedAddressesContainer}>
              {savedAddresses.length > 0 ? (
                <FlatList
                  data={savedAddresses}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.addressItem,
                        selectedAddress === item && styles.selectedAddress,
                      ]}
                      onPress={() => handleSelectAddress(item)}
                    >
                      <Text style={styles.addressText}>
                        {item.landmark}, {item.city}, {item.state} - {item.pincode} | Phone: {item.phoneNumber}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={styles.noAddressesText}>No addresses available</Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContainer: {
//     width: '80%',
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 5,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   input: {
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15,
//     color:'black'
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginBottom: 15,
//   },
//   submitButton: {
//     backgroundColor: '#2E7D32',
//     padding: 10,
//     borderRadius: 5,
//     flex: 1,
//     marginRight: 10,
//   },
//   submitButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   viewButton: {
//     backgroundColor: '#006400',
//     padding: 10,
//     borderRadius: 5,
//     flex: 1,
//   },
//   viewButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   savedAddressesContainer: {
//     width: '100%',
//     marginTop: 15,
//   },
//   addressItem: {
//     backgroundColor: '#f1f1f1',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 10,
//   },
//   selectedAddress: {
//     backgroundColor: '#d0e9c6',
//   },
//   addressText: {
//     fontSize: 16,
//   },
//   noAddressesText: {
//     textAlign: 'center',
//     color: '#888',
//   },
//   closeButton: {
//     marginTop: 10,
//     padding: 10,
//   },
//   closeButtonText: {
//     color: 'red',
//     fontWeight: 'bold',
//   },
//   disabledButton: {
//     backgroundColor: '#ccc',
//   },
// });

const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      width: '80%',
      backgroundColor: '#e7f6e7', // Light green background for the modal
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      elevation: 5,
      borderColor: '#006400', 
      borderWidth: 2,
    },

    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#2E7D32', 
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#006400', // Dark green border for input fields
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: 'black', // Black input text color
      backgroundColor: '#f5fff5', // Very light green for input background
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 15,
    },
    submitButton: {
      backgroundColor: '#4CAF50', // Medium green for submit button
      padding: 10,
      borderRadius: 5,
      flex: 1,
      marginRight: 10,
    },
    submitButtonText: {
      color: 'white', // White text for submit button
      fontWeight: 'bold',
      textAlign: 'center',
    },
    viewButton: {
      backgroundColor: '#388E3C', // Darker green for view button
      padding: 10,
      borderRadius: 5,
      flex: 1,
    },
    viewButtonText: {
      color: 'white', // White text for view button
      fontWeight: 'bold',
      textAlign: 'center',
    },
    savedAddressesContainer: {
      width: '100%',
      marginTop: 15,
    },
    addressItem: {
      backgroundColor: '#f0f8f0', // Very light green for saved address item
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
      borderColor: '#006400', // Dark green border for saved address item
      borderWidth: 1,
    },
    selectedAddress: {
      backgroundColor: '#c8e6c9', // Soft green for selected address
    },
    addressText: {
      fontSize: 16,
      color: '#2E7D32', // Dark green text for address item
    },
    noAddressesText: {
      textAlign: 'center',
      color: '#888', // Light gray text for no addresses message
    },
    closeButton: {
      marginTop: 10,
      padding: 10,
    },
    closeButtonText: {
      color: '#D32F2F', // Dark red for cancel button text
      fontWeight: 'bold',
    },
    disabledButton: {
      backgroundColor: '#ccc', // Gray color for disabled button
    },
  });
  

export default AddressModal;
