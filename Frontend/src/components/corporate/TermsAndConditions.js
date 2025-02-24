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
            By accessing or using our Corporate Meals service, you agree to be bound by these Terms and 
            Conditions. If you do not agree to all the terms and conditions, you must not use our services.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">2. Account Registration</h2>
          <p className="mb-2">
            To use our services, you must create an account with accurate, complete, and updated information.
            You are responsible for maintaining the confidentiality of your account credentials and for all
            activities that occur under your account.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">3. Ordering</h2>
          <p className="mb-2">
            All orders must be placed at least 24 hours in advance. By placing an order, you commit to 
            purchasing the items at the prices listed at the time of order. Prices and availability are 
            subject to change without notice.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">4. Payment</h2>
          <p className="mb-2">
            We accept major credit cards and corporate accounts with pre-approved credit terms. 
            Payment is processed at the time of order confirmation. For corporate accounts, invoices are 
            generated and payment is due within 15 days of receipt.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">5. Delivery</h2>
          <p className="mb-2">
            Delivery times are estimates and may vary based on traffic conditions and other factors 
            beyond our control. We are not responsible for delays caused by circumstances outside our 
            reasonable control.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">6. Cancellation</h2>
          <p className="mb-2">
            Orders may be canceled or modified up to 12 hours before the scheduled delivery time without 
            penalty. Cancellations made with less than 12 hours' notice may incur a 50% charge of the 
            total order value.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">7. Allergies & Dietary Restrictions</h2>
          <p className="mb-2">
            While we make efforts to accommodate dietary restrictions, we cannot guarantee that our food 
            is free from allergens. It is the customer's responsibility to check ingredient lists and 
            inform us of any allergies or dietary restrictions.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">8. Limitation of Liability</h2>
          <p className="mb-2">
            Our liability for any claims arising from our services shall not exceed the amount paid for 
            the specific order giving rise to such claim.
          </p>
        </section>
        
        <p className="mt-10 text-sm text-gray-500">
          Last Updated: February 24, 2025
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