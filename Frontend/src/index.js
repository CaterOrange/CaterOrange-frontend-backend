import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
   
    <GoogleOAuthProvider clientId="239233180210-t0m8gf26n364e7m3ono4ij6lhp9rld9v.apps.googleusercontent.com">
      <App/>
      
      </GoogleOAuthProvider>
  </React.StrictMode>
);