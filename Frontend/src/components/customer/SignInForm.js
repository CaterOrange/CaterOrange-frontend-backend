// import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { GoogleLogin } from '@react-oauth/google';
// import React, { useContext, useEffect, useState } from 'react';
// import { Carousel } from 'react-responsive-carousel';
// import "react-responsive-carousel/lib/styles/carousel.min.css"; // carousel styles
// import { useNavigate } from 'react-router-dom';
// import {jwtDecode} from 'jwt-decode'; // Import jwt-decode for decoding Google tokens
// import SignUpForm from './SignUpForm';
// import { StoreContext } from '../../services/contexts/store';
// import { Login_customer,Login_forgotPassword, Login_google_auth } from '../../services/context_state_management/actions/action';

// const SignInForm = ({ onSignIn }) => {
//   const { state, dispatch } = useContext(StoreContext);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState(''); // for the confirm password field
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showSignUpModal, setShowSignUpModal] = useState(false);
//   const [forgotPassword, setForgotPassword] = useState(false); // to toggle forgot password form
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [userProfile, setUserProfile] = useState(null); // for storing Google user profile
//   const [isGoogleLogin, setIsGoogleLogin] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!forgotPassword) {
//       await Login_customer(email, password, dispatch);
//     } else {
//       await Login_forgotPassword(email, password, confirmPassword, dispatch);
//     }
//   };


//   const handleSignUp = ( isGoogleLogin ) =>{
//     console.log("in signup: ",isGoogleLogin)
//   setIsGoogleLogin(isGoogleLogin);
//   }
//   useEffect(() => {
    
//     if (state.data && !state.isError) {
//       console.log("in useeffect: ",isGoogleLogin)
//       onSignIn(state.data, isGoogleLogin); // Call onSignIn with the token
//       console.log('signed in successfully');
//       navigate('/home')
//     }
//   }, [state.data, state.isError, onSignIn, navigate]);

//   const handleGoogleLoginSuccess = async (credentialResponse) => {
//     const tokenId = credentialResponse.credential;

//     // Decode the Google token to get user info
//     const decodedToken = jwtDecode(tokenId);
//     console.log(decodedToken);
//     const { name , email } = decodedToken;
    
//     setEmail(email);
  
//     setUserProfile(decodedToken);

//   //   // Store the Google token in localStorage
//     localStorage.setItem('accessToken', tokenId);

//     console.log(name);
//     console.log(email);


//     const response= await Login_google_auth(name, email, dispatch);
//     setIsGoogleLogin(true);
   
// };

//   const handleGoogleLoginError = () => {
//     console.log('Google Login Failed');
//   };

//   const handleImageError = (event) => {
//     console.error(`Error loading image: ${event.target.src}`);
//   };


//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       {showSignUpModal ? (
//         <SignUpForm closeModal={() => setShowSignUpModal(false)} onSignUp={handleSignUp} />
//       ) : (
//         <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
//           {/* Carousel Section */}
//           <div className="h-40 bg-blue-300 border-back-200 mb-4 overflow-hidden">
//             <Carousel 
//               autoPlay 
//               infiniteLoop 
//               showThumbs={false} 
//               showStatus={false}
//               interval={3000}
//             >
//               <div>
//                 <img 
//                   src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
//                   alt="Food Image 1" 
//                   className="object-cover h-40 w-full"
//                   onError={handleImageError}
//                 />
//               </div>
//               <div>
//                 <img 
//                   src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
//                   alt="Food Image 2" 
//                   className="object-cover h-40 w-full"
//                   onError={handleImageError}
//                 />
//               </div>
//               <div>
//                 <img 
//                   src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDd8fGZvb2R8ZW58MHx8fHwxNjE2NzI2NDUz&ixlib=rb-1.2.1&q=80&w=400" 
//                   alt="Food Image 3" 
//                   className="object-cover h-40 w-full"
//                   onError={handleImageError}
//                 />
//               </div>
//             </Carousel>
//           </div>

//           <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">CaterOrange</h2>
          
//           <form onSubmit={handleSubmit}>
//             <div className="mb-4">
//               <input
//                 type="email"
//                 id="email"
//                 placeholder="Enter email"
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             {/* If forgot password is clicked, show password and confirm password fields */}
//             {!forgotPassword ? (
//               <>
//                 <div className="mb-4 relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     id="password"
//                     placeholder="Enter Password"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 flex items-center pr-3"
//                   >
//                     <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
//                   </button>
//                 </div>

