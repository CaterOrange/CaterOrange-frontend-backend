// import React, { useState } from 'react';
// import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/outline';
// import Body from './Body'; // Import Body to use it within Header
// import './css/styles.css'; // Ensure you import your CSS file
// import { Link, useNavigate } from 'react-router-dom';

// const Header = ({ user }) => {
//   const [isSidenavOpen, setIsSidenavOpen] = useState(false);
//   const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // State for logout dialog
//   const navigate = useNavigate();

//   const toggleSidenav = () => {
//     setIsSidenavOpen(!isSidenavOpen);
//   };

//   const handleViewCart = () => {
//     navigate('/cart');
//   };

//   const handleViewOrders=()=>{
//     navigate('/orders');
//   }

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('userProfile');
//     setTimeout(() => {
//       window.location.href = '/';
//     }, 0);
//   };

//   const handleViewLoginPage = () => {
//     setIsLogoutDialogOpen(true); // Open the logout confirmation dialog
//   };

//   const handleConfirmLogout = (confirm) => {
//     setIsLogoutDialogOpen(false); // Close the dialog
//     if (confirm) {
//       handleLogout(); // If the user confirms, perform logout
//     }
//   };

//   return (
//     <>
//       <header className="fixed top-0 left-0 w-full bg-green-500 text-white shadow-md py-4 px-6 z-50 flex items-center justify-between">
//         {/* Profile Icon */}
//         <div className="flex items-center">
//           <UserCircleIcon className="h-8 w-8 cursor-pointer" onClick={toggleSidenav} />
//         </div>

//         {/* Corporate Title */}
//         <h2 className="text-3xl font-bold mb-4 gradient-text animate-gradient text-center flex-1">
//           CORPORATE MENU
//         </h2>

//         {/* Cart Icon */}
//         <div className="flex items-center">
//           <Link to="/cart">
//             <ShoppingCartIcon className="h-6 w-6 cursor-pointer" onClick={handleViewCart} />
//           </Link>
//         </div>
//       </header>

//       {/* Backdrop for body content */}
//       {isSidenavOpen && (
//         <div className="fixed inset-0 bg-black opacity-50 z-40 blur-sm"></div>
//       )}

//       {/* Sidenav */}
//       <div
//         className={`fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out ${
//           isSidenavOpen ? 'translate-x-0' : '-translate-x-full'
//         } z-50 overflow-y-auto`} // Ensure sidenav is scrollable
//       >
//         {/* User profile details */}
//         <div className="p-4 bg-green-500 text-white">
//           <div className="flex justify-end p-4">
//             <button className="text-black" onClick={toggleSidenav}>
//               ✕
//             </button>
//           </div>
//           <img
//             src={user.profilePicture || '(link unavailable)'}
//             alt="Profile"
//             className="rounded-full w-16 h-16 mx-auto"
//           />
//           <h3 className="text-center mt-2">{user.name || 'Hello'}</h3>
//           {user.phone && <p className="text-center">{user.phone}</p>}
//           <p className="text-center">{user.email || 'Email Address'}</p>
//         </div>
//         {/* Menu options */}
//         <ul className="p-2 space-y-2">
//           <Link to='/orders'>
//           <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewOrders}>My Orders</li>
//           </Link>
//           <li className="p-2 border-b border-gray-200 cursor-pointer">Order Events</li>
//           <li className="p-2 border-b border-gray-200 cursor-pointer">Address</li>
//           <li className="p-2 border-b border-gray-200 cursor-pointer">Wallet</li>
//           <li className="p-2 border-b border-gray-200 cursor-pointer">Contact Us</li>
//           <li className="p-2 border-b border-gray-200 cursor-pointer">Settings</li>
//           <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewLoginPage}>
//             LogOut &rarr;
//           </li>
//         </ul>
//       </div>

