import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import React, { useContext, useState } from 'react';
import SignInForm from './SignInForm';
import { SignUpContext } from '../../services/contexts/SignUpContext';
import { SignUp_customer } from '../../services/context_state_management/actions/action';


const SignUpForm = ({ closeModal }) => {
  const { state, dispatch } = useContext(SignUpContext);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
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
   
  };
  const handleSignIn = (token) => {
    if (token) {
        localStorage.setItem('accessToken', token);
       
    }
};
const handleGoogleLoginSuccess = async (credentialResponse) => {
  const tokenId = credentialResponse.credential;
  const decodedToken = jwtDecode(tokenId);
  const { name, email } = decodedToken;

  setEmail(email);
  setUserProfile(decodedToken);
  localStorage.setItem('accessToken', tokenId);

  await Login_google_auth(name, email, tokenId, dispatch);
};

const handleGoogleLoginError = () => {
  console.log('Google Login Failed');
};

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gray-100 relative">
       {showSignInModal ? (
        <SignInForm closeModal={() => setShowSignInModal(false)} onSignIn={handleSignIn}/>
      ) : (
      <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-orange-600 text-center">Create an account</h2>
        
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                className="h-4 w-4 text-orange-700 focus:ring-orange-600 border-gray-300 rounded mt-4"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 mt-4">
                Remember me
              </label>
            </div>
          </div>
          <button 
            className="bg-orange-600 text-white font-bold py-2 px-4 rounded w-full hover:bg-orange-700"
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
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
              <div className="mt-4">
              <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
              </div>
            </div>
          </div>
          <center>
          <p className="text-gray-600 mt-4 ">
            Do you have an account?{' '}
            <button
              type="button"
              className="text-orange-600 ml-1"
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