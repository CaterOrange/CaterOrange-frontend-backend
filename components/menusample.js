import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// Enhanced categories data with images and more items
const categories = [
  {
    id: '1',
    name: 'North Indian Style',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
    subCategories: [
      { id: 'b1', name: 'Chicken Biryani', price: '₹250', rating: 4.5, isVeg: false },
      { id: 'b2', name: 'Mutton Biryani', price: '₹350', rating: 4.3, isVeg: false },
      { id: 'b3', name: 'Veg Biryani', price: '₹200', rating: 4.0, isVeg: true },
    ]
  },

  {
    id: '2',
    name: 'South Indian Style',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    subCategories: [
      { id: 'p1', name: 'Margherita', price: '₹199', rating: 4.2 },
      { id: 'p2', name: 'Pepperoni', price: '₹299', rating: 4.4 },
      { id: 'p3', name: 'BBQ Chicken', price: '₹349', rating: 4.3 },
    ]
  },
  {
    id: '3',
    name: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    subCategories: [
      { id: 'k1', name: 'Chocolate Cake', price: '₹399', rating: 4.6, isVeg: true },
      { id: 'k2', name: 'Red Velvet', price: '₹449', rating: 4.7, isVeg: true },
      { id: 'k3', name: 'Black Forest', price: '₹379', rating: 4.5, isVeg: true },
    ]
  },
  {
    id: '4',
    name: 'Snacks',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    subCategories: [
      { id: 'bg1', name: 'Classic Burger', price: '₹149', rating: 4.2 },
      { id: 'bg2', name: 'Cheese Burger', price: '₹179', rating: 4.4 },
      { id: 'bg3', name: 'Double Patty', price: '₹249', rating: 4.5 },
    ]
  },
  {
    id: '5',
    name: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
    subCategories: [
      { id: 's1', name: 'Chicken Shawarma', price: '₹120', rating: 4.3 },
      { id: 's2', name: 'Mixed Shawarma', price: '₹150', rating: 4.4 },
      { id: 's3', name: 'Falafel Wrap', price: '₹100', rating: 4.1 },
    ]
  },
  {
    id: '6',
    name: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    subCategories: [
      { id: 'n1', name: 'Butter Naan', price: '₹40', rating: 4.4 },
      { id: 'n2', name: 'Paneer Butter Masala', price: '₹220', rating: 4.5 },
      { id: 'n3', name: 'Dal Makhani', price: '₹180', rating: 4.3 },
    ]
  },
  
  {
    id: '7',
    name: 'Cake',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    subCategories: [
      { id: 'k1', name: 'Chocolate Cake', price: '₹399', rating: 4.6, isVeg: true },
      { id: 'k2', name: 'Red Velvet', price: '₹449', rating: 4.7, isVeg: true },
      { id: 'k3', name: 'Black Forest', price: '₹379', rating: 4.5, isVeg: true },
    ]
  },
  {
    id: '8',
    name: 'South Indian',
    image: 'https://images.unsplash.com/photo-1630383249896-25924bc0f229',
    subCategories: [
      { id: 'si1', name: 'Masala Dosa', price: '₹120', rating: 4.4, isVeg: true },
      { id: 'si2', name: 'Idli Sambar', price: '₹80', rating: 4.2, isVeg: true },
      { id: 'si3', name: 'Vada', price: '₹60', rating: 4.3, isVeg: true },
    ]
  },
  // Add more categories as needed
];

const FoodOrderApp = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const categoryScrollRef = useRef(null);

