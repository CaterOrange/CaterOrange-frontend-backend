import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Corporatecart from './components/corporate/Cart';
import CorporateOrders from './components/corporate/CorporateOrders.js';
import Home from './components/corporate/Home.js';
import ESuccessPage from './components/corporate/payments/ESuccessPage.js';
import FailurePage from './components/corporate/payments/Failurepage.js';
import PendingPage from './components/corporate/payments/PendingPage.js';
import SuccessPage from './components/corporate/payments/SuccessPage.js';
import SignInForm from './components/customer/SignInForm.js';
import Menu from './components/events/Menu.js';
import OrderDashboard from './components/events/myorders.js';
import { SignInProvider } from './services/contexts/SignInContext.js';
import { SignUpProvider } from './services/contexts/SignUpContext.js';
import StoreProvider from './services/contexts/store.js';
import ShowAddress from './components/Address/ShowAddress.js';
import { AboutUs } from './components/Home/AboutUs.js';
import { Wallet } from './components/Home/Wallet.js';
import { Settings } from './components/Home/Settings.js';
import HomePage from './components/HomePage.js';
import ChangeAddress from './components/events/changeAddress.js';
import { useCart } from './services/contexts/CartContext.js';
import ProtectedRoute from './components/corporate/protectedRoute.js';  // Import the ProtectedRoute component
import Razorpay from './components/rasorpay.js';
import NotFound from './components/Home/notFound.js';
import AddressList from './components/Address/AddressList.js';


import mixpanel from "mixpanel-browser";

mixpanel.init("cb19042cf789f9c44e059bd4be6f2c5d", { debug: true }); // Replace with your token


function App() {
  const [user, setUser] = useState(null);
  const { cartCount } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  const handleSignIn = async (token, isGoogleLogin) => {
    if (token) {
      localStorage.setItem('token', token);
      setUser({ token });
    }

    if (!isGoogleLogin) {
      try {
        console.log('in manual', token);
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/info`, {
          headers: { token }
        });
        const profile = {
          name: response.data.customer_name,
          phone: response.data.customer_phonenumber,
          email: response.data.customer_email,
          cartCount: cartCount || 0
        };

        localStorage.setItem('userDP', JSON.stringify(profile));
        setUser({ token, ...profile });
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleSignIn(token, false);
    }
    setIsLoading(false);
  }, []);


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StoreProvider>
      <SignInProvider>
        <SignUpProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/home" /> : <SignInForm onSignIn={handleSignIn} />}
              />
              {/* Protected Routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home user={user} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <ProtectedRoute>
                    <Menu />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/changeaddress"
                element={
                  <ProtectedRoute>
                    <ChangeAddress />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Corporatecart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <CorporateOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/success"
                element={
                  <ProtectedRoute>
                    <SuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homepage"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/Esuccess"
                element={
                  <ProtectedRoute>
                    <ESuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/eventorders"
                element={
                  <ProtectedRoute>
                    <OrderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/failure"
                element={
                  <ProtectedRoute>
                    <FailurePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pending"
                element={
                  <ProtectedRoute>
                    <PendingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/address"
                element={
                  <ProtectedRoute>
                    <ShowAddress />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <ProtectedRoute>
                    <AboutUs />
                  </ProtectedRoute>
                }
              />
              <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <AddressList />
            </ProtectedRoute>
          }
        />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/razorpay"
                element={
                  // <ProtectedRoute>
                    <Razorpay />
                  // {/* </ProtectedRoute>     */}
                }
              />
              <Route path="*" element={<NotFound />} />

            </Routes>
          </Router>
        </SignUpProvider>
      </SignInProvider>
    </StoreProvider>
  );
}

export default App;