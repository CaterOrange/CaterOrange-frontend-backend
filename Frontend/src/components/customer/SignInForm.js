import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleLogin } from '@react-oauth/google';
import React, { useContext, useEffect, useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // carousel styles
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode for decoding Google tokens
import SignUpForm from './SignUpForm';
import { Login_customer, Login_forgotPassword, Login_google_auth } from '../../services/context_state_management/actions/action.js';
import { SignInContext } from '../../services/contexts/SignInContext.js';

const SignInForm = ({ onSignIn }) => {
  const { state, dispatch } = useContext(SignInContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // for the confirm password field
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false); // to toggle forgot password form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState(null); // for storing Google user profile
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forgotPassword) {
      await Login_customer(email, password, dispatch);
    } else {
      await Login_forgotPassword(email, password, confirmPassword, dispatch);
    }
  };

  useEffect(() => {
    if (state.data && !state.isError) {
      onSignIn(state.data); // Call onSignIn with the token
      console.log('signed in successfully');
      navigate('#'); // Redirect to the dashboard after successful sign-in
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
    localStorage.setItem('accessToken', tokenId);
    console.log(name);
    console.log(email);
    const response= await Login_google_auth(name, email, tokenId, dispatch);
};
  const handleGoogleLoginError = () => {
    console.log('Google Login Failed');
  };
  const handleImageError = (event) => {
    console.error(`Error loading image: ${event.target.src}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {showSignUpModal ? (
        <SignUpForm closeModal={() => setShowSignUpModal(false)} />
      ) : (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          {/* Carousel Section */}
          <div className="h-40 bg-blue-300 border-back-200 mb-4 overflow-hidden">
            <Carousel 
              autoPlay 
              infiniteLoop 
              showThumbs={false} 
              showStatus={false}
              interval={3000}
            >
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
                  alt="Food Image 1" 
                  className="object-cover h-40 w-full"
                  onError={handleImageError}
                />
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
                  alt="Food Image 2" 
                  className="object-cover h-40 w-full"
                  onError={handleImageError}
                />
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
                  alt="Food Image 3" 
                  className="object-cover h-40 w-full"
                  onError={handleImageError}
                />
              </div>
            </Carousel>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center">CaterOrange</h2>
          
          <form onSubmit={handleSubmit}>
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

            {/* If forgot password is clicked, show password and confirm password fields */}
            {!forgotPassword ? (
              <>
                <div className="mb-4 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Enter Password"
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

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)} // Show forgot password fields
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            ) : (
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

            <div className="mb-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-indigo-700"
              >
                {forgotPassword ? 'Reset Password' : 'Sign In'}
              </button>
            </div>
            {state.isError && <p className="text-red-500 mt-2">{state.errorMessage}</p>}
          </form>

          <div className="mb-4 text-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>

          <div className="text-center">
            <p className="text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => setShowSignUpModal(true)}
                className="text-indigo-600 hover:text-indigo-500 font-bold"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInForm;