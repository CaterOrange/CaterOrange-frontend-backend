// import React, { useEffect, useState, useRef } from "react";
// import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, Lock, Mail, User } from "lucide-react";
// import axios from "axios";
// import {UserCircleIcon} from "@heroicons/react/solid"
// import { useCart } from '../../services/contexts/CartContext';


// const Navbar = ({ activeTab, toggleSidenav, cartCount }) => {
//   return (
//     <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-20">
//       <div className="flex items-center justify-between relative">
//         <div className="absolute left-0">
//           <UserCircleIcon
//             className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity" 
//             onClick={toggleSidenav} 
//           />
//         </div>

//         <div className="flex-1 flex justify-center">
//           <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
//             Settings
//           </h2>

//         </div>
        
//       </div>
//     </header>
//   );
// };

// const Sidenav = ({ isOpen, onClose, sidenavRef, userDP }) => {
//   const navigate = useNavigate();
  
//   const getInitials = (name) => {
//     if (!name) return '';
//     const names = name.split(' ');
//     return names.map((n) => n[0]).join('').toUpperCase();
//   };

//   const handleNavigation = (path) => {
//     onClose();
//     navigate(path);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userDP');
//     localStorage.removeItem('address');
//     window.location.href = '/';
//   };

//   return (
//     <>
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black/50 z-30"
//           onClick={onClose}
//           aria-hidden="true"
//         />
//       )}
//       <div
//         ref={sidenavRef}
//         className={`fixed top-0 left-0 h-full w-72 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="p-4 bg-teal-800 text-white">
//           <div className="flex justify-end p-2">
//             <button 
//               className="text-white hover:opacity-80 transition-opacity" 
//               onClick={onClose}
//               aria-label="Close menu"
//             >
//               <span className="text-2xl">✕</span>
//             </button>
//           </div>

//           <div className="flex flex-col items-center">
//             {userDP.picture ? (
//               <img
//                 src={userDP.picture}
//                 alt="Profile"
//                 className="rounded-full w-16 h-16 object-cover"
//                 referrerPolicy="no-referrer"
//               />
//             ) : (
//               <div className="rounded-full w-16 h-16 bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
//                 {getInitials(userDP.name)}
//               </div>
//             )}

//             <h3 className="mt-2 font-medium">{userDP.name || 'Hello'}</h3>
//             {userDP.phone && <p className="text-sm mt-1">{userDP.phone}</p>}
//             <p className="text-sm mt-1">{userDP.email || 'Email Address'}</p>
//           </div>
//         </div>

//         <nav>
//           <ul className="p-2 space-y-1">
//             {[
//               {label:'Home', path:'/home'},
//               { label: 'My Orders', path: '/orders' },
//               { label: 'Contact Us', path: '/contact' },
//               // { label: 'Wallet', path: '/wallet' },
//               { label: 'Settings', path: '/settings' }
//             ].map((item) => (
//               <li key={item.path}>
//                 <button
//                   className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
//                   onClick={() => handleNavigation(item.path)}
//                 >
//                   {item.label}
//                 </button>
//               </li>
//             ))}
//             <li>
//               <button
//                 className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
//                 onClick={handleLogout}
//               >
//                 Logout
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </>
//   );
// };

// export const Settings = () => {
//   const navigate = useNavigate();
//   const { cartCount } = useCart();
//   const [isSidenavOpen, setIsSidenavOpen] = useState(false);
//   const sidenavRef = useRef(null);
//   const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
  
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [error, setError] = useState({});
//   const [successMessage, setSuccessMessage] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
//         setIsSidenavOpen(false);
//       }
//     }

//     if (isSidenavOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isSidenavOpen]);

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));
//     setError((prev) => {
//       const newErrors = { ...prev };
//       delete newErrors[id];
//       return newErrors;
//     });
//     validateField(id, value);
//   };

//   const validateField = (field, value) => {
//     let fieldError = null;
//     switch (field) {
//       case "email":
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(value)) fieldError = "Invalid email format.";
//         break;
//       case "password":
//         if (value.length < 8 || value.length > 20) fieldError = "Password must be 8-20 characters.";
//         else if (!/[A-Z]/.test(value)) fieldError = "Password must contain an uppercase letter.";
//         else if (!/[a-z]/.test(value)) fieldError = "Password must contain a lowercase letter.";
//         if (formData.confirmPassword && value !== formData.confirmPassword) {
//           setError((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
//         }
//         break;
//       case "confirmPassword":
//         if (value !== formData.password) fieldError = "Passwords do not match.";
//         break;
//       default:
//         break;
//     }
//     if (fieldError) setError((prev) => ({ ...prev, [field]: fieldError }));
//   };

//   const toggleSidenav = () => setIsSidenavOpen(!isSidenavOpen);
//   const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
//   const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError((prev) => {
//       const newErrors = { ...prev };
//       delete newErrors.submit;
//       return newErrors;
//     });

