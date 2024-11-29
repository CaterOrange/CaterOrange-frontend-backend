import axios from 'axios';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import GoogleMapComponent from '../Maps/GMaps';
import { useNavigate } from 'react-router-dom';
import { VerifyToken } from '../../MiddleWare/verifyToken';

const AddressForm = ({ onAddressAdd, onAddressSelect, onClose }) => {
 const [formData, setFormData] = useState({
 tag: '',
 pincode: '',
 city: '',
 state: '',
 flatNumber: '',
 landmark: '',
 shipToName: '',
 shipToPhoneNumber: '',
 location: { address: '', lat: null, lng: null }
 });

 const [fieldErrors, setFieldErrors] = useState({
 tag: '',
 pincode: '',
 city: '',
 state: '',
 flatNumber: '',
 landmark: '',
 shipToName: '',
 shipToPhoneNumber: '',
 location: '',
 selectedOption: '',
 general: ''
 });

 const [address, setAddress] = useState([]);
 const [selectedOption, setSelectedOption] = useState(null);
 const [successMessage, setSuccessMessage] = useState('');
 const [isViewAddresses, setIsViewAddresses] = useState(false);
 const [defaultDetails, setDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
 const [editableDefaultDetails, setEditableDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
 const [selectedAddressId, setSelectedAddressId] = useState(null);
 const navigate = useNavigate();
 VerifyToken();
 useEffect(() => {
 const fetchDefaultDetails = async () => {
 const token = localStorage.getItem('token');
 if (!token) {
 console.warn('No token found, redirecting to login.');
 navigate('/');
 return;
 }
 try {
 const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getDefaultAddress`, {
 headers: { token }
 });
 const { customer_name, customer_phonenumber } = response.data.customer;

 setDefaultDetails({ customer_name, customer_phonenumber });
 setEditableDefaultDetails({ customer_name, customer_phonenumber });
 } catch (error) {
 console.error('Error fetching default address:', error);
 }
 };
 fetchDefaultDetails();
 }, [navigate]);

 const handleLocationSelect = ({ lat, lng, address }) => {
 setFormData(prev => ({
 ...prev,
 location: { lat, lng, address }
 }));
 setFieldErrors(prev => ({
 ...prev,
 location: ''
 }));
 };

 const validateField = (field, value) => {
 let error = '';
 switch (field) {
 case 'tag':
 if (!value.trim()) {
 return '*Address label is required*';
 } else if (value.length < 3) {
 return '*Address label must be at least 3 characters*';
 } else if (!/^[a-zA-Z\s]+$/.test(value)) {
 return '*Address label should only contain letters*';
 }
 break;
 case 'pincode':
 const pincodeRegex = /^\d{6}$/;
 if (!value.trim()) {
 error = '*Pincode is required*';
 } else if (!pincodeRegex.test(value)) {
 error = '*Invalid pincode format (should be 6 digits)*';
 }
 break;
 case 'flatNumber':
 if (!value.trim()) {
 error = '*flat/house number is required*';
 } else if (value.length < 2) {
 error = '*flat/house number must be at least 2 characters*';
 }
 else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
 return '*flat/house number should only contain letters*';
 }
 break;

case 'city':
 if (!value.trim()) {
 error = '*City is required*';
 } else if (value.length < 2) {
 error = '*City name must be at least 2 characters*';
 }
 else if (!/^[a-zA-Z\s]+$/.test(value)) {
 return '*City label should only contain letters*';
 }
 break;
 case 'state':
 if (!value.trim()) {
 error = '*State is required*';
 } else if (value.length < 2) {
 error = '*State name must be at least 2 characters*';
 }
 else if (!/^[a-zA-Z\s]+$/.test(value)) {
 return '*State label should only contain letters*';
 }
 break;
 case 'landmark':
 if (!value.trim()) {
 error = '*landmark is required*';
 } else if (value.length < 2) {
 error = '*landamark must be at least 2 characters*';
 }
 else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
 return '*landmark should only contain letters*';
 }
 break;
 default:
 break;
 }
 return error;
 };

 const handleChange = (field, value) => {
 setFormData(prev => ({
 ...prev,
 [field]: value
 }));
 
 const error = validateField(field, value);
 setFieldErrors(prev => ({
 ...prev,
 [field]: error
 }));
 };

 const handleDefaultDetailsChange = (e) => {
 const { name, value } = e.target;
 setEditableDefaultDetails(prev => ({ ...prev, [name]: value }));
 };

 const handleViewAddresses = async () => {
 if (!isViewAddresses) {
 try {
 const token = localStorage.getItem('token');
 if (!token) {
 console.error('No token found in localStorage');
 return;
 }

 const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getalladdresses`, {
 headers: { token }
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
 
 const validationErrors = {};
 
 // Validate all required fields
 Object.keys(formData).forEach(field => {
 const error = validateField(field, formData[field]);
 if (error) {
 validationErrors[field] = error;
 }
 });
 
 
 if (Object.keys(validationErrors).length === 0) {
 try {
 const response = await axios.post(
 `${process.env.REACT_APP_URL}/api/address/createAddres`,
 {
 tag: formData.tag,
 pincode: formData.pincode,
 line1: `${formData.flatNumber}, ${formData.landmark}`,
 line2: `${formData.city}, ${formData.state}`,
 location: [], //`{${formData.location.lat},${formData.location.lng}}`,
 ship_to_name: selectedOption === 'shipping' 
 ? formData.shipToName 
 : editableDefaultDetails.customer_name,
 ship_to_phone_number: selectedOption === 'shipping'
 ? formData.shipToPhoneNumber
 : editableDefaultDetails.customer_phonenumber
 },
 {
 headers: { 
 'token': localStorage.getItem('token') 
 }
 }
 );
 
 onAddressAdd();
 
 // Clear form
 setFormData({
 tag: '',
 pincode: '',
 city: '',
 state: '',
 flatNumber: '',
 landmark: '',
 shipToName: '',
 shipToPhoneNumber: '',
 location: { address: '', lat: null, lng: null }
 });
 
 setSuccessMessage('Address saved successfully.');
 } catch (error) {
 console.error('Error saving address:', error);
 setSuccessMessage('Failed to save address.');
 }
 } else {
 setFieldErrors(validationErrors);
 }
 };


 const handleSelect = async (address_id) => {
 try {
 const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/getAddress`, {
 params: { address_id },
 headers:{'token':localStorage.getItem('token')}
 });
 setSelectedAddressId(address_id);
 onAddressSelect(response.data.result);
 } catch (error) {
 console.error('Error fetching address:', error);
 }
 };

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
 <p className={`text-center ${successMessage.includes('success') ? 'text-green-500' : 'text-red-500'} mb-4`}>
 {successMessage}
 </p>
 )}

 {fieldErrors.general && (
 <p className="text-red-500 text-sm mb-4 text-center">{fieldErrors.general}</p>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 
 <div>
 <label className="block text-gray-700 text-sm font-bold mb-2">
 Address Label
 </label>
 <input
 type="text"
 value={formData.tag}
 onChange={(e) => handleChange('tag', e.target.value)}
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.tag ? 'border-red-500' : 'border-gray-300'}`}
 placeholder="e.g., Home, Office"
 />
 {fieldErrors.tag && <p className="text-red-500 text-xs mt-1">{fieldErrors.tag}</p>}
 </div>

 {/* Flat/House Number */}
 <div>
 <label className="block text-gray-700 text-sm font-bold mb-2">
 Flat/House Number
 </label>
 <input
 type="text"
 value={formData.flatNumber}
 onChange={(e) => handleChange('flatNumber', e.target.value)}
 
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.flatNumber ? 'border-red-500' : 'border-gray-300'}`}
 placeholder="e.g., Flat 101, House 123"
 />
 {fieldErrors.flatNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.flatNumber}</p>}
 </div>

 {/* Landmark */}
 <div>
 <label className="block text-gray-700 text-sm font-bold mb-2">
 Landmark
 </label>
 <input
 type="text"
 value={formData.landmark}
 onChange={(e) => handleChange('landmark', e.target.value)}
 
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.landmark ? 'border-red-500' : 'border-gray-300'}`}
 placeholder="e.g., Near Post Office"
 />
 {fieldErrors.landmark && <p className="text-red-500 text-xs mt-1">{fieldErrors.landmark}</p>}
 </div>

 {/* City */}
 <div>
 <label className="block text-gray-700 text-sm font-bold mb-2">
 City
 </label>
 <input
 type="text"
 value={formData.city}
 onChange={(e) => handleChange('city', e.target.value)}
 
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'}`}
 placeholder="Enter city name"
 />
 {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
 </div>

 {/* State */}
 <div>
 <label className="block text-gray-700 text-sm font-bold mb-2">
 State
 </label>
 <input
 type="text"
 value={formData.state}
 onChange={(e) => handleChange('state', e.target.value)}
 
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.state ? 'border-red-500' : 'border-gray-300'}`}
 placeholder="Enter state name"
 />
 {fieldErrors.state && <p className="text-red-500 text-xs mt-1">{fieldErrors.state}</p>}
 </div>

 {/* Pincode */}
 <div>
 <label className="block text-gray-700 text-sm font-bold mb-2">
 Pincode
 </label>
 <input
 type="text"
 value={formData.pincode}
 onChange={(e) => handleChange('pincode', e.target.value)}
 
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.pincode ? 'border-red-500' : 'border-gray-300'}`}
 placeholder="Enter 6-digit pincode"
 />
 {fieldErrors.pincode && <p className="text-red-500 text-xs mt-1">{fieldErrors.pincode}</p>}
 </div>
 
 <div>
 </div>

 {/* View Saved Addresses Button */}
 <button
 type="button"
 onClick={handleViewAddresses}
 className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
 >
 View Saved Addresses
 </button>

 {/* Saved Addresses Section */}
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

 {/* Shipping/Default Details Section */}
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
 value={formData.shipToName}
 onChange={(e) => handleChange('shipToName', e.target.value)}
 placeholder="Ship To Name"
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.shipToName ? 'border-red-500' : 'border-gray-300'}`}
 />
 {fieldErrors.shipToName && <p className="text-red-500 text-xs mt-1">{fieldErrors.shipToName}</p>}

 <input
 type="text"
 value={formData.shipToPhoneNumber}
 onChange={(e) => handleChange('shipToPhoneNumber', e.target.value)}
 placeholder="Ship To Phone Number"
 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.shipToPhoneNumber ? 'border-red-500' : 'border-gray-300'}`}
 />
 {fieldErrors.shipToPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.shipToPhoneNumber}</p>}
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
 <label htmlFor="default" className="text-gray-700 text-sm">Use Default Details</label>
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

 <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
 Submit
 </button>
 </form>
 </div>
 );
};

export default AddressForm;