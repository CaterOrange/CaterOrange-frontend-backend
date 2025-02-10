
// import axios from 'axios';
// import { Pencil, Trash, X } from 'lucide-react';
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';
// import 'leaflet/dist/leaflet.css';

// import L from 'leaflet';
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// const DefaultIcon = L.icon({
//     iconUrl: icon,
//     shadowUrl: iconShadow,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41]
// });

// L.Marker.prototype.options.icon = DefaultIcon;

// const AddressForm = ({ onAddressAdd, onAddressSelect, onClose }) => {
//     const [isEdit, setIsEdit] = useState(false);
// const [editAddressId, setEditAddressId] = useState(null);
//     const [formData, setFormData] = useState({
//         tag: '',
//         pincode: '',
//         city: '',
//         state: '',
//         flatNumber: '',
//         landmark: '',
//         shipToName: '',
//         shipToPhoneNumber: '',
//         location: { lat: null, lng: null } // Modified for validation
//     });

//     const [fieldErrors, setFieldErrors] = useState({
//         tag: '',
//         pincode: '',
//         city: '',
//         state: '',
//         flatNumber: '',
//         landmark: '',
//         shipToName: '',
//         shipToPhoneNumber: '',
//         location: '',
//         selectedOption: '',
//         general: ''
//     });

//     const [address, setAddress] = useState([]);
//     const [selectedOption, setSelectedOption] = useState(null);
//     const [successMessage, setSuccessMessage] = useState('');
//     const [isViewAddresses, setIsViewAddresses] = useState(false);
//     const [defaultDetails, setDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
//     const [editableDefaultDetails, setEditableDefaultDetails] = useState({ customer_name: '', customer_phonenumber: '' });
//     const [selectedAddressId, setSelectedAddressId] = useState(null);

//     const [position, setPosition] = useState([20.5937, 78.9629]); // Default to center of India
//     const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
//     const [mapKey, setMapKey] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const [locationError, setLocationError] = useState('');

//     const navigate = useNavigate();
//     VerifyToken();

//     useEffect(() => {
//         const fetchDefaultDetails = async () => {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 console.warn('No token found, redirecting to login.');
//                 navigate('/');
//                 return;
//             }
//             try {
//                 const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getDefaultAddress`, {
//                     headers: { token }
//                 });
//                 const { customer_name, customer_phonenumber } = response.data.customer;

//                 setDefaultDetails({ customer_name, customer_phonenumber });
//                 setEditableDefaultDetails({ customer_name, customer_phonenumber });
//             } catch (error) {
//                 console.error('Error fetching default address:', error);
//             }
//         };
//         fetchDefaultDetails();
//     }, [navigate]);

//     const validateField = (field, value) => {
//         let error = '';
//         switch (field) {
//             case 'tag':
//                 if (!value.trim()) {
//                     return '*Address label is required*';
//                 } else if (value.length < 3) {
//                     return '*Address label must be at least 3 characters*';
//                 } else if (!/^[a-zA-Z\s]+$/.test(value)) {
//                     return '*Address label should only contain letters*';
//                 }
//                 break;
//             case 'pincode':
//                 const pincodeRegex = /^\d{6}$/;
//                 if (!value.trim()) {
//                     error = '*Pincode is required*';
//                 } else if (!pincodeRegex.test(value)) {
//                     error = '*Invalid pincode format (should be 6 digits)*';
//                 }
//                 break;
//             case 'flatNumber':
//                 if (!value.trim()) {
//                     error = '*Flat/house number is required*';
//                 } else if (value.length < 2) {
//                     error = '*Flat/house number must be at least 2 characters*';
//                 } else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
//                     return '*Flat/house number should only contain letters or numbers*';
//                 }
//                 break;
//             case 'city':
//                 if (!value.trim()) {
//                     error = '*City is required*';
//                 } else if (value.length < 2) {
//                     error = '*City name must be at least 2 characters*';
//                 } else if (!/^[a-zA-Z\s]+$/.test(value)) {
//                     return '*City label should only contain letters*';
//                 }
//                 break;
//             case 'state':
//                 if (!value.trim()) {
//                     error = '*State is required*';
//                 } else if (value.length < 2) {
//                     error = '*State name must be at least 2 characters*';
//                 } else if (!/^[a-zA-Z\s]+$/.test(value)) {
//                     return '*State label should only contain letters*';
//                 }
//                 break;
//             case 'landmark':
//                 if (!value.trim()) {
//                     error = '*Landmark is required*';
//                 } else if (value.length < 2) {
//                     error = '*Landmark must be at least 2 characters*';
//                 } else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
//                     return '*Landmark should only contain letters or numbers*';
//                 }
//                 break;
//             case 'location':
//                 if (!value.lat || !value.lng) {
//                     error = '*Location is required*';
//                 }
//                 break;
//             default:
//                 break;
//         }
//         return error;
//     };

