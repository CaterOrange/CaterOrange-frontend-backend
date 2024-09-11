import SignInForm from "./components/customer/SignInForm";
import { SignInProvider } from './services/contexts/SignInContext.js';
import { SignUpProvider } from './services/contexts/SignUpContext.js';
import React, { useEffect, useState } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);

  const handleSignIn = (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
      setUser({ token });
    }
  };

  return (
    <SignInProvider>
      <SignUpProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                user ? <Navigate to="/dashboard" /> : <SignInForm onSignIn={handleSignIn} />
              }
            />
            {/* Add additional routes here as needed */}
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </Router>
      </SignUpProvider>
    </SignInProvider>
  );
}

export default App;
