// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   SafeAreaView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Feather';

// const EventCart = () => {
//   const [cartItems, setCartItems] = useState([
//     {
//       id: 1,
//       name: 'Chote Masala',
//       price: 199.99,
//       quantity: 1,
//       image: 'https://via.placeholder.com/80',
//     },
//     {
//       id: 2,
//       name: 'Paneer Masala',
//       price: 299.99,
//       quantity: 2,
//       image: 'https://via.placeholder.com/80',
//     },
//     {
//       id: 3,
//       name: 'Rice Sambar',
//       price: 89.99,
//       quantity: 1,
//       image: 'https://via.placeholder.com/80',
//     },
//   ]);

//   const updateQuantity = (id, change) => {
//     setCartItems(items =>
//       items.map(item =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + change) }
//           : item
//       )
//     );
//   };

//   const removeItem = (id) => {
//     setCartItems(items => items.filter(item => item.id !== id));
//   };

//   const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const shipping = 10;
//   const tax = subtotal * 0.08;
//   const total = subtotal + shipping + tax;

//   const CartItem = ({ item }) => (
//     <View style={styles.cartItem}>
//       <Image
//         source={{ uri: item.image }}
//         style={styles.itemImage}
//       />
//       <View style={styles.itemDetails}>
//         <Text style={styles.itemName}>{item.name}</Text>
//         <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
//       </View>
//       <View style={styles.quantityContainer}>
//         <TouchableOpacity
//           onPress={() => updateQuantity(item.id, -1)}
//           style={styles.quantityButton}
//         >
//           <Icon name="minus" size={16} color="#666" />
//         </TouchableOpacity>
//         <Text style={styles.quantityText}>{item.quantity}</Text>
//         <TouchableOpacity
//           onPress={() => updateQuantity(item.id, 1)}
//           style={styles.quantityButton}
//         >
//           <Icon name="plus" size={16} color="#666" />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.itemTotal}>
//         <Text style={styles.totalText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeItem(item.id)}
//         style={styles.removeButton}
//       >
//         <Icon name="trash-2" size={20} color="#666" />
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Icon name="shopping-bag" size={24} color="#000" />
//         <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
//       </View>

//       <ScrollView style={styles.content}>
//         {cartItems.length === 0 ? (
//           <View style={styles.emptyCart}>
//             <Text style={styles.emptyText}>Your cart is empty</Text>
//           </View>
//         ) : (
//           <View style={styles.cartContent}>
//             {cartItems.map(item => (
//               <CartItem key={item.id} item={item} />
//             ))}

//             <View style={styles.summary}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryText}>Subtotal</Text>
//                 <Text style={styles.summaryText}>₹{subtotal.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryText}>Shipping</Text>
//                 <Text style={styles.summaryText}>₹{shipping.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryText}>Tax</Text>
//                 <Text style={styles.summaryText}>₹{tax.toFixed(2)}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Total</Text>
//                 <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
//               </View>

//               <TouchableOpacity style={styles.checkoutButton}>
//                 <Text style={styles.checkoutButtonText}>Proceed to Pay</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: 'green',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   content: {
//     flex: 1,
//   },
//   cartContent: {
//     padding: 16,
//   },
//   emptyCart: {
//     padding: 48,
//     alignItems: 'center',
//   },
//   emptyText: {
//     color: '#666',
//   },
//   cartItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   itemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//   },
//   itemDetails: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   itemName: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   itemPrice: {
//     color: '#666',
//     marginTop: 4,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 12,
//   },
//   quantityButton: {
//     padding: 8,
//   },
//   quantityText: {
//     paddingHorizontal: 12,
//   },
//   itemTotal: {
//     width: 80,
//     alignItems: 'flex-end',
//   },
//   totalText: {
//     fontWeight: '600',
//   },
//   removeButton: {
//     padding: 8,
//   },
//   summary: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryText: {
//     color: '#666',
//   },
//   totalRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingTop: 12,
//     marginTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   totalAmount: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   checkoutButton: {
//     backgroundColor: '#800080',
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   checkoutButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default EventCart;


// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   SafeAreaView,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const EventCart = () => {
//   const [cartItems, setCartItems] = useState([
//     {
//       id: 1,
//       name: 'Chote Masala',
//       price: 199.99,
//       quantity: 1,
//       image: 'https://via.placeholder.com/80',
//     },
//     {
//       id: 2,
//       name: 'Paneer Masala',
//       price: 299.99,
//       quantity: 2,
//       image: 'https://via.placeholder.com/80',
//     },
//     {
//       id: 3,
//       name: 'Rice Sambar',
//       price: 89.99,
//       quantity: 1,
//       image: 'https://via.placeholder.com/80',
//     },
//   ]);

//   const updateQuantity = (id, change) => {
//     setCartItems(items =>
//       items.map(item =>
//         item.id === id
//           ? { ...item, quantity: Math.max(1, item.quantity + change) }
//           : item
//       )
//     );
//   };

//   const removeItem = (id) => {
//     setCartItems(items => items.filter(item => item.id !== id));
//   };

//   const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const shipping = 10;
//   const tax = subtotal * 0.08;
//   const total = subtotal + shipping + tax;