//     const handleChange = (field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));

//         const error = validateField(field, value);
//         setFieldErrors(prev => ({
//             ...prev,
//             [field]: error
//         }));
//     };

//     const getCurrentLocation = () => {
//         setLoading(true);
//         if (navigator.geolocation) {
//             navigator.geolocation.getCurrentPosition(
//                 (position) => {
//                     const { latitude, longitude } = position.coords;
//                     setPosition([latitude, longitude]);
//                     setMapCenter([latitude, longitude]);
//                     setFormData(prev => ({
//                         ...prev,
//                         location: { lat: latitude, lng: longitude } // Setting the location when getting the current location
//                     }));
//                     setMapKey(prev => prev + 1);
//                     setLoading(false);
//                 },
//                 () => {
//                     setLoading(false);
//                     setLocationError('Failed to get current location. Please try again.');
//                 }
//             );
//         } else {
//             setLoading(false);
//             setLocationError('Geolocation is not supported by this browser.');
//         }
//     };

//     const handleLocationSelect = (newPosition) => {
//         setPosition(newPosition);
//         setLocationError('');
//         setFormData(prev => ({
//             ...prev,
//             location: { lat: newPosition[0], lng: newPosition[1] } // Update the location on map click
//         }));
//     };

//     const LocationMarker = ({ position, onLocationSelect }) => {
//         const map = useMapEvents({
//             click(e) {
//                 const { lat, lng } = e.latlng;
//                 onLocationSelect([lat, lng]);
//             },
//         });

//         return position ? <Marker position={position} /> : null;
//     };

//     const handleDefaultDetailsChange = (e) => {
//         const { name, value } = e.target;
//         setEditableDefaultDetails(prev => ({ ...prev, [name]: value }));
//     };

//     const handleViewAddresses = async () => {
//         if (!isViewAddresses) {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (!token) {
//                     console.error('No token found in localStorage');
//                     return;
//                 }
//                 if (isTokenExpired(token)) {
//                     navigate('/');
//                     return;
//                 }

//                 const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getalladdresses`, {
//                     headers: { token }
//                 });

//                 if (response.data.address) {
//                     setAddress(response.data.address);
//                 } else {
//                     console.error('Failed to fetch addresses:', response.status);
//                 }
//             } catch (error) {
//                 console.error('Error fetching addresses:', error);
//             }
//         }
//         setIsViewAddresses(!isViewAddresses);
//     };


// const handleSubmit = async (e) => {
//     e.preventDefault();
//     const validationErrors = {};

//     // Validate all required fields
//     Object.keys(formData).forEach(field => {
//         const error = validateField(field, formData[field]);
//         if (error) {
//             validationErrors[field] = error;
//         }
//     });

//     // Validate location explicitly
//     const locationError = validateField('location', formData.location);
//     if (locationError) {
//         validationErrors.location = locationError;
//     }

//     // Validate selected option
//     if (!selectedOption) {
//         validationErrors.selectedOption = '*Please select either shipping or default details*';
//     }

//     if (Object.keys(validationErrors).length > 0) {
//         setFieldErrors(validationErrors);
//         // Scroll to the first error
//         const firstError = document.querySelector('.text-red-500');
//         if (firstError) {
//             firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         }
//         return;
//     }

//     // Submit the form if no errors
//     try {
//         if (isTokenExpired(localStorage.getItem('token'))) {
//             navigate('/');
//             return;
//         }

