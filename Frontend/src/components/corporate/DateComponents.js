import axios from "axios";
import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCart } from '../../services/contexts/CartContext';
import { isTokenExpired, VerifyToken } from "../../MiddleWare/verifyToken";

import { StoreContext } from "../../services/contexts/store";
import './css/date.css';
import { useNavigate } from "react-router-dom";

import { io } from "socket.io-client";


function DateComponent({ foodtype, quantity ,onSaveSuccess, onError }) {
    const [selectedDates, setSelectedDates] = useState([]);
    const [monthlyIncludedDays, setMonthlyIncludedDays] = useState({});
    const [individualToggles, setIndividualToggles] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastClickedDate, setLastClickedDate] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [CartData, setCartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
        
    const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
    const { state, dispatch } = useContext(StoreContext);
    const [toDate, setToDate] = useState(null);
    const { updateCartCount } = useCart();
    const navigate = useNavigate(); 


    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();
    VerifyToken();
    useEffect(() => {
        updateSelectedDates();
        updateMonthlyIncludedDays();
    }, [individualToggles, dragStart, dragEnd]);


    const updateSelectedDates = () => {
        const allSelectedDates = Object.entries(individualToggles)
            .filter(([dateStr, isSelected]) => isSelected && new Date(dateStr) >= currentDate)
            .map(([dateStr]) => new Date(dateStr));
    
        if (dragStart && dragEnd) {
            const dragRange = generateDateRange(dragStart, dragEnd);
            dragRange.forEach(date => {
                if (date >= currentDate && !allSelectedDates.some(d => d.toDateString() === date.toDateString())) {
                    allSelectedDates.push(date);
                }
            });
        }
    
        allSelectedDates.sort((a, b) => a - b); // Sort dates
    
        if (allSelectedDates.length > 0) {
            setFromDate(allSelectedDates[0]);
            setToDate(allSelectedDates[allSelectedDates.length - 1]);
        }
    
        setSelectedDates(allSelectedDates);
    };
    

    const updateMonthlyIncludedDays = () => {
        const newMonthlyIncludedDays = {};
        Object.entries(individualToggles).forEach(([dateStr, isSelected]) => {
            if (isSelected) {
                const date = new Date(dateStr);
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                const dayOfWeek = date.getDay();
                if (!newMonthlyIncludedDays[monthKey]) {
                    newMonthlyIncludedDays[monthKey] = {};
                }
                newMonthlyIncludedDays[monthKey][dayOfWeek] = true;
            }
        });
        setMonthlyIncludedDays(newMonthlyIncludedDays);
    };

    const handleDateClick = (date) => {
        if (date < currentDate) return;
        const dateStr = date.toDateString();

        if (lastClickedDate && !individualToggles[dateStr]) {
            const dateRange = generateDateRange(lastClickedDate, date);
            const newToggles = { ...individualToggles };

            dateRange.forEach(d => {
                if (d >= currentDate) {
                    const dStr = d.toDateString();
                    newToggles[dStr] = true;
                }
            });

            setIndividualToggles(newToggles);
            setLastClickedDate(null);
        } else {
            setIndividualToggles(prev => ({
                ...prev,
                [dateStr]: !prev[dateStr]
            }));

            setLastClickedDate(individualToggles[dateStr] ? null : date);
        }

        if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
            setCurrentMonth(date);
        }
    };



    const handleDragStart = (date) => {
        if (date < currentDate) return;
        setDragStart(date);
        setDragEnd(null);
        setIsDragging(true);
    };

    const handleDragEnter = (date) => {
        if (isDragging && date >= currentDate) {
            setDragEnd(date);
        }
    };

    const handleDragEnd = () => {
        if (dragStart && dragEnd) {
            const dragRange = generateDateRange(dragStart, dragEnd);
            const newToggles = { ...individualToggles };
            const newMonthlyIncludedDays = { ...monthlyIncludedDays };

            dragRange.forEach(date => {
                if (date >= currentDate) {
                    const dateStr = date.toDateString();
                    newToggles[dateStr] = true;

                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    const dayOfWeek = date.getDay();
                    if (!newMonthlyIncludedDays[monthKey]) {
                        newMonthlyIncludedDays[monthKey] = {};
                    }
                    newMonthlyIncludedDays[monthKey][dayOfWeek] = true;
                }
            });

            setIndividualToggles(newToggles);
            setMonthlyIncludedDays(newMonthlyIncludedDays);
        }
        setDragStart(null);
        setDragEnd(null);
        setIsDragging(false);
    };

    const generateDateRange = (start, end) => {
        let dates = [];
        let currentDate = new Date(Math.min(start, end));
        const endDate = new Date(Math.max(start, end));
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    const dayClassName = (date) => {
        if (date < currentDate) return "disabled-day";

        const dateStr = date.toDateString();
        return individualToggles[dateStr] ? "selected-day" : "default-day";
    };


    const handleIncludeDayChange = (day) => {
        const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
        const newValue = !monthlyIncludedDays[monthKey]?.[day];

        setIndividualToggles(prev => {
            const newToggles = { ...prev };
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

            for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
                if (d.getDay() === day && d >= currentDate) {
                    const dateStr = d.toDateString();
                    newToggles[dateStr] = newValue;
                }
            }
            return newToggles;
        });
    };