//     try {
//       await axios.post(`${process.env.REACT_APP_URL}/api/customer/updatePassword`, {
//         customer_email: formData.email,
//         customer_password: formData.password,
//         confirm_password: formData.confirmPassword,
//       }, {
//         headers: { 'token': localStorage.getItem('token') }
//       });
//       setSuccessMessage("Password updated successfully!");
//       setTimeout(() => navigate("/"), 1000);
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || "Error updating the password.";
//       setError((prev) => ({ ...prev, submit: errorMessage }));
//     }
//   };

//   const handleCancel = () => {
//     setFormData({ name: "", email: "", password: "", confirmPassword: "" });
//     setError({});
//     setSuccessMessage("");
//   };

//   return (
//     <div className="relative min-h-screen">
//       <Navbar 
//         activeTab="settings"
//         toggleSidenav={toggleSidenav}
//         cartCount={cartCount}
//       />
      
//       <Sidenav 
//         isOpen={isSidenavOpen}
//         onClose={() => setIsSidenavOpen(false)}
//         sidenavRef={sidenavRef}
//         userDP={storedUserDP}
//       />

//       <div className="pt-16">
//         <div className="fixed inset-0 flex items-center justify-center bg-black/50">
//           <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 m-4">
//             <header className="mb-6">
//               <div className="flex items-center justify-between">
//                 <button
//                   onClick={() => navigate("/")}
//                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <ArrowLeft className="h-5 w-5 text-gray-600" />
//                 </button>
//                 <h1 className="text-xl font-semibold"> Change Password</h1>
//                 <div className="w-10" />
//               </div>
//             </header>

//             <div className="max-h-[60vh] overflow-y-auto">
//               {/* <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
//                 <Lock className="h-4 w-4" />
//                 Change Password
//               </h2> */}

//               <form className="space-y-4" onSubmit={handleSubmit}>
//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2">
//                     <User className="h-4 w-4 text-gray-400" />
//                   </div>
//                   <input
//                     type="text"
//                     id="name"
//                     className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="John Doe"
//                   />
//                 </div>

//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2">
//                     <Mail className="h-4 w-4 text-gray-400" />
//                   </div>
//                   <input
//                     type="email"
//                     id="email"
//                     className={`w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${error.email ? 'border-red-500' : 'focus:ring-gray-300'}`}
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="example@gmail.com"
//                   />
//                   {error.email && <p className="text-red-500 text-xs mt-1">{error.email}</p>}
//                 </div>

//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2">
//                     <Lock className="h-4 w-4 text-gray-400" />
//                   </div>
//                   <input
//                     type={passwordVisible ? "text" : "password"}
//                     id="password"
//                     className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${error.password ? 'border-red-500' : 'focus:ring-gray-300'}`}
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="New Password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                     onClick={togglePasswordVisibility}
//                   >
//                     {passwordVisible ? <EyeIcon className="h-4 w-4 text-gray-400" /> : <EyeOffIcon className="h-4 w-4 text-gray-400" />}
//                   </button>
//                   {error.password && <p className="text-red-500 text-xs mt-1">{error.password}</p>}
//                 </div>

//                 <div className="relative">
//                   <div className="absolute left-3 top-1/2 -translate-y-1/2">
//                     <Lock className="h-4 w-4 text-gray-400" />
//                   </div>
//                   <input
//                     type={confirmPasswordVisible ? "text" : "password"}
//                     id="confirmPassword"
//                     className={`w-full pl-10 pr-10 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${error.confirmPassword ? 'border-red-500' : 'focus:ring-gray-300'}`}
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     placeholder="Confirm Password"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-1/2 -translate-y-1/2"
//                     onClick={toggleConfirmPasswordVisibility}
//                   >
//                     {confirmPasswordVisible ? <EyeIcon className="h-4 w-4 text-gray-400" /> : <EyeOffIcon className="h-4 w-4 text-gray-400" />}
//                   </button>
//                   {error.confirmPassword && <p className="text-red-500 text-xs mt-1">{error.confirmPassword}</p>}
//                 </div>

//                 {error.submit && <p className="text-red-500 text-sm">{error.submit}</p>}
//                 {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

//                 <div className="flex gap-3 pt-2">
//                   <button
//                     type="submit"
//                     className="flex-1 py-2 px-4 bg-teal-400 text-white rounded-lg text-sm hover:bg-teal-300 transition-colors"
//                   >
//                     Update Password
//                   </button>
//                   <button
//                     type="button"
//                     className="flex-1 py-2 px-4 bg-teal-100 text-gray-700 rounded-lg text-sm hover:bg-teal-200 transition-colors"
//                     onClick={handleCancel}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//             </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;

import React, { useEffect, useState, useRef } from "react";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";
import axios from "axios";
import { UserCircleIcon } from "@heroicons/react/solid";
import { useCart } from '../../services/contexts/CartContext';

const Navbar = ({ activeTab, toggleSidenav, cartCount }) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-20">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0">
          <UserCircleIcon
            className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={toggleSidenav} 
          />
        </div>

        <div className="flex-1 flex justify-center">
          <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
            Settings
          </h2>
        </div>
      </div>
    </header>
  );
};

