// import React, { useState, useEffect } from 'react';
// import {View,Text,TouchableOpacity,StyleSheet,Modal,SafeAreaView,FlatList} from 'react-native';
// import Icon from 'react-native-vector-icons/Feather';
// import { myorders } from './action';

// const OrderScreen = () => {
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [openOrderId, setOpenOrderId] = useState(null);
//   const [OrdersData, setOrderData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setIsLoading(true);
//         const orderData = await myorders();
        
//         if (orderData && Array.isArray(orderData)) {
//           const formattedOrders = orderData.map((order) => {
//             const formattedItems = order.event_order_details.map((item) => {
//               // Calculate amount based on unit type
//               let itemAmount;
//               if (item.unit === 'plate_units') {
//                 itemAmount = item.quantity * item.priceperunit * order.number_of_plates;
//               } else { // wtorvol_units
//                 itemAmount = item.quantity * item.priceperunit;
//               }

//               return {
//                 name: item.productname,
//                 plates: item.number_of_plates,
//                 pricePerUnit: item.priceperunit,
//                 pricePerKg: item.isdual ? item.price_per_wtorvol_units : undefined,
//                 quantity: item.quantity,
//                 amount: itemAmount,
//                 unit: item.unit,
//                 wtorvol_units: item.wtorvol_units,
//                 plate_units: item.plate_units,
//                 delivery_status: item.delivery_status
//               };
//             });

//             const date = new Date(order.processing_date);
//             const formattedDate = date.toLocaleDateString('en-GB');
            
//             // Calculate total amount from individual items
//             const totalAmount = formattedItems.reduce((sum, item) => sum + item.amount, 0);
            
//             return {
//               id: order.eventorder_generated_id,
//               date: formattedDate,
//               plates: order.number_of_plates,
//               amount: totalAmount,
//               totalItems: formattedItems.length,
//               totalPrice: totalAmount,
//               items: formattedItems,
//               status: order.delivery_status,
//               time: order.processing_date ? new Date(order.processing_date).toLocaleTimeString() : ''
//             };
//           });

//           setOrderData(formattedOrders);
//           setError(null);
//         } else {
//           setError('No order data found');
//           setOrderData([]);
//         }
//       } catch (err) {
//         console.error('Error fetching orders:', err);
//         setError('Failed to fetch orders');
//         setOrderData([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const handleOrderClick = (order) => {
//     setOpenOrderId(openOrderId === order.id ? null : order.id);
//   };

//   const handleSeeDetails = (order) => {
//     setSelectedOrder(order);
//     setModalVisible(true);
//   };

//   const OrderDetailsModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={modalVisible}
//       onRequestClose={() => setModalVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Order Details</Text>
//             <TouchableOpacity 
//               onPress={() => setModalVisible(false)}
//               style={styles.closeButton}
//             >
//               <Icon name="x" size={24} color="#2E7D32" />
//             </TouchableOpacity>
//           </View>

//           {selectedOrder && (
//             <View style={styles.orderInfoSection}>
//               <View style={styles.orderCard}>
//                 <Text style={styles.orderIdText}>Order ID: {selectedOrder.id}</Text>
//                 <Text style={styles.dateText}>Date of Order: {selectedOrder.date}</Text>
//                 <Text style={styles.dateText}>Amount: ₹{selectedOrder.amount.toLocaleString()}</Text>
//                 <Text style={styles.dateText}>No Of Plates: {selectedOrder.plates}</Text>
//               </View>

//               <View style={styles.itemsContainer}>
//                 <Text style={styles.sectionTitle}>Items Ordered:</Text>
//                 {selectedOrder.items.map((item, index) => (
//                   <View key={index} style={styles.itemRow}>
//                     <Text style={styles.itemName}>{item.name}</Text>
                 
//                     <Text style={styles.itemName}>
//                       Quantity: {item.quantity} 
//                     </Text>
//                     {/* <Text style={styles.itemName}>
//                       Per_Unit: ₹{item.pricePerUnit.toLocaleString()}
//                     </Text> */}
//                     <Text style={styles.itemPrice}>
//                       Amount: ₹{item.amount.toLocaleString()}
//                     </Text>
//                   </View>
//                 ))}
//               </View>

