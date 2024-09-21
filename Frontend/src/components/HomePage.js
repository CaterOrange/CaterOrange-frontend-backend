import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiTrash } from 'react-icons/fi'; // Import trash icon
import AddressForm from '../components/events/AddressForm';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [address, setAddress] = useState([]);
  const [isViewAddresses, setIsViewAddresses] = useState(false);
  const [isAddAddressFormVisible, setIsAddAddressFormVisible] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(); // State for selected address

  const handleAddAddress = () => {
    setIsAddAddressFormVisible(!isAddAddressFormVisible);
    setIsEditingAddress(false);
    setAddressToEdit(null);
  };

  const handleViewAddresses = async () => {
    if (!isViewAddresses) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        const response = await axios.get('http://localhost:4000/address/getalladdresses', {
          headers: { 'token': token },
        });

        if (response.data.address) {
          setAddress(response.data.address);
        } else {
          console.error('Failed to fetch addresses:', response.status);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    }
    setIsViewAddresses(!isViewAddresses);
  };

  const handleEditAddress = (address) => {
    setAddressToEdit(address);
    setIsEditingAddress(true);
    setIsAddAddressFormVisible(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return;
      }

      const response = await axios.delete(`http://localhost:5000/address/delete/${addressId}`, {
        headers: { 'token': token },
      });

      if (response.status === 200) {
        setAddress(address.filter((addr) => addr.address_id !== addressId));
      } else {
        console.error('Failed to delete address:', response.status);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const saveAddress = (newAddress) => {
    if (isEditingAddress) {
      setAddress(
        address.map((addr) =>
          addr.address_id === newAddress.address_id ? newAddress : addr
        )
      );
    } else {
      setAddress([...address, newAddress]);
    }
    setIsAddAddressFormVisible(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const plates = form.elements['plates'].value;

    if (!form.checkValidity()) {
      form.reportValidity();
    } else {
      navigate('/menu', { state: { numberOfPlates: plates, selectedDate: selectedDate, address: selectedAddress } });
    }
  };
  console.log("hey",address);
  const handleSelect = (address_id) => {
    const selectedAddr = address.find(addr => addr.address_id === address_id);
    setSelectedAddressId(address_id);
    setSelectedAddress(selectedAddr); // Update selected address state
    console.log("address",selectedAddress);
    console.log(selectedAddr);
    // console.log(selectedAddress); //hi
  };

  return (
    <div className="bg-gradient-to-b from-[#008000] to-[#70c656] min-h-screen p-4 font-sans">
      <div className="flex justify-end mb-6">
        <div className="bg-white rounded-full p-2">
          <User size={24} className="text-gray-600" />
        </div>
      </div>

      <h2 className="text-black-500 text-lg font-semibold mb-6 text-center">
        Know Availability to your Location
      </h2>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="number"
                  name="phone"
                  placeholder="enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <label className="block text-gray-700 mb-2">Delivery Location</label>
              <div>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="hover:bg-blue-100 text-black-500 font-bold py-2 px-4 rounded mb-2"
                >
                  + Add Address
                </button>
              </div>
              {isAddAddressFormVisible && (
                <div className="transition-all duration-300 ease-in-out">
                  <AddressForm
                    saveAddress={saveAddress}
                    existingAddress={addressToEdit}
                  />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={handleViewAddresses}
                  className="hover:bg-blue-100 text-black-500 font-bold py-2 px-4 rounded"
                >
                  View Addresses
                </button>
              </div>
              {isViewAddresses && (
                <div>
                  {address.length > 0 ? (
                    address.map((add) => (
                      <div
                        key={add.address_id}
                        className="p-2 border-b border-gray-200 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="address"
                            value={add.address_id}
                            checked={selectedAddressId === add.address_id}
                            onChange={() => handleSelect(add.address_id)}
                            className="mr-2"
                          />
                          <p>
                            {add.tag}, {add.pincode}, {add.line1}, {add.line2}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span
                            className="text-blue-500 underline cursor-pointer mr-2"
                            onClick={() => handleEditAddress(add)}
                          >
                            Edit
                          </span>
                          <FiTrash
                            className="text-red-500 cursor-pointer"
                            onClick={() => handleDeleteAddress(add.address_id)}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No addresses available</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Enter no of plates</label>
              <input
                type="number"
                name="plates"
                placeholder="e.g., 300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Select Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select a date"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;