//   const CartItem = ({ item }) => (
//     <View style={styles.cartItem}>
//       <Image
//         source={{ uri: item.image }}
//         style={styles.itemImage}
//       />
//       <View style={styles.itemDetails}>
//         <Text style={styles.itemName}>{item.name}</Text>
//         <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
//       </View>
//       <View style={styles.quantityContainer}>
//         <TouchableOpacity
//           onPress={() => updateQuantity(item.id, -1)}
//           style={styles.quantityButton}
//         >
//           <Icon name="remove" size={16} color="#666" />
//         </TouchableOpacity>
//         <Text style={styles.quantityText}>{item.quantity}</Text>
//         <TouchableOpacity
//           onPress={() => updateQuantity(item.id, 1)}
//           style={styles.quantityButton}
//         >
//           <Icon name="add" size={16} color="#666" />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.itemTotal}>
//         <Text style={styles.totalText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeItem(item.id)}
//         style={styles.removeButton}
//       >
//         <Icon name="delete" size={20} color="#666" />
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Icon name="shopping-cart" size={24} color="#000" />
//         <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
//       </View>

//       <ScrollView style={styles.content}>
//         {cartItems.length === 0 ? (
//           <View style={styles.emptyCart}>
//             <Text style={styles.emptyText}>Your cart is empty</Text>
//           </View>
//         ) : (
//           <View style={styles.cartContent}>
//             {cartItems.map(item => (
//               <CartItem key={item.id} item={item} />
//             ))}

//             <View style={styles.summary}>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryText}>Subtotal</Text>
//                 <Text style={styles.summaryText}>₹{subtotal.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryText}>Shipping</Text>
//                 <Text style={styles.summaryText}>₹{shipping.toFixed(2)}</Text>
//               </View>
//               <View style={styles.summaryRow}>
//                 <Text style={styles.summaryText}>Tax</Text>
//                 <Text style={styles.summaryText}>₹{tax.toFixed(2)}</Text>
//               </View>
//               <View style={styles.totalRow}>
//                 <Text style={styles.totalLabel}>Total</Text>
//                 <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
//               </View>

//               <TouchableOpacity style={styles.checkoutButton}>
//                 <Text style={styles.checkoutButtonText}>Proceed to Pay</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//     backgroundColor: 'green',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginLeft: 8,
//   },
//   content: {
//     flex: 1,
//   },
//   cartContent: {
//     padding: 16,
//   },
//   emptyCart: {
//     padding: 48,
//     alignItems: 'center',
//   },
//   emptyText: {
//     color: '#666',
//   },
//   cartItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   itemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//   },
//   itemDetails: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   itemName: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   itemPrice: {
//     color: '#666',
//     marginTop: 4,
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   quantityButton: {
//     padding: 8,
//   },
//   quantityText: {
//     paddingHorizontal: 12,
//   },
//   itemTotal: {
//     width: 80,
//     alignItems: 'flex-end',
//   },
//   totalText: {
//     fontWeight: '600',
//   },
//   removeButton: {
//     padding: 8,
//   },
//   summary: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   summaryText: {
//     color: '#666',
//   },
//   totalRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingTop: 12,
//     marginTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#e0e0e0',
//   },
//   totalLabel: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   totalAmount: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   checkoutButton: {
//     backgroundColor: '#800080',
//     padding: 16,
//     borderRadius: 8,
//     marginTop: 16,
//     alignItems: 'center',
//   },
//   checkoutButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });

// export default EventCart;









import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EventCart = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Chote Masala',
      price: 199.99,
      quantity: 1,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo70eIXRgLy22fnQV12nqbnnOruVaIw4e2XQ&s',
    },
    {
      id: 2,
      name: 'Paneer Masala',
      price: 299.99,
      quantity: 2,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo70eIXRgLy22fnQV12nqbnnOruVaIw4e2XQ&s',
    },
    {
      id: 3,
      name: 'Rice Sambar',
      price: 89.99,
      quantity: 1,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo70eIXRgLy22fnQV12nqbnnOruVaIw4e2XQ&s',
    },
  ]);

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const CartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, -1)}
          style={styles.quantityButton}
        >
          <Icon name="remove" size={16} color="#666" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => updateQuantity(item.id, 1)}
          style={styles.quantityButton}
        >
          <Icon name="add" size={16} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.totalText}>₹{(item.price * item.quantity).toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeItem(item.id)}
        style={styles.removeButton}
      >
        <Icon name="delete" size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Icon name="shopping-cart" size={24} color="#000" />
        <Text style={styles.headerTitle}>Shopping Cart ({cartItems.length})</Text>
      </View>

      <View style={styles.addressContainer}>
        <Text style={styles.addressText}>Delivery Address</Text>
        <View style={styles.addressDetails}>
          <Text style={styles.addressLine}>123 Main Street, Anytown, USA 12345</Text>
          <TouchableOpacity style={styles.changeAddressButton}>
            <Text style={styles.changeAddressButtonText}>Change Address</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          <View style={styles.cartContent}>
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Subtotal</Text>
                <Text style={styles.summaryText}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Shipping</Text>
                <Text style={styles.summaryText}>₹{shipping.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Tax</Text>
                <Text style={styles.summaryText}>₹{tax.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
              </View>

              <TouchableOpacity style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>Proceed to Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'green',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  addressText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addressDetails: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  addressLine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  changeAddressButton: {
    backgroundColor: '#800080',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  changeAddressButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  cartContent: {
    padding: 16,
  },
  emptyCart: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemPrice: {
    color: '#666',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    paddingHorizontal: 12,
  },
  itemTotal: {
    width: 80,
    alignItems: 'flex-end',
  },
  totalText: {
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#800080',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default EventCart;