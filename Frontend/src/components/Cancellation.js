import React from 'react';
import { Link } from 'react-router-dom';
const CancellationRefunds = () => {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Cancellation & Refunds Policy</h1>
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Order Cancellation</h2>
          <p className="mb-2">
            We understand that plans change. Our cancellation policy is designed to be flexible 
            while ensuring we can properly manage our food preparation and delivery operations.
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">
              <strong>Early Cancellation (24+ hours before delivery):</strong> Full refund with no cancellation fee.
            </li>
            <li className="mb-1">
              <strong>Standard Cancellation (12-24 hours before delivery):</strong> 85% refund of the order value.
            </li>
            <li className="mb-1">
              <strong>Late Cancellation (4-12 hours before delivery):</strong> 50% refund of the order value.
            </li>
            <li className="mb-1">
              <strong>Very Late Cancellation (less than 4 hours before delivery):</strong> No refund available.
            </li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">How to Cancel an Order</h2>
          <p className="mb-2">
            To cancel an order, please follow these steps:
          </p>
          <ol className="list-decimal ml-6 mb-4">
            <li className="mb-1">Log in to your account</li>
            <li className="mb-1">Navigate to "My Orders"</li>
            <li className="mb-1">Select the order you wish to cancel</li>
            <li className="mb-1">Click the "Cancel Order" button</li>
            <li className="mb-1">Confirm your cancellation</li>
          </ol>
          <p className="mb-2">
            Alternatively, you can contact our customer service team at support@corporatemeals.com
            or call (555) 123-4567 during business hours.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Refund Process</h2>
          <p className="mb-2">
            Once your cancellation is processed, any eligible refund will be initiated within 1-2 business days.
            The time it takes for the refund to appear in your account depends on your payment method:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">
              <strong>Credit/Debit Cards:</strong> 3-5 business days
            </li>
            <li className="mb-1">
              <strong>Corporate Accounts:</strong> Applied as credit to your next invoice
            </li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Quality Issues & Service Failures</h2>
          <p className="mb-2">
            If you experience any issues with food quality, missing items, or significant delivery delays,
            please report the problem within 2 hours of delivery. Our team will review your case and may
            offer one of the following solutions:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">Full or partial refund</li>
            <li className="mb-1">Credit toward future orders</li>
            <li className="mb-1">Replacement of affected items (when possible)</li>
          </ul>
          <p className="mb-2">
            To report a quality issue, please contact            our customer service team at support@corporatemeals.com or call (555) 123-4567 within the specified time frame.
          </p>
        </section>
        
        <div className="mt-8">
          <Link to="/" className="text-teal-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefunds;
