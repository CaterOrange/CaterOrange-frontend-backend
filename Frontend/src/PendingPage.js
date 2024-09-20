import React from 'react';
import { ClockIcon } from '@heroicons/react/outline'; // Import an icon to represent pending state

const PendingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-500">
      <div className="text-center">
        
        {/* Pending Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white">
            <ClockIcon className="h-16 w-16 text-yellow-500" />
          </div>
        </div>
        
        {/* Order Pending Message */}
        <h1 className="text-3xl font-bold text-white">Payment Pending</h1>
        <p className="text-white mt-2">
          Your payment is being processed. Please wait.
        </p>
      </div>
    </div>
  );
};

export default PendingPage;
