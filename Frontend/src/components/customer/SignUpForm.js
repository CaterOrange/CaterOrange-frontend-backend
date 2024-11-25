
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import React, { useContext, useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // carousel styles
import { Login_google_auth, SignUp_customer } from '../../services/context_state_management/actions/action';
import { SignUpContext } from '../../services/contexts/SignUpContext';
import SignInForm from './SignInForm';
import { useCart } from '../../services/contexts/CartContext';

const images = [
  "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727161124/Beige_and_Orange_Minimalist_Feminine_Fashion_Designer_Facebook_Cover_1_qnd0uz.png",
  "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727104667/WhatsApp_Image_2024-09-23_at_20.47.25_gu19jf.jpg",
  "https://cdn.leonardo.ai/users/8b9fa60c-fc98-4afb-b569-223446336c31/generations/f5b61c13-0d39-4b94-8f86-f9c748dae078/Leonardo_Phoenix_Vibrant_orangehued_events_menu_image_featurin_0.jpg"
];

const SignUpForm = ({ closeModal, onSignUp }) => {
  const { cartCount } = useCart();
  const { state, dispatch } = useContext(SignUpContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
        if (value.trim() === '') {
          error = '*Name is required*';
        } else if (value.length < 3) {
          error = '*Name must be at least 3 characters long*';
        }
        break;
      case 'phone':
        const phoneRegex = /^\d{10}$/;  // Assumes a 10-digit phone number
        if (value.trim() === '') {
          error = '*Phone number is required*';
        }
        else if (value && !phoneRegex.test(value)) {
          error = '*Invalid phone number format it must be 10-digit format*';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value.trim() === '') {
          error = '*Email is required*';
        }
        else if (!emailRegex.test(value)) {
          error = '*Invalid email format*';
        }
        break;
      case 'password':
        if (value.trim() === '') {
          error = '*Password is required*';
        }
        else if (value.length < 8 ) {
          error = '*Password must be atleast 8 characters long with uppercase ,lowercase letters and numbers*';
        }
        break;
      case 'confirmPassword':
        if (value !== password) {
          error = '*Passwords do not match*';
        }
        break;
      default:
        break;
    }
    setFieldErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleBlur = (field) => {
    validateField(field, field === 'confirmPassword' ? confirmPassword : eval(field));
  };

  const handleChange = (field, value) => {
    switch(field) {
      case 'name':
        setName(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
    validateField(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate all fields
    ['name', 'phone', 'email', 'password', 'confirmPassword'].forEach(field => {
      if (!validateField(field, eval(field))) {
        isValid = false;
      }
    });

    if (isValid) {
      try {
        await SignUp_customer(name, phone, email, password, confirmPassword, dispatch);
      } catch (error) {
        console.error("Signup error:", error);
        
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          // Update field errors based on the API response
          const newFieldErrors = { ...fieldErrors };
          let fieldToClear = null;
          if (errorData.email) {
            newFieldErrors.email = errorData.email;
            fieldToClear = 'email';
          } else if (errorData.phone) {
            newFieldErrors.phone = errorData.phone;
            fieldToClear = 'phone';
          } else if (errorData.name) {
            newFieldErrors.name = errorData.name;
            fieldToClear = 'name';
          } else if (errorData.password) {
            newFieldErrors.password = errorData.password;
            fieldToClear = 'password';
          }

          setFieldErrors(newFieldErrors);

          // Clear only the field that caused the error
          if (fieldToClear) {
            switch(fieldToClear) {
              case 'email':
                setEmail('');
                break;
              case 'phone':
                setPhone('');
                break;
              case 'name':
                setName('');
                break;
              case 'password':
                setPassword('');
                setConfirmPassword('');
                break;
              default:
                break;
            }
          }
        } else {
          // If the error structure is unknown, set a general error message
          setFieldErrors(prev => ({
            ...prev,
            general: 'An error occurred during signup. Please try again.'
          }));
        }
      }
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const tokenId = credentialResponse.credential;
    // Decode the Google token to get user info
    const decodedToken = jwtDecode(tokenId);
    console.log(decodedToken);
    const { name , email, picture } = decodedToken;
    setEmail(email);
    setUserProfile(decodedToken);
    console.log(name);
    console.log(email);
    const userDP = {
      name: name,
      email: email,
      picture: picture,
      cartCount: cartCount || 0 // Initialize cart count to 0 or use an existing value
    };
    localStorage.setItem('userDP', JSON.stringify(userDP));
    
    const response= await Login_google_auth(name, email, tokenId,dispatch);
    console.log(response)
    onSignUp(tokenId, true);
  };

  const handleSignIn = (token, isGoogle) => {
    onSignUp(token, isGoogle);
  };

  useEffect(() => {
    if (state.data && !state.isError) {
      onSignUp(state.data, false);
      console.log('signed up successfully', state.data);
    }
  }, [state.data, state.isError, onSignUp]);

  const handleGoogleLoginError = () => {
    console.log('Google Login Failed');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {showSignInModal ? (
        <SignInForm closeModal={() => setShowSignInModal(false)} onSignIn={handleSignIn} />
      ) : (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="h-40 bg-blue-300 border-back-200 mb-4 overflow-hidden">
            <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} interval={3000}>
              {images.map((src, index) => (
                <div key={index}>
                  <img
                    src={src}
                    alt={`Carousel Image ${index + 1}`}
                    className="object-cover h-40 w-full max-w-[120%]"
                  />
                </div>
              ))}
            </Carousel>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-black-600 text-center">Create an account</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <input
                  type="text"
                  id="name"
                  className={`w-full px-4 py-3 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  value={name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="Name"
                  required
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>
              <div className="w-1/2">
                <input
                  type="tel"
                  id="phone"
                  className={`w-full px-4 py-3 border ${fieldErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  value={phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="Phone Number"
                />
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
              </div>
            </div>
            <div className="mb-4 mt-4">
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                required
                placeholder="Email"
              />
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>
            <div className="flex space-x-4">
              <div className='relative w-full'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`w-full px-4 py-3 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </button>
              </div>
              <div className='relative w-full'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`w-full px-4 py-3 border ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  value={confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  required
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                </button>
              </div>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            
            <button 
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-700 mt-4"
              type="submit"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
            {fieldErrors.general && <p className="text-red-500 text-sm mt-2">{fieldErrors.general}</p>}
            {state.isError && <p className="text-red-500 mt-2">{state.errorMessage}</p>}
          </form>
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="mt-4 flex items-center justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                />
              </div>
            </div>
          </div>
          <center>
            <p className="text-gray-600 mt-4">
              Do you have an account?{' '}
              <button
                type="button"
                className="text-blue-600 ml-1"
                onClick={() => setShowSignInModal(true)}
              >
                Login
              </button>
            </p>
          </center>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;
