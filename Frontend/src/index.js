import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import AddressForm from './components/Address/AddressForm';
import MapAddressSelector from './components/Maps/MapAddresSelector';
// import AdminApp from './AdminApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="99210557264-qdl18r8dfjs8ckent7f2387l52pjui65.apps.googleusercontent.com">
      {/* <App/> */}
      <AddressForm/>
      {/* <MapAddressSelector/> */}
      </GoogleOAuthProvider>
  </React.StrictMode>
);