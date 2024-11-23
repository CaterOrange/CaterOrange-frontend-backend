import React from 'react';
import { XCircleIcon } from '@heroicons/react/outline'; // Import a failure icon from Heroicons
import { VerifyToken } from '../../../MiddleWare/verifyToken';

const FailurePage = () => {
  VerifyToken();
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-500">
      <div className="text-center">
        
        {/* Failure Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white">
            <XCircleIcon className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        {/* Order Failed Message */}
        <h1 className="text-3xl font-bold text-white">Payment Failed</h1>
        <p className="text-white mt-2">
          There was an issue processing your payment. Please try again.
        </p>
      </div>
    </div>
  );
};

export default FailurePage;