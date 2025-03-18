// import React from 'react';
// import { Link } from 'react-router-dom';

// const PrivacyPolicy = () => {
//   return (
//     <div className="container mx-auto px-4 py-10 min-h-screen">
//       <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
//         <h1 className="text-2xl font-bold text-teal-800 mb-6">Privacy Policy</h1>
        
//         <section className="mb-6">
//           <p className="mb-4">
//             At CaterOrange, we value your privacy. This Privacy Policy outlines how we collect, use, 
//             and protect your personal information when you use our platform at app.caterorange.com.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Information We Collect</h2>
//           <p className="mb-2">
//             We collect information to enhance your experience, including:
//           </p>
//           <ul className="list-disc ml-6 mb-4">
//             <li className="mb-1"><strong>Personal Details:</strong> Name, email, phone number, and address.</li>
//             <li className="mb-1"><strong>Account Data:</strong> Username, password, and profile preferences.</li>
//             <li className="mb-1"><strong>Order Information:</strong> Food preferences, transaction details, and order history.</li>
//             <li className="mb-1"><strong>Technical Data:</strong> IP address, browser type, and device details.</li>
//             <li className="mb-1"><strong>Usage Data:</strong> Pages visited, actions taken, and time spent on the platform.</li>
//           </ul>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">How We Use Your Information</h2>
//           <p className="mb-2">
//             Your information is used to improve and personalize your experience, including:
//           </p>
//           <ul className="list-disc ml-6 mb-4">
//             <li className="mb-1">Processing and fulfilling your food orders.</li>
//             <li className="mb-1">Providing customer support and responding to inquiries.</li>
//             <li className="mb-1">Enhancing platform functionality and user experience.</li>
//             <li className="mb-1">Sending order updates and promotional messages (with your consent).</li>
//             <li className="mb-1">Preventing fraudulent activities and ensuring platform security.</li>
//           </ul>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Data Sharing</h2>
//           <p className="mb-2">We may share your information with:</p>
//           <ul className="list-disc ml-6 mb-4">
//             <li className="mb-1"><strong>Delivery Partners:</strong> To facilitate order fulfillment.</li>
//             <li className="mb-1"><strong>Service Providers:</strong> For payment processing and customer support.</li>
//             <li className="mb-1"><strong>Legal Compliance:</strong> When required by law or regulatory authorities.</li>
//           </ul>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Security Measures</h2>
//           <p className="mb-4">
//             We implement industry-standard security practices to protect your data. However, no method 
//             of data transmission over the internet is completely secure.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Your Rights</h2>
//           <p className="mb-2">Depending on your location, you may:</p>
//           <ul className="list-disc ml-6 mb-4">
//             <li className="mb-1">Access and update your personal information.</li>
//             <li className="mb-1">Request deletion of your data.</li>
//             <li className="mb-1">Opt-out of marketing communications.</li>
//           </ul>
//         </section>
        
       
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Policy Updates</h2>
//           <p className="mb-4">
//             We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated "Last Updated" date.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">Contact Us</h2>
//           <p className="mb-2">
//             If you have any questions, please contact us at:
//           </p>
//           <p className="mb-2">info@caterorange.com</p>
//         </section>
        
//         <div className="mt-8 text-right text-sm text-gray-600 italic">
//           Last Updated: March 11, 2025
//         </div>
        
//         <div className="mt-8">
//           <Link to="/" className="text-teal-600 hover:underline">Back to Home</Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrivacyPolicy;



import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import DOMPurify from "dompurify";
import Header2 from "./Header2";


const PrivacyPolicy = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const githubURL = "https://raw.githubusercontent.com/CaterOrange/Website-T-C-and-Policies/refs/heads/main/PrivacyPolicy.html";
        const response = await fetch(`${githubURL}?t=${new Date().getTime()}`);
        let html = await response.text();
        
        // Add inline styles for lists
        html = html.replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 2rem; margin-bottom: 1rem;">');
        html = html.replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 2rem; margin-bottom: 1rem;">');
        
        const cleanHtml = DOMPurify.sanitize(html, {
          FORBID_TAGS: ["style", "script", "link"],
          ADD_ATTR: ['style'], // Allow style attributes
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
          Privacy Policy
        </h1> */}

          {/* Loader */}
          {loading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
          )}

          {/* Document Container */}
          <div
            className={`relative overflow-hidden rounded-xl border border-gray-300 shadow-md transition-opacity duration-500 ${loading ? "opacity-0" : "opacity-100"
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
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