const Sidenav = ({ isOpen, onClose, sidenavRef, userDP }) => {
  const navigate = useNavigate();
  
  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  const handleNavigation = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDP');
    localStorage.removeItem('address');
    window.location.href = '/';
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={sidenavRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 bg-teal-800 text-white">
          <div className="flex justify-end p-2">
            <button 
              className="text-white hover:opacity-80 transition-opacity" 
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            {userDP.picture ? (
              <img
                src={userDP.picture}
                alt="Profile"
                className="rounded-full w-16 h-16 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="rounded-full w-16 h-16 bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
                {getInitials(userDP.name)}
              </div>
            )}

            <h3 className="mt-2 font-medium">{userDP.name || 'Hello'}</h3>
            {userDP.phone && <p className="text-sm mt-1">{userDP.phone}</p>}
            <p className="text-sm mt-1">{userDP.email || 'Email Address'}</p>
          </div>
        </div>

        <nav>
          <ul className="p-2 space-y-1">
            {[
              {label:'Home', path:'/home'},
              { label: 'My Orders', path: '/orders' },
              { label: 'Contact Us', path: '/contact' },
              { label: 'Settings', path: '/settings' }
            ].map((item) => (
              <li key={item.path}>
                <button
                  className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export const Settings = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const sidenavRef = useRef(null);
  const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
        setIsSidenavOpen(false);
      }
    }

    if (isSidenavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidenavOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    validateField(id, value);
  };

  const validateField = (field, value) => {
    let fieldError = null;
    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) fieldError = "Invalid email format.";
        break;
      case "password":
        if (value.length < 8 || value.length > 20) fieldError = "Password must be 8-20 characters.";
        else if (!/[A-Z]/.test(value)) fieldError = "Password must contain an uppercase letter.";
        else if (!/[a-z]/.test(value)) fieldError = "Password must contain a lowercase letter.";
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setError((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) fieldError = "Passwords do not match.";
        break;
      default:
        break;
    }
    if (fieldError) setError((prev) => ({ ...prev, [field]: fieldError }));
  };

  const toggleSidenav = () => setIsSidenavOpen(!isSidenavOpen);
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError((prev) => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    try {
      await axios.post(`${process.env.REACT_APP_URL}/api/customer/updatePassword`, {
        customer_email: formData.email,
        customer_password: formData.password,
        confirm_password: formData.confirmPassword,
      }, {
        headers: { 'token': localStorage.getItem('token') }
      });
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating the password.";
      setError((prev) => ({ ...prev, submit: errorMessage }));
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setError({});
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        activeTab="settings"
        toggleSidenav={toggleSidenav}
        cartCount={cartCount}
      />
      
      <Sidenav 
        isOpen={isSidenavOpen}
        onClose={() => setIsSidenavOpen(false)}
        sidenavRef={sidenavRef}
        userDP={storedUserDP}
      />

<div className="pt-20 px-18 md:px-8 pb-8 max-w-2xl mx-auto items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <header className="mb-8">
            <div className="flex items-center gap-4">
              {/* <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {/* <ArrowLeft className="h-6 w-6 text-gray-600" /> */}
             
              <div className="flex-1 flex justify-center">

              <h1 className="text-2xl font-semibold">Change Password</h1>
              </div>
            </div>
          </header>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-1 focus:ring-gray-300"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                className={`w-full pl-12 pr-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-1 ${error.email ? 'border-red-500' : 'focus:ring-gray-300'}`}
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
              />
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                className={`w-full pl-12 pr-12 py-3 border rounded-lg text-base focus:outline-none focus:ring-1 ${error.password ? 'border-red-500' : 'focus:ring-gray-300'}`}
                value={formData.password}
                onChange={handleChange}
                placeholder="New Password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <EyeIcon className="h-5 w-5 text-gray-400" /> : <EyeOffIcon className="h-5 w-5 text-gray-400" />}
              </button>
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmPassword"
                className={`w-full pl-12 pr-12 py-3 border rounded-lg text-base focus:outline-none focus:ring-1 ${error.confirmPassword ? 'border-red-500' : 'focus:ring-gray-300'}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onClick={toggleConfirmPasswordVisibility}
              >
                {confirmPasswordVisible ? <EyeIcon className="h-5 w-5 text-gray-400" /> : <EyeOffIcon className="h-5 w-5 text-gray-400" />}
              </button>
              {error.confirmPassword && <p className="text-red-500 text-sm mt-1">{error.confirmPassword}</p>}
            </div>

            {error.submit && <p className="text-red-500 text-sm">{error.submit}</p>}
            {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-teal-400 text-white rounded-lg text-base font-medium hover:bg-teal-300 transition-colors"
              >
                Update Password
              </button>
              <button
                type="button"
                className="flex-1 py-3 px-6 bg-teal-100 text-gray-700 rounded-lg text-base font-medium hover:bg-teal-200 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;