
// import React from 'react';
// import { Link } from 'react-router-dom';

// const CancellationRefunds = () => {
//   return (
//     <div className="container mx-auto px-4 py-10 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-teal-800 mb-6">Reschedule Policy</h1>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Order Reschedule</h2>
//           <p className="mb-2">
//             We understand that plans change. Our reschedule policy is designed to be flexible 
//             while ensuring we can properly manage our food preparation and delivery operations.
//           </p>
     
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">How to Reschedule an Order</h2>
//           <p className="mb-2">
//             To reschedule an order, please follow these steps:
//           </p>
//           <ol className="list-decimal ml-6 mb-4">
//             <li className="mb-1">Log in to your account</li>
//             <li className="mb-1">Navigate to "My Orders"</li>
//             <li className="mb-1">Select the order you wish to reschedule</li>
//             <li className="mb-1">Click the "Reschedule Order" button</li>
//             <li className="mb-1">Confirm your reschedule request</li>
//           </ol>
//           <p className="mb-2">
//             Alternatively, you can contact our customer service team at info@caterorange.com during business hours.
//           </p>
//         </section>
        
      
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Quality Issues & Service Concerns</h2>
//           <p className="mb-2">
//             If you experience any issues with food quality, missing items, or significant delivery delays,
//             please report the problem within 3 hours of delivery. Our team will review your case and work 
//             to address your concerns promptly.
//           </p>
//           <p className="mb-2">
//             To report a quality issue, please contact our customer service team at info@caterorangecom or call 8123700851 within the specified time frame.
//           </p>
//         </section>
        
//         <div className="mt-8">
//           <Link to="/" className="text-teal-600 hover:underline">Back to Home</Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CancellationRefunds;



import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CancellationRefunds = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Add cache-busting parameter to prevent caching
        const githubURL = "https://raw.githubusercontent.com/CaterOrange/Website-T-C-and-Policies/refs/heads/main/CancellationRefunds.html";
        const response = await fetch(`${githubURL}?t=${new Date().getTime()}`);
        const html = await response.text();
        setHtmlContent(html);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching content:", error);
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        {/* Title */}
        <h1 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          Reschedule & Cancellation & Refunds Policy
        </h1>

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
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 text-lg font-medium text-white bg-teal-600 rounded-lg shadow-md hover:bg-teal-700 transition duration-300"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefunds;