const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};



const formatCartItem = (cartDetails, amount) => {
    return {
      cart_order_details: Array.isArray(cartDetails) 
        ? JSON.stringify(cartDetails)
        : cartDetails,
      total_amount: amount
    };
  };

//   const formatCartItem = {
//     cart_order_details: JSON.stringify(cartDetails),
//     total_amount: amount
//   };
  
//   useEffect(() => {
//     const socket = io('http://localhost:4000', {
//         path: '/socket.io',
//         transports: ['websocket', 'polling'], 
//     });
//     socket.on('connect', () => {
//       console.log(`Connected to server with socket id1: ${socket.id}`);
//       socket.emit('message', 'Hello, server!');
//     });
//     socket.on('cartUpdated', (data) => {
//         console.log('Cart updated:', data);
//       });
 

//     socket.on('message', (data) => {
//       console.log(`Message from server: ${data}`);
//     });

//     socket.on('disconnect', () => {
//       console.log('Disconnected from server');
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);



// const handleSaveDates = async () => {
//     const dates = selectedDates;
//     const local = dates.length * quantity;
//     console.log("hiiiii")
  
//     if (quantity === 0) {
//       onError('Please select a quantity');
//       return;
//     } else if (dates.length === 0) {
//       onError('Please select dates');
//       return;
//     }
  
//     try {
//       const token = localStorage.getItem('token');
//       if(isTokenExpired(token))
//         {
//             navigate('/');
//         }
//       const cartDetailsPromises = dates.map(async (originalDate) => {
//         const formattedDate = formatDate(originalDate);
//   let Count;
//         const data = {
//           date: formattedDate,
//           type: foodtype.category_name,
//           image: foodtype.category_media,
//           quantity: quantity,
//           price: foodtype.category_price,
//           category_id: foodtype.category_id
//         };
  
//         const amount = foodtype.category_price * quantity;
//         const item = formatCartItem([data], amount); 
//         const itemId = `${foodtype.category_name}_${formattedDate}`;
//         console.log("item id",itemId)
//         const response = await axios.post(`${process.env.REACT_APP_URL}/api/cart/update`, {
//           item: JSON.stringify(item),
//           itemId: itemId
//         }, {
//           headers: { token }
//         });
//         console.log("response",response.data)
//         if (response.status === 200) {
//             const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
//             try{
            
//             const response = await axios.get(
//                 `${process.env.REACT_APP_URL}/api/customer/getCartCount`,
//                 { headers: { token } }
//             );
//             console.log('res',response)

//             if(response.status === 200){
//                 console.log("count fetched successfully", response.data.totalCartCount)
//                 // setCount(response.data.data)
//                  Count= response.data.totalCartCount;
//             }
//         }catch(error){
//             console.error('Error fetching cart count:', error);
//         }
//         console.log("snehaa", Count)
//             // Ensure cartCount is treated as a number
//             const newCount = Count; // Correctly adding numbers.
            
//             console.log("cart count:", newCount)

//             const updatedUserDP = {
//                 ...storedUserDP,
//                 cartCount: newCount
//             };

//             localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
//             updateCartCount(newCount); // Single update call
       
//             console.log('Cart details saved successfully:', response.data);
//             onSaveSuccess();
//         } else {
//             console.error('Failed to save cart details:', response.data);
//             onError('Failed to save cart details');
//         }
//         return response.status === 200;
//       });
  
//       const results = await Promise.all(cartDetailsPromises);
  
//       if (results.every((status) => status)) {
//         onSaveSuccess();
//       } else {
//         onError('Failed to save one or more cart details');
//       }
//     } catch (error) {
//       console.error('Error saving cart details:', error);
//       onError('Error saving cart details');
//     }
//   };
  
