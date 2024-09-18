import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleLogin } from '@react-oauth/google';
import React, { useContext, useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // carousel styles
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrected import for jwt-decode
import SignUpForm from './SignUpForm';
import { Login_customer, Login_forgotPassword, Login_google_auth } from '../../services/context_state_management/actions/action.js';
import { SignInContext } from '../../services/contexts/SignInContext.js';
import axios from 'axios';

const SignInForm = ({ onSignIn }) => {
  const { state, dispatch } = useContext(SignInContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [userProfile, setUserProfile] = useState(null); // for storing Google user profile
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setError('');
    try {
      console.log('handle otp called');
      await axios.post('http://localhost:4000/customer/checkCustomerOtp', { email });
      const response = await axios.post('http://localhost:4000/customer/send-otp', { email });
      setError(response.data.message);
      setForgotPasswordStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      const response = await axios.post('http://localhost:4000/customer/verify-otp', { email, otp });
      setError(response.data.message);
      setForgotPasswordStep(3);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while verifying OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (forgotPassword) {
        if (forgotPasswordStep === 1) {
          await handleSendOtp();
        } else if (forgotPasswordStep === 2) {
          await handleVerifyOtp();
        } else if (forgotPasswordStep === 3) {
          if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
          }
          await Login_forgotPassword(email, password, confirmPassword, dispatch);
        }
      } else {
        await Login_customer(email, password, dispatch);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An unexpected error occurred');
    }
  };

  useEffect(() => {
    if (state.data && !state.isError) {
      onSignIn(state.data);
      navigate('#');
    } else if (state.isError) {
      setError(state.errorMessage);
    }
  }, [state, onSignIn, navigate]);
  const handleSignUp = ( isGoogleLogin ) =>{
    console.log("in signup: ",isGoogleLogin)
  setIsGoogleLogin(isGoogleLogin);
  }
  useEffect(() => {
    
    if (state.data && !state.isError) {
      console.log("in useeffect: ",isGoogleLogin)
      onSignIn(state.data, isGoogleLogin); // Call onSignIn with the token
      console.log('signed in successfully');
      navigate('/home')
    }
  }, [state.data, state.isError, onSignIn, navigate]);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const tokenId = credentialResponse.credential;
    // Decode the Google token to get user info
    const decodedToken = jwtDecode(tokenId);
    console.log(decodedToken);
    const { name , email } = decodedToken;
    setEmail(email);
    setUserProfile(decodedToken);
  //   // Store the Google token in localStorage
    localStorage.setItem('accessToken', tokenId);

    console.log(name);
    console.log(email);
    const response= await Login_google_auth(name, email, tokenId,dispatch);
    setIsGoogleLogin(true);
   
};

  const handleGoogleLoginError = () => {
    console.log('Google Login Failed');
  };

  const handleImageError = (event) => {
    console.error(`Error loading image: ${event.target.src}`);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
    setForgotPasswordStep(1);
  };

  const toggleForgotPassword = () => {
    setForgotPassword(!forgotPassword);
    resetForm();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {showSignUpModal ? (
        <SignUpForm 
          closeModal={() => setShowSignUpModal(false)}
          onSignUp={handleSignUp}
        />
      ) : (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="h-40 bg-blue-300 border-back-200 mb-4 overflow-hidden">
            <Carousel 
              autoPlay 
              infiniteLoop 
              showThumbs={false} 
              showStatus={false}
              interval={3000}
            >
              {[1, 2, 3].map((_, index) => (
                <div key={index}>
                  <img 
                    src={`https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400`} 
                    alt={`Food Image ${index + 1}`} 
                    className="object-cover h-40 w-full"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </Carousel>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">CaterOrange</h2>

          <form onSubmit={handleSubmit}>
            {!forgotPassword && (
              <>
                <div className="mb-4">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </button>
                </div>
              </>
            )}

            {forgotPassword && (
              <>
                {forgotPasswordStep === 1 && (
                  <div className="mb-4">
                    <input
                      type="email"
                      id="forgot-email"
                      placeholder="Enter email for OTP"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                )}

                {forgotPasswordStep === 2 && (
                  <div className="mb-4">
                    <input
                      type="text"
                      id="otp"
                      placeholder="Enter OTP"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                )}

                {forgotPasswordStep === 3 && (
                  <>
                    <div className="mb-4 relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="new-password"
                        placeholder="Enter New Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                      </button>
                    </div>
                    <div className="mb-4 relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirm-password"
                        placeholder="Confirm New Password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {forgotPassword ? (forgotPasswordStep === 3 ? 'Reset Password' : 'Next') : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between">
            <button
              className="text-sm text-indigo-500 hover:underline focus:outline-none"
              onClick={toggleForgotPassword}
            >
              {forgotPassword ? 'Back to Sign In' : 'Forgot Password?'}
            </button>
            <button
              className="text-sm text-indigo-500 hover:underline focus:outline-none"
              onClick={() => setShowSignUpModal(true)}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInForm;