//         const payload = {
//             tag: formData.tag,
//             pincode: formData.pincode,
//             line1: `${formData.flatNumber}, ${formData.landmark}`,
//             line2: `${formData.city}, ${formData.state}`,
//             location: `https://www.google.com/maps?q=${position[0]},${position[1]}`,
//             ship_to_name: selectedOption === 'shipping'
//                 ? formData.shipToName
//                 : editableDefaultDetails.customer_name,
//             ship_to_phone_number: selectedOption === 'shipping'
//                 ? formData.shipToPhoneNumber
//                 : editableDefaultDetails.customer_phonenumber
//         };
//         console.log('edited data',payload,isEdit)
//         if (isEdit) {
//             // Make PUT request to edit endpoint
//             await axios.post(
//                 `${process.env.REACT_APP_URL}/api/address/edit/${editAddressId}`,
//                 payload,
//                 {
//                     headers: { 'token': localStorage.getItem('token') }
//                 }
//             );
//             setSuccessMessage('Address updated successfully.');
//         } else {
//             // Make POST request to create endpoint
//             await axios.post(
//                 `${process.env.REACT_APP_URL}/api/address/createAddres`,
//                 payload,
//                 {
//                     headers: { 'token': localStorage.getItem('token') }
//                 }
//             );
//             setSuccessMessage('Address saved successfully.');
//         }

//         // Clear form and reset edit state
//         setFormData({
//             tag: '',
//             pincode: '',
//             city: '',
//             state: '',
//             flatNumber: '',
//             landmark: '',
//             shipToName: '',
//             shipToPhoneNumber: '',
//             location: { lat: null, lng: null }
//         });
//         setIsEdit(false);
//         setEditAddressId(null);
//         onAddressAdd(); // Refresh the address list

//     } catch (error) {
//         console.error('Error saving/updating address:', error);
//         setSuccessMessage(isEdit ? 'Failed to update address.' : 'Failed to save address.');
//     }
// };
//     const handleSelect = async (address_id) => {
//         try {
//             const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/getAddress`, {
//                 params: { address_id },
//                 headers: { 'token': localStorage.getItem('token') }
//             });
//             setSelectedAddressId(address_id);
//             onAddressSelect(response.data.result);
//         } catch (error) {
//             console.error('Error fetching address:', error);
//         }
//     };
  
      
//         const handleEdit = (address) => {
//             // Parse line1 (flatNumber, landmark)
//             setIsEdit(true);
//             setEditAddressId(address.address_id);
//             const [flatNumber, landmark] = address.line1.split(',').map(item => item.trim());
            
//             // Parse line2 (city, state)
//             const [city, state] = address.line2.split(',').map(item => item.trim());
//             const locationCoords = address.location
//             .split('q=')[1]  // Get everything after 'q='
//             ?.split(',')     // Split into lat,lng
//             .map(coord => parseFloat(coord)); // Convert to numbers
        
//           const lat = locationCoords?.[0] || null;
//           const lng = locationCoords?.[1] || null;
//             // Update form data with parsed values
//             setFormData({
//               tag: address.tag,
//               pincode: address.pincode,
//               flatNumber: flatNumber,
//               landmark: landmark,
//               city: city,
//               state: state,
//               shipToName: address.ship_to_name || '',
//               shipToPhoneNumber: address.ship_to_phone_number || '',
//               location: { lat, lng }
//             });
//             if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
//                 setPosition([lat, lng]);
//                 setMapCenter([lat, lng]);
//                 setMapKey(prev => prev + 1); // Force map re-render
//               }
       
//             // Set the appropriate shipping option based on whether custom shipping details exist
//             if (address.ship_to_name && address.ship_to_phone_number) {
//                 setSelectedOption('shipping');
//               } else {
//                 setSelectedOption('default');
//                 setEditableDefaultDetails({
//                   customer_name: address.ship_to_name || defaultDetails.customer_name,
//                   customer_phonenumber: address.ship_to_phone_number || defaultDetails.customer_phonenumber
//                 });
//               }
//             // Clear any existing field errors
//             setFieldErrors({
//               tag: '',
//               pincode: '',
//               city: '',
//               state: '',
//               flatNumber: '',
//               landmark: '',
//               shipToName: '',
//               shipToPhoneNumber: '',
//               location: '',
//               selectedOption: '',
//               general: ''
//             });
          
