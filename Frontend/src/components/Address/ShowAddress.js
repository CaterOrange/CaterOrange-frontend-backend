import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const ShowAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }
        const response = await axios.get(
          `${process.env.REACT_APP_URL}/api/address/getalladdresses`,
          { headers: { token } }
        );
        if (response.data.address) {
          setAddresses(response.data.address);
        } else {
          console.error("Failed to fetch addresses:", response.status);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    fetchAddresses(); 
  }, [token]);

  const handleBackToHome = () => {
    navigate("/home");
    console.log("Navigating back to home");
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-6 sticky top-0 bg-white z-10">Addresses</h1>

      <div className="overflow-y-auto max-h-[60vh] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div
                key={address.address_id}
                className={`p-6 border rounded-xl shadow-md hover:shadow-lg transition duration-300 transform hover:-translate-y-1 ${
                  selectedAddressId === address.address_id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300"
                }`}
                style={{ height: "190px", minWidth: "50px" }}
              > 
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h2 className="text-xl font-semibold">{address.tag}</h2>
                      <p className="text-gray-700 mt-2">
                        {address.line1}, {address.line2}
                      </p>
                      <p className="text-gray-500">Pincode: {address.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No addresses available</p>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleBackToHome}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ShowAddress;

