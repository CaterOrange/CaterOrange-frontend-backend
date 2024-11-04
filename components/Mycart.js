
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Switch,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const CartModel = ({ 
  cartModalVisible, 
  setCartModalVisible, 
  cartItems, 
  updateQuantity,
  toggleStates,
  setToggleStates
}) => {
    console.log('crt',cartItems)
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (cartModalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: width,
        useNativeDriver: true,
        friction: 8,
      }).start();
    }
  }, [cartModalVisible]);

  const calculateItemPrice = (item) => {
    if (toggleStates[item.product_id]) {
      return item.price_per_wtorvol_units * item.quantity;
    } else {
      return item.priceperunit * item.quantity;
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + calculateItemPrice(item);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
 
  
    return subtotal
  };

  const handleToggle = (itemId) => {
    setToggleStates(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleQuantityInput = (itemId, value) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0) {
      updateQuantity(itemId, numValue - (cartItems.find(item => item.product_id === itemId)?.quantity || 0));
    }
  };

  if (cartItems.length === 0) {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={cartModalVisible}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>My Cart</Text>
              <TouchableOpacity 
                onPress={() => setCartModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.emptyCartContainer}>
              <Icon name="shopping-cart" size={64} color="#ccc" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add items to get started</Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={cartModalVisible}
      onRequestClose={() => setCartModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>My Cart ({cartItems.length})</Text>
            <TouchableOpacity 
              onPress={() => setCartModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.addressContainer}>
            <View>
             <Text style={styles.addressLabel}>Delivery Address:</Text>
             <Text style={styles.addressText}>
               123, Main Street, Your City, State - 123456
             </Text>
             </View>
             <View>
             <TouchableOpacity style={styles.changeAddressButton}>
             <Text style={styles.changeAddressButtonText}>Change Address</Text>
           </TouchableOpacity>
           </View>
           </View>
          <ScrollView style={styles.itemsContainer}>
            {cartItems.map((item) => (
              <View key={item.product_id} style={styles.itemCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8' }} 
                  style={styles.itemImage} 
                />
                
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productname}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{toggleStates[item.product_id] ? item.price_per_wtorvol_units : item.priceperunit} per {toggleStates[item.product_id] ? item.wtorvol_units : item.plate_units}
                  </Text>
                  
                  <View style={styles.toggleContainer}>
                    <Text style={styles.unitText}>
                      {toggleStates[item.product_id] ? item.wtorvol_units : item.plate_units}
                    </Text>
                    {item.isdual && (
                      <Switch
                        value={toggleStates[item.product_id] || false}
                        onValueChange={() => handleToggle(item.product_id)}
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={toggleStates[item.product_id] ? "#f5dd4b" : "#f4f3f4"}
                      />
                    )}
                  </View>

                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product_id, -1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity.toString()}
                      onChangeText={(value) => handleQuantityInput(item.product_id, value)}
                      keyboardType="number-pad"
                    />
                    
                    <TouchableOpacity 
                      onPress={() => updateQuantity(item.product_id, 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.itemTotal}>
                    <Text style={styles.itemTotalText}>
                      Total: ₹{calculateItemPrice(item).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
         
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{calculateTotal().toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.proceedButton}>
            <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '90%',
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  itemsContainer: {
    flex: 1,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
  },
  quantityInput: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  itemTotal: {
    marginTop: 4,
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4757',
  },
  proceedButton: {
    backgroundColor: '#FF4757',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },

  addressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f7f7f7',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addressText: {
    fontSize: 14,
    color: "black",
    marginTop: 4,
  },
  changeAddressButton: {
    backgroundColor: '#4169E1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    color:'white'
  },
});

export default CartModel;