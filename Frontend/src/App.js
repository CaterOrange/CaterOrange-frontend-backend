import SignInForm from "./components/customer/SignInForm.js";
import { SignInProvider } from './services/contexts/SignInContext.js';
import { SignUpProvider } from './services/contexts/SignUpContext.js';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from "./components/corporate/Home.js";
import Corporatecart from './components/corporate/Cart';
import StoreProvider from "./services/contexts/store.js";
import CorporateOrders from "./components/corporate/CorporateOrders.js";
import SuccessPage from "./components/corporate/payments/SuccessPage.js";
import FailurePage from "./components/corporate/payments/Failurepage.js";
import PendingPage from "./components/corporate/payments/PendingPage.js";

function App() {
  const [user, setUser] = useState(null);
  const handleSignIn = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      setUser({ token });
    }
  };
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
            <Route
            path="/cart"
            element={<Corporatecart/>}/>
             <Route
            path="/orders"
            element={<CorporateOrders/>}/>
              <Route path="/success" element={<SuccessPage />} />
        <Route path="/failure" element={<FailurePage />} />
        <Route path="/pending" element={<PendingPage/>}/>
          </Routes>
        </Router>
      </SignUpProvider>
    </SignInProvider>
    </StoreProvider>
  );
}

export default App;