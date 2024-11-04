// // ProductList.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';

// const ProductList = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get('http://10.0.2.2:5000/api/products');
//         setProducts(response.data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   // if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
//   if (error) return <Text>Error: {error}</Text>;
//   return (
//     <View>
//       <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Products</Text>
//       <FlatList
//         data={products}
//         keyExtractor={(item) => item.productId}
//         renderItem={({ item }) => (
//           <View style={{ marginBottom: 20 }}>
//             <Text style={{ fontSize: 18 }}>{item.ProductName}</Text>
//             <Image 
//               source={{ uri: item.Image }} 
//               style={{ width: 100, height: 100 }} 
//               resizeMode="contain" 
//             />
//             <Text>SubCategory_name: {item.ProductName}</Text>
//             <Text>Category_name: {item.Category_Name}</Text>
//             <Text>Price Category: {item.Price_Category}</Text>
//             <Text>isVeg: {item.isDual ? 'Yes' : 'No'}</Text>
//             <Text>price1: {item.PriceperUnit}</Text>
{             /* <Text> weight1:{item.Plate_Units}</Text> */}
//             <Text>quantity1: {item.MinUnitsperPlate}</Text>
//             <Text>weight2: {item.WtOrVol_Units}</Text>
//             <Text>price2: {item.Price_Per_WtOrVol_Units}</Text>
//             <Text>quantity2: {item.Min_WtOrVol_Units_per_Plate}</Text>
//             <Text>{item.isDeactivated ? 'This product is deactivated.' : 'This product is active.'}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default ProductList;









// image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',


// const categories = [
//   {
//     id: '1',
//     name: 'North Indian Style',
//     image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
//     subCategories: [
//       { id: 'b1', name: 'Chicken Biryani', price: '₹250', rating: 4.5, isVeg: false },
//       { id: 'b2', name: 'Mutton Biryani', price: '₹350', rating: 4.3, isVeg: false },
//       { id: 'b3', name: 'Veg Biryani', price: '₹200', rating: 4.0, isVeg: true },
//     ]
//   },

//   {
//     id: '2',
//     name: 'South Indian Style',
//     image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
//     subCategories: [
//       { id: 'p1', name: 'Margherita', price: '₹199', rating: 4.2 },
//       { id: 'p2', name: 'Pepperoni', price: '₹299', rating: 4.4 },
//       { id: 'p3', name: 'BBQ Chicken', price: '₹349', rating: 4.3 },
//     ]
//   },
//   {
//     id: '3',
//     name: 'Breakfast',
//     image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
//     subCategories: [
//       { id: 'k1', name: 'Chocolate Cake', price: '₹399', rating: 4.6, isVeg: true },
//       { id: 'k2', name: 'Red Velvet', price: '₹449', rating: 4.7, isVeg: true },
//       { id: 'k3', name: 'Black Forest', price: '₹379', rating: 4.5, isVeg: true },
//     ]
//   },
//   {
//     id: '4',
//     name: 'Snacks',
//     image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
//     subCategories: [
//       { id: 'bg1', name: 'Classic Burger', price: '₹149', rating: 4.2 },
//       { id: 'bg2', name: 'Cheese Burger', price: '₹179', rating: 4.4 },
//       { id: 'bg3', name: 'Double Patty', price: '₹249', rating: 4.5 },
//     ]
//   },
//   {
//     id: '5',
//     name: 'Shawarma',
//     image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
//     subCategories: [
//       { id: 's1', name: 'Chicken Shawarma', price: '₹120', rating: 4.3 },
//       { id: 's2', name: 'Mixed Shawarma', price: '₹150', rating: 4.4 },
//       { id: 's3', name: 'Falafel Wrap', price: '₹100', rating: 4.1 },
//     ]
//   },
//   {
//     id: '6',
//     name: 'North Indian',
//     image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
//     subCategories: [
//       { id: 'n1', name: 'Butter Naan', price: '₹40', rating: 4.4 },
//       { id: 'n2', name: 'Paneer Butter Masala', price: '₹220', rating: 4.5 },
//       { id: 'n3', name: 'Dal Makhani', price: '₹180', rating: 4.3 },
//     ]
//   },
  
//   {
//     id: '7',
//     name: 'Cake',
//     image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
//     subCategories: [
//       { id: 'k1', name: 'Chocolate Cake', price: '₹399', rating: 4.6, isVeg: true },
//       { id: 'k2', name: 'Red Velvet', price: '₹449', rating: 4.7, isVeg: true },
//       { id: 'k3', name: 'Black Forest', price: '₹379', rating: 4.5, isVeg: true },
//     ]
//   },
//   {
//     id: '8',
//     name: 'South Indian',
//     image: 'https://images.unsplash.com/photo-1630383249896-25924bc0f229',
//     subCategories: [
//       { id: 'si1', name: 'Masala Dosa', price: '₹120', rating: 4.4, isVeg: true },
//       { id: 'si2', name: 'Idli Sambar', price: '₹80', rating: 4.2, isVeg: true },
//       { id: 'si3', name: 'Vada', price: '₹60', rating: 4.3, isVeg: true },
//     ]
//   },