//             // Hide the address list view
//             setIsViewAddresses(false);
          
//             // Clear any existing success message
//             setSuccessMessage('');
//           };
          
//     return (
//         <div className="relative p-4 border rounded-lg shadow-lg max-w-md mx-auto bg-white">
//             <button
//                 onClick={onClose}
//                 className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//                 aria-label="Close"
//             >
//                 <X size={24} />
//             </button>

//             <h2 className="text-xl font-bold mb-4">Address Form</h2>

//             <div className="mb-6">
//                 <div className="relative z-0 border border rounded overflow-hidden h-64 mb-4">
//                     <MapContainer
//                         key={mapKey}
//                         center={mapCenter}
//                         zoom={13}
//                         style={{ height: '100%', width: '100%' }}
//                     >
//                         <TileLayer
//                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                             attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                         />
//                         <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
//                     </MapContainer>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={getCurrentLocation}
//                     disabled={loading}
//                     className="w-full mb-4 bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-500 disabled:bg-teal-300"
//                 >
//                     {loading ? 'Getting Location...' : '📍 Use Current Location'}
//                 </button>
//                 {locationError && <p className="text-red-500 text-sm mb-4">{locationError}</p>}
//                 {fieldErrors.location && <p className="text-red-500 text-xs mb-4">{fieldErrors.location}</p>} {/* Display location error */}
//             </div>

//             {successMessage && (
//                 <p className={`text-center ${successMessage.includes('success') ? 'text-teal-800' : 'text-red-500'} mb-4`}>
//                     {successMessage}
//                 </p>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-4">

//                 <div>
//                     <label className="block text-gray-700 text-sm font-bold mb-2">
//                         Address Label
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.tag}
//                         onChange={(e) => handleChange('tag', e.target.value)}
//                         className={`w-full px-3 py-2 border rounded-md ${fieldErrors.tag ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="e.g., Home, Office"
//                     />
//                     {fieldErrors.tag && <p className="text-red-500 text-xs mt-1">{fieldErrors.tag}</p>}
//                 </div>

//                 {/* Flat/House Number */}
//                 <div>
//                     <label className="block text-gray-700 text-sm font-bold mb-2">
//                         Flat/House Number
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.flatNumber}
//                         onChange={(e) => handleChange('flatNumber', e.target.value)}
//                         className={`w-full px-3 py-2 border rounded-md ${fieldErrors.flatNumber ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="e.g., Flat 101, House 123"
//                     />
//                     {fieldErrors.flatNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.flatNumber}</p>}
//                 </div>

//                 {/* Landmark */}
//                 <div>
//                     <label className="block text-gray-700 text-sm font-bold mb-2">
//                         Landmark
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.landmark}
//                         onChange={(e) => handleChange('landmark', e.target.value)}
//                         className={`w-full px-3 py-2 border rounded-md ${fieldErrors.landmark ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="e.g., Near Post Office"
//                     />
//                     {fieldErrors.landmark && <p className="text-red-500 text-xs mt-1">{fieldErrors.landmark}</p>}
//                 </div>

//                 {/* City */}
//                 <div>
//                     <label className="block text-gray-700 text-sm font-bold mb-2">
//                         City
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.city}
//                         onChange={(e) => handleChange('city', e.target.value)}
//                         className={`w-full px-3 py-2 border rounded-md ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="Enter city name"
//                     />
//                     {fieldErrors.city && <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>}
//                 </div>

//                 {/* State */}
//                 <div>
//                     <label className="block text-gray-700 text-sm font-bold mb-2">
//                         State
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.state}
//                         onChange={(e) => handleChange('state', e.target.value)}
//                         className={`w-full px-3 py-2 border rounded-md ${fieldErrors.state ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="Enter state name"
//                     />
//                     {fieldErrors.state && <p className="text-red-500 text-xs mt-1">{fieldErrors.state}</p>}
//                 </div>