//       {/* Logout Confirmation Dialog */}
//       {isLogoutDialogOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="bg-white p-6 rounded shadow-lg text-center">
//             <h2 className="text-lg font-bold mb-4">Do you really want to Logout?</h2>
//             <div className="flex justify-center space-x-4">
//               <button
//                 className="bg-green-500 text-white py-2 px-4 rounded"
//                 onClick={() => handleConfirmLogout(true)}
//               >
//                 Yes
//               </button>
//               <button
//                 className="bg-gray-500 text-white py-2 px-4 rounded"
//                 onClick={() => handleConfirmLogout(false)}
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Body Content */}
//       <div className="pt-20 mt-5"> {/* Add padding to avoid overlap with fixed header */}
//         <Body isSidenavOpen={isSidenavOpen} />
//       </div>
//     </>
//   );
// };

// export default Header;
import React, { useState } from 'react';
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/outline';
import Body from './Body'; // Import Body to use it within Header
import './css/styles.css'; // Ensure you import your CSS file
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user }) => {
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false); // State for logout dialog
  const navigate = useNavigate();

  const toggleSidenav = () => {
    setIsSidenavOpen(!isSidenavOpen);
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleViewOrders=()=>{
    navigate('/orders');
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    // localStorage.removeItem('userProfile');
    setTimeout(() => {
      window.location.href = '/';
    }, 0);
  };

  const handleViewLoginPage = () => {
    setIsLogoutDialogOpen(true); // Open the logout confirmation dialog
  };

  const handleConfirmLogout = (confirm) => {
    setIsLogoutDialogOpen(false); // Close the dialog
    if (confirm) {
      handleLogout(); // If the user confirms, perform logout
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-green-500 text-white shadow-md py-4 px-6 z-50 flex items-center justify-between">
        {/* Profile Icon */}
        <div className="flex items-center">
          <UserCircleIcon className="h-8 w-8 cursor-pointer" onClick={toggleSidenav} />
        </div>

        {/* Corporate Title */}
        <h2 className="text-3xl font-bold mb-4 gradient-text animate-gradient text-center flex-1">
          CORPORATE MENU
        </h2>

        {/* Cart Icon */}
        <div className="flex items-center">
          <Link to="/cart">
            <ShoppingCartIcon className="h-6 w-6 cursor-pointer" onClick={handleViewCart} />
          </Link>
        </div>
      </header>

      {/* Backdrop for body content */}
      {isSidenavOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-40 blur-sm"></div>
      )}

      {/* Sidenav */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out ${
          isSidenavOpen ? 'translate-x-0' : '-translate-x-full'
        } z-50 overflow-y-auto`} // Ensure sidenav is scrollable
      >
        {/* User profile details */}
        <div className="p-4 bg-green-500 text-white">
          <div className="flex justify-end p-4">
            <button className="text-black" onClick={toggleSidenav}>
              ✕
            </button>
          </div>
          <h3 className="text-center mt-2">Hello</h3>
          <p className="text-center">phone</p>
          <p className="text-center">Email Address</p>
        </div>
        {/* Menu options */}
        <ul className="p-2 space-y-2">
          <Link to='/orders'>
          <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewOrders}>My Orders</li>
          </Link>
          <li className="p-2 border-b border-gray-200 cursor-pointer">Order Events</li>
          <li className="p-2 border-b border-gray-200 cursor-pointer">Address</li>
          <li className="p-2 border-b border-gray-200 cursor-pointer">Wallet</li>
          <li className="p-2 border-b border-gray-200 cursor-pointer">Contact Us</li>
          <li className="p-2 border-b border-gray-200 cursor-pointer">Settings</li>
          <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewLoginPage}>
            LogOut &rarr;
          </li>
        </ul>
      </div>

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Do you really want to Logout?</h2>
            <div className="flex justify-center space-x-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded"
                onClick={() => handleConfirmLogout(true)}
              >
                Yes
              </button>
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded"
                onClick={() => handleConfirmLogout(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body Content */}
      <div className="pt-20 mt-5"> {/* Add padding to avoid overlap with fixed header */}
        
        <Body isSidenavOpen={isSidenavOpen} />
      </div>
    </>
  );
};

export default Header;