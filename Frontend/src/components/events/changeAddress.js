


import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiTrash } from 'react-icons/fi';
import AddressForm from './AddressForm';
import axios from 'axios';
import { VerifyToken } from '../../MiddleWare/verifyToken';

const ChangeAddress = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [address, setAddress] = useState([]);
    const [isViewAddresses, setIsViewAddresses] = useState(false);
    const [isAddAddressFormVisible, setIsAddAddressFormVisible] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressToEdit, setAddressToEdit] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState();
    const [selectedTime, setSelectedTime] = useState('');

    VerifyToken();

    // Retrieve the stored numberOfPlates when mounting the address change component
    const storedPlates = localStorage.getItem('plates');
    const Plates = storedPlates ? parseInt(storedPlates, 10) : 1;

    const handleAddAddress = () => {
        setIsAddAddressFormVisible(!isAddAddressFormVisible);
        setIsEditingAddress(false);
        setAddressToEdit(null);
    };

    const handleViewAddresses = async () => {
        if (!isViewAddresses) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.warn('No token found, redirecting to login.');
                    navigate('/');
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_URL}/api/address/getalladdresses`, {
                    headers: { 'token': token },
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

    const handleEditAddress = (address) => {
        setAddressToEdit(address);
        setIsEditingAddress(true);
        setIsAddAddressFormVisible(true);
    };

    const saveAddress = (newAddress) => {
        if (isEditingAddress) {
            setAddress(
                address.map((addr) =>
                    addr.address_id === newAddress.address_id ? newAddress : addr
                )
            );
        } else {
            setAddress([...address, newAddress]);
        }
        setIsAddAddressFormVisible(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        // const plates = form.elements['plates'].value;


        if (!form.checkValidity()) {
            form.reportValidity();
        } else {
            navigate('/menu', { state: { address: selectedAddress }, Plates });
        }
    };

    const handleSelect = (address_id) => {
        const selectedAddr = address.find(addr => addr.address_id === address_id);
        setSelectedAddressId(address_id);
        setSelectedAddress(selectedAddr);
        if (selectedAddr) {
            localStorage.setItem('addedaddress', JSON.stringify(selectedAddr));
        }
    };

    return (
        <div
            className="bg-gradient-to-b from-[#2c6E63] to-[#80CBC4] min-h-screen p-4"
            style={{ fontFamily: process.env.REACT_APP_FONT }} // Use font from .env
        >
            <div className="bg-white rounded-lg shadow-lg p-6">
                {/* <h2
 className="text-lg font-semibold mb-6 text-center"
 style={{ color: '#006600', fontFamily: process.env.REACT_APP_FONT }}
 >
 Know Order Availability To Your Location
 </h2> */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-black-500 font-bold mb-2">Delivery Location</label>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleAddAddress}
                                    className="bg-teal-800 hover:bg-teal-600 text-white hover:text-black font-bold py-2 px-4 rounded mb-2"
                                >
                                    + Add Address
                                </button>
                            </div>
                            {isAddAddressFormVisible && (
                                <div className="transition-all duration-300 ease-in-out">
                                    <AddressForm
                                        saveAddress={saveAddress}
                                        existingAddress={addressToEdit}
                                    />
                                </div>
                            )}
                            <div>
                                <button
                                    type="button"
                                    onClick={handleViewAddresses}
                                    className="text-black font-bold py-2 ml-2 px-4 rounded"
                                >
                                    View Addresses
                                </button>
                            </div>
                            {isViewAddresses && (
                                <div>
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
                                                    <p>
                                                        {add.tag}, {add.pincode}, {add.line1}, {add.line2}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    {/* <span
 className="text-blue-500 underline cursor-pointer mr-2"
 onClick={() => handleEditAddress(add)}
 >
 Edit
 </span> */}
                                                    {/* <FiTrash
 className="text-red-500 cursor-pointer"
 onClick={() => handleDeleteAddress(add.address_id)}
 /> */}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No addresses available</p>
                                    )}
                                </div>
                            )}
                        </div>


                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="bg-teal-800 text-white px-8 py-2 rounded-md shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-800 focus:ring-opacity-50"
                            style={{ backgroundColor: process.env.REACT_APP_COLORCODE }} // Use color from .env
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangeAddress;

