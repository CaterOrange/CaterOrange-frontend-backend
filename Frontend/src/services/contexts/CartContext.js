// // CartContext.js
// import React, { createContext, useContext, useState } from 'react';

// const CartContext = createContext();

// export const useCart = () => {
//   return useContext(CartContext);
// };

// export const CartProvider = ({ children }) => {

//   const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//   const [cartCount, setCartCount] = useState(storedUserDP.cartCount || 0);
  

//   const updateCartCount = (newCount) => {
    
//     setCartCount(newCount);
//     window.dispatchEvent(new Event('countUpdated')); // Emit an event
//   };

//   return (
//     <CartContext.Provider value={{ cartCount, updateCartCount }}>
//       {children}
//     </CartContext.Provider>
//   );
// };
 

import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
  const [cartCount, setCartCount] = useState(storedUserDP.cartCount || 0);

  const updateCartCount = (newCount) => {
    setCartCount(newCount);
    window.dispatchEvent(new Event('countUpdated')); // Emit an event
  };

  useEffect(() => {
    // Update `cartCount` in local storage whenever it changes
    const updatedUserDP = {
      ...storedUserDP,
      cartCount
    };
    localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
  }, [cartCount]);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};
