import React, { useState } from "react";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { VerifyToken } from "../../MiddleWare/verifyToken";

export const Wallet = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const [balance, setBalance] = useState(250); // Example wallet balance
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2024-10-20", description: "Order #1243", amount: -50 },
    { id: 2, date: "2024-10-18", description: "Wallet Top-up", amount: 100 },
    { id: 3, date: "2024-10-15", description: "Order #1234", amount: -30 },
  ]);
  VerifyToken();
  const goToHomePage = () => {
    navigate("/"); // Navigate to the homepage
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-[700px] w-full p-8 bg-white rounded-lg shadow-lg space-y-8">
        <h1 className="text-3xl font-semibold text-neutral-900 text-center">
          My Wallet
        </h1>

        {/* Wallet Balance Section */}
        <div className="bg-primary-50 p-6 rounded-md shadow-md text-center">
          <h2 className="text-2xl font-semibold text-primary-900 mb-2">
            Wallet Balance
          </h2>
          <p className="text-4xl font-bold text-neutral-900">₹{balance}</p>
          <button className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-500 transition duration-300 flex items-center justify-center gap-2">
            <FaPlusCircle /> Add Money
          </button>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-neutral-900">
            Transaction History
          </h2>
          <ul className="space-y-3">
            {transactions.map((txn) => (
              <li
                key={txn.id}
                className={`flex justify-between items-center p-4 rounded-md shadow-sm ${
                  txn.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <div>
                  <p className="font-medium text-neutral-800">
                    {txn.description}
                  </p>
                  <p className="text-sm text-neutral-500">{txn.date}</p>
                </div>
                <p
                  className={`font-semibold ${
                    txn.amount > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {txn.amount > 0 ? `+${txn.amount}` : txn.amount} USD
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Home Button */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-500 transition duration-300"
          onClick={goToHomePage}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};
