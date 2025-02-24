import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [year] = useState(new Date().getFullYear());

  return (
    <footer className="bg-gradient-to-r from-teal-800 to-teal-700 text-white py-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Corporate Meals</h3>
            <p className="text-sm mb-4">
              Delivering high-quality corporate catering solutions tailored to your business needs.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-teal-300">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-300 transition duration-300">Home</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-teal-300 transition duration-300">My Orders</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-teal-300 transition duration-300">Cart</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-300 transition duration-300">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-teal-300 transition duration-300">FAQ</Link>
              </li>
              <li>
                <Link to="/addresses" className="hover:text-teal-300 transition duration-300">Manage Addresses</Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-teal-300 transition duration-300">Account Settings</Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-bold mb-4">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/shipping-policy" className="hover:text-teal-300 transition duration-300">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-teal-300 transition duration-300">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/cancellation-refunds" className="hover:text-teal-300 transition duration-300">Cancellation & Refunds</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-teal-300 transition duration-300">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-teal-600 mt-8 pt-6 text-sm text-center">
          <p>&copy; {year} Corporate Meals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;