//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="remember-me"
//                       className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
//                       checked={rememberMe}
//                       onChange={(e) => setRememberMe(e.target.checked)}
//                     />
//                     <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
//                       Remember me
//                     </label>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setForgotPassword(true)} // Show forgot password fields
//                     className="text-sm text-orange-600 hover:text-orange-500"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div className="mb-4 relative">
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     id="new-password"
//                     placeholder="Enter New Password"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 flex items-center pr-3"
//                   >
//                     <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
//                   </button>
//                 </div>
//                 <div className="mb-4 relative">
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     id="confirm-password"
//                     placeholder="Confirm New Password"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute inset-y-0 right-0 flex items-center pr-3"
//                   >
//                     <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
//                   </button>
//                 </div>
//               </>
//             )}

//             <div className="mb-4">
//               <button
//                 type="submit"
//                 className="w-full bg-orange-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 hover:bg-orange-700"
//               >
//                 {forgotPassword ? 'Reset Password' : 'Sign In'}
//               </button>
//               {state.isError && <p className="text-red-500 mt-2">{state.errorMessage}</p>}
//             </div>
//           </form>

//           <div className="mb-4 text-center">
//             <GoogleLogin
//               clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
//               onSuccess={handleGoogleLoginSuccess}
//               onError={handleGoogleLoginError}
//             />
//           </div>

//           <div className="text-center">
//             <p className="text-sm">
//               Don't have an account?{' '}
//               <button
//                 onClick={() => setShowSignUpModal(true)}
//                 className="text-orange-600 hover:text-orange-500 font-bold"
//               >
//                 Sign up
//               </button>
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SignInForm;




//siri 




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




const images = [
  "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727161124/Beige_and_Orange_Minimalist_Feminine_Fashion_Designer_Facebook_Cover_1_qnd0uz.png",
  "https://res.cloudinary.com/dmoasmpg4/image/upload/v1727104667/WhatsApp_Image_2024-09-23_at_20.47.25_gu19jf.jpg",
  "https://cdn.leonardo.ai/users/8b9fa60c-fc98-4afb-b569-223446336c31/generations/f5b61c13-0d39-4b94-8f86-f9c748dae078/Leonardo_Phoenix_Vibrant_orangehued_events_menu_image_featurin_0.jpg"
];


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
      await axios.post(`${process.env.REACT_APP_URL}/api/customer/checkCustomerOtp`, { email });
      const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/send-otp`, { email });
      setError(response.data.message);
      setForgotPasswordStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred while sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/verify-otp`, { email, otp });
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
      onSignIn(state.data,isGoogleLogin);
      navigate('/home');
    } else if (state.isError) {
      setError(state.errorMessage);
    }
  }, [state, onSignIn, navigate]);


  const handleSignUp = async(token, isGoogleLogin ) =>{
    localStorage.setItem('token',token);
    
    console.log("in signup isgooglelogin: ",isGoogleLogin)
  setIsGoogleLogin(isGoogleLogin);
  if(!isGoogleLogin){
    try {
      console.log('in manual',token)
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/info`, {
        headers: { token }
      });
      console.log('RESPONSE', response.data)
      const profile = {
        name: response.data.customer_name,
        phone: response.data.customer_phonenumber,
        email: response.data.customer_email
      };
      const a= localStorage.setItem('userDP', JSON.stringify(profile));
      console.log('a',a);
      setUser({ token, ...profile });
      console.log('user data', user)
      setIsGoogleLogin(false);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  }
  navigate('/home');
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
    const { name , email, picture } = decodedToken;
    setEmail(email);
    setUserProfile(decodedToken);
    console.log(name);
    console.log(email);
    const userDP={
      name:name,
      email: email,
      picture: picture
    }
    localStorage.setItem('userDP', JSON.stringify(userDP));
    const response= await Login_google_auth(name, email, tokenId,dispatch);
    console.log(response)
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
          <div className="h-50 bg-blue-300 border-back-200 mb-4 overflow-hidden">
            <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} interval={3000}>
            {images.map((src, index) => (
              <div key={index}>
                <img
                  src={src}
                  alt={`Carousel Image ${index + 1}`}
                  className="object-cover h-40 w-full max-w-[120%]" // Increase width here
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