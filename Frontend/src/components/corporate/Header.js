import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/outline';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../services/contexts/CartContext';
import axios from 'axios';
import { io } from 'socket.io-client';

import Body from './Body';
import './css/styles.css';
import { VerifyToken } from '../../MiddleWare/verifyToken';

const Header = ({ user }) => {
  const { cartCount, updateCartCount } = useCart();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('corporate');
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};

  const toggleSidenav = () => {
    setIsSidenavOpen(!isSidenavOpen);
  };

  const handleViewCart = () => navigate('/cart');
  const handleViewOrders = () => navigate('/orders');
  const handleViewContactPage = () => navigate('/contact');
  const handleViewWalletPage = () => navigate('/wallet');
  const handleViewChangePassword = () => navigate('/settings');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDP');
    localStorage.removeItem('address');

    setTimeout(() => {
      window.location.href = '/';
    }, 0);
  };
   VerifyToken();
  const handleViewLoginPage = () => setIsLogoutDialogOpen(true);

  const handleConfirmLogout = (confirm) => {
    setIsLogoutDialogOpen(false);
    if (confirm) handleLogout();
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  // Memoize the fetchCount function
  const fetchCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/getCartCount`, {
        headers: { token }
      });
      
      const newCount = response.data.totalCartCount;
      console.log("ii", newCount);
      updateCartCount(newCount);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  }, [updateCartCount]);

  // Effect for fetching cart count and initializing from localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Initialize from localStorage only on first mount
      const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
      if (storedUserDP.cartCount !== undefined) {
        updateCartCount(storedUserDP.cartCount);
      }
      
      // Initial fetch
      fetchCount();
    }
  }, [fetchCount, updateCartCount]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_URL, {
      transports: ['websocket', 'polling'] 
    });
    socket.on('connect', () => {
      console.log(`Connected to server with socket id: ${socket.id}`);
      socket.emit('message', 'Hello, server!');
    });
    socket.on('cartUpdated', (data) => {
        console.log('Cart updated:', data);
        fetchCount();
      });
 

    socket.on('message', (data) => {
      console.log(`Message from server: ${data}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-teal-800 text-white shadow-md py-4 px-6 z-50 flex items-center justify-between">
        <div className="flex items-center">
          <UserCircleIcon className="h-9 w-9 cursor-pointer" onClick={toggleSidenav} />
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-white text-center flex-1">
          {activeTab === 'corporate' ? 'CORPORATE MEALS' : 'EVENTS MENU'}
        </h2>

        {activeTab === 'corporate' && (
          <div className="flex items-center relative">
            <Link to="/cart">
              <ShoppingCartIcon className="h-8 w-8 cursor-pointer" onClick={handleViewCart} />
            </Link>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </div>
        )}
        {activeTab === 'events' && <div className="w-6"></div>}
      </header>

      {isSidenavOpen && <div className="fixed inset-0 bg-black opacity-50 z-40 blur-sm"></div>}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidenavOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 overflow-y-auto`}
      >
        <div className="p-4 bg-teal-800 text-white">
          <div className="flex justify-end p-4">
            <button className="text-black" onClick={toggleSidenav}>
              ✕
            </button>
          </div>

          {storedUserDP.picture ? (
            <img
              src={storedUserDP.picture}
              alt="Profile"
              className="rounded-full w-16 h-16 mx-auto object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="rounded-full w-16 h-16 mx-auto bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
              {getInitials(storedUserDP.name)}
            </div>
          )}

          <h3 className="text-center mt-2">{storedUserDP.name || 'Hello'}</h3>
          {storedUserDP.phone && <p className="text-center">{storedUserDP.phone}</p>}
          <p className="text-center">{storedUserDP.email || 'Email Address'}</p>
        </div>

        <ul className="p-2 space-y-2">
          <Link to="/orders">
            <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewOrders}>
              My Orders
            </li>
          </Link>
          <Link to="/address">
            <li className="p-2 border-b border-gray-200 cursor-pointer">Address</li>
          </Link>
          <li
            className="p-2 border-b border-gray-200 cursor-pointer"
            onClick={handleViewWalletPage}
          >
            Wallet
          </li>
          <li
            className="p-2 border-b border-gray-200 cursor-pointer"
            onClick={handleViewContactPage}
          >
            Contact Us
          </li>
          <li
            className="p-2 border-b border-gray-200 cursor-pointer"
            onClick={handleViewChangePassword}
          >
            Settings
          </li>
          <li
            className="p-2 border-b border-gray-200 cursor-pointer"
            onClick={handleViewLoginPage}
          >
            LogOut &rarr;
          </li>
        </ul>
      </div>

      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Do you really want to Logout?</h2>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-teal-800 text-white py-2 px-4 rounded"
                onClick={() => handleConfirmLogout(true)}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={() => handleConfirmLogout(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-20 mt-5">
        <Body isSidenavOpen={isSidenavOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </>
  );
};

export default Header;