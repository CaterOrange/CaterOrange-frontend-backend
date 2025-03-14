import React, { useEffect, useState, useRef } from 'react';
import { Pencil, X, Upload, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const AddressForm = ({ initialData = null, onAddressAdd, onAddressSelect, onClose }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [formData, setFormData] = useState({
    addressLabel: '',
    line1: '',
    line2: '',
    pincode: '',
    location: { lat: null, lng: null },
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [showImagePreview, setShowImagePreview] = useState(false);

  const [address, setAddress] = useState([]);
  const [isViewAddresses, setIsViewAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [position, setPosition] = useState({ lat: 20.5937, lng: 78.9629 }); // India centroid
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [defaultDetails, setDefaultDetails] = useState({
    customer_name: '',
    customer_phonenumber: '',
    isValid: false,
    errors: {},
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');

  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const mapRef = useRef(null);
  VerifyToken();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,   // Disable satellite view option
    mapTypeId: 'roadmap',    // Force roadmap view
  };

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
        `${process.env.REACT_APP_URL}/api/v2/address/getDefaultAddress`,
        { headers: { token } }
      );

      const { customer_name, customer_phonenumber } = response.data.customer;
      setDefaultDetails((prev) => ({
        ...prev,
        customer_name,
        customer_phonenumber,
        isValid: validateDefaultDetails(customer_name, customer_phonenumber).isValid,
        errors: validateDefaultDetails(customer_name, customer_phonenumber).errors,
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

    if (initialData.media_image_url) {
      setExistingImage(initialData.media_image_url);
      setImagePreview(initialData.media_image_url);
      setShowImagePreview(true);
    }

    setFormData({
      addressLabel: initialData.tag || '',
      line1: initialData.line1 || '',
      line2: initialData.line2 || '',
      pincode: initialData.pincode || '',
      location: coords
        ? { lat: parseFloat(coords[1]), lng: parseFloat(coords[2]) }
        : { lat: null, lng: null },
    });

    if (coords) {
      const newPos = { lat: parseFloat(coords[1]), lng: parseFloat(coords[2]) };
      setPosition(newPos);
      setMapCenter(newPos);
      fetchAddress(newPos);
    }
  };

  const fetchAddress = async (location) => {
    if (!isLoaded) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      const latLng = { lat: location.lat, lng: location.lng };

      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setFormattedAddress(results[0].formatted_address);
        } else {
          setFormattedAddress('Unable to fetch address');
        }
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      setFormattedAddress('Error fetching address');
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

      case 'line1':
        if (!value) {
          error = 'Address Line 1 is required';
        } else if (value.length < 2) {
          error = 'Address Line 1 must be at least 2 characters';
        }
        break;

      case 'line2':
        if (!value) {
          error = 'Address Line 2 is required';
        } else if (value.length < 2) {
          error = 'Address Line 2 must be at least 2 characters';
        }
        break;

      case 'pincode':
        if (!value) {
          error = 'Pincode is required';
        } else {
          const cleanPincode = value.replace(/\D/g, '');
          if (cleanPincode.length !== 6) {
            error = 'Pincode must be 6 digits';
          }
        }
        break;

      case 'media_image_url':
        if (value) {
          const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          if (!validTypes.includes(value.type)) {
            error = 'Please upload a valid image file (JPEG, PNG)';
          } else if (value.size > 5 * 1024 * 1024) {
            error = 'Image size should be less than 5MB';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateField('media_image_url', file);
      if (error) {
        setFormErrors((prev) => ({
          ...prev,
          media_image_url: error,
        }));
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);

      setExistingImage(null);
      setFormErrors((prev) => ({
        ...prev,
        media_image_url: '',
      }));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExistingImage(null);
    setShowImagePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderImageSection = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-gray-800 text-sm font-medium mb-3">Address Image</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative">
            {showImagePreview ? (
              <div className="relative w-full h-full">
                <img
                  src={imagePreview || existingImage}
                  alt="Address"
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Pencil size={16} />
                    <span>Change Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveImage();
                    }}
                    className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Remove Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
        {formErrors.media_image_url && (
          <p className="text-red-500 text-xs mt-1">{formErrors.media_image_url}</p>
        )}
      </div>
    </div>
  );

  const validateForm = (respectTouched = false) => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (!respectTouched || touchedFields[key]) {
        const error = validateField(
          key,
          key === 'location' ? formData[key] : formData[key]
        );
        if (error) {
          errors[key] = error;
          isValid = false;
        }
      }
    });

    setFormErrors(errors);
    setIsFormValid(isValid && defaultDetails.isValid);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (name === 'pincode') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 6) {
        setFormData((prev) => ({
          ...prev,
          [name]: cleanValue,
        }));

        if (touchedFields[name]) {
          const error = validateField(name, cleanValue);
          setFormErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (touchedFields[name]) {
        const error = validateField(name, value);
        setFormErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    }

    setTimeout(() => validateForm(true), 0);
  };

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
      errors,
    };
  };

  const handleDefaultDetailsChange = (e) => {
    const { name, value } = e.target;

    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    const newDetails = {
      ...defaultDetails,
      [name]: value,
    };

    const validation = validateDefaultDetails(
      name === 'customer_name' ? value : newDetails.customer_name,
      name === 'customer_phonenumber' ? value : newDetails.customer_phonenumber
    );

    setDefaultDetails({
      ...newDetails,
      isValid: validation.isValid,
      errors: touchedFields[name] ? validation.errors : {},
    });

    setTimeout(() => validateForm(true), 0);
  };

  useEffect(() => {
    if (initialData) {
      validateForm(true);
    }
  }, [initialData]);

  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          setMapCenter(newPos);
          setFormData((prev) => ({
            ...prev,
            location: newPos,
          }));
          setCurrentLocation(newPos);
          fetchAddress(newPos);
          setLoading(false);
          validateForm(true);
        },
        (error) => {
          setLoading(false);
          setLocationError(
            error.message ||
              'Failed to get current location. Please allow location access or select manually.'
          );
        }
      );
    } else {
      setLoading(false);
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  const handleMapClick = (e) => {
    const newPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setPosition(newPos);
    setMapCenter(newPos);
    setFormData((prev) => ({
      ...prev,
      location: newPos,
    }));
    setLocationError('');
    setCurrentLocation(null);
    fetchAddress(newPos);
    setFormErrors((prev) => ({
      ...prev,
      location: '',
    }));
    validateForm(true);
  };

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allFields = { ...formData, ...defaultDetails };
    setTouchedFields(
      Object.keys(allFields).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );

    if (!validateForm(false)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        navigate('/');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('tag', formData.addressLabel);
      formDataToSend.append('pincode', formData.pincode);
      formDataToSend.append('line1', formData.line1);
      formDataToSend.append('line2', formData.line2);
      formDataToSend.append(
        'location',
        `https://www.google.com/maps?q=${formData.location.lat},${formData.location.lng}`
      );
      formDataToSend.append('ship_to_name', defaultDetails.customer_name);
      formDataToSend.append('ship_to_phone_number', defaultDetails.customer_phonenumber);

      if (selectedImage) {
        formDataToSend.append('media_image_url', selectedImage);
      } else if (imagePreview && !selectedImage && isEdit) {
        // Handle existing image if no new image is uploaded in edit mode
      }

      const config = {
        headers: {
          token,
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_URL}/api/v2/customer/address/update/${editAddressId}`,
          formDataToSend,
          config
        );
        setSuccessMessage('Address updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_URL}/api/v2/address/createAddres`,
          formDataToSend,
          config
        );
        setSuccessMessage('Address saved successfully');
      }

      if (onAddressAdd) await onAddressAdd();
      if (onClose) onClose();
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        general: error.response?.data?.message || 'Failed to save address',
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
          `${process.env.REACT_APP_URL}/api/v2/address/getalladdresses`,
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
        `${process.env.REACT_APP_URL}/api/v2/customer/getAddress`,
        {
          params: { address_id },
          headers: { token: localStorage.getItem('token') },
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
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
        ref={modalRef}
      >
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
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={13}
                  options={options}
                  onClick={handleMapClick}
                  onLoad={handleMapLoad}
                >
                  {position.lat && position.lng && <Marker position={position} />}
                </GoogleMap>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <p>Loading Map...</p>
                </div>
              )}
            </div>

            {formErrors.location && (
              <p className="text-red-500 text-sm mb-2">{formErrors.location}</p>
            )}

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center"
            >
              {loading ? (
                'Getting Location...'
              ) : (
                <>
                  <span>Get Current Location</span>
                </>
              )}
            </button>
            {locationError && <p className="text-red-500 text-sm mt-2">{locationError}</p>}

            {formattedAddress && (
              <div className="mt-2 text-sm text-gray-700 bg-gray-100 p-2 rounded">
                <p>{formattedAddress}</p>
              </div>
            )}
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

            <div className="grid grid-cols-1 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="line1"
                  value={formData.line1}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.line1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Flat number, Building name"
                />
                {formErrors.line1 && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.line1}</p>
                )}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2 *
                </label>
                <input
                  type="text"
                  name="line2"
                  value={formData.line2}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.line2 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Area, City, State"
                />
                {formErrors.line2 && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.line2}</p>
                )}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {renderImageSection()}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-gray-800 text-sm font-medium mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
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
                  isFormValid
                    ? 'bg-teal-700 hover:bg-teal-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isFormValid}
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