// ];




  // const CategoryItem = ({ item }) => {
  //   const [showSubcategories, setShowSubcategories] = useState(false);

  //   const toggleSubcategories = () => {
  //     setShowSubcategories(prevState => !prevState);
  //     Animated.spring(categoryScale, {
  //       toValue: showSubcategories ? 1 : 1.1,
  //       useNativeDriver: true,
  //     }).start();
  //   };

  //   return (
  //     <View style={styles.categoryContainer}>
  //       <TouchableOpacity
  //         style={styles.categoryItem}
  //         onPress={toggleSubcategories}
  //       >
  //         <View style={styles.categoryImageContainer}>
  //           {/* <Image
  //             source={{ uri: item.image }}
  //             style={styles.categoryImage}
  //           /> */}
  //           <Image
  //             source={{ uri: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783' }}
  //             style={styles.categoryImage}
  //           />

  //         </View>
  //         <Text style={styles.categoryName}>{item.Category_Name}</Text>
  //         <Icon
  //           name={showSubcategories ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
  //           size={24}
  //           color="#333"
  //         />
  //       </TouchableOpacity>
  //       {/* {showSubcategories && (
  //         <View style={styles.subcategoriesContainer}>
  //           {item.subCategories.map((subItem) => (
  //             <SubCategoryItem key={subItem.id} item={subItem} />
  //           ))}
  //         </View>
  //       )} */}
  //       {showSubcategories && (
  //         <View style={styles.subcategoriesContainer}>
  //           <SubCategoryItem
  //             key={item.productId}                 
  //             item={item}                          
  //             productId={item.productId}           
  //             productName={item.ProductName}       
  //           />
  //         </View>
  //       )}
  //     </View>
  //   );
  // };


  // const SubCategoryItem = ({ item }) => {
  //   const [isEnabled, setIsEnabled] = useState(false);
  //   const toggleSwitch = () => setIsEnabled(previousState => !previousState);
    
  //   // Find if item exists in cart to set initial checkbox state
  //   const itemInCart = cartItems.find(cartItem => cartItem.id === item.id);
  //   const [isChecked, setIsChecked] = useState(!!itemInCart);
    
  //   useEffect(() => {
  //     const exists = cartItems.some(cartItem => cartItem.id === item.id);
  //     setIsChecked(exists);
  //   }, [cartItems, item.id]);


  //   if (isVegOnly && !item.isVeg) {
  //     return null;
  //   }
  
  //   const toggleCheckbox = () => {
  //   const newCheckedState = !isChecked;
  //   setIsChecked(newCheckedState);
    
  //   if (newCheckedState) {
  //     // Add to cart
  //     setCartItems(prevItems => {
  //       if (prevItems.find(cartItem => cartItem.id === item.id)) {
  //         return prevItems;
  //       }
  //       return [...prevItems, { ...item, quantity: 1 }];
  //     });
  //   } else {
  //     // Remove from cart
  //     setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
  //   }
  // };

  
  //   const handleAddToCart = () => {
  //     setIsChecked(true);
  //     addToCart(item);
  //   };
  
  //   return (
  //     <Animated.View style={styles.subCategoryItem}>
  //       <View style={styles.subCategoryContent}>
  //         <View style={styles.subCategoryHeader}>
  //           <Text style={styles.subCategoryName}>{item.ProductName}</Text>
  //           <Switch
  //             trackColor={{ false: "#767577", true: "#81b0ff" }}
  //             thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
  //             onValueChange={toggleSwitch}
  //             value={isEnabled}
  //           />
  //         </View>
  //         <Text style={styles.price}>{item.PriceperUnit}</Text>
  //         <View style={styles.actionContainer}>
  //           <TouchableOpacity
  //             style={styles.addButton}
  //             onPress={handleAddToCart}>
  //             <Text style={styles.addButtonText}>Add to Cart</Text>
  //           </TouchableOpacity>
  //           <View style={styles.actionContainer}>
  //         <CheckBox
  //           value={isChecked}
  //           onValueChange={toggleCheckbox}
  //           tintColors={{ true: '#4CAF50', false: '#ccc' }}
  //           style={styles.checkbox}
  //         />
  //       </View>
  //         </View>
  //         {item.isVeg && (
  //           <View style={styles.vegBadge}>
  //             <Text style={styles.vegText}>VEG</Text>
  //           </View>
  //         )}
  //       </View>
  //     </Animated.View>
  //   );
  // };
  
  // Update the addToCart function to handle duplicates better
  
  
  // const addToCart = (item) => {
  //   setCartItems(prevItems => {
  //     const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
  //     if (existingItem) {
  //       return prevItems.map(cartItem =>
  //         cartItem.id === item.id
  //           ? { ...cartItem, quantity: cartItem.quantity + 1 }
  //           : cartItem
  //       );
  //     }
  //     return [...prevItems, { ...item, quantity: 1 }];
  //   });
    
  //   Animated.sequence([
  //     Animated.spring(cartBounce, {
  //       toValue: 1.2,
  //       useNativeDriver: true,
  //     }),
  //     Animated.spring(cartBounce, {
  //       toValue: 1,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // };
  



   // // Filter categories based on search query
  // useEffect(() => {
  //   const filtered = categories.filter(category =>
  //     category.name.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  //   setFilteredCategories(filtered);
  // }, [searchQuery]);





  // ProductList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import FoodOrderApp from './FoodOrderApp';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/products');
        console.log('API Response:', response.data); // Debug log
        setProducts(response.data);
      } catch (err) {
        console.error('API Error:', err); // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.Category_Name;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const categories = Object.keys(groupedProducts).map(category => ({
    Category_Name: category,
    products: groupedProducts[category]
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Menu Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <FoodOrderApp categoryData={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProductList;

// FoodOrderApp.js
import React, { useState, useRef } from 'react';
import CheckBox from '@react-native-community/checkbox';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Switch,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const FoodOrderApp = ({ categoryData }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const categoryScale = useRef(new Animated.Value(1)).current;
  const cartBounce = useRef(new Animated.Value(1)).current;

  const toggleSubcategories = () => {
    setShowSubcategories(prevState => !prevState);
    Animated.spring(categoryScale, {
      toValue: showSubcategories ? 1 : 1.1,
      useNativeDriver: true,
    }).start();
  };

  const SubCategoryItem = ({ item }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const toggleSwitch = () => setIsEnabled(prevState => !prevState);
    
    const toggleCheckbox = () => {
      const newCheckedState = !isChecked;
      setIsChecked(newCheckedState);
      
      if (newCheckedState) {
        addToCart(item);
      } else {
        removeFromCart(item);
      }
    };

    return (
      <View style={styles.subCategoryItem}>
        <View style={styles.subCategoryContent}>
          <View style={styles.subCategoryHeader}>
            <Text style={styles.subCategoryName}>{item.ProductName}</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <Text style={styles.price}>₹{item.PriceperUnit}</Text>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
            <CheckBox
              value={isChecked}
              onValueChange={toggleCheckbox}
              tintColors={{ true: '#4CAF50', false: '#ccc' }}
              style={styles.checkbox}
            />
          </View>
        </View>
      </View>
    );
  };

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.productId === item.productId);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.productId === item.productId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
    
    Animated.sequence([
      Animated.spring(cartBounce, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(cartBounce, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removeFromCart = (item) => {
    setCartItems(prevItems => 
      prevItems.filter(cartItem => cartItem.productId !== item.productId)
    );
  };

  const CartModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={cartModalVisible}
      onRequestClose={() => setCartModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Cart</Text>
            <TouchableOpacity onPress={() => setCartModalVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {cartItems.length === 0 ? (
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
          ) : (
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.productId.toString()}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <View>
                    <Text style={styles.cartItemName}>{item.ProductName}</Text>
                    <Text style={styles.cartItemPrice}>₹{item.PriceperUnit}</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, -1)}
                      style={styles.quantityButton}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, 1)}
                      style={styles.quantityButton}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
          
          {cartItems.length > 0 && (
            <TouchableOpacity style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  const updateQuantity = (productId, change) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + change;
          if (newQuantity <= 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={toggleSubcategories}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783' }}
            style={styles.categoryImage}
          />
        </View>
        <Text style={styles.categoryName}>{categoryData.Category_Name}</Text>
        <Icon
          name={showSubcategories ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#333"
        />
      </TouchableOpacity>
      
      {showSubcategories && (
        <View style={styles.subcategoriesContainer}>
          <FlatList
            data={categoryData.products}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={({ item }) => (
              <SubCategoryItem item={item} />
            )}
          />
        </View>
      )}

      <CartModal />
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    backgroundColor: '#FFF',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 16,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subcategoriesContainer: {
    backgroundColor: '#F8F8F8',
    padding: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  subCategoryItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
  },
  subCategoryContent: {
    gap: 8,
  },
  subCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 16,
    color: '#666',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 12,
  },
  addButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkbox: {
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCartText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Foo