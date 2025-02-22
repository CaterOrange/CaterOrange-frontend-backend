import React, { useEffect, useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { Alert, AlertTitle } from '@mui/material';
import axios from 'axios';
import AddressForm from './AddressForm';
import { useNavigate } from 'react-router-dom';

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_URL}/api/v2/address/getalladdresses`, {
        headers: { token }
      });
      
      if (response.data.success) {
        setAddresses(response.data.addresses || []);  // Ensure addresses is always an array
        setError(null);
      }
    } catch (error) {
      setError('Failed to fetch addresses. Please try again.');
      console.error('Error fetching addresses:', error);
      setAddresses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    const formattedAddress = {
      address_id: address.address_id,
      tag: address.tag,
      pincode: address.pincode,
      line1: address.line1,
      line2: address.line2,
      location: address.location,
      ship_to_name: address.ship_to_name,
      ship_to_phone_number: address.ship_to_phone_number
    };
    setEditingAddress(formattedAddress);
    setShowAddressForm(true);
  };

  const handleAddressAdded = async () => {
    await fetchAddresses();
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `${process.env.REACT_APP_URL}/api/v2/address/deleteaddress/${addressId}`,
          { headers: { token } }
        );

        if (response.data.success) {
          fetchAddresses();
          setError(null);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete address. Please try again.');
        console.error('Error deleting address:', error);
      }
    }
  };

  const formatAddress = (address) => ({
    name: address.ship_to_name,
    street: address.line1,
    city: address.line2,
    phone: address.ship_to_phone_number,
    tag: address.tag,
    pincode: address.pincode,
    location: address.location
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Addresses</h1>
          <button
            onClick={() => {
              setEditingAddress(null);
              setShowAddressForm(true);
              setError(null);
            }} 
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            Add New Address
          </button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        {addresses && addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => {
              const formattedAddress = formatAddress(address);
              return (
                <div
                  key={address.address_id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {formattedAddress.name}
                        </h3>
                        <span className="px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full">
                          {formattedAddress.tag}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-gray-600">
                        <p>{formattedAddress.street}, {formattedAddress.city}, {formattedAddress.pincode}, {formattedAddress.location}, {formattedAddress.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(address)}
                        className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(address.address_id)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses found</h3>
              <p className="text-gray-600 mb-6">Add your first address to get started</p>
              <button
                onClick={() => setShowAddressForm(true)}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Address
              </button>
            </div>
          </div>
        )}

        {showAddressForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <AddressForm
              initialData={editingAddress}
              onClose={() => {
                setShowAddressForm(false);
                setEditingAddress(null);
                setError(null);
              }}
              onAddressAdd={handleAddressAdded}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressList;