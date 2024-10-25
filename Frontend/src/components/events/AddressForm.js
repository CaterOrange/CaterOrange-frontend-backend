import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapComponent from '../Maps/GMaps';

const AddressForm = ({ saveAddress, existingAddress }) => {
  const [tag, setTag] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });
  const [shipToName, setShipToName] = useState('');
  const [shipToPhoneNumber, setShipToPhoneNumber] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [defaultDetails, setDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
  const [editableDefaultDetails, setEditableDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });

  // Fetch default address details
  useEffect(() => {
    const fetchDefaultDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found, please log in again.');

      try {
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getDefaultAddress`, {
          headers: { token },
        });
        const { customer_name = '', customer_phonenumber = '' } = response.data.customer || {};
        setDefaultDetails({ customer_name, customer_phonenumber });
        setEditableDefaultDetails({ customer_name, customer_phonenumber });
      } catch (error) {
        console.error('Error fetching default address:', error);
      }
    };

    fetchDefaultDetails();
  }, []);

  // Populate form if an existing address is being edited
  useEffect(() => {
    if (existingAddress) {
      setTag(existingAddress.tag || '');
      setPincode(existingAddress.pincode || '');
      setCity(existingAddress.city || '');
      setState(existingAddress.state || '');
      setFlatNumber(existingAddress.flatNumber || '');
      setLandmark(existingAddress.landmark || '');
      setLocation(existingAddress.location || { address: '', lat: null, lng: null });
      setSelectedOption(existingAddress.selectedOption || null);

      if (existingAddress.selectedOption === 'shipping') {
        setShipToName(existingAddress.shipToName || '');
        setShipToPhoneNumber(existingAddress.shipToPhoneNumber || '');
      }
    }
  }, [existingAddress]);

  const validateField = (field, value) => {
    let error = '';
    const phoneRegex = /^\d{10}$/;

    switch (field) {
      case 'tag':
        if (!value) error = 'Tag is required';
        break;
      case 'pincode':
        if (!value || isNaN(value)) error = 'Valid pincode is required';
        break;
      case 'city':
        if (!value) error = 'City is required';
        break;
      case 'state':
        if (!value) error = 'State is required';
        break;
      case 'shipToPhoneNumber':
        if (!phoneRegex.test(value)) error = 'Valid 10-digit phone number is required';
        break;
      default:
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'tag':
        setTag(value);
        break;
      case 'pincode':
        setPincode(value);
        break;
      case 'city':
        setCity(value);
        break;
      case 'state':
        setState(value);
        break;
      case 'shipToName':
        setShipToName(value);
        break;
      case 'shipToPhoneNumber':
        setShipToPhoneNumber(value);
        break;
      case 'customer_name':
      case 'customer_phonenumber':
        setEditableDefaultDetails((prev) => ({ ...prev, [name]: value }));
        break;
      default:
        break;
    }

    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(fieldErrors).some((error) => error)) return;

    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found, please log in again.');

    const line1 = `${flatNumber}, ${landmark}`;
    const line2 = `${city}, ${state}`;

    try {
      const url = existingAddress
        ? `${process.env.REACT_APP_URL}/api/address/edit/${existingAddress.address_id}`
        : `${process.env.REACT_APP_URL}/api/address/createAddress`;

      const response = await axios.post(
        url,
        {
          tag,
          pincode,
          line1,
          line2,
          location: `{${location.lat},${location.lng}}`,
          ship_to_name: selectedOption === 'shipping' ? shipToName : editableDefaultDetails.customer_name,
          ship_to_phone_number: selectedOption === 'shipping' ? shipToPhoneNumber : editableDefaultDetails.customer_phonenumber,
        },
        { headers: { token } }
      );

      setSuccessMessage(existingAddress ? 'Address updated successfully.' : 'Address saved successfully.');
      clearForm();
      if (saveAddress) saveAddress(response.data.address);
    } catch (error) {
      console.error('Error saving address:', error);
      setSuccessMessage('Failed to save address.');
    }
  };
  const clearForm = () => {
    setTag('');
    setPincode('');
    setCity('');
    setState('');
    setFlatNumber('');
    setLandmark('');
    setLocation({ address: '', lat: null, lng: null });
    setShipToName('');
    setShipToPhoneNumber('');
    setSelectedOption(null);
    setFieldErrors({});
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {successMessage && (
        <p className={`text-center ${successMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {successMessage}
        </p>
      )}
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tag</label>
          <input
            type="text"
            value={tag}
            
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="E.g., Home, Office"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.tag && <p className="text-red-500 text-xs">{fieldErrors.tag}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter pincode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={city}
            onChange={handleChange}
          onBlur={handleBlur}
            placeholder="Enter city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={state}
            onChange={handleChange}
          onBlur={handleBlur}
            placeholder="Enter state"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Flat Number</label>
          <input
            type="text"
            value={flatNumber}
            onChange={handleChange}
          onBlur={handleBlur}
            placeholder="Enter flat number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Landmark</label>
          <input
            type="text"
            value={landmark}
            onChange={handleChange}
          onBlur={handleBlur}
            placeholder="Enter landmark"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Location</label>
          <GoogleMapComponent onLocationSelect={handleLocationSelect} />
          {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Address Type</label>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select an option</option>
            <option value="default">Set as default</option>
            <option value="shipping">Shipping</option>
          </select>
          {errors.selectedOption && <p className="text-red-500 text-xs">{errors.selectedOption}</p>}
        </div>

        {selectedOption === 'shipping' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ship to Name</label>
              <input
                type="text"
                value={shipToName}
                onChange={(e) => setShipToName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.shipToName && <p className="text-red-500 text-xs">{errors.shipToName}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Ship to Phone Number</label>
              <input
                type="text"
                value={shipToPhoneNumber}
                onChange={(e) => setShipToPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.shipToPhoneNumber && <p className="text-red-500 text-xs">{errors.shipToPhoneNumber}</p>}
            </div>
          </>
        )}

        {selectedOption === 'default' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Default Name</label>
              <input
                type="text"
                name="customer_name"
                value={editableDefaultDetails.customer_name}
                onChange={handleDefaultDetailsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Default Phone Number</label>
              <input
                type="text"
                name="customer_phonenumber"
                value={editableDefaultDetails.customer_phonenumber}
                onChange={handleDefaultDetailsChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          {existingAddress ? 'Update Address' : 'Save Address'}
        </button>
      </form>
    </div>
  );
};

export default AddressForm;