//                 {/* Pincode */}
//                 <div>
//                     <label className="block text-gray-700 text-sm font-bold mb-2">
//                         Pincode
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.pincode}
//                         onChange={(e) => handleChange('pincode', e.target.value)}
//                         maxLength={6}
//                         className={`w-full px-3 py-2 border rounded-md ${fieldErrors.pincode ? 'border-red-500' : 'border-gray-300'}`}
//                         placeholder="Enter 6-digit pincode"
//                     />
//                     {fieldErrors.pincode && <p className="text-red-500 text-xs mt-1">{fieldErrors.pincode}</p>}
//                 </div>

//                 {/* View Saved Addresses Button */}
//                 <button
//                     type="button"
//                     onClick={handleViewAddresses}
//                     className="w-full bg-teal-800 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
//                 >
//                     View Saved Addresses
//                 </button>

//                 {/* Saved Addresses Section */}
//                 {isViewAddresses && (
//   <div className="mt-4 border-t pt-4">
//     <h3 className="font-bold mb-2">Saved Addresses</h3>
//     {address.length > 0 ? (
//       address.map((add) => (
//         <div
//           key={add.address_id}
//           className="p-2 border-b border-gray-200 flex items-center justify-between"
//         >
//           <div className="flex items-center">
//             <input
//               type="radio"
//               name="address"
//               value={add.address_id}
//               checked={selectedAddressId === add.address_id}
//               onChange={() => handleSelect(add.address_id)}
//               className="mr-2"
//             />
//             <p>{add.tag}, {add.pincode}, {add.line1}, {add.line2}</p>
//           </div>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => handleEdit(add )}
//               className="p-1 text-blue-500 hover:text-blue-700"
//             >
//               <Pencil size={18} />
//             </button>
          
//           </div>
//         </div>
//       ))
//     ) : (
//       <p>No addresses available</p>
//     )}
//   </div>
// )}
//                 <div className="space-y-2">
//                     <div className="flex items-center">
//                         <input
//                             type="radio"
//                             id="shipping"
//                             checked={selectedOption === 'shipping'}
//                             onChange={() => setSelectedOption('shipping')}
//                             className="mr-2"
//                         />
//                         <label htmlFor="shipping" className="text-gray-700 text-sm">Include shipping details</label>
//                     </div>

//                     {selectedOption === 'shipping' && (
//                         <>
//                             <input
//                                 type="text"
//                                 value={formData.shipToName}
//                                 onChange={(e) => handleChange('shipToName', e.target.value)}
//                                 placeholder="Ship To Name"
//                                 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.shipToName ? 'border-red-500' : 'border-gray-300'}`}
//                             />
//                             {fieldErrors.shipToName && <p className="text-red-500 text-xs mt-1">{fieldErrors.shipToName}</p>}

//                             <input
//                                 type="text"
//                                 value={formData.shipToPhoneNumber}
//                                 onChange={(e) => handleChange('shipToPhoneNumber', e.target.value)}
//                                 placeholder="Ship To Phone Number"
//                                 className={`w-full px-3 py-2 border rounded-md ${fieldErrors.shipToPhoneNumber ? 'border-red-500' : 'border-gray-300'}`}
//                             />
//                             {fieldErrors.shipToPhoneNumber && <p className="text-red-500 text-xs mt-1">{fieldErrors.shipToPhoneNumber}</p>}
//                         </>
//                     )}

//                     <div className="flex items-center">
//                         <input
//                             type="radio"
//                             id="default"
//                             checked={selectedOption === 'default'}
//                             onChange={() => setSelectedOption('default')}
//                             className="mr-2"
//                         />
//                         <label htmlFor="default" className="text-gray-700 text-sm">Use Default Details</label>
//                     </div>

//                     {selectedOption === 'default' && (
//                         <>
//                             <input
//                                 type="text"
//                                 name="customer_name"
//                                 value={editableDefaultDetails.customer_name}
//                                 onChange={handleDefaultDetailsChange}
//                                 placeholder="Default Name"
//                                 className="w-full px-3 py-2 border rounded-md"
//                             />
//                             <input
//                                 type="text"
//                                 name="customer_phonenumber"
//                                 value={editableDefaultDetails.customer_phonenumber}
//                                 onChange={handleDefaultDetailsChange}
//                                 placeholder="Default Phone Number"
//                                 className="w-full px-3 py-2 border rounded-md"
//                             />
//                         </>
//                     )}
//                 </div>

//                 <button type="submit" className="w-full bg-teal-800 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded">
//                     Submit
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default AddressForm;














