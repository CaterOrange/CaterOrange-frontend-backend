import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { VerifyToken } from '../../MiddleWare/verifyToken';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

    const [position, setPosition] = useState([20.5937, 78.9629]); // Default to center of India
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
    const [mapKey, setMapKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState('');

    VerifyToken();

    // Regular expressions for validation
    const letterRegex = /^[A-Za-z\s]*$/;
    const flatNumberRegex = /^[A-Za-z0-9\s]*$/;
    const pincodeRegex = /^\d{6}$/;

    // Validate function for required location
    const validateLocation = () => {
        if (!location || !location.lat || !location.lng) {
            return 'Location is required.';
        }
        return '';
    };

    // Validation functions for individual fields
    const validateField = (name, value) => {
        switch (name) {
            case 'tag':
                if (!value) return 'Tag is required';
                if (value.length < 2) return 'Tag must be at least 2 characters';
                if (value.length > 50) return 'Tag must be less than 50 characters';
                if (!letterRegex.test(value)) return 'Tag must only contain letters and spaces';
                return '';

            case 'pincode':
                if (!value) return 'Pincode is required';
                if (!pincodeRegex.test(value)) return 'Valid 6-digit pincode is required';
                return '';

            case 'city':
                if (!value) return 'City is required';
                if (value.length < 2) return 'City must be at least 2 characters';
                if (value.length > 50) return 'City must be less than 50 characters';
                if (!letterRegex.test(value)) return 'City must only contain letters and spaces';
                return '';

            case 'state':
                if (!value) return 'State is required';
                if (value.length < 2) return 'State must be at least 2 characters';
                if (value.length > 50) return 'State must be less than 50 characters';
                if (!letterRegex.test(value)) return 'State must only contain letters and spaces';
                return '';

            case 'flatNumber':
                if (value && value.length > 20) return 'Flat number must be less than 20 characters';
                if (value && !flatNumberRegex.test(value)) return 'Flat number must contain only letters, numbers, and spaces';
                return '';

            case 'landmark':
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

    useEffect(() => {
        const fetchDefaultDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found, please log in again.');
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getDefaultAddress`, {
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

    const validate = () => {
        const validationErrors = {};
        
        if (!tag) validationErrors.tag = 'Tag is required';
        else if (tag.length < 2) validationErrors.tag = 'Tag must be at least 2 characters';
        else if (tag.length > 50) validationErrors.tag = 'Tag must be less than 50 characters';
        else if (!letterRegex.test(tag)) validationErrors.tag = 'Tag must only contain letters and spaces';
        
        if (!pincode) validationErrors.pincode = 'Pincode is required';
        else if (!pincodeRegex.test(pincode)) validationErrors.pincode = 'Valid 6-digit pincode is required';
        
        if (!city) validationErrors.city = 'City is required';
        else if (city.length < 2) validationErrors.city = 'City must be at least 2 characters';
        else if (city.length > 50) validationErrors.city = 'City must be less than 50 characters';
        else if (!letterRegex.test(city)) validationErrors.city = 'City must only contain letters and spaces';
        
        if (!state) validationErrors.state = 'State is required';
        else if (state.length < 2) validationErrors.state = 'State must be at least 2 characters';
        else if (state.length > 50) validationErrors.state = 'State must be less than 50 characters';
        else if (!letterRegex.test(state)) validationErrors.state = 'State must only contain letters and spaces';
        
        if (flatNumber && flatNumber.length > 20) validationErrors.flatNumber = 'Flat number must be less than 20 characters';
        else if (flatNumber && !flatNumberRegex.test(flatNumber)) validationErrors.flatNumber = 'Flat number must contain only letters, numbers, and spaces';
        
        if (landmark && landmark.length > 100) validationErrors.landmark = 'Landmark must be less than 100 characters';

        if (validateLocation()) {
            validationErrors.location = validateLocation();
        }

        if (!selectedOption) {
            validationErrors.selectedOption = 'You must select either shipping details or set as default';
        }

        if (selectedOption === 'shipping') {
            if (!shipToName) validationErrors.shipToName = 'Ship to name is required';
            else if (shipToName.length > 100) validationErrors.shipToName = 'Ship to name must be less than 100 characters';
            else if (!letterRegex.test(shipToName)) validationErrors.shipToName = 'Ship to name must only contain letters and spaces';
        
            if (!shipToPhoneNumber || isNaN(shipToPhoneNumber) || shipToPhoneNumber.length !== 10) {
                validationErrors.shipToPhoneNumber = 'Valid 10-digit phone number is required';
            }
        }

        if (selectedOption === 'default') {
            if (!editableDefaultDetails.customer_name) {
                validationErrors.customerName = 'Default name is required';
            } else if (editableDefaultDetails.customer_name.length > 100) {
                validationErrors.customerName = 'Default name must be less than 100 characters';
            } else if (!letterRegex.test(editableDefaultDetails.customer_name)) {
                validationErrors.customerName = 'Default name must only contain letters and spaces';
            }
        
            if (!editableDefaultDetails.customer_phonenumber || isNaN(editableDefaultDetails.customer_phonenumber) || editableDefaultDetails.customer_phonenumber.length !== 10) {
                validationErrors.customerPhoneNumber = 'Valid 10-digit phone number is required';
            }
        }

        return validationErrors;
    };

    const getCurrentLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setPosition([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                    setMapKey((prev) => prev + 1);
                    setLocation({ lat: latitude, lng: longitude, address: '' });
                    setLoading(false);
                },
                () => {
                    setLoading(false);
                    setLocationError('Failed to get current location');
                }
            );
        } else {
            setLoading(false);
            setLocationError('Geolocation is not supported by this browser.');
        }
    };

    const handleLocationSelect = (newPosition) => {
        setPosition(newPosition);
        setLocationError('');
        setLocation({ lat: newPosition[0], lng: newPosition[1], address: '' });
    };

    const LocationMarker = ({ position, onLocationSelect }) => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                onLocationSelect([lat, lng]);
            },
        });

        return position ? <Marker position={position} /> : null;
    };

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

                await axios.post(
                    url,
                    {
                        tag,
                        pincode,
                        line1,
                        line2,
                        location: `https://www.google.com/maps?q=${position[0]},${position[1]}`,
                        ship_to_name: selectedOption === 'shipping' ? shipToName : editableDefaultDetails.customer_name,
                        ship_to_phone_number: selectedOption === 'shipping' ? shipToPhoneNumber : editableDefaultDetails.customer_phonenumber,
                    },
                    {
                        headers: { 'token': token },
                    }
                );

                clearForm();
                if (saveAddress) {
                    saveAddress({ tag, pincode, line1, line2, location, ship_to_name: shipToName, ship_to_phone_number: shipToPhoneNumber });
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
        setLocation(null);
        setShipToName('');
        setShipToPhoneNumber('');
        setSelectedOption(null);
        setErrors({});
    };

    return (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-6">
                <div className="border rounded overflow-hidden h-64 mb-4">
                    <MapContainer
                        key={mapKey}
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
                    </MapContainer>
                </div>

                <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loading}
                    className="w-full mb-4 bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-500 disabled:bg-orange-300"
                >
                    {loading ? 'Getting Location...' : '📍 Use Current Location'}
                </button>
                {locationError && <p className="text-red-500 text-sm mb-4">{locationError}</p>}
                {errors.location && <p className="text-red-500 text-xs mb-4">{errors.location}</p>} {/* Display location error */}
            </div>

            {successMessage && (
                <p className={`text-center ${successMessage.includes('success') ? 'text-teal-800' : 'text-red-500'}`}>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-800 focus:border-teal-600"
                            />
                            {errors.customerPhoneNumber && <p className="text-red-500 text-xs">{errors.customerPhoneNumber}</p>}
                        </div>
                    </>
                )}

                <button
                    onClick={handleSubmit}
                    type="submit"
                    className="w-full bg-teal-800 text-white py-2 px-4 rounded-md shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-opacity-50"
                >
                    {existingAddress ? 'Update Address' : 'Save Address'}
                </button>
            </form>
        </div>
    );
};

export default AddressForm;
