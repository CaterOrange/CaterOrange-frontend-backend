import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoogleMapComponent from '../Maps/GMaps';
import { VerifyToken } from '../../MiddleWare/verifyToken';

const AddressForm = ({ saveAddress, existingAddress }) => {
  const [tag, setTag] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [location, setLocation] = useState(null);
  const [shipToName, setShipToName] = useState('');
  const [shipToPhoneNumber, setShipToPhoneNumber] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [defaultDetails, setDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
  const [editableDefaultDetails, setEditableDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
  VerifyToken();
  // Regular expressions for validation
  const letterRegex = /^[A-Za-z\s]*$/;
  const flatNumberRegex = /^[A-Za-z0-9\s]*$/;
  const pincodeRegex = /^\d{6}$/;

  // Validation functions for individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'tag':
        if (!value) return 'Tag is required';
        if (value.length < 2) return 'Tag atleast 3 characters';

        if (value.length > 50) return 'Tag must be less than 50 characters';
        if (!letterRegex.test(value)) return 'Tag must only contain letters and spaces';
        return '';

      case 'pincode':
        if (!value) return 'Pincode is required';
        if (!pincodeRegex.test(value)) return 'Valid 6-digit pincode is required';
        return '';

      case 'city':
        if (!value) return 'City is required';
        if (value.length <2) return 'City atleast 3 characters';

        if (value.length > 50) return 'City must be less than 50 characters';
        if (!letterRegex.test(value)) return 'City must only contain letters and spaces';
        return '';

      case 'state':
        if (!value) return 'State is required';
        if (value.length <2) return 'State atleast 3 characters';

        if (value.length > 50) return 'State must be less than 50 characters';
        if (!letterRegex.test(value)) return 'State must only contain letters and spaces';
        return '';

      case 'flatNumber':
        if (value && value.length > 20) return 'Flat number must be less than 20 characters';
        if (value && !flatNumberRegex.test(value)) return 'Flat number must contain only letters, numbers, and spaces';
        return '';

      case 'landmark':
        if (value.length <2) return 'landmark atleast 3 characters';

        if (value && value.length > 100) return 'Landmark must be less than 100 characters';
        return '';

      case 'shipToName':
        if (!value) return 'Ship to name is required';
        if (value.length > 100) return 'Ship to name must be less than 100 characters';
        if (!letterRegex.test(value)) return 'Ship to name must only contain letters and spaces';
        return '';

      case 'shipToPhoneNumber':
        if (!value || isNaN(value) || value.length !== 10) return 'Valid 10-digit phone number is required';
        return '';

      case 'customer_name':
        if (!value) return 'Default name is required';
        if (value.length > 100) return 'Default name must be less than 100 characters';
        if (!letterRegex.test(value)) return 'Default name must only contain letters and spaces';
        return '';

      case 'customer_phonenumber':
        if (!value || isNaN(value) || value.length !== 10) return 'Valid 10-digit phone number is required';
        return '';

      default:
        return '';
    }
  };

  // Handle field change with validation
  const handleFieldChange = (name, value, setter) => {
    setter(value);
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Modified state setters with validation
  const handleTagChange = (e) => handleFieldChange('tag', e.target.value, setTag);
  const handlePincodeChange = (e) => handleFieldChange('pincode', e.target.value, setPincode);
  const handleCityChange = (e) => handleFieldChange('city', e.target.value, setCity);
  const handleStateChange = (e) => handleFieldChange('state', e.target.value, setState);
  const handleFlatNumberChange = (e) => handleFieldChange('flatNumber', e.target.value, setFlatNumber);
  const handleLandmarkChange = (e) => handleFieldChange('landmark', e.target.value, setLandmark);
  const handleShipToNameChange = (e) => handleFieldChange('shipToName', e.target.value, setShipToName);
  const handleShipToPhoneNumberChange = (e) => handleFieldChange('shipToPhoneNumber', e.target.value, setShipToPhoneNumber);

  // Modified default details handler with validation
  const handleDefaultDetailsChange = (e) => {
    const { name, value } = e.target;
    setEditableDefaultDetails(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name === 'customer_name' ? 'customerName' : 'customerPhoneNumber']: error
    }));
  };

  // Your existing useEffect hooks remain unchanged
  useEffect(() => {
    const fetchDefaultDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found, please log in again.');
      }
      try {
        const response = await axios.get('https://dev.caterorange.com/api/address/getDefaultAddress', {
          headers: { 'token': token },
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

  useEffect(() => {
    if (existingAddress) {
      setTag(existingAddress.tag || '');
      setPincode(existingAddress.pincode || '');
      setCity(existingAddress.city || '');
      setState(existingAddress.state || '');
      setFlatNumber(existingAddress.flatNumber || '');
      setLandmark(existingAddress.landmark || '');
      setLocation(null);
      setSelectedOption(existingAddress.selectedOption || null);
      if (existingAddress.selectedOption === 'shipping') {
        setShipToName(existingAddress.shipToName || '');
        setShipToPhoneNumber(existingAddress.shipToPhoneNumber || '');
      }
    }
  }, [existingAddress]);

  // Your existing validate function remains unchanged
  const validate = () => {
    const errors = {};
    
    if (!tag) errors.tag = 'Tag is required';
    else if (tag.length <3) errors.tag = 'tag must be atleast 2 characters';
    else if (tag.length > 50) errors.tag = 'Tag must be less than 50 characters';
    else if (!letterRegex.test(tag)) errors.tag = 'Tag must only contain letters and spaces';
    
    if (!pincode) errors.pincode = 'Pincode is required';
    else if (!pincodeRegex.test(pincode)) errors.pincode = 'Valid 6-digit pincode is required';
    
    if (!city) errors.city = 'City is required';
    else if (city.length <3) errors.city = 'city must be atleast 2 characters';
    else if (city.length > 50) errors.city = 'City must be less than 50 characters';
    else if (!letterRegex.test(city)) errors.city = 'City must only contain letters and spaces';
    
    if (!state) errors.state = 'State is required';
    else if (state.length <3) errors.state = 'State must be atleast 2 characters';
    else if (state.length > 50) errors.state = 'State must be less than 50 characters';
    else if (!letterRegex.test(state)) errors.state = 'State must only contain letters and spaces';
    
    if (flatNumber && flatNumber.length > 20) errors.flatNumber = 'Flat number must be less than 20 characters';
    else if (flatNumber.length <3) errors.flatNumber = 'Flatnumber must be atleast 2 characters';
    else if (flatNumber && !flatNumberRegex.test(flatNumber)) errors.flatNumber = 'Flat number must contain only letters, numbers, and spaces';
    
    if (landmark && landmark.length > 100) errors.landmark = 'Landmark must be less than 100 characters';
    else if (landmark.length <3) errors.landmark = 'landmark must be atleast 2 characters';

    if (!selectedOption) {
      errors.selectedOption = 'You must select either shipping details or set as default';
    }
    
    if (selectedOption === 'shipping') {
      if (!shipToName) errors.shipToName = 'Ship to name is required';
      else if (shipToName.length > 100) errors.shipToName = 'Ship to name must be less than 100 characters';
      else if (!letterRegex.test(shipToName)) errors.shipToName = 'Ship to name must only contain letters and spaces';
    
      if (!shipToPhoneNumber || isNaN(shipToPhoneNumber) || shipToPhoneNumber.length !== 10) {
        errors.shipToPhoneNumber = 'Valid 10-digit phone number is required';
      }
    }
    
    if (selectedOption === 'default') {
      if (!editableDefaultDetails.customer_name) {
        errors.customerName = 'Default name is required';
      } else if (editableDefaultDetails.customer_name.length > 100) {
        errors.customerName = 'Default name must be less than 100 characters';
      } else if (!letterRegex.test(editableDefaultDetails.customer_name)) {
        errors.customerName = 'Default name must only contain letters and spaces';
      }
    
      if (!editableDefaultDetails.customer_phonenumber || isNaN(editableDefaultDetails.customer_phonenumber) || editableDefaultDetails.customer_phonenumber.length !== 10) {
        errors.customerPhoneNumber = 'Valid 10-digit phone number is required';
      }
    }
    
    return errors;
  };

  // Your existing handleSubmit function remains unchanged
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    const line1 = `${flatNumber}, ${landmark}`;
    const line2 = `${city}, ${state}`;
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found, please log in again.');
    }
    if (Object.keys(validationErrors).length === 0) {
      try {
        const url = existingAddress
          ? `${process.env.REACT_APP_URL}/api/address/edit/${existingAddress.address_id}`
          : `${process.env.REACT_APP_URL}/api/address/createAddres`;

        const response = await axios.post(
          url,
          {
            tag,
            pincode,
            line1,
            line2,
            location: [],
            ship_to_name: selectedOption === 'shipping' ? shipToName : editableDefaultDetails.customer_name,
            ship_to_phone_number: selectedOption === 'shipping' ? shipToPhoneNumber : editableDefaultDetails.customer_phonenumber,
          },
          {
            headers: { 'token': token },
          }
        );

        clearForm();
        if (saveAddress) {
          saveAddress(response.data.address);
        }
        setSuccessMessage(existingAddress ? 'Address updated successfully.' : 'Address saved successfully.');
      } catch (error) {
        console.error('Error saving address:', error);
        setSuccessMessage('Failed to save address.');
      }
    } else {
      setErrors(validationErrors);
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
    setErrors({});
  };

  // Update your JSX to use new handlers
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
            onChange={handleTagChange}
            placeholder="E.g., Home, Office"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.tag && <p className="text-red-500 text-xs">{errors.tag}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
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
            onChange={handleCityChange}
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
            onChange={handleStateChange}
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
            onChange={handleFlatNumberChange}
            placeholder="Enter flat number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.flatNumber && <p className="text-red-500 text-xs">{errors.flatNumber}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Landmark</label>
          <input
            type="text"
            value={landmark}
            onChange={handleLandmarkChange}
            placeholder="Enter landmark"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.landmark && <p className="text-red-500 text-xs">{errors.landmark}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Address Type</label>
          <select
            value={selectedOption || ""}
            onChange={(e) => {
              setSelectedOption(e.target.value);
              if (!e.target.value) {
                setErrors(prev => ({ ...prev, selectedOption: 'You must select either shipping details or set as default' }));
              } else {
                setErrors(prev => {
                  const { selectedOption, ...rest } = prev;
                  return rest;
                });
              }
            }}
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
                onChange={handleShipToNameChange}
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
                onChange={handleShipToPhoneNumberChange}
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
              {errors.customerName && <p className="text-red-500 text-xs">{errors.customerName}</p>}
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
              {errors.customerPhoneNumber && <p className="text-red-500 text-xs">{errors.customerPhoneNumber}</p>}
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