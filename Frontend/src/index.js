import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="239233180210-19aiqeqla9u3v48hs1pojqghck03jefk.apps.googleusercontent.com">
      <App/>
      
      </GoogleOAuthProvider>
  </React.StrictMode>
);