//               <View style={styles.totalSection}>
//                 <Text style={styles.totalText}>Total Amount:</Text>
//                 <Text style={styles.totalPrice}>₹ {selectedOrder.totalPrice.toLocaleString()}</Text>
//               </View>

//               <TouchableOpacity style={styles.reorderButton}>
//                 <Text style={styles.reorderButtonText}>Re-Order</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderOrderCard = ({ item }) => (
//     <View style={styles.orderCard}>
//       <View style={styles.orderHeader}>
//         <View style={styles.statusContainer}>
//           <View style={styles.statusIndicator} />
//           <Text style={styles.statusText}>{item.status}</Text>
//         </View>
//         <TouchableOpacity onPress={() => handleSeeDetails(item)}>
//           <Text style={styles.seeDetailsText}>See Details {'>'}</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.storeName}>Order ID: {item.id}</Text>
//       <Text style={styles.orderDate}>Ordered Date:{item.date} </Text>

//       <View style={styles.orderSummary}>
//         <Text style={styles.itemCount}>{item.totalItems} Item{item.totalItems > 1 ? 's' : ''}</Text>
//         <View style={styles.priceContainer}>
//           <Text style={styles.price}>₹ {item.amount.toLocaleString()}</Text>
//           <TouchableOpacity style={styles.reOrderBtn}>
//             <Text style={styles.reOrderText}>Re-Order</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Order History</Text>
//       </View>
//       {isLoading ? (
//         <View style={styles.loadingContainer}>
//           <Text style={styles.loadingText}>Loading orders...</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={OrdersData}
//           renderItem={renderOrderCard}
//           keyExtractor={(item) => item.id.toString()}
//           contentContainerStyle={styles.orderList}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={<Text style={styles.noOrders}>No orders found</Text>}
//         />
//       )}

