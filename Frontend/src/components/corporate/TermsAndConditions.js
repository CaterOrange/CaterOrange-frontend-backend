// import React from 'react';
// import { Link } from 'react-router-dom';

// const TermsConditions = () => {
//   return (
//     <div className="container mx-auto px-4 py-10 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-teal-800 mb-6">Terms & Conditions</h1>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">1. Acceptance of Terms</h2>
//           <p className="mb-2">
//             By accessing or using app.caterorange.com, you agree to comply with and be bound by these Terms and 
//             Conditions. If you do not agree with any part of these terms, please do not use our services.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">2. Account Registration</h2>
//           <p className="mb-2">
//             To place an order, users must create an account with accurate information. You are responsible for
//             keeping your account details secure and for all activities conducted under your account.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">3. Ordering & Pricing</h2>
//           <p className="mb-2">
//             Orders must be placed at least 3 hours in advance. The minimum order value for meal delivery is ₹99.
//             Prices and availability are subject to change at any time without prior notice.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">4. Payment</h2>
//           <p className="mb-2">
//             Payments can be made via credit/debit cards, UPI, and other digital payment methods available on 
//             app.caterorange.com. Orders are confirmed only after successful payment.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">5. Delivery & Service Areas</h2>
//           <p className="mb-2">
//             Delivery is available within designated service areas. Delivery times are estimated and may vary due to 
//             unforeseen circumstances. Customers will be notified of any significant delays.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">6. Rescheduling Orders</h2>
//           <p className="mb-2">
//             Orders can be rescheduled up to 24 hours before the original delivery time without any extra charges.
//             Rescheduling requests made within 24 hours of delivery may incur additional charges or may not be possible
//             depending on availability.
//           </p>
//         </section>
        
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">8. Limitation of Liability</h2>
//           <p className="mb-2">
//             app.caterorange.com is not liable for any indirect, incidental, or consequential damages arising from
//             the use of our services beyond the total amount paid for the order in question.
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

// export default TermsConditions;


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header2 from "./Header2";
import DOMPurify from "dompurify";

const TermsConditions = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Add cache-busting parameter to prevent caching
        const githubURL = "https://raw.githubusercontent.com/CaterOrange/Website-T-C-and-Policies/refs/heads/main/TermsConditions.html";
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
  <Header2/>
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        {/* Title */}
        {/* <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          Terms & Conditions
        </h1> */}

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          </div>
        )}

        {/* Document Container */}
        <div
          className={`relative overflow-hidden rounded-xl border border-gray-300 shadow-md transition-opacity duration-500 ${
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

export default TermsConditions;
