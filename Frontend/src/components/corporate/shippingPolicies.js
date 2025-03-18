// import React from 'react';
// import { Link } from 'react-router-dom';

// const ShippingPolicy = () => {
//   return (
//     <div className="container mx-auto px-4 py-10 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-teal-800 mb-6">Shipping Policy</h1>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Delivery Areas</h2>
//           <p className="mb-2">
//             We currently offer meal delivery services within designated service zones. Additional delivery charges may apply for locations outside our standard delivery areas.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Delivery Schedule</h2>
//           <p className="mb-2">
//             Orders are delivered daily. We recommend placing orders at least 3 hours in advance to ensure timely delivery.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Minimum Order Value</h2>
//           <p className="mb-2">
//             The minimum order value for meal delivery is ₹99. Orders below this amount will not be processed.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Delivery Fees</h2>
//           <p className="mb-2">
//             Standard delivery fees vary based on location. Exact charges will be displayed at checkout before placing the order.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Order Tracking</h2>
//           <p className="mb-2">
//             Once your order has been dispatched, you will receive a notification with an estimated delivery time. Order status can be tracked through the app dashboard.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Special Instructions</h2>
//           <p className="mb-2">
//             If you have specific delivery instructions (landmarks, gate codes, etc.), please mention them in the "Delivery Notes" section while placing your order.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Food Safety & Handling</h2>
//           <p className="mb-2">
//             All meals are prepared under strict hygiene conditions. Our delivery system ensures that your food reaches you fresh and safely packaged.
//           </p>
//         </section>
        
//         <p className="mt-10 text-sm text-gray-500">
//           Last Updated: March 11, 2025
//         </p>
        
//         <div className="mt-8 border-t pt-6">
//           <Link to="/" className="text-teal-600 hover:text-teal-800 transition duration-300">
//             &larr; Back to Home
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ShippingPolicy;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header2 from "./Header2";
import DOMPurify from "dompurify";

const ShippingPolicy = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Add cache-busting parameter to prevent caching
        const githubURL = "https://raw.githubusercontent.com/CaterOrange/Website-T-C-and-Policies/refs/heads/main/ShippingPolicy.html";
        const response = await fetch(`${githubURL}?t=${new Date().getTime()}`);
        const html = await response.text();
        const cleanHtml = DOMPurify.sanitize(html, {
          FORBID_TAGS: ["style", "script", "link"],
        });
        setHtmlContent(cleanHtml);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching content:", error);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
  <>
    <div className="min-h-screen bg-gray-50 flex flex-col px-4 py-10">
    <Header2/>

      <div className="max-w-4xl w-full mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-teal-800 text-center">
        </h1>
        <p className="text-gray-600 text-center mb-6">
        </p>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        )}

        {/* Document Container - Removed card styling */}
        <div
          className={`relative overflow-hidden transition-opacity duration-500 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        >
          {!loading && (
            <div 
              className="w-full h-[80vh] md:h-[70vh] sm:h-[60vh] overflow-auto p-4"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>

        {/* Back Button */}
        {/* <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 text-lg font-medium text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition duration-300"
          >
            &larr; Back to Home
          </Link>
        </div> */}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ShippingPolicy;