import axios from 'axios';
import { Pencil, Trash, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AddressForm = ({ onAddressAdd, onAddressSelect, onClose }) => {
    const [isEdit, setIsEdit] = useState(false);
const [editAddressId, setEditAddressId] = useState(null);
    const [formData, setFormData] = useState({
        tag: '',
        pincode: '',
        city: '',
        state: '',
        flatNumber: '',
        landmark: '',
        shipToName: '',
        shipToPhoneNumber: '',
        location: { lat: null, lng: null } // Modified for validation
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

    const [position, setPosition] = useState([20.5937, 78.9629]); // Default to center of India
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
    const [mapKey, setMapKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState('');

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
                    error = '*Flat/house number is required*';
                } else if (value.length < 2) {
                    error = '*Flat/house number must be at least 2 characters*';
                } else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
                    return '*Flat/house number should only contain letters or numbers*';
                }
                break;
            case 'city':
                if (!value.trim()) {
                    error = '*City is required*';
                } else if (value.length < 2) {
                    error = '*City name must be at least 2 characters*';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    return '*City label should only contain letters*';
                }
                break;
            case 'state':
                if (!value.trim()) {
                    error = '*State is required*';
                } else if (value.length < 2) {
                    error = '*State name must be at least 2 characters*';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    return '*State label should only contain letters*';
                }
                break;
            case 'landmark':
                if (!value.trim()) {
                    error = '*Landmark is required*';
                } else if (value.length < 2) {
                    error = '*Landmark must be at least 2 characters*';
                } else if (!/^[a-zA-Z0-9\s]+$/.test(value)) {
                    return '*Landmark should only contain letters or numbers*';
                }
                break;
            case 'location':
                if (!value.lat || !value.lng) {
                    error = '*Location is required*';
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
                        location: { lat: latitude, lng: longitude } // Setting the location when getting the current location
                    }));
                    setMapKey(prev => prev + 1);
                    setLoading(false);
                },
                () => {
                    setLoading(false);
                    setLocationError('Failed to get current location. Please try again.');
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
        setFormData(prev => ({
            ...prev,
            location: { lat: newPosition[0], lng: newPosition[1] } // Update the location on map click
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
                if (isTokenExpired(token)) {
                    navigate('/');
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

    // Validate location explicitly
    const locationError = validateField('location', formData.location);
    if (locationError) {
        validationErrors.location = locationError;
    }

    // Validate selected option
    if (!selectedOption) {
        validationErrors.selectedOption = '*Please select either shipping or default details*';
    }

    if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        // Scroll to the first error
        const firstError = document.querySelector('.text-red-500');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Submit the form if no errors
    try {
        if (isTokenExpired(localStorage.getItem('token'))) {
            navigate('/');
            return;
        }

        const payload = {
            tag: formData.tag,
            pincode: formData.pincode,
            line1: `${formData.flatNumber}, ${formData.landmark}`,
            line2: `${formData.city}, ${formData.state}`,
            location: `https://www.google.com/maps?q=${position[0]},${position[1]}`,
            ship_to_name: selectedOption === 'shipping'
                ? formData.shipToName
                : editableDefaultDetails.customer_name,
            ship_to_phone_number: selectedOption === 'shipping'
                ? formData.shipToPhoneNumber
                : editableDefaultDetails.customer_phonenumber
        };
        console.log('edited data',payload,isEdit)
        if (isEdit) {
            // Make PUT request to edit endpoint
            await axios.post(
                `${process.env.REACT_APP_URL}/api/address/edit/${editAddressId}`,
                payload,
                {
                    headers: { 'token': localStorage.getItem('token') }
                }
            );
            setSuccessMessage('Address updated successfully.');
        } else {
            // Make POST request to create endpoint
            await axios.post(
                `${process.env.REACT_APP_URL}/api/address/createAddres`,
                payload,
                {
                    headers: { 'token': localStorage.getItem('token') }
                }
            );
            setSuccessMessage('Address saved successfully.');
        }

        // Clear form and reset edit state
        setFormData({
            tag: '',
            pincode: '',
            city: '',
            state: '',
            flatNumber: '',
            landmark: '',
            shipToName: '',
            shipToPhoneNumber: '',
            location: { lat: null, lng: null }
        });
        setIsEdit(false);
        setEditAddressId(null);
        onAddressAdd(); // Refresh the address list

    } catch (error) {
        console.error('Error saving/updating address:', error);
        setSuccessMessage(isEdit ? 'Failed to update address.' : 'Failed to save address.');
    }
};
    const handleSelect = async (address_id) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/getAddress`, {
                params: { address_id },
                headers: { 'token': localStorage.getItem('token') }
            });
            setSelectedAddressId(address_id);
            onAddressSelect(response.data.result);
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };
  
      
        const handleEdit = (address) => {
            // Parse line1 (flatNumber, landmark)
            setIsEdit(true);
            setEditAddressId(address.address_id);
            const [flatNumber, landmark] = address.line1.split(',').map(item => item.trim());
            
            // Parse line2 (city, state)
            const [city, state] = address.line2.split(',').map(item => item.trim());
            const locationCoords = address.location
            .split('q=')[1]  // Get everything after 'q='
            ?.split(',')     // Split into lat,lng
            .map(coord => parseFloat(coord)); // Convert to numbers
        
          const lat = locationCoords?.[0] || null;
          const lng = locationCoords?.[1] || null;
            // Update form data with parsed values
            setFormData({
              tag: address.tag,
              pincode: address.pincode,
              flatNumber: flatNumber,
              landmark: landmark,
              city: city,
              state: state,
              shipToName: address.ship_to_name || '',
              shipToPhoneNumber: address.ship_to_phone_number || '',
              location: { lat, lng }
            });
            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                setPosition([lat, lng]);
                setMapCenter([lat, lng]);
                setMapKey(prev => prev + 1); // Force map re-render
              }
       
            // Set the appropriate shipping option based on whether custom shipping details exist
            if (address.ship_to_name && address.ship_to_phone_number) {
                setSelectedOption('shipping');
              } else {
                setSelectedOption('default');
                setEditableDefaultDetails({
                  customer_name: address.ship_to_name || defaultDetails.customer_name,
                  customer_phonenumber: address.ship_to_phone_number || defaultDetails.customer_phonenumber
                });
              }
            // Clear any existing field errors
            setFieldErrors({
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
          
            // Hide the address list view
            setIsViewAddresses(false);
          
            // Clear any existing success message
            setSuccessMessage('');
          };
          
          return (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
                <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
                <h2 className="text-xl font-semibold text-teal-700 mt-4  font-serif">
                    <span className="text-teal-700">✏️</span>
                    {isEdit ? 'Edit Address' : 'Add New Address'}
                    </h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full bg-gray-200 hover:bg-red-100 active:bg-red-200 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                    <X size={20} className="text-red-600 font-bold transition-transform transform hover:scale-110" />
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
                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
                        </MapContainer>
                    </div>
    
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={loading}
                        className="w-full mb-4 bg-teal-700 text-white py-2 px-4 rounded hover:bg-teal-500 disabled:bg-teal-300"
                    >
                        {loading ? 'Getting Location...' : '📍 Use Current Location'}
                    </button>
                    {locationError && <p className="text-red-500 text-sm mb-4">{locationError}</p>}
                    {fieldErrors.location && <p className="text-red-500 text-xs mb-4">{fieldErrors.location}</p>}
                </div>
    
                {successMessage && (
                    <p className={`text-center ${successMessage.includes('success') ? 'text-teal-800' : 'text-red-500'} mb-4`}>
                        {successMessage}
                    </p>
                )}
    
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-md font-bold text-gray-700 mb-1 font-serif">Address Label</label>
                        <input
                          type="text"
                          value={formData.tag}
                          onChange={(e) => handleChange('tag', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-800 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)] focus:border-gray-900"
                          placeholder="Ex: Home, Office"
                        />
                        {fieldErrors.tag && <p className="text-red-500 text-xs mt-1">{fieldErrors.tag}</p>}
                      </div>
          
                      <div>
                        <label className="block text-md font-bold text-gray-700 mb-1 font-serif">Flat/House Number</label>
                        <input
                          type="text"
                          value={formData.flatNumber}
                          onChange={(e) => handleChange('flatNumber', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-800 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)] focus:border-gray-900"
                          placeholder="Ex: Flat 101"
                        />
                      </div>
          
                      <div>
                        <label className="block text-md font-bold text-gray-700 mb-1 font-serif">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-800 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)] focus:border-gray-900"
                          placeholder="Enter city name"
                        />
                      </div>
                    </div>
          
                    <div className="space-y-4">
                      <div>
                        <label className="block text-md font-bold text-gray-700 mb-1 font-serif">Landmark</label>
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => handleChange('landmark', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-800 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)] focus:border-gray-900"
                          placeholder="Ex: Near Post Office"
                        />
                      </div>
          
                      <div>
                        <label className="block text-md font-bold text-gray-700 mb-1 font-serif">State</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleChange('state', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-800 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)] focus:border-gray-900"
                          placeholder="Enter state name"
                        />
                      </div>
          
                      <div>
                        <label className="block text-md font-bold text-gray-700 mb-1 font-serif">Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          maxLength={6}
                          onChange={(e) => handleChange('pincode', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-800 rounded-lg shadow-[0_4px_8px_rgba(0,0,0,0.5)] focus:border-gray-900"
                          placeholder="Enter 6-digit pincode"
                        />
                      </div>
                    </div>
                  </div>
    
                    <button
                        type="button"
                        onClick={handleViewAddresses}
                        className="w-full bg-teal-800 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
                    >
                        View Saved Addresses
                    </button>
    
                    {isViewAddresses && (
      <div className="mt-4 border-t pt-4">
        <h3 className="font-bold mb-2 font-serif text-md">Saved Addresses</h3>
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
                <p className="text-gray-800 text-sm md:text-base font-small leading-relaxed tracking-wide bg-gray-100 p-2 rounded-lg shadow-sm">{add.tag}, {add.pincode}, {add.line1}, {add.line2}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(add )}
                  className="p-1 text-blue-500 hover:text-blue-700"
                >
                  <Pencil size={18} />
                </button>
              
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
                            <label htmlFor="shipping" className="text-gray-800 text-sm font-medium tracking-wide hover:text-gray-900 transition-colors">
                            Include Shipping Details
                            </label>
                       </div>
    
                        {selectedOption === 'shipping' && (
                            <>
                                <input
                                    type="text"
                                    value={formData.shipToName}
                                    onChange={(e) => handleChange('shipToName', e.target.value)}
                                    placeholder="Ship To Name"
                                    className={`w-full px-3 py-2 text-sm border border-gray-600 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${fieldErrors.shipToName ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {fieldErrors.shipToName && <p className="text-red-500 text-xs mt-1">{fieldErrors.shipToName}</p>}
    
                                <input
                                    type="text"
                                    value={formData.shipToPhoneNumber}
                                    onChange={(e) => handleChange('shipToPhoneNumber', e.target.value)}
                                    placeholder="Ship To Phone Number"
                                    className={`w-full px-3 py-2 text-sm border border-gray-600 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${fieldErrors.shipToPhoneNumber ? 'border-red-500' : 'border-gray-300'}`}
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
                            <label htmlFor="default" className="text-gray-800 text-sm font-medium tracking-wide hover:text-gray-900 transition-colors">Use Default Details</label>
                        </div>
    
                        {selectedOption === 'default' && (
                            <>
                                <input
                                    type="text"
                                    name="customer_name"
                                    value={editableDefaultDetails.customer_name}
                                    onChange={handleDefaultDetailsChange}
                                    placeholder="Default Name"
                                    className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.5)] focus:border-gray-900"
                                />
                                <input
                                    type="text"
                                    name="customer_phonenumber"
                                    value={editableDefaultDetails.customer_phonenumber}
                                    onChange={handleDefaultDetailsChange}
                                    placeholder="Default Phone Number"
                                    className="w-full px-3 py-2 text-sm border border-gray-600 rounded-lg shadow-[0_2px_6px_rgba(0,0,0,0.5)] focus:border-gray-900"
                                />
                            </>
                        )}
                    </div>
    
                    <button type="submit" className="w-full bg-teal-800 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded">
                        Submit
                    </button>
                </form>
                </div>
            </div>
            </div>
        );
};

export default AddressForm;
