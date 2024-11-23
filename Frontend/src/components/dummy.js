import axios from 'axios';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import GoogleMapComponent from './GMaps';
import { VerifyToken } from '../MiddleWare/verifyToken';

const AddressForm = ({ onAddressAdd, onAddressSelect, onClose }) => {
  const [tag, setTag] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState([]);
  const [state, setState] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [landmark, setLandmark] = useState('');
  const [location, setLocation] = useState({ address: '', lat: null, lng: null });
  const [shipToName, setShipToName] = useState('');
  const [shipToPhoneNumber, setShipToPhoneNumber] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isViewAddresses, setIsViewAddresses] = useState(false);
  const [defaultDetails, setDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
  const [editableDefaultDetails, setEditableDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  VerifyToken();
  
  useEffect(() => {
    const fetchDefaultDetails = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found, please log in again.');
      }
      try {
        const response = await axios.get('http://localhost:7000/address/getDefaultAddress', {
          headers: { token: `${localStorage.getItem('accessToken')}` }
        });
        const { customer_name, customer_phonenumber } = response.data.customer;

        setDefaultDetails({ customer_name, customer_phonenumber });
        setEditableDefaultDetails({ customer_name, customer_phonenumber });
      } catch (error) {
        console.error('Error fetching default address:', error);
      }
    };
    fetchDefaultDetails();
  }, []);


  const handleLocationSelect = ({ lat, lng, address }) => {
    setLocation({ lat, lng, address });
    setErrors((prevErrors) => {
      const { location, ...rest } = prevErrors;
      return rest;
    });
  };

  const handleDefaultDetailsChange = (e) => {
    const { name, value } = e.target;
    setEditableDefaultDetails(prev => ({ ...prev, [name]: value }));
  };


  const handleViewAddresses = async () => {
    if (!isViewAddresses) {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No token found in localStorage');
          return;
        }

        const response = await axios.get('http://localhost:7000/address/getalladdresses', {

          headers: { token: `${localStorage.getItem('accessToken')}` }

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
          'http://localhost:7000/address/createAddres',
          {
            tag,
            pincode,
            line1,
            line2,
            location: `{${location.lat},${location.lng}}`,
            ship_to_name: selectedOption === 'shipping' ? shipToName : editableDefaultDetails.customer_name,
            ship_to_phone_number: selectedOption === 'shipping' ? shipToPhoneNumber : editableDefaultDetails.customer_phonenumber,
          },
          {
            headers: { token: `${localStorage.getItem('accessToken')}` }
          }
        );
        onAddressAdd();
        clearForm();
        
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

    if (!selectedOption) {
      errors.selectedOption = 'You must select either shipping details or set as default';
    }

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


  const handleSelect = async (address_id) => {
    console.log('id', address_id);
    try {
      const response = await axios.get('http://localhost:7000/customer/getAddress', {
        params: { address_id } // Use params to send the address_id as a query parameter
      });
      setSelectedAddressId(response.data.result)
      console.log('select', response.data.result);
      onAddressSelect(response.data.result);
    } catch (error) {
      console.error('Error fetching address:', error.response ? error.response.data : error.message);
    }
  };
  const handleClose =()=>{
    onClose()
  }

  return (
    <div className="relative p-4 border rounded-lg shadow-lg max-w-md mx-auto bg-white">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <h2 className="text-xl font-bold mb-4">Address Form</h2>

      {successMessage && (
        <p className={`text-center ${successMessage.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tag">
            Address Label
          </label>
          <input
            id="tag"
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          {errors.tag && <p className="text-red-500 text-xs mt-1">{errors.tag}</p>}
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
            required
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
            required
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
            required
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
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Location</label>
          <GoogleMapComponent onLocationSelect={handleLocationSelect} />
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        <button
          type="button"
          onClick={handleViewAddresses}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          View Saved Addresses
        </button>

        {isViewAddresses && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-bold mb-2">Saved Addresses</h3>
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
                    <p>{add.tag}, {add.pincode}, {add.line1}, {add.line2}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No addresses available</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="shipping"
              checked={selectedOption === 'shipping'}
              onChange={() => setSelectedOption('shipping')}
              className="mr-2"
            />
            <label htmlFor="shipping" className="text-gray-700 text-sm">Include shipping details</label>
          </div>

          {selectedOption === 'shipping' && (
            <>
              <input
                type="text"
                value={shipToName}
                onChange={(e) => setShipToName(e.target.value)}
                placeholder="Ship To Name"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.shipToName && <p className="text-red-500 text-xs mt-1">{errors.shipToName}</p>}

              <input
                type="text"
                value={shipToPhoneNumber}
                onChange={(e) => setShipToPhoneNumber(e.target.value)}
                placeholder="Ship To Phone Number"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.shipToPhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.shipToPhoneNumber}</p>}
            </>
          )}

          <div className="flex items-center">
            <input
              type="radio"
              id="default"
              checked={selectedOption === 'default'}
              onChange={() => setSelectedOption('default')}
              className="mr-2"
            />
            <label htmlFor="default" className="text-gray-700 text-sm">Set as Default details</label>
          </div>

          {selectedOption === 'default' && (
            <>
              <input
                type="text"
                name="customer_name"
                value={editableDefaultDetails.customer_name}
                onChange={handleDefaultDetailsChange}
                placeholder="Default Name"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                name="customer_phonenumber"
                value={editableDefaultDetails.customer_phonenumber}
                onChange={handleDefaultDetailsChange}
                placeholder="Default Phone Number"
                className="w-full px-3 py-2 border rounded-md"
              />
            </>
          )}
        </div>

        {errors.selectedOption && <p className="text-red-500 text-xs mt-1">{errors.selectedOption}</p>}

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddressForm;