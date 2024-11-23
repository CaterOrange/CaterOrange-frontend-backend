import axios from 'axios';
import React, { useState ,useEffect} from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Corporatecart from './components/corporate/Cart';
import CorporateOrders from "./components/corporate/CorporateOrders.js";
import Home from "./components/corporate/Home.js";
import ESuccessPage from "./components/corporate/payments/ESuccessPage.js";
import FailurePage from "./components/corporate/payments/Failurepage.js";
import PendingPage from "./components/corporate/payments/PendingPage.js";
import SuccessPage from "./components/corporate/payments/SuccessPage.js";
import SignInForm from "./components/customer/SignInForm.js";
import Menu from "./components/events/Menu.js";
import OrderDashboard from "./components/events/myorders.js";
import { SignInProvider } from './services/contexts/SignInContext.js';
import { SignUpProvider } from './services/contexts/SignUpContext.js';
import StoreProvider from "./services/contexts/store.js";
import ShowAddress from './components/Address/ShowAddress.js';
import { AboutUs } from './components/Home/AboutUs.js';
import { Wallet } from './components/Home/Wallet.js';
import { Settings } from './components/Home/Settings.js';


//import AddressForm from "./components/events/AddressForm.js";
import HomePage from "./components/HomePage.js";
import ChangeAddress from "./components/events/changeAddress.js";
import { useCart } from './services/contexts/CartContext.js';


function App() {
  const [user, setUser] = useState(null);
  const { cartCount } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn =async (token,isGoogleLogin) => {
    if (token) {
      localStorage.setItem('token', token);
      setUser({ token });
    }

    if (!isGoogleLogin) {
      try {
        console.log('in manual',token)
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

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleSignIn(token, false); // Not Google Login, use manual login process
    }
    setIsLoading(false); // After token check is complete, stop loading
  }, []);

  // If loading, show nothing or a loading spinner
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
              element={
                user ? <Navigate to="/home" /> : <SignInForm onSignIn={handleSignIn} />
                
              }
            />
            <Route path="/home" element={<Home user={user}/>} />
            <Route path="/menu" element={<Menu />}/>
            <Route path="/changeaddress" element={<ChangeAddress/>}/>
            <Route
            path="/cart"
            element={<Corporatecart/>}/>
             <Route
            path="/orders" element={<CorporateOrders/>}/>
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/Esuccess" element={<ESuccessPage />} />
              <Route path="/eventorders" element={<OrderDashboard/>} />
              <Route path="/failure" element={<FailurePage />} />
              <Route path="/pending" element={<PendingPage/>}/>
              <Route path="/address" element={<ShowAddress />} />
              <Route path="/contact" element={<AboutUs />} />
              <Route path="/wallet" element={<Wallet />}/>
              <Route path="/settings" element={<Settings />}/>
          </Routes>
        </Router>
      
      </SignUpProvider>
    </SignInProvider>
    </StoreProvider>
  );
}

export default App;