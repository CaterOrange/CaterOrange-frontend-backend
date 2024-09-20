import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/outline'; 

const SuccessPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-green-500">
      <div className="text-center">
       
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>
        </div>
        
        {/* Order Successful Message */}
        <h1 className="text-3xl font-bold text-white">Order Successful</h1>
        <p className="text-white mt-2">
          Your payment was processed successfully.
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;
