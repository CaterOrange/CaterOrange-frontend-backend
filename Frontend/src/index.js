import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import AddressForm from './components/Address/AddressForm';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="239233180210-945oqr7onmtpopgd4c1vuu6m3eaho01e.apps.googleusercontent.com">
      <App/>
      {/* <AddressForm/> */}
      
      </GoogleOAuthProvider>
  </React.StrictMode>
);