import React, { useState } from 'react';
import axios from 'axios';
import GoogleMapComponent from '../Maps/GMaps';

const AddressForm = () => {
  const [tag, setTag] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });
  const [shipToName, setShipToName] = useState('');
  const [shipToPhoneNumber, setShipToPhoneNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // New state for managing selected checkbox
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleLocationSelect = ({ lat, lng, address }) => {
    setLocation({ lat, lng, address });
    // Clear location-related errors when a valid location is selected
    setErrors((prevErrors) => {
      const { location, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    const line1 = `${flatNumber}, ${landmark}`;
    const line2 = `${city}, ${state}`;
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No token found, please log in again.');
    }
    if (Object.keys(validationErrors).length === 0) {
        try {
            const defaultResponse = await axios.get('http://localhost:4000/address/getDefaultAddress', {
                headers: { 'token': token },
            });
            const { customer_name, customer_phonenumber } = defaultResponse.data.customer;
            console.log('Default Address:', { customer_name, customer_phonenumber });
            const response = await axios.post(
                'http://localhost:4000/address/createAddres',
                {
                    tag,
                    pincode,
                    line1,
                    line2,
                    location: `{${location.lat},${location.lng}}`,
                    ship_to_name: selectedOption === 'shipping' ? shipToName : customer_name,
                    ship_to_phone_number: selectedOption === 'shipping' ? shipToPhoneNumber : customer_phonenumber
                },
                {
                    headers: { 'token': token },
                }
            );
        
            clearForm();
            console.log('Form Data Submitted:', response.data);
            setSuccessMessage('Address saved successfully.');
        } catch (error) {
            console.error('Error saving address:', error);
            setSuccessMessage('Failed to save address.');
        }
    } else {
        setErrors(validationErrors);
    }
};

    const validate = () => {
      const errors = {};

      if (!tag) errors.tag = 'Tag is required';
      if (!pincode || isNaN(pincode)) errors.pincode = 'Valid pincode is required';
      if (!city) errors.city = 'City is required';
      if (!state) errors.state = 'State is required';
      if (!location.lat || !location.lng) {
        errors.location = 'Location is required';
      } else {
        if (isNaN(location.lat) || isNaN(location.lng)) {
          errors.location = 'Valid latitude and longitude are required';
        }
        if (location.lat < -90 || location.lat > 90) {
          errors.location = 'Latitude must be between -90 and 90';
        }
        if (location.lng < -180 || location.lng > 180) {
          errors.location = 'Longitude must be between -180 and 180';
        }
      }

      // Ensure either "shipping" or "default" option is selected
      if (!selectedOption) {
        errors.selectedOption = 'You must select either shipping details or set as default';
      }

      // If "Include shipping details" is selected, ensure the fields are filled
      if (selectedOption === 'shipping') {
        if (!shipToName) errors.shipToName = 'Ship to name is required'; 
        if (!shipToPhoneNumber || isNaN(shipToPhoneNumber) || shipToPhoneNumber.length !== 10) {
          errors.shipToPhoneNumber = 'Valid 10-digit phone number is required';
        }
      }

      return errors;
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
    setIsDefault(false);
    setSelectedOption(null); 
    setErrors({});
  };

  return (
    <div>
      {successMessage && (
        <p className={`text-center ${successMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {successMessage}
        </p>
      )}
      <form onSubmit={handleSubmit} className="p-2 border rounded max-w-xs mx-auto">
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Address Label</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
            required
          />
          {errors.tag && <p className="text-red-500 text-xs">{errors.tag}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
          />
          {errors.pincode && <p className="text-red-500 text-xs">{errors.pincode}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm" required
          />
          {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm" required
          />
          {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Flat Number</label>
          <input
            type="text"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm" required
          />
          {errors.flatNumber && <p className="text-red-500 text-xs">{errors.flatNumber}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Landmark</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm" required
          />
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Location</label>
          <GoogleMapComponent onLocationSelect={handleLocationSelect} />
          {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
        </div>

        <div className="mb-2 flex items-center">
      <input
        type="radio"
        checked={selectedOption === 'shipping'}
        onChange={() => setSelectedOption('shipping')}
        className="mr-2"
      />
      <label className="text-gray-700 text-sm">Include shipping details</label>
    </div>

    {selectedOption === 'shipping' && (
      <>
        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Ship To Name</label>
          <input
            type="text"
            value={shipToName}
            onChange={(e) => setShipToName(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
          />
          {errors.shipToName && <p className="text-red-500 text-xs">{errors.shipToName}</p>}
        </div>

            <div className="mb-2">
              <label className="block text-gray-700 text-sm">Ship To Phone Number</label>
              <input
                type="text"
                value={shipToPhoneNumber}
                onChange={(e) => setShipToPhoneNumber(e.target.value)}
                className="mt-1 p-1 border rounded w-full text-sm"
              />
              {errors.shipToPhoneNumber && <p className="text-red-500 text-xs">{errors.shipToPhoneNumber}</p>}
            </div>
          </>
        )}

        <div className="mb-2 flex items-center">
          <input
            type="radio"
            checked={selectedOption === 'default'}
            onChange={() => setSelectedOption('default')}
            className="mr-2"
          />
          <label className="text-gray-700 text-sm">Set as Default details</label>
        </div>

        {errors.selectedOption && <p className="text-red-500 text-xs">{errors.selectedOption}</p>}

        <button type="submit" className="mt-2 p-2 bg-blue-500 text-white rounded w-full">Submit</button>
      </form>
    </div>
  );
};

export default AddressForm;