//       <OrderDetailsModal />
//     </SafeAreaView>
//   );
// };


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#CCFFCC',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//   },
//   orderList: {
//     padding: 16,
//   },
//   orderCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   orderHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   statusIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#2E7D32',
//     marginRight: 6,
//   },
//   statusText: {
//     color: '#2E7D32',
//     fontWeight: '500',
//   },
//   seeDetailsText: {
//     color: '#2E7D32',
//     fontWeight: '500',
//   },
//   storeName: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   orderDate: {
//     color: '#666',
//     fontSize: 14,
//     marginBottom: 12,
//   },
//   orderSummary: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 8,
//   },
//   itemCount: {
//     color: '#666',
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   price: {
//     fontWeight: '600',
//     fontSize: 16,
//     marginRight: 12,
//   },
//   reOrderBtn: {
//     backgroundColor: '#2E7D32',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   reOrderText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     minHeight: '70%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   orderInfoSection: {
//     marginBottom: 20,
   
//   },
//   orderIdText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   dateText: {
//     color: '#666',
//     marginBottom: 4,
//   },
//   storeNameText: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#2E7D32',
//   },
//   itemsContainer: {
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   itemRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   itemName: {
//     flex: 1,
//     color: '#444',
//   },
//   itemPrice: {
//     fontWeight: '500',
//   },
//   totalSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     marginBottom: 20,
//   },
//   totalText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   totalPrice: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//   },
//   reorderButton: {
//     backgroundColor: '#2E7D32',
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   reorderButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#2E7D32',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorText: {
//     fontSize: 16,
//     color: 'red',
//   },
//   noOrders: {
//     textAlign: 'center',
//     marginTop: 50,
//     fontSize: 16,
//     color: '#666',
//   },
// });

// export default OrderScreen;












import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  SafeAreaView, 
  FlatList, 
  Alert,
  NativeModules,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { myorders } from './action';

const OrderScreen = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [OrdersData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // PhonePe Configuration
  const MERCHANT_ID = "PGTESTPAYUAT"; // Replace with your merchant ID
  const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"; // Replace with your salt key
  const SALT_INDEX = "1";
  const ENV = "SANDBOX"; // Use "PRODUCTION" for live environment

  const handlePayment = async (amount) => {
    try {
      const merchantTransactionId = `MT${Date.now()}`;
      
      // Create base64 encoded payload
      const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: `MUID${Date.now()}`,
        amount: amount * 100,
        callbackUrl: 'https://webhook.site/callback-url',
        mobileNumber: '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const base64Body = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      // Create checksum
      const string = `${base64Body}/pg/v1/pay${SALT_KEY}`;
      const sha256 = require('crypto').createHash('sha256').update(string).digest('hex');
      const checksum = `${sha256}###${SALT_INDEX}`;

      if (Platform.OS === 'android') {
        NativeModules.PhonePeModule.startTransaction(
          base64Body,
          checksum,
          merchantTransactionId,
          (error) => {
            console.error('Payment error:', error);
            Alert.alert('Error', 'Payment failed. Please try again.');
          },
          (success) => {
            Alert.alert('Success', 'Payment completed successfully!');
            // Handle successful payment
          }
        );
      } else {
        // iOS implementation
        Alert.alert('Info', 'PhonePe integration is currently only supported on Android');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  const handleReOrder = (order) => {
    Alert.alert(
      'Confirm Re-Order',
      `Total amount to pay: ₹${order.totalPrice.toLocaleString()}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Pay Now',
          onPress: () => handlePayment(order.totalPrice),
        },
      ]
    );
  };

  const handleOrderClick = (order) => {
    setOpenOrderId(openOrderId === order.id ? null : order.id);
  };

  const handleSeeDetails = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const OrderDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Icon name="x" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {selectedOrder && (
            <View style={styles.orderInfoSection}>
              <View style={styles.orderCard}>
                <Text style={styles.orderIdText}>Order ID: {selectedOrder.id}</Text>
                <Text style={styles.dateText}>Date of Order: {selectedOrder.date}</Text>
                <Text style={styles.dateText}>Amount: ₹{selectedOrder.amount.toLocaleString()}</Text>
                <Text style={styles.dateText}>No Of Plates: {selectedOrder.plates}</Text>
              </View>

              <View style={styles.itemsContainer}>
                <Text style={styles.sectionTitle}>Items Ordered:</Text>
                {selectedOrder.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                 
                    <Text style={styles.itemName}>
                      Quantity: {item.quantity} 
                    </Text>
                    {/* <Text style={styles.itemName}>
                      Per_Unit: ₹{item.pricePerUnit.toLocaleString()}
                    </Text> */}
                    <Text style={styles.itemPrice}>
                      Amount: ₹{item.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalSection}>
                <Text style={styles.totalText}>Total Amount:</Text>
                <Text style={styles.totalPrice}>₹ {selectedOrder.totalPrice.toLocaleString()}</Text>
              </View>

              <TouchableOpacity style={styles.reorderButton}>
                <Text style={styles.reorderButtonText}>Re-Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );


  // ... (rest of your existing code remains the same until the renderOrderCard function)

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.statusContainer}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <TouchableOpacity onPress={() => handleSeeDetails(item)}>
          <Text style={styles.seeDetailsText}>See Details {'>'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.storeName}>Order ID: {item.id}</Text>
      <Text style={styles.orderDate}>Ordered Date:{item.date} </Text>

      <View style={styles.orderSummary}>
        <Text style={styles.itemCount}>{item.totalItems} Item{item.totalItems > 1 ? 's' : ''}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹ {item.amount.toLocaleString()}</Text>
          <TouchableOpacity 
            style={styles.reOrderBtn}
            onPress={() => handleReOrder(item)}
          >
            <Text style={styles.reOrderText}>Re-Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={OrdersData}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.orderList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.noOrders}>No orders found</Text>}
        />
      )}

      <OrderDetailsModal />
    </SafeAreaView>
  );
};

// ... (styles remain the same)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CCFFCC',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  orderList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },
  statusText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  seeDetailsText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemCount: {
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontWeight: '600',
    fontSize: 16,
    marginRight: 12,
  },
  reOrderBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reOrderText: {
    color: '#fff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    padding: 4,
  },
  orderInfoSection: {
    marginBottom: 20,
   
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateText: {
    color: '#666',
    marginBottom: 4,
  },
  storeNameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E7D32',
  },
  itemsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    color: '#444',
  },
  itemPrice: {
    fontWeight: '500',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  reorderButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reorderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#2E7D32',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  noOrders: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default OrderScreen;