const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return null;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_URL}/api/cart`, {
        headers: { token },
      });
      console.log("response",response.data)
      setCartData(response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching cart data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveDates = async () => {
    const dates = selectedDates;
    console.log("dates",dates)
    const local = dates.length * quantity;
  
    if (quantity === 0) {
      onError('Please select a quantity');
      return;
    } else if (dates.length === 0) {
      onError('Please select dates');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (isTokenExpired(token)) {
        navigate('/');
        return;
      }
  
      // Fetch current cart data first
      const currentCart = await fetchCart();
      
      const cartDetailsPromises = dates.map(async (originalDate) => {
        const formattedDate = formatDate(originalDate);
        const itemId = `${foodtype.category_name}_${formattedDate}`;
        let newQuantity = quantity;
     
       
        
        if (currentCart[itemId]) {
        
            const existingItemData = JSON.parse(JSON.parse(currentCart[itemId]));
        
            if (existingItemData && existingItemData.cart_order_details) {
                const existingCartDetails = typeof existingItemData.cart_order_details === "string"
                    ? JSON.parse(existingItemData.cart_order_details)
                    : existingItemData.cart_order_details;
        
        
                if (Array.isArray(existingCartDetails) && existingCartDetails.length > 0) {
                    newQuantity += existingCartDetails[0].quantity
                    
                } else {
                    console.error("cart_order_details is not an array or is empty.");
                }
            } else {
                console.log("No cart_order_details found for itemId:", itemId);
            }
        } else {
            console.log(`ItemId ${itemId} not found in currentCart`);
        }
        
        
        const amount = foodtype.category_price * newQuantity;

  
        const data = {
          date: formattedDate,
          type: foodtype.category_name,
          image: foodtype.category_media,
          quantity: newQuantity,
          price: foodtype.category_price,
          category_id: foodtype.category_id
        };
  
        const item = formatCartItem([data], amount);
  
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/cart/update`, {
          item: JSON.stringify(item),
          itemId: itemId
        }, {
          headers: { token }
        });
  
        if (response.status === 200) {
          try {
            const countResponse = await axios.get(
              `${process.env.REACT_APP_URL}/api/customer/getCartCount`,
              { headers: { token } }
            );
  
            if (countResponse.status === 200) {
              const newCount = countResponse.data.totalCartCount;
              const storedUserDP = JSON.parse(localStorage.getItem('userDP')) || {};
              const updatedUserDP = {
                ...storedUserDP,
                cartCount: newCount
              };
  
              localStorage.setItem('userDP', JSON.stringify(updatedUserDP));
              updateCartCount(newCount);
            }
          } catch (error) {
            console.error('Error fetching cart count:', error);
          }
  
          return true;
        } else {
          console.error('Failed to save cart details:', response.data);
          onError('Failed to save cart details');
          return false;
        }
      });
  
      const results = await Promise.all(cartDetailsPromises);
  
      if (results.every((status) => status)) {
        onSaveSuccess();
      } else {
        onError('Failed to save one or more cart details');
      }
    } catch (error) {
      console.error('Error saving cart details:', error);
      onError('Error saving cart details');
    }
  };
  


const handleclear = () => {
        setSelectedDates([]);
        setIndividualToggles({});
        setDragStart(null);
        setDragEnd(null);
        setIsDragging(false);
        setMonthlyIncludedDays({});
        setFromDate(null);
        setToDate(null);
    };

    const renderCustomHeader = ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
        <div style={{ margin: '5px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                <button
                    className="bold-arrow-left "
                    onClick={() => {
                        decreaseMonth();
                        setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
                    }}
                    disabled={prevMonthButtonDisabled}
                >
                    {"<"}
                </button>
                <div className="bold-text2">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button
                    className="bold-arrow-right"
                    onClick={() => {
                        increaseMonth();
                        setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
                    }}
                    disabled={nextMonthButtonDisabled}
                >
                    {">"}
                </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', fontSize: '0.8em' }}>
                {weekdays.map((day, index) => (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            id={`include-${day}`}
                            checked={monthlyIncludedDays[`${date.getFullYear()}-${date.getMonth()}`]?.[index] || false}
                            onChange={() => handleIncludeDayChange(index)}
                            style={{ margin: '0 0 2px 0', width: '12px', height: '12px', margin: '7px' }}
                        />
                        <label
                            htmlFor={`include-${day}`}
                            className={`bold-label ${index === 0 || index === 6 ? 'weekend' : ''}`}
                        >
                            {day}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    // Touch event handlers
    const handleTouchStart = (date) => {
        handleDragStart(date);
    };

    const handleTouchMove = (e, date) => {
        e.preventDefault(); // Prevent scrolling while dragging
        handleDragEnter(date);
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    return (
        <div className="container">
            <div className="calendar-container">
                <div className="date-range-display">
            <p className="date-range">From: {fromDate ? dayjs(fromDate).format('DD/MM/YYYY') : 'dd/mm/yyyy'}</p>
            <p className="date-range">To: {toDate ? dayjs(toDate).format('DD/MM/YYYY') : 'dd/mm/yyyy'}</p>
            </div>
                <DatePicker
                    selected={null}
                    onChange={() => { }}
                    onSelect={handleDateClick}
                    onMonthChange={(date) => setCurrentMonth(date)}
                    inline
                    dayClassName={dayClassName}
                    dateFormat="dd/MM/yyyy"
                    renderCustomHeader={renderCustomHeader}
                    renderDayContents={(day, date) => (
                        <div className="datepicker bold-text"
                            onMouseDown={() => handleDragStart(date)}
                            onMouseEnter={() => handleDragEnter(date)}
                            onMouseUp={handleDragEnd}
                            onTouchStart={() => handleTouchStart(date)}
                            onTouchMove={(e) => handleTouchMove(e, date)}
                            onTouchEnd={handleTouchEnd}
                        >
                            {day}
                        </div>
                    )}
                    minDate={currentDate}
                />
                <div className="selected-container">
                    <div>
                        <p className="days">Chosen Dining Days: {selectedDates.length}</p>
                    </div>
                    <div >
                        <button className="btn text-white bg-red-500 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-3 py-1 me-2 mb-2 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none dark:focus:ring-red-800" onClick={handleclear}>Clear</button>
                    </div>
                    <div>
                        <button className="btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-1 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" onClick={handleSaveDates}>Save</button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}

export default DateComponent;
