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
//             By accessing or using our Corporate Meals service, you agree to be bound by these Terms and 
//             Conditions. If you do not agree to all the terms and conditions, you must not use our services.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">2. Account Registration</h2>
//           <p className="mb-2">
//             To use our services, you must create an account with accurate, complete, and updated information.
//             You are responsible for maintaining the confidentiality of your account credentials and for all
//             activities that occur under your account.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">3. Ordering</h2>
//           <p className="mb-2">
//             All orders must be placed at least 24 hours in advance. By placing an order, you commit to 
//             purchasing the items at the prices listed at the time of order. Prices and availability are 
//             subject to change without notice.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">4. Payment</h2>
//           <p className="mb-2">
//             We accept major credit cards and corporate accounts with pre-approved credit terms. 
//             Payment is processed at the time of order confirmation. For corporate accounts, invoices are 
//             generated and payment is due within 15 days of receipt.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">5. Delivery</h2>
//           <p className="mb-2">
//             Delivery times are estimates and may vary based on traffic conditions and other factors 
//             beyond our control. We are not responsible for delays caused by circumstances outside our 
//             reasonable control.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">6. Cancellation</h2>
//           <p className="mb-2">
//             Orders may be canceled or modified up to 12 hours before the scheduled delivery time without 
//             penalty. Cancellations made with less than 12 hours' notice may incur a 50% charge of the 
//             total order value.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">7. Allergies & Dietary Restrictions</h2>
//           <p className="mb-2">
//             While we make efforts to accommodate dietary restrictions, we cannot guarantee that our food 
//             is free from allergens. It is the customer's responsibility to check ingredient lists and 
//             inform us of any allergies or dietary restrictions.
//           </p>
//         </section>
        
//         <section className="mb-6">
//           <h2 className="text-xl font-semibold text-teal-700 mb-3">8. Limitation of Liability</h2>
//           <p className="mb-2">
//             Our liability for any claims arising from our services shall not exceed the amount paid for 
//             the specific order giving rise to such claim.
//           </p>
//         </section>
        
//         <p className="mt-10 text-sm text-gray-500">
//           Last Updated: February 24, 2025
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

import React from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Terms & Conditions</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">1. Acceptance of Terms</h2>
          <p className="mb-2">
            By accessing or using app.caterorange.com, you agree to comply with and be bound by these Terms and 
            Conditions. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">2. Account Registration</h2>
          <p className="mb-2">
            To place an order, users must create an account with accurate information. You are responsible for
            keeping your account details secure and for all activities conducted under your account.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">3. Ordering & Pricing</h2>
          <p className="mb-2">
            Orders must be placed at least 3 hours in advance. The minimum order value for meal delivery is ₹99.
            Prices and availability are subject to change at any time without prior notice.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">4. Payment</h2>
          <p className="mb-2">
            Payments can be made via credit/debit cards, UPI, and other digital payment methods available on 
            app.caterorange.com. Orders are confirmed only after successful payment.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">5. Delivery & Service Areas</h2>
          <p className="mb-2">
            Delivery is available within designated service areas. Delivery times are estimated and may vary due to 
            unforeseen circumstances. Customers will be notified of any significant delays.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">6. Rescheduling Orders</h2>
          <p className="mb-2">
            Orders can be rescheduled up to 24 hours before the original delivery time without any extra charges.
            Rescheduling requests made within 24 hours of delivery may incur additional charges or may not be possible
            depending on availability.
          </p>
        </section>
        
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">8. Limitation of Liability</h2>
          <p className="mb-2">
            app.caterorange.com is not liable for any indirect, incidental, or consequential damages arising from
            the use of our services beyond the total amount paid for the order in question.
          </p>
        </section>
        
        <p className="mt-10 text-sm text-gray-500">
          Last Updated: March 11, 2025
        </p>
        
        <div className="mt-8 border-t pt-6">
          <Link to="/" className="text-teal-600 hover:text-teal-800 transition duration-300">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
