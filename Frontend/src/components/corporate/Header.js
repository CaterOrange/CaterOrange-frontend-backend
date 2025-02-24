import { ShoppingCartIcon } from '@heroicons/react/outline';
import {UserCircleIcon} from '@heroicons/react/solid';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../services/contexts/CartContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import Body from './Body';
import './css/styles.css';
import { VerifyToken } from '../../MiddleWare/verifyToken';
import AddressList from '../Address/AddressList';
import AddressForm from '../events/AddressForm';
import Footer from './Footer';

const Header = ({ user }) => {
  const { cartCount, updateCartCount } = useCart();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('corporate');
  const sidenavRef = useRef(null);
  const navigate = useNavigate();
  const isInitialMount = useRef(true);
  const [addresses, setAddresses] = useState([]);
  const [showAddresses, setShowAddresses] = useState(false);
  const addressesRef = useRef(null);
  const [showAddressForm, setShowAddressForm] = useState(false);


  const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};

  const toggleSidenav = () => {
    setIsSidenavOpen(!isSidenavOpen);
  };


  useEffect(() => {
    function handleClickOutside(event) {
      if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
        setIsSidenavOpen(false);
      }
    }

    if (isSidenavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidenavOpen]);
  const handleViewCart = () => navigate('/cart');
  const handleViewOrders = () => navigate('/orders');
  const handleViewContactPage = () => navigate('/contact');
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

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getalladdresses`, {
        headers: { token }
      });
      
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleViewAddresses = () => {
    navigate('/addresses');
    setIsSidenavOpen(false); // Close the sidenav when navigating
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (addressesRef.current && !addressesRef.current.contains(event.target)) {
        setShowAddresses(false);
      }
    }

    if (showAddresses) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddresses]);


  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
      if (storedUserDP.cartCount !== undefined) {
        updateCartCount(storedUserDP.cartCount);
      }
      
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
   <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-50">
  <div className="flex items-center justify-between relative">
    <div className="absolute left-0">
      <UserCircleIcon className="h-9 w-9 cursor-pointer" onClick={toggleSidenav} />
    </div>

    <div className="flex-1 flex justify-center">
      <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
        {activeTab === 'corporate' ? 'CORPORATE MEALS' : 'EVENTS MENU'}
      </h2>
    </div>

    <div className="absolute right-0 flex items-center space-x-2 md:space-x-4">
      {activeTab === 'corporate' && (
        <>
          <Link to="/orders">
            <button className="hidden md:block text-white py-1 px-2 md:px-4 rounded-lg shadow-md hover:bg-gray-100 hover:text-teal-500 transition-all text-sm md:text-base font-serif">
              My Orders
            </button>
          </Link>
          <Link to="/contact">
            <button className="hidden md:block text-white py-1 px-2 md:px-4 rounded-lg shadow-md hover:bg-gray-100 hover:text-teal-500 transition-all text-sm md:text-base font-serif">
              Contact Us
            </button>
          </Link>
          <div className="relative">
            <Link to="/cart">
              <ShoppingCartIcon className="h-6 w-6 md:h-8 md:w-8 cursor-pointer" onClick={handleViewCart} />
            </Link>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </div>
        </>
      )}
      {activeTab === 'events' && <div className="w-6"></div>}
    </div>
  </div>
</header>
      {isSidenavOpen && <div className="fixed inset-0 bg-black opacity-50 z-40 blur-sm"></div>}

      <div
      ref={sidenavRef}
        className={`fixed top-0 left-0 h-full w-70 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidenavOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 overflow-y-auto`}
      >
        <div className="p-4 bg-teal-800 text-white">
          <div className="flex justify-end p-4">
            <button className="text-white text-2xl" onClick={toggleSidenav}>
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
            <li className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors" onClick={handleViewOrders}>
              My Orders
            </li>
          </Link>
         
         
          <li
            className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
            onClick={handleViewContactPage}
          >
            Contact Us
          </li>
          
          <li
            className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
            onClick={handleViewChangePassword}
          >
            Settings
          </li>
          <li
                className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
                onClick={handleViewLoginPage}
          >
            LogOut
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
      {showAddresses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={addressesRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">My Addresses</h2>
              <button
                onClick={() => setShowAddresses(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {addresses.length > 0 ? (
                addresses.map((address, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg mb-3 hover:border-teal-500"
                  >
                    <p className="font-medium text-gray-800">{address.name}</p>
                    <p className="text-gray-600">{address.street}</p>
                    <p className="text-gray-600">{address.city}, {address.state} {address.pincode}</p>
                    <p className="text-gray-600">{address.phone}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No addresses found</p>
              )}
            </div>
            
          </div>
        </div>
      )}

      <div className="pt-20 mt-7">
        <Body isSidenavOpen={isSidenavOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {showAddressForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <AddressForm
      onClose={() => setShowAddressForm(false)}
      onAddressAdded={() => {
        fetchAddresses();
        setShowAddressForm(false);
      }}
    />
    
  </div>

)}
      <Footer/>
    </>
  );
};

export default Header;