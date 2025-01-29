import React, { useEffect, useState } from 'react';
import { UserCircle, Trash2, ChevronDown, ChevronUp, Plus, Minus, MapPin, ShoppingCart, X } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { cartToOrder } from './action';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { isTokenExpired, VerifyToken } from '../../MiddleWare/verifyToken';
import { io } from 'socket.io-client';

// import { set } from 'react-datepicker/dist/date_utils'

const ToggleSwitch = ({ isOn, onToggle }) => (

    <div
        className={`w-8 h-4 flex items-center rounded-full p-1 cursor-pointer ${isOn ? `bg-teal-800` : `bg-gray-300`}`}
        onClick={onToggle}
    >
        <div
            className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${isOn ? `translate-x-4` : `translate-x-0`}`}
        ></div>
    </div>
);

const MenuItem = ({ item, checked, toggleState, onToggleUnit, onCheck, mainToggleOn }) => {
    console.log('chetha',item,checked,toggleState)
    const shouldDisplayToggle = item['plate_units'] !== null && item['wtorvol_units'] !== null;
    console.log('neetoggle',toggleState)
    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => {
        setIsOpen(!isOpen);
    };
    VerifyToken();

    return (
        <div className="mt-4 flex flex-col border-b-2 border-teal-800">
            <div
                className="flex items-center justify-between p-2 cursor-pointer"
                onClick={handleToggle}
            >
                <div className="flex items-center flex-grow">
                    <img src={item.Image} alt={item['productname']} className="w-16 h-16 object-cover rounded mr-4" />
                    <div className="flex items-center">
                        <h3 className="font-semibold text-gray-800">{item['productname']}</h3>
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={onCheck}
                            className="ml-2"
                            style={{ margin: '0 0 1px 0', width: '15px', height: '15px', margin: '7px',accentColor:'black',backgroundColor:'transparent' }}
                        />
                    </div>
                </div>
                {shouldDisplayToggle && (
                    <div className="flex items-center">
                        <ToggleSwitch
                            isOn={toggleState[item['productid']] === 'wtorvol_units'}
                            onToggle={() => onToggleUnit(item['productid'],item)}
                        />
                    </div>
                )}
                <p className="ml-2">
                    {toggleState[item['productid']] === 'wtorvol_units' ? item['wtorvol_units'] : item['plate_units']}
                </p>
                {isOpen ? (
                    <ChevronUp size={20} className="text-gray-600 ml-2" />
                ) : (
                    <ChevronDown size={20} className="text-gray-600 ml-2" />
                )}
            </div>
            {isOpen && (
                <div className="p-4 bg-gray-50">
                    <p className="text-gray-600">Details about {item['productname']}</p>
                </div>
            )}
        </div>
    );
};

// MenuCategory Component
const MenuCategory = ({ category, items, checkedItems, toggleState, onToggleUnit, onCheck, mainToggleOn }) => {
    const [isOpen, setIsOpen] = useState(false);
    VerifyToken();
    return (
        <div className="mb-4 bg-white rounded-lg shadow ">
            <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-semibold text-gray-800">{category}</span>
                <div className="flex items-center">
                    <span className="mr-2 text-teal-800 font-medium">{items.length} </span>
                    {isOpen ? (
                        <ChevronUp size={20} className="text-teal-800" />
                    ) : (
                        <ChevronDown size={20} className="text-teal-800" />
                    )}
                </div>
            </button>
            {isOpen && (
                <div>
                    {items.map(item => (
                        <MenuItem
                            key={item['productid']}
                            item={item}
                            checked={checkedItems[item['productid']] || false}
                            toggleState={toggleState}
                            onToggleUnit={onToggleUnit}
                            onCheck={() => onCheck(item['productid'],item)}
                            mainToggleOn={mainToggleOn}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const CartSidebar = ({ isOpen, onClose, cartItems, numberOfPlates, selectedDate, toggleState, onToggleUnit, address, selectedTime, onRemoveItem, onChangeAddress, onClearCart }) => {
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cartId, setCartId] = useState(0);
    const [redirectUrl, setRedirectUrl] = useState('');
    const [localQuantities, setLocalQuantities] = useState({});
    const [cartDetails, setCartDetails] = useState([]);
    const navigate = useNavigate();
    VerifyToken();
    const token = localStorage.getItem('token');

    const fetchCart = async () => {
        try {
            if (!token || isTokenExpired(token)) {
                navigate("/");
            }
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/cart/getcart`, {
                headers: { token: `${localStorage.getItem('token')}` },
            });
            console.log('in carts', response.data);

            const cartDataArray = response.data?.cartitem?.cartData || [];
            console.log('Extracted Cart Data:', cartDataArray);

            setCartDetails(cartDataArray);
        } catch (error) {
            console.error('Error fetching cart data:', error);
        }
    };
    useEffect(() => {
        fetchCart();
    }, [isOpen]);
    useEffect(()=>{
        if(numberOfPlates){
            localStorage.setItem('numberOfPlates',numberOfPlates.toString())
        }
    },[numberOfPlates]);


    const calculateTotalItemCost = (item, numberOfPlates, selectedUnit, quantity) => {
        let totalCost;

        if (selectedUnit === 'plate_units') {
            const priceperunit = item['priceperunit'];
            totalCost = (priceperunit * numberOfPlates * quantity).toFixed(2);

        }
        else if (selectedUnit === 'wtorvol_units') {
            const price_per_wtorvol_units = item['price_per_wtorvol_units'];
            const min_wtorvol_units_per_plate = item['min_wtorvol_units_per_plate'];

            const costperkg = price_per_wtorvol_units * 1000;
            
            if (quantity < 1) {
                totalCost = quantity * costperkg * numberOfPlates
             
            }
            else {
                totalCost = costperkg * quantity
            }

            console.log("total", totalCost);
        } else {
            throw new Error('Invalid selected unit');
        }

        return totalCost;
    };


    const totalAmount = cartDetails.reduce((sum, item) => {
        const selectedUnit = item.unit
        console.log("select",selectedUnit)
        const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit,  item.quantity);
        return sum + parseFloat(totalItemCost);
    }, 0).toFixed(2);



    const handleInputChange = (item, value) => {
        const newQuantity = value === '' ? '' : Number(value);
        updatenewquantites(newQuantity,item)



    };

    const handleBlur = (item, quantity, minunitsperplate) => {
        if (quantity < 1) {
            return;
        }
        const newQuantity = quantity < minunitsperplate ? minunitsperplate : quantity;
        updatenewquantites(newQuantity,item)

    };


    const handleIncrease = (item) => {
        const currentQuantity = item.quantity || 1;
        const newQuantity = currentQuantity + 1;
        console.log('new quantity',newQuantity)
        updatenewquantites(newQuantity,item)
    };

    const handleDecrease = (item) => {
        const currentQuantity = item.quantity || 1;
        const newQuantity = Math.max(currentQuantity - 1, 1);
        console.log('new quantity',newQuantity)
        updatenewquantites(newQuantity,item)
    };
    const updatenewquantites=async(newQuantity,titem)=>{
    const updatedCartItems = cartDetails.map(item => 
            item.productid === titem.productid 
                ? { ...item, quantity: newQuantity }
                : item
        );
  const newTotalAmount = updatedCartItems.reduce((sum, item) => {
                const selectedUnit = item.unit
                const totalItemCost = calculateTotalItemCost(
                    item,
                    numberOfPlates,
                    selectedUnit,
                    item.quantity
                );
                return sum + parseFloat(totalItemCost);
            }, 0).toFixed(2);
              const result = await axios.post(
            `${process.env.REACT_APP_URL}/api/cart/add`,
            {
                totalAmount:newTotalAmount,
                cartData: updatedCartItems,
                selectedDate,
                numberOfPlates,
                selectedTime
            },
            {
                headers: { token }
            }
        );
                        console.log('Cart updated successfully:', result.data);
fetchCart()

    }
    useEffect(() => {
        const socket = io(process.env.REACT_APP_URL, {
          transports: ['websocket', 'polling'] 
        });
        socket.on('connect', () => {
          console.log(`Connected to server with socket id: ${socket.id}`);
          socket.emit('message', 'Hello, server!');
        });
        socket.on('EventcartUpdated', (data) => {
            console.log('Cart updated:', data);
            fetchCart();
          });
     
    
        socket.on('message', (data) => {
          console.log(`Message from server: ${data}`);
        });
    
        socket.on('disconnect', () => {
          console.log('Disconnected from server');
        });
    
        return () => {
          socket.disconnect();
        };
      }, []);

    const handleSubmit = async () => {
        setLoading(true);
        if (!token || isTokenExpired(token)) {
            navigate("/");
        }
        try {
            const respond = await cartToOrder(totalAmount, cartDetails, numberOfPlates, selectedDate, selectedTime, address);


            const response = await axios.post(`${process.env.REACT_APP_URL}/api/pay`, {

                amount: totalAmount,
                corporateorder_id: respond.eventorder_generated_id,


            }, { headers: { token: `${localStorage.getItem('token')}` } });

            if (response.data && response.data.redirectUrl) {



                setRedirectUrl(response.data.redirectUrl);
                window.location.href = response.data.redirectUrl;
               
                setLocalQuantities({});
                onUpdateQuantity({});

                onClearCart();
            } else {
                console.log('Unexpected response format.');
            }
        } catch (err) {
            setError(err.response ? `Error: ${err.response.data.message || 'An error occurred. Please try again.'}` : 'Network error or no response from the server.');
        } finally {
            setLoading(false);
        }
    };


    const handleDelete = async (productId,item) => {
        console.log("id", productId)
        setLoading(true);
        setError('');
        setCartDetails(prev => prev.filter(item => item.productid !== productId));

        try {

            onRemoveItem(productId);


            const updatedCartItems = cartDetails.filter(item => item.productid !== productId);
            console.log('deleteee',updatedCartItems,item,numberOfPlates,selectedDate,selectedTime)
            const newTotalAmount = updatedCartItems.reduce((sum, item) => {
                const selectedUnit = item.unit
                const totalItemCost = calculateTotalItemCost(
                    item,
                    numberOfPlates,
                    selectedUnit,
                    item.quantity
                );
                return sum + parseFloat(totalItemCost);
            }, 0).toFixed(2);
            console.log('updatednewtotal',newTotalAmount)
        
           const result= await axios.post(
                    `${process.env.REACT_APP_URL}/api/cart/add`,
                {
                    totalAmount: newTotalAmount,
                    cartData: updatedCartItems,
                    selectedDate,
                    numberOfPlates,
                    selectedTime
                },
                {
                    headers: { token: localStorage.getItem('token') }
                }
            );
            console.log('Cart delete successfully:', result.data);


        } catch (error) {
            console.error('Error removing item:', error);
            // setError(error.response?.data?.message || 'Failed to remove item from cart');
        } finally {
            setLoading(false);
        }
    };



    const isAddressValid = address && address.line1 && address.line2 && address.pincode;

    return (
        <div className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full">
                <div className="bg-gradient-to-b from-[#2C6E63] to-[#80CBC4] p-2">
                    <div className="relative">
                        <div className="absolute right-0 flex flex-col items-end">
                            <button onClick={onClose} className="text-white hover:text-gray-200 ">
                                <X size={24} />
                            </button>
                            <button
                                onClick={onChangeAddress}
                                className="bg-teal-100 text-teal-800 px-1 py-1 rounded-full mt-14"
                            >
                                Change Address
                            </button>
                        </div>
                        <div className="flex items-center mt-2">
                            <ShoppingCart size={24} className="text-white mr-2" />
                            <h2 className="text-xl font-bold text-white">My Cart</h2>
                        </div>
                        <div className="text-white flex items-center mt-5">
                            <MapPin size={20} className="mr-2" />
                            <div>
                                <p>{address.line1}</p>
                                <p>{address.line2}</p>
                                <p>{address.pincode}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                        {cartDetails.length === 0 ? (
                            <div className="col-span-full flex items-center justify-center h-full text-gray-600 text-lg">
                                Your cart is empty. Fill the cart to proceed.
                            </div>
                        ) : (
                            cartDetails.map(item => {
                                console.log('item', item)
                                const minunitsperplate = item['minunitsperplate'] || 1;
                                const selectedUnit = toggleState[item['productid']] || item['plate_units'] || item['wtorvol_units'];

                                return (
                                    <div key={item['productid']} className="flex flex-col border border-teal-800 rounded-lg shadow-sm p-2">
                                    <div className='relative'>
                                       <div className='absolute top right-2'>
                                                <button
                                                    onClick={() => handleDelete(item['productid'],item)}
                                                    className="bg-red-500 text-white p-2  rounded-full hover:bg-red-600"
                                                    title="Remove from cart"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                        </div>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                            <h3 className="font-semibold text-gray-800 mb-1">{item['productname']}</h3>
                                            {item['plate_units'] && item['wtorvol_units'] && (
                                                <div className="flex items-center mb-2">
                                                    <ToggleSwitch
                                                        isOn={toggleState[item['productid']] === 'wtorvol_units'}
                                                        onToggle={() => onToggleUnit(item['productid'])}
                                                    />
                                                    <p className="ml-2">
                                                        {toggleState[item['productid']] === 'wtorvol_units' ? (
                                                            item['wtorvol_units'] && item['wtorvol_units'].toLowerCase().includes('grams') ? (
                                                                item['wtorvol_units'].replace('grams', 'kg')
                                                            ) : item['wtorvol_units'].toLowerCase().includes('ml') ? (
                                                                item['wtorvol_units'].replace('ml', 'L')
                                                            ) : (
                                                                item['wtorvol_units']
                                                            )
                                                        ) : (
                                                            item['plate_units']
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                            {!item['wtorvol_units'] && <p>{item['plate_units']}</p>}
                                            <p className="text-sm text-gray-600 mb-1 flex flex-col items-center">
                                                <span className="text-gray-700 mt-1">
                                                    {(() => {
                                                        const selectedUnit = toggleState[item['productid']] === 'wtorvol_units' ? 'wtorvol_units' : 'plate_units';
                                                        const quantity = item.quantity;
                                                        const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit, localQuantities[item.productid] || item.quantity);

                                                        let calculationString;
                                                        let totalCost;
                                                        if (selectedUnit === 'plate_units') {
                                                            const priceperunit = item['priceperunit'];
                                                            //calculationString = `${localQuantities[item.productid] || item.quantity} * ${priceperunit} * ${numberOfPlates} = `;
                                                        } else if (selectedUnit === 'wtorvol_units') {
                                                            const price_per_wtorvol_units = item['price_per_wtorvol_units'];
                                                            const costperkg = price_per_wtorvol_units * 1000;
                                                            if (quantity < 1) {
                                                                totalCost = localQuantities[item.productid] || item.quantity * costperkg * numberOfPlates

                                                                // calculationString = `${quantity} * ${numberOfPlates} * ${costPerKg} =`
                                                                //calculationString = `${localQuantities[item.productid] || item.quantity} * ${costperkg}=`
                                                            }
                                                            else {
                                                                totalCost = costperkg * localQuantities[item.productid] || item.quantity
                                                                //calculationString = `${costperkg} * ${localQuantities[item.productid] || item.quantity} =`
                                                            }

                                                        }

                                                        return (
                                                            <>
                                                                {calculationString}
                                                                <span className="text-gray-800 font-semibold">₹{totalItemCost}</span>
                                                            </>
                                                        );
                                                    })()}
                                                </span>
                                            </p>
                                            </div>
            
                                        <div className="flex items-center justify-center mb-2">
                                            <button
                                                onClick={() => handleDecrease(item)}
                                                className="p-1 bg-teal-800 text-white rounded-l"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                value={ item.quantity}
                                                onChange={(e) => handleInputChange(item, e.target.value)}
                                                onBlur={() => handleBlur(item,  item.quantity, minunitsperplate)}
                                                className="w-12 text-center px-2 py-1 border"
                                                min="1"
                                            />
                                            <button
                                                onClick={() => handleIncrease(item)}
                                                className="p-1 bg-teal-800 text-white rounded-r"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {cartDetails.length > 0 && (
                    <div className="p-4 bg-white border-t">
                        <div className="text-xl font-bold text-gray-800 mb-2">
                            Total Amount: ₹{totalAmount}
                        </div>
                        <button
                            onClick={handleSubmit}
                            className={`w-full py-2 px-4 ${isAddressValid ? 'bg-teal-800 text-white' : 'bg-teal-800 text-white cursor-not-allowed'} font-bold rounded`}
                            disabled={loading || !isAddressValid}
                        >
                            {loading ? 'Processing...' : 'Pay Now'}
                        </button>
                        {!isAddressValid && (
                            <p className="text-red-500 mt-2">Please add a valid address to proceed with payment.</p>
                        )}
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};


const Menu = () => {
    const [menuData, setMenuData] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [quantities, setQuantities] = useState({});
    const [toggleState, setToggleState] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mainToggleOn, setMainToggleOn] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    // const [numberofplates, setNumberOfPlates] = useState(1);
    const location = useLocation();
   const numberOfPlates = location.state?.numberOfPlates || 1;
   const selectedDate = location.state?.selectedDate || 1;

   const selectedTime = location.state?.selectedTime || 1;

   console.log('number',numberOfPlates,selectedDate,selectedTime)

    const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
    VerifyToken();

    const [address,setAddress]=useState({
        line1:'',
        line2:'',
        pincode:''

    })
 
    useEffect(()=>{
        const savedAddress = JSON.parse(localStorage.getItem('addedaddress'));
        if(savedAddress){
            setAddress(savedAddress);
        }
    },[]);
    useEffect(() => {

        const token = localStorage.getItem('token');
        let decodedEmail = null;
        if (token) {
            const decodedToken = jwtDecode(token);
            decodedEmail = decodedToken.email;
            setCurrentUser(decodedEmail);
        }

        if (decodedEmail) {
            const paymentComplete = localStorage.getItem(`paymentComplete_${decodedEmail}`);
            if (paymentComplete === 'true') {
                setCheckedItems({});
                setQuantities({});
                localStorage.removeItem(`cartItems_${decodedEmail}`);
            } else {


            
                fetchCart()


                // const storedCart = localStorage.getItem(`cartItems_${decodedEmail}`);
                // if (storedCart) {
                //     const parsedCart = JSON.parse(storedCart);
                //     setCheckedItems(parsedCart.checkedItems || {});
                //     setQuantities(parsedCart.quantities || {});
                // } else {
                //     setCheckedItems({});
                //     setQuantities({});
                // }
            }
        }
        // const storedToggleState = localStorage.getItem('toggleState');
        // if (storedToggleState) {
        //     setToggleState(JSON.parse(storedToggleState));
        // }
    }, [location.state?.numberOfPlates]);


    const fetchCart = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_URL}/api/cart/getcart`, {
                headers: { token: `${localStorage.getItem('token')}` },
            });
    
            const cartDataArray = response.data?.cartitem?.cartData || [];
            
            const quantities = cartDataArray.reduce((acc, item) => ({
                ...acc,
                [item.productid]: item.quantity
            }), {});
            
            const checkedItems = cartDataArray.reduce((acc, item) => ({
                ...acc,
                [item.productid]: true
            }), {});
       
           
            setCheckedItems(checkedItems)
            setQuantities(quantities)
            fetchProducts(cartDataArray);

            return { quantities, checkedItems };
        } catch (error) {
            console.error('Error fetching cart data:', error);
        }
    };
      useEffect(() => {
        const socket = io(process.env.REACT_APP_URL, {
          transports: ['websocket', 'polling'] 
        });
        socket.on('connect', () => {
          console.log(`Connected to server with socket id: ${socket.id}`);
          socket.emit('message', 'Hello, server!');
        });
        socket.on('EventcartUpdated', (data) => {
            console.log('Cart updated:', data);
            fetchCart();
          });
     
    
        socket.on('message', (data) => {
          console.log(`Message from server: ${data}`);
        });
    
        socket.on('disconnect', () => {
          console.log('Disconnected from server');
        });
    
        return () => {
          socket.disconnect();
        };
      }, []);
  useEffect(() => {
    const socket = io(process.env.REACT_APP_URL, {
      transports: ['websocket', 'polling'] 
    });
    socket.on('connect', () => {
      console.log(`Connected to server with socket id: ${socket.id}`);
      socket.emit('message', 'Hello, server!');
    });
    socket.on('EventcartUpdated', (data) => {
        console.log('Cart updated:', data);
        // fetchCart();
      });
 

    socket.on('message', (data) => {
      console.log(`Message from server: ${data}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);
    const handleChangeAddress = () => {
        navigate('/changeaddress');
    };



    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setCurrentUser(decodedToken.email);
        } else {
            setCurrentUser(null);
        }
    }, []);

    const clearCart = () => {
        setCheckedItems({});
        setQuantities({});
        if (currentUser) {
            localStorage.removeItem(`cartItems_${currentUser}`);
        }
    };




    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userDP');
        localStorage.removeItem('address');
        setCurrentUser(null);
        setCheckedItems({});
        setQuantities({});
        setTimeout(() => {
            window.location.href = '/';
        }, 0);
    };



    const handleViewLoginPage = () => {
        setIsLogoutDialogOpen(true);
    };

    const handleConfirmLogout = (confirm) => {
        setIsLogoutDialogOpen(false);
        if (confirm) {
            handleLogout();
        }
    };


    const navigate = useNavigate();
    const onToggleUnit = (productId,item) => {
        const newToggleState = {
            ...toggleState,
            [productId]: toggleState[productId] === 'wtorvol_units' ? 'plate_units' : 'wtorvol_units'
        };
        setToggleState(newToggleState);
        const updatedCartItems = cartItems.map(cartItem => {
            if (cartItem.productid === productId) {
                return {
                    ...cartItem,
                    unit: newToggleState[productId] // Update the unit based on the new toggle state
                };
            }
            return cartItem;
        });
           console.log('nretogglecart',updatedCartItems)
        updateCart(updatedCartItems)
    };
    const handleViewOrders = () => {
        navigate('/orders');
    }

    const fetchProducts = async (cartDataArray) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || isTokenExpired(token)) {
                navigate("/");
            }
            const response = await fetch(`${process.env.REACT_APP_URL}/api/products`, {
                headers: { 'token': token }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const transformedData = data.reduce((acc, item) => {
                const category = item['category_name'];
                if (!acc[category]) {
                    acc[category] = { category, items: [] };
                }

                acc[category].items.push(item);
                return acc;
            }, {});

            setMenuData(Object.values(transformedData));
            console.log('cartdataarray',cartDataArray)

            const initialToggleState = { ...toggleState };
            data.forEach(item => {
                const cartItem = cartDataArray.find(cartItem => cartItem.productid === item.productid);
                
                if (cartItem) {
                    initialToggleState[item.productid] = cartItem.unit;
                } else {
                    initialToggleState[item.productid] = 'plate_units';
                }
            });
            
            console.log('initial', initialToggleState);
            setToggleState(initialToggleState);
            localStorage.setItem('toggleState', JSON.stringify(initialToggleState));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useEffect(() => {
        if (mainToggleOn) {
            const newToggleState = Object.keys(toggleState).reduce((acc, itemId) => {
                acc[itemId] = 'wtorvol_units';
                return acc;
            }, {});
            setToggleState(newToggleState);
            localStorage.setItem('toggleState', JSON.stringify(newToggleState));
        } else {

            const newToggleState = Object.keys(toggleState).reduce((acc, itemId) => {
                acc[itemId] = 'plate_units';
                return acc;
            }, {});
            setToggleState(newToggleState);
            localStorage.setItem('toggleState', JSON.stringify(newToggleState));
        }
    }, [mainToggleOn]);

    const handleCheck = (itemId,item) => {
        const newCheckedItems = { ...checkedItems, [itemId]: !checkedItems[itemId] };
        console.log("newcheck",newCheckedItems)
        setCheckedItems(newCheckedItems);
        const newQuantities = { ...quantities };
        console.log("new", newQuantities,checkedItems[itemId]);
        if (!checkedItems[itemId]) {
            newQuantities[itemId] = 1;
        } else {
            delete newQuantities[itemId];
        }
        setQuantities(newQuantities);
        let updatedCartItems
        if (!newCheckedItems[itemId]) {
            console.log('Item removed from cart');
            updatedCartItems = cartItems.filter(cartItem => cartItem.productid !== itemId);
        }
        else {
            console.log('Item added to cart');
            const updatedItem = { ...item, quantity: 1, unit: 'plate_units' };
            updatedCartItems = [...cartItems, updatedItem];
        }
        

        console.log('cartttitems',updatedCartItems)
      
        updateCart(updatedCartItems);
        console.log("newi",newCheckedItems, newQuantities)
    };

    const updateCart = async (updatedCartItems) => {
        try {
            const totalAmount = updatedCartItems.reduce((sum, item) => {
                const selectedUnit = toggleState[item.productid]
                console.log("selectedunit",selectedUnit)
                const totalItemCost = calculateTotalItemCost(item, numberOfPlates, selectedUnit,  1);
                return sum + parseFloat(totalItemCost);
            }, 0).toFixed(2);
        
            console.log('hiiiiiiiiiiiiiiiiiii',totalAmount,updatedCartItems,selectedDate,numberOfPlates,selectedTime)
            const token = localStorage.getItem('token');
         const result = await axios.post(
                `${process.env.REACT_APP_URL}/api/cart/add`,
                {
                    totalAmount,
                    cartData: updatedCartItems,
                    selectedDate,
                    numberOfPlates,
                    selectedTime
                },
                {
                    headers: { token }
                }
            );

            console.log('Cart updated successfully:', result.data);
            setCartId(result.data);
        } catch (error) {
            console.error('Failed to update cart:', error);
        }
    };

    const calculateTotalItemCost = (item, numberOfPlates, selectedUnit, quantity) => {
        let totalCost;

        if (selectedUnit === 'plate_units') {
            const priceperunit = item['priceperunit'];
            totalCost = (priceperunit * numberOfPlates * quantity).toFixed(2);

        }
        else if (selectedUnit === 'wtorvol_units') {
            const price_per_wtorvol_units = item['price_per_wtorvol_units'];
            const min_wtorvol_units_per_plate = item['min_wtorvol_units_per_plate'];

            const costperkg = price_per_wtorvol_units * 1000;
            
            if (quantity < 1) {
                totalCost = quantity * costperkg * numberOfPlates
             
            }
            else {
                totalCost = costperkg * quantity
            }

            console.log("total", totalCost);
        } else {
            throw new Error('Invalid selected unit');
        }

        return totalCost;
    };

  
    const removeItem = (productId) => {
        // Update checkedItems to uncheck the item
        const newCheckedItems = { ...checkedItems };
        delete newCheckedItems[productId];
        setCheckedItems(newCheckedItems);

        // Update quantities to remove the item
        const newQuantities = { ...quantities };
        delete newQuantities[productId];
        setQuantities(newQuantities);

        // Update localStorage
        if (currentUser) {
            localStorage.setItem(
                `cartItems_${currentUser}`,
                JSON.stringify({
                    checkedItems: newCheckedItems,
                    quantities: newQuantities,
                })
            );
        }
    };

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    };
    console.log('menudata', menuData)


    const cartItems = menuData.flatMap(category =>
        category.items
            .filter(item => checkedItems[item.productid])
            .map(item => ({
                ...item,
                quantity: quantities[item.productid] || 1,
                unit: toggleState[item.productid] || item.plate_units
            }))
    );
    

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    console.log('cartmenu', cartItems)

    return (
        <div className="bg-gradient-to-b from-[#2C6E63]">
            <div className=" top-0 left-0 w-full bg-gradient-to-b from-[#2C6E63] to-[#80CBC4] z-50">
                <div className="flex justify-between items-center py-3 px-3">
                    <button onClick={toggleSidebar} className="text-white">
                        <UserCircle size={32} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">EVENT MENU CARD</h1>
                    <button
                        onClick={() => setIsCartOpen(!isCartOpen)}
                        className="relative bg-yellow-500 text-white p-2 rounded"
                    >
                        <div className="yellow-700">
                            <ShoppingCart size={24} />
                        </div>
                        {cartItems.length > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-2 text-xs">
                                {cartItems.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-end py-2 mr-6">
                    <span className="mr-2 text-white font-semibold">
                        {mainToggleOn ? 'Kgs' : 'Plates'}
                    </span>
                    <ToggleSwitch
                        isOn={mainToggleOn}
                        onToggle={() => setMainToggleOn(prev => !prev)}
                    />
                </div>
            </div>

            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className="fixed top-0 left-0 h-full w-64 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0 z-50 overflow-y-auto">
                        <div className="p-4 bg-teal-800 text-white">
                            <div className="flex justify-end">
                                <button className="text-white" onClick={toggleSidebar}>
                                    ✕
                                </button>
                            </div>
                            {storedUserDP.picture ? (
                                <img
                                    src={storedUserDP.picture}
                                    alt="Profile"
                                    className="rounded-full w-16 h-16 mx-auto object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="rounded-full w-16 h-16 mx-auto bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
                                    {getInitials(storedUserDP.name)}
                                </div>
                            )}

                            <h3 className="text-center mt-2">{storedUserDP.name || 'Hello'}</h3>
                            {storedUserDP.phone && <p className="text-center">{storedUserDP.phone}</p>}
                            <p className="text-center">{storedUserDP.email || 'Email Address'}</p>

                        </div>
                        <ul className="p-2 space-y-2">
                            <Link to='/home'>
                                <li className="p-2 border-b border-gray-200 cursor-pointer">Home</li>
                            </Link>
                            <Link to='/orders'>
                                <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewOrders}>My Orders</li>
                            </Link>

                            <li className="p-2 border-b border-gray-200 cursor-pointer">Address</li>
                            <li className="p-2 border-b border-gray-200 cursor-pointer">Wallet</li>
                            <li className="p-2 border-b border-gray-200 cursor-pointer">Contact Us</li>
                            <li className="p-2 border-b border-gray-200 cursor-pointer">Settings</li>
                            <li className="p-2 border-b border-gray-200 cursor-pointer" onClick={handleViewLoginPage}>
                                LogOut &rarr;
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {isLogoutDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <h2 className="text-lg font-bold mb-4">Do you really want to Logout?</h2>
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-teal-800 text-white py-2 px-4 rounded"
                                onClick={() => handleConfirmLogout(true)}
                            >
                                Yes
                            </button>
                            <button
                                className="bg-gray-500 text-white py-2 px-4 rounded"
                                onClick={() => handleConfirmLogout(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 mt-15"> 
                {menuData.map(category => (
                    <MenuCategory
                        key={category.category}
                        category={category.category}
                        items={category.items}
                        checkedItems={checkedItems}
                        toggleState={toggleState}
                        onToggleUnit={onToggleUnit}
                        onCheck={handleCheck}
                        mainToggleOn={mainToggleOn}
                    />
                ))}
            </div>
            <CartSidebar
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                numberOfPlates={numberOfPlates}
                // onUpdateQuantity={updateQuantity}
                toggleState={toggleState}
                onToggleUnit={onToggleUnit}
                mainToggleOn={mainToggleOn}
                address={address}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onRemoveItem={removeItem}
                onChangeAddress={handleChangeAddress}
                onClearCart={clearCart}
            />
        </div>
    );
};



export default Menu;
