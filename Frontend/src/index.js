import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="230275199603-3a6c8rmdomfrsr5mdhdl8pol04ubo44s.apps.googleusercontent.com">
      <App/>
      </GoogleOAuthProvider>
  </React.StrictMode>
);