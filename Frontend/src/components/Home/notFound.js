import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 text-white">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg flex flex-col items-center">
        <h1 className="text-8xl font-extrabold mb-4">404</h1>
        <p className="text-2xl font-semibold mb-8">Oops! Page Not Found</p>
        <Link to="/" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300">
          Go back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;