import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// import AdminApp from './AdminApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="99210557264-qdl18r8dfjs8ckent7f2387l52pjui65.apps.googleusercontent.com">
      <App/>
      </GoogleOAuthProvider>
  </React.StrictMode>
);