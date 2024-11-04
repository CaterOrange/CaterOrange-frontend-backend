// // ProductList.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native';
// import FoodOrderApp from './menu';

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
//             data={products}
//             keyExtractor={(item) => item.productId}
//             renderItem={({ item }) => (
//                 <FoodOrderApp product={item} />
//             )}
//             />
   
//     </View>
//   );
// };

// export default ProductList;



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import FoodOrderApp from './menu';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:5000/api/products');
        console.log('API Response:', response.data); // Debug log
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('API Error:', err); // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderItem = ({ item }) => {
    console.log('Rendering product:', item); // Debug log
    return <FoodOrderApp product={item} />;
  };

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

  if (!products || products.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No products available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu Items</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  listContainer: {
    paddingBottom: 20,
  },
});

export default ProductList;