//   const [showAllCategories, setShowAllCategories] = useState(false);
  

  const categoryScale = useRef(new Animated.Value(1)).current;
  const cartBounce = useRef(new Animated.Value(1)).current;

  // Filter categories based on search query
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery]);


  // Cart functions
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
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

  // Cart Modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  
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
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <View>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{item.price}</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                      style={styles.quantityButton}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
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

  // Search Modal
  const SearchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={searchVisible}
      onRequestClose={() => setSearchVisible(false)}
    >
      <View style={styles.searchModalContainer}>
        <View style={styles.searchModalContent}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={24} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for dishes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => setSearchVisible(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredCategories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => {
                  setSelectedCategory(item);
                  setSearchVisible(false);
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.searchResultImage}
                />
                <Text style={styles.searchResultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  
//   const CategoryItem = ({ item, index }) => {


//     const isSelected = selectedCategory?.id === item.id;
//     return (
//       <TouchableOpacity
//         onPress={() => {
//           setSelectedCategory(isSelected ? null : item);
//           Animated.spring(categoryScale, {
//             toValue: isSelected ? 1 : 1.1,
//             useNativeDriver: true,
//           }).start();
//         }}
//         style={styles.categoryItem}>
//         <Animated.View
//           style={[
//             styles.categoryImageContainer,
//             {
//               transform: [
//                 { scale: isSelected ? categoryScale : 1 },
//               ],
//             },
//           ]}>
//           <Image
//             source={{ uri: item.image }}
//             style={styles.categoryImage}
//           />
//         </Animated.View>
//         <Text style={styles.categoryName}>{item.name}</Text>
//       </TouchableOpacity>
//     );
//   };

  // SubCategory Item Component with Toggle
  
  const CategoryItem = ({ item }) => {
    const [showSubcategories, setShowSubcategories] = useState(false);

    const toggleSubcategories = () => {
      setShowSubcategories(prevState => !prevState);
      Animated.spring(categoryScale, {
        toValue: showSubcategories ? 1 : 1.1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          style={styles.categoryItem}
          onPress={toggleSubcategories}
        >
          <View style={styles.categoryImageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.categoryImage}
            />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
          <Icon
            name={showSubcategories ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
        {showSubcategories && (
          <View style={styles.subcategoriesContainer}>
            {item.subCategories.map((subItem) => (
              <SubCategoryItem key={subItem.id} item={subItem} />
            ))}
          </View>
        )}
      </View>
    );
  };

  
  const SubCategoryItem = ({ item }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    if (isVegOnly && !item.isVeg) {
      return null;
    }

    return (
      <Animated.View style={styles.subCategoryItem}>
        <View style={styles.subCategoryContent}>
          <View style={styles.subCategoryHeader}>
            <Text style={styles.subCategoryName}>{item.name}</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <Text style={styles.price}>{item.price}</Text>
          {item.isVeg ? (
            <View style={styles.vegBadge}>
              <Text style={styles.vegText}>VEG</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToCart(item)}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <Icon name="fastfood" size={24} color="#FF4757" />
          <Text style={styles.locationText}>CaterOrange</Text>
        </View>
        <Animated.View style={[styles.cartContainer, { transform: [{ scale: cartBounce }] }]}>
          <TouchableOpacity onPress={() => setCartModalVisible(true)}>
            <Icon name="shopping-cart" size={24} color="#333" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setSearchVisible(true)}
        >
          <Icon name="search" size={20} color="#666" />
          <Text style={styles.filterText}>Search</Text>
        </TouchableOpacity>
     
      </View>

      {/* Categories */}
      {/* <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Inspiration for your first order</Text>
        <FlatList
          ref={categoryScrollRef}
          data={showAllCategories ? categories : categories.slice(0, 4)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <CategoryItem item={item} index={index} />
          )}
          contentContainerStyle={styles.categoriesList}
        />
        <TouchableOpacity 
          style={styles.seeMoreButton}
          onPress={() => setShowAllCategories(!showAllCategories)}
        >
          <Text style={styles.seeMoreText}>
            {showAllCategories ? 'See Less' : 'See More'}
            
          </Text>
          <Icon 
            name={showAllCategories ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
            size={20} 
            color="#FF4757"
          />
        </TouchableOpacity>
      </View> */}



      {/* Selected Category Items */}
      {/* {selectedCategory && (
        <View style={styles.subCategoriesContainer}>
          <Text style={styles.subCategoryTitle}>{selectedCategory.name} Menu</Text>
          <FlatList
            data={selectedCategory.subCategories}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <SubCategoryItem item={item} />}
            contentContainerStyle={styles.subCategoriesList}
          />
        </View>
      )} */}


<View style={styles.categoriesContainer}>
        <FlatList
          data={filteredCategories}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CategoryItem item={item} />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Modals */}
      <CartModal />
      <SearchModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 
  searchModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchModalContent: {
    flex: 1,
    paddingTop: 50,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  searchResultText: {
    fontSize: 16,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  seeMoreText: {
    color: '#FF4757',
    marginRight: 4,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
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
    borderBottomColor: '#eee',
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
    borderBottomColor: '#eee',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#FF4757',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
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
    backgroundColor: '#FF4757',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: '#FF4757',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#FFE5E7',
  },
  filterText: {
    marginHorizontal: 4,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 8,
  },
//   categoryItem: {
//     alignItems: 'center',
//     marginHorizontal: 8,
//     width: 80,
//   },
categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f5f5f5',
  },
//   categoryImageContainer: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     overflow: 'hidden',
//     marginBottom: 8,
//     backgroundColor: '#f5f5f5',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
//   categoryName: {
//     fontSize: 12,
//     textAlign: 'center',
//     color: '#333',
//   },
categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
//   subCategoriesContainer: {
//     flex: 1,
//     backgroundColor: '#f9f9f9',
//   },

subcategoriesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  subCategoryItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  subCategoriesList: {
    padding: 16,
  },
//   subCategoryItem: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 12,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
  subCategoryContent: {
    flex: 1,
  },
  subCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  price: {
    fontSize: 16,
    color: '#FF4757',
    fontWeight: '600',
    marginVertical: 8,
  },
  addButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  vegBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  vegText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FoodOrderApp;




import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// Enhanced categories data with images and more items
const categories = [
  {
    id: '1',
    name: 'North Indian Style',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
    subCategories: [
      { id: 'b1', name: 'Chicken Biryani', price: '₹250', rating: 4.5, isVeg: false },
      { id: 'b2', name: 'Mutton Biryani', price: '₹350', rating: 4.3, isVeg: false },
      { id: 'b3', name: 'Veg Biryani', price: '₹200', rating: 4.0, isVeg: true },
    ],
  },
  {
    id: '2',
    name: 'South Indian Style',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    subCategories: [
      { id: 'p1', name: 'Margherita', price: '₹199', rating: 4.2 },
      { id: 'p2', name: 'Pepperoni', price: '₹299', rating: 4.4 },
      { id: 'p3', name: 'BBQ Chicken', price: '₹349', rating: 4.3 },
    ],
  },
  {
    id: '3',
    name: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    subCategories: [
      { id: 'k1', name: 'Chocolate Cake', price: '₹399', rating: 4.6, isVeg: true },
      { id: 'k2', name: 'Red Velvet', price: '₹449', rating: 4.7, isVeg: true },
      { id: 'k3', name: 'Black Forest', price: '₹379', rating: 4.5, isVeg: true },
    ],
  },
  {
    id: '4',
    name: 'Snacks',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    subCategories: [
      { id: 'bg1', name: 'Classic Burger', price: '₹149', rating: 4.2 },
      { id: 'bg2', name: 'Cheese Burger', price: '₹179', rating: 4.4 },
      { id: 'bg3', name: 'Double Patty', price: '₹249', rating: 4.5 },
    ],
  },
  {
    id: '5',
    name: 'Shawarma',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783',
    subCategories: [
      { id: 's1', name: 'Chicken Shawarma', price: '₹120', rating: 4.3 },
      { id: 's2', name: 'Mixed Shawarma', price: '₹150', rating: 4.4 },
      { id: 's3', name: 'Falafel Wrap', price: '₹100', rating: 4.1 },
    ],
  },
  {
    id: '6',
    name: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
    subCategories: [
      { id: 'n1', name: 'Butter Naan', price: '₹40', rating: 4.4 },
      { id: 'n2', name: 'Paneer Butter Masala', price: '₹220', rating: 4.5 },
      { id: 'n3', name: 'Dal Makhani', price: '₹180', rating: 4.3 },
    ],
  },
  {
    id: '7',
    name: 'Cake',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    subCategories: [
      { id: 'k1', name: 'Chocolate Cake', price: '₹399', rating: 4.6, isVeg: true },
      { id: 'k2', name: 'Red Velvet', price: '₹449', rating: 4.7, isVeg: true },
      { id: 'k3', name: 'Black Forest', price: '₹379', rating: 4.5, isVeg: true },
    ],
  },
  {
    id: '8',
    name: 'South Indian',
    image: 'https://images.unsplash.com/photo-1630383249896-25924bc0f229',
    subCategories: [
      { id: 'si1', name: 'Masala Dosa', price: '₹120', rating: 4.4, isVeg: true },
      { id: 'si2', name: 'Idli Sambar', price: '₹80', rating: 4.2, isVeg: true },
      { id: 'si3', name: 'Vada', price: '₹60', rating: 4.3, isVeg: true },
    ],
  },
];

const FoodOrderApp = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const categoryScrollRef = useRef(null);
  const categoryScale = useRef(new Animated.Value(1)).current;
  const cartBounce = useRef(new Animated.Value(1)).current;

  // Filter categories based on search query
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchQuery]);

  // Cart functions
  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.id === item.id
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

  const updateQuantity = (id, delta) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity + delta, 1) }
          : item
      )
    );
  };

  // Cart Modal
  const [cartModalVisible, setCartModalVisible] = useState(false);
  
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
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <View>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>{item.price}</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, -1)}
                      style={styles.quantityButton}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, 1)}
                      style={styles.quantityButton}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Order App</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
          <Icon name="search" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCartModalVisible(true)}>
          <Animated.View style={{ transform: [{ scale: cartBounce }] }}>
            <Icon name="shopping-cart" size={24} />
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {searchVisible && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={categoryScrollRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        snapToInterval={width - 40}
        decelerationRate="fast"
        style={styles.categoryScroll}
      >
        {filteredCategories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryContainer}
          >
            <Image source={{ uri: category.image }} style={styles.categoryImage} />
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <FlatList
        data={selectedCategory ? selectedCategory.subCategories : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity onPress={() => addToCart(item)} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.itemList}
      />
      
      <CartModal />
      
      <View style={styles.vegToggleContainer}>
        <Text>Show Veg Only</Text>
        <Switch
          value={isVegOnly}
          onValueChange={setIsVegOnly}
        />
      </View>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchInput: {
    padding: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  categoryScroll: {
    paddingVertical: 16,
  },
  categoryContainer: {
    width: width - 40,
    alignItems: 'center',
    marginRight: 16,
  },
  categoryImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  categoryName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemList: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: '#777',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCartText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#777',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 16,
    color: '#777',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
  },
  vegToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
});

export default FoodOrderApp;
