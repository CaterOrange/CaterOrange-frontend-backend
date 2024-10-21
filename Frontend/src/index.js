import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="636281200529-dl48re3g9q9221e7dcruuqls3f46v311.apps.googleusercontent.com">
      <App/>
      
      </GoogleOAuthProvider>
  </React.StrictMode>
);