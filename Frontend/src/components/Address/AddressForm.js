import React, { useState } from 'react';
import axios from 'axios';
import GoogleMapComponent from '../Maps/GMaps';
// import GoogleMapComponent from './GMaps';

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
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleLocationSelect = ({ lat, lng, address }) => {
    setLocation({ lat, lng, address });
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
        const response = await axios.post(
          'http://localhost:4000/order/address',
          {
            tag,
            pincode,
            line1,
            line2,
            location: `{${location.lat},${location.lng}}`,
            ship_to_name: shipToName,
            ship_to_phone_number: shipToPhoneNumber,
          },
          {
            headers: {
              'token': token, // Note: Ensure that your backend expects 'token' in headers
            },
          }
        );

        // setSuccessMessage('Address saved successfully');
        clearForm();
        console.log('Form Data Submitted:', response.data);
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
    if (!shipToName) errors.shipToName = 'Ship to name is required';
    if (!shipToPhoneNumber || isNaN(shipToPhoneNumber) || shipToPhoneNumber.length !== 10) {
      errors.shipToPhoneNumber = 'Valid 10-digit phone number is required';
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
          <label className="block text-gray-700 text-sm">Tag</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
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
            className="mt-1 p-1 border rounded w-full text-sm"
          />
          {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
          />
          {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Flat Number</label>
          <input
            type="text"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
          />
          {errors.flatNumber && <p className="text-red-500 text-xs">{errors.flatNumber}</p>}
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Landmark</label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="mt-1 p-1 border rounded w-full text-sm"
          />
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 text-sm">Location</label>
          <GoogleMapComponent onLocationSelect={handleLocationSelect} />
          {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
        </div>

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

        <button type="submit" className="bg-blue-500 text-white p-1 rounded w-full text-sm">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddressForm;
