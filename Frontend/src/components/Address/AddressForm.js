import React, { useEffect, useState, useRef } from 'react';
import { Pencil, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const DefaultIcon = L.icon({
 iconUrl: icon,
 shadowUrl: iconShadow,
 iconSize: [25, 41],
 iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AddressForm = ({ initialData = null, onAddressAdd, onAddressSelect, onClose }) => {
 const [isEdit, setIsEdit] = useState(false);
 const [editAddressId, setEditAddressId] = useState(null);
 const [formData, setFormData] = useState({
 addressLabel: '',
 doorNumber: '',
 landmark: '',
 city: '',
 state: '',
 pincode: '',
 location: { lat: null, lng: null }
 });

 const [address, setAddress] = useState([]);
 const [isViewAddresses, setIsViewAddresses] = useState(false);
 const [selectedAddressId, setSelectedAddressId] = useState(null);
 const [position, setPosition] = useState([20.5937, 78.9629]);
 const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
 const [mapKey, setMapKey] = useState(0);
 const [loading, setLoading] = useState(false);
 const [locationError, setLocationError] = useState('');
 const [successMessage, setSuccessMessage] = useState('');
 const [formErrors, setFormErrors] = useState({});
 const [defaultDetails, setDefaultDetails] = useState({
 customer_name: '',
 customer_phonenumber: '',
 isValid: false,
 errors: {}
 });

 const [isFormValid, setIsFormValid] = useState(false);

 const navigate = useNavigate();
 const modalRef = useRef(null);
 VerifyToken();

 useEffect(() => {
 fetchDefaultDetails();
 if (initialData) {
 populateInitialData();
 }
 }, [initialData]);

 const fetchDefaultDetails = async () => {
 try {
 const token = localStorage.getItem('token');
 if (!token) {
 navigate('/');
 return;
 }

 const response = await axios.get(
 `${process.env.REACT_APP_URL}/api/address/getDefaultAddress`,
 { headers: { token } }
 );

 const { customer_name, customer_phonenumber } = response.data.customer;
 setDefaultDetails(prev => ({
 ...prev,
 customer_name,
 customer_phonenumber,
 isValid: validateDefaultDetails(customer_name, customer_phonenumber)
 }));
 } catch (error) {
 console.error('Error fetching default details:', error);
 }
 };

 const populateInitialData = () => {
 setIsEdit(true);
 setEditAddressId(initialData.address_id);

 const locationUrl = initialData.location || '';
 const coords = locationUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
 const [doorNumber, landmark] = (initialData.line1 || '').split(',').map(s => s.trim());
 const [city, state] = (initialData.line2 || '').split(',').map(s => s.trim());

 setFormData({
 addressLabel: initialData.tag || '',
 doorNumber: doorNumber || '',
 landmark: landmark || '',
 city: city || '',
 state: state || '',
 pincode: initialData.pincode || '',
 location: coords ? {
 lat: parseFloat(coords[1]),
 lng: parseFloat(coords[2])
 } : { lat: null, lng: null }
 });

 if (coords) {
 const newPos = [parseFloat(coords[1]), parseFloat(coords[2])];
 setPosition(newPos);
 setMapCenter(newPos);
 setMapKey(prev => prev + 1);
 }
 };

 const validateField = (name, value) => {
 let error = '';
 switch (name) {
 case 'location':
 if (!value || !value.lat || !value.lng) {
 error = 'Please select a location on the map';
 }
 break;
 
 case 'addressLabel':
 if (!value) error = 'Address label is required';
 break;
 case 'doorNumber':
 if (!value) error = 'Door number is required';
 else if (value.length < 2) error = 'Door number must be at least 2 characters';
 break;
 case 'landmark':
 if (!value) error = 'Landmark is required';
 break;
 case 'city':
 if (!value) error = 'City is required';
 else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'City should only contain letters';
 break;
 case 'state':
 if (!value) error = 'State is required';
 else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'State should only contain letters';
 break;
 case 'pincode':
 if (!value) {
 error = 'Pincode is required';
 } else {
 // Remove any spaces or non-digit characters
 const cleanPincode = value.replace(/\D/g, '');
 if (cleanPincode.length !== 6) {
 error = 'Pincode must be 6 digits';
 }
 }
 break;
 case 'location':
 if (!value.lat || !value.lng) error = 'Location is required';
 break;
 default:
 break;
 }
 return error;
 };

 // Validate entire form and update isFormValid state
 const validateForm = () => {
 const errors = {};
 let isValid = true;
 
 Object.keys(formData).forEach(key => {
 const error = validateField(key, 
 key === 'location' ? formData[key] : formData[key]);
 if (error) {
 errors[key] = error;
 isValid = false;
 }
 });

 setFormErrors(errors);
 setIsFormValid(isValid && defaultDetails.isValid);
 return isValid;
 };

 // Handle input changes with immediate validation
 const handleChange = (e) => {
 const { name, value } = e.target;
 
 // Special handling for pincode
 if (name === 'pincode') {
 // Remove any non-digit characters
 const cleanValue = value.replace(/\D/g, '');
 // Only update if it's empty or contains digits and is not longer than 6
 if (cleanValue.length <= 6) {
 setFormData(prev => ({
 ...prev,
 [name]: cleanValue
 }));
 
 // Validate the cleaned pincode value
 const error = validateField(name, cleanValue);
 setFormErrors(prev => ({
 ...prev,
 [name]: error
 }));
 }
 } else {
 setFormData(prev => ({
 ...prev,
 [name]: value
 }));
 
 // Validate the changed field immediately
 const error = validateField(name, value);
 setFormErrors(prev => ({
 ...prev,
 [name]: error
 }));
 }
 
 // Validate entire form to update button state
 setTimeout(() => validateForm(), 0);
 };

 // Validate default details with immediate feedback
 const validateDefaultDetails = (name, phone) => {
 const errors = {};
 
 if (!name?.trim() || name.length < 3) {
 errors.customer_name = 'Name must be at least 3 characters';
 }
 
 if (!phone?.trim() || !/^\d{10}$/.test(phone)) {
 errors.customer_phonenumber = 'Phone number must be 10 digits';
 }
 
 return {
 isValid: Object.keys(errors).length === 0,
 errors
 };
 };

 // Handle default details changes with validation
 const handleDefaultDetailsChange = (e) => {
 const { name, value } = e.target;
 const newDetails = {
 ...defaultDetails,
 [name]: value
 };
 
 const validation = validateDefaultDetails(
 name === 'customer_name' ? value : newDetails.customer_name,
 name === 'customer_phonenumber' ? value : newDetails.customer_phonenumber
 );
 
 setDefaultDetails({
 ...newDetails,
 isValid: validation.isValid,
 errors: validation.errors
 });
 
 // Update overall form validity
 setTimeout(() => validateForm(), 0);
 };

 // Effect to validate form when component mounts or data changes
 useEffect(() => {
 validateForm();
 }, [formData, defaultDetails]);

 const getCurrentLocation = () => {
 setLoading(true);
 if (navigator.geolocation) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 const { latitude, longitude } = position.coords;
 setPosition([latitude, longitude]);
 setMapCenter([latitude, longitude]);
 setFormData(prev => ({
 ...prev,
 location: { lat: latitude, lng: longitude }
 }));
 setMapKey(prev => prev + 1);
 setLoading(false);
 },
 () => {
 setLoading(false);
 setLocationError('Failed to get current location');
 }
 );
 } else {
 setLoading(false);
 setLocationError('Geolocation is not supported');
 }
 };

 const handleLocationSelect = (newPosition) => {
 setPosition(newPosition);
 setLocationError('');
 setFormData(prev => ({
 ...prev,
 location: { lat: newPosition[0], lng: newPosition[1] }
 }));
 // Clear location error when a location is selected
 setFormErrors(prev => ({
 ...prev,
 location: ''
 }));
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
 
 if (!validateForm()) {
 return;
 }

 try {
 const token = localStorage.getItem('token');
 if (!token || isTokenExpired(token)) {
 navigate('/');
 return;
 }

 const payload = {
 tag: formData.addressLabel,
 pincode: formData.pincode,
 line1: `${formData.doorNumber}, ${formData.landmark}`,
 line2: `${formData.city}, ${formData.state}`,
 location: `https://www.google.com/maps?q=${formData.location.lat},${formData.location.lng}`,
 ship_to_name: defaultDetails.customer_name,
 ship_to_phone_number: defaultDetails.customer_phonenumber
 };

 if (isEdit) {
 await axios.put(
 `${process.env.REACT_APP_URL}/api/customer/address/update/${editAddressId}`,
 payload,
 { headers: { token } }
 );
 setSuccessMessage('Address updated successfully');
 } else {
 await axios.post(
 `${process.env.REACT_APP_URL}/api/address/createAddres`,
 payload,
 { headers: { token } }
 );
 setSuccessMessage('Address saved successfully');
 }

 if (onAddressAdd) await onAddressAdd();
 if (onClose) onClose();

 } catch (error) {
 setFormErrors(prev => ({
 ...prev,
 general: error.response?.data?.message || 'Failed to save address'
 }));
 }
 };


 const handleViewAddresses = async () => {
 if (!isViewAddresses) {
 try {
 const token = localStorage.getItem('token');
 if (!token || isTokenExpired(token)) {
 navigate('/');
 return;
 }

 const response = await axios.get(
 `${process.env.REACT_APP_URL}/api/address/getalladdresses`,
 { headers: { token } }
 );

 if (response.data.address) {
 setAddress(response.data.address);
 }
 } catch (error) {
 console.error('Error fetching addresses:', error);
 }
 }
 setIsViewAddresses(!isViewAddresses);
 };

 const handleSelect = async (address_id) => {
 try {
 const response = await axios.get(
 `${process.env.REACT_APP_URL}/api/customer/getAddress`,
 {
 params: { address_id },
 headers: { token: localStorage.getItem('token') }
 }
 );
 setSelectedAddressId(address_id);
 if (onAddressSelect) onAddressSelect(response.data.result);
 } catch (error) {
 console.error('Error fetching address:', error);
 }
 };

 const handleOverlayClick = (e) => {
 if (e.target === e.currentTarget) {
 onClose();
 }
 };

 return (
 <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" onClick={handleOverlayClick}>
 <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto" ref={modalRef}>
 <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
 <h2 className="text-xl font-semibold text-teal-700 font-serif">
 ✏️ {isEdit ? 'Edit Address' : 'Add New Address'}
 </h2>
 <button
 onClick={onClose}
 className="p-1 rounded-full bg-gray-200 hover:bg-red-100 active:bg-red-200 transition-all duration-300"
 >
 <X size={20} className="text-red-600" />
 </button>
 </div>

 <div className="px-6 py-4">
 <div className="mb-6">
 <div className="relative z-0 border-2 border-teal-500 rounded-lg overflow-hidden h-64 mb-4">
 <MapContainer
 key={mapKey}
 center={mapCenter}
 zoom={13}
 style={{ height: '100%', width: '100%' }}
 >
 <TileLayer
 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 attribution='© OpenStreetMap contributors'
 />
 <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
 </MapContainer>
 </div>

 {/* Add error message for location */}
 {formErrors.location && (
 <p className="text-red-500 text-sm mb-2">{formErrors.location}</p>
 )}

 <button
 type="button"
 onClick={getCurrentLocation}
 disabled={loading}
 className="w-full mb-4 bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-600 disabled:bg-teal-300"
 >
 {loading ? 'Getting Location...' : '📍 Use Current Location'}
 </button>
 {locationError && <p className="text-red-500 text-sm mb-4">{locationError}</p>}
 </div>

 {successMessage && (
 <div className="text-teal-700 text-center mb-4">{successMessage}</div>
 )}

 {formErrors.general && (
 <div className="text-red-500 text-center mb-4">{formErrors.general}</div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-2 gap-6">
 <div className="form-group">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Address Label *
 </label>
 <select
 name="addressLabel"
 value={formData.addressLabel}
 onChange={handleChange}
 className={`w-full px-3 py-2 border rounded-md ${
 formErrors.addressLabel ? 'border-red-500' : 'border-gray-300'
 }`}
 >
 <option value="">Select Label</option>
 <option value="home">Home</option>
 <option value="office">Office</option>
 <option value="other">Other</option>
 </select>
 {formErrors.addressLabel && (
 <p className="text-red-500 text-xs mt-1">{formErrors.addressLabel}</p>
 )}
 </div>

 <div className="form-group">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Door Number & Floor *
 </label>
 <input
 type="text"
 name="doorNumber"
 value={formData.doorNumber}
 onChange={handleChange}
 className={`w-full px-3 py-2 border rounded-md ${
 formErrors.doorNumber ? 'border-red-500' : 'border-gray-300'
 }`}
 placeholder="Ex: Flat 101"
 />
 {formErrors.doorNumber && (
 <p className="text-red-500 text-xs mt-1">{formErrors.doorNumber}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="form-group">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Landmark *
 </label>
 <input
 type="text"
 name="landmark"
 value={formData.landmark}
 onChange={handleChange}
 className={`w-full px-3 py-2 border rounded-md ${
 formErrors.landmark ? 'border-red-500' : 'border-gray-300'
 }`}
 placeholder="Ex: Near Post Office"
 />
 {formErrors.landmark && (
 <p className="text-red-500 text-xs mt-1">{formErrors.landmark}</p>
 )}
 </div>

 <div className="form-group">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 City *
 </label>
 <input
 type="text"
 name="city"
 value={formData.city}
 onChange={handleChange}
 className={`w-full px-3 py-2 border rounded-md ${
 formErrors.city ? 'border-red-500' : 'border-gray-300'
 }`}
 placeholder="Enter city"
 />
 {formErrors.city && (
 <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="form-group">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 State *
 </label>
 <input
 type="text"
 name="state"
 value={formData.state}
 onChange={handleChange}
 className={`w-full px-3 py-2 border rounded-md ${
 formErrors.state ? 'border-red-500' : 'border-gray-300'
 }`}
 placeholder="Enter state"
 />
 {formErrors.state && (
 <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>
 )}
 </div>

 <div className="form-group">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Pincode *
 </label>
 <input
 type="text"
 name="pincode"
 value={formData.pincode}
 onChange={handleChange}
 maxLength={6}
 pattern="\d*"
 inputMode="numeric"
 className={`w-full px-3 py-2 border rounded-md ${
 formErrors.pincode ? 'border-red-500' : 'border-gray-300'
 }`}
 placeholder="Enter 6-digit pincode"
 />
 {formErrors.pincode && (
 <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>
 )}
 </div>

 </div>

 <div className="space-y-4 mt-6">
 <div className="bg-gray-50 p-4 rounded-lg">
 <h3 className="text-gray-800 text-sm font-medium mb-3">Default Details</h3>
 <div className="space-y-3">
 <div>
 <input
 type="text"
 name="customer_name"
 value={defaultDetails.customer_name}
 onChange={handleDefaultDetailsChange}
 placeholder="Default Name"
 className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
 />
 {defaultDetails.errors.customer_name && (
 <p className="text-red-500 text-xs mt-1">
 {defaultDetails.errors.customer_name}
 </p>
 )}
 </div>

 <div>
 <input
 type="text"
 name="customer_phonenumber"
 value={defaultDetails.customer_phonenumber}
 onChange={handleDefaultDetailsChange}
 placeholder="Default Phone Number"
 className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
 />
 {defaultDetails.errors.customer_phonenumber && (
 <p className="text-red-500 text-xs mt-1">
 {defaultDetails.errors.customer_phonenumber}
 </p>
 )}
 </div>
 </div>
 </div>

 <button 
 type="submit"
 className={`w-full font-bold py-2 px-4 rounded transition-colors ${
 defaultDetails.isValid 
 ? 'bg-teal-700 hover:bg-teal-600 text-white' 
 : 'bg-gray-300 text-gray-500 cursor-not-allowed'
 }`}
 disabled={!defaultDetails.isValid}
 >
 {isEdit ? 'Update Address' : 'Save Address'}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
};

export default AddressForm;