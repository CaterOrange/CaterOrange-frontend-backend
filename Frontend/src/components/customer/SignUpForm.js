import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import React, { useContext, useState, useEffect } from 'react';
import SignInForm from './SignInForm';
import axios from 'axios';
import { SignUpContext } from '../../services/contexts/SignUpContext';
import { SignUp_customer, Login_google_auth } from '../../services/context_state_management/actions/action';

const SignUpForm = ({ closeModal, onSignUp }) => {
  const { state, dispatch } = useContext(SignUpContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log(name, phone, email, password, confirmPassword);
    await SignUp_customer(name, phone, email, password, confirmPassword, dispatch);
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const tokenId = credentialResponse.credential;
    const decodedToken = jwtDecode(tokenId);
    const { name, email, picture } = decodedToken;

    // const tokens=await axios.post(`http://localhost:4000/customer/google_auth`,{name,email});

    // const token=tokens.token
    setEmail(email);
    // localStorage.setItem('token', tokenId);
    const userData={
      name:name,
      email: email,
      picture: picture
    }
    localStorage.setItem('userData', JSON.stringify(userData));
    await Login_google_auth(name, email, tokenId, dispatch);
    onSignUp(tokenId, true);
  };

  const handleSignIn = (token, isGoogle) => {
    onSignUp(token, isGoogle);
  };

  useEffect(() => {
    if (state.data && !state.isError) {
      onSignUp(state.data, false);
      console.log('signed up successfully',state.data);
    }
  }, [state.data, state.isError, onSignUp]);

  const handleGoogleLoginError = () => {
    console.log('Google Login Failed');
  };

  const handleImageError = (event) => {
    console.error(`Error loading image: ${event.target.src}`);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
      {showSignInModal ? (
        <SignInForm closeModal={() => setShowSignInModal(false)} onSignIn={handleSignIn} />
      ) : (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="h-40 bg-blue-300 border-back-200 mb-4 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
              alt="Food Image" 
              className="object-cover h-40 w-full"
              onError={handleImageError}
            />
          </div>

          <h2 className="text-2xl font-bold mb-6 text-black-600 text-center">Create an account</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <input
                type="text"
                id="name"
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
              <input
                type="text"
                id="phone"
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
              />
            </div>
            <div className="mb-4 mt-4">
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
              />
            </div>
            <div className="flex space-x-4">
              <div className='relative w-full'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            
            <button 
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded w-full hover:bg-blue-700 mt-4"
              type="submit"
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
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