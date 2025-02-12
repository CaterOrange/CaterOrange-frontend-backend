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
    const [quantityError, setQuantityError] = useState(false);
        
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

    useEffect(() => {
        if (quantity > 0) {
            setQuantityError(false); // Clear quantity error state when quantity is selected
        }
    }, [quantity]);

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
      setQuantityError('Please select a quantity'); // Set quantity error state to true
      return;
    } else if (dates.length === 0) {
      onError('Please select dates');
      setQuantityError('Please Select Dates')
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
        setQuantityError(false); // Clear quantity error state
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
        <div className="w-full max-w-md mx-auto">
            {quantityError && (
                <div className="text-sm text-red-600 mb-1 bg-red-200 rounded-lg p-2">
                    {quantityError}
                </div>
            )}
         
            <div className="bg-white rounded-lg shadow-md mb-2">
                <div className="p-2 border-b border-gray-200">
                    <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mr-2">From:</p>
                            <p className="text-sm font-medium text-gray-900">
                                {fromDate 
                                    ? dayjs(fromDate).format('DD/MM/YYYY') 
                                    : <span className="text-gray-400">Select date</span>
                                }
                            </p>
                        </div>
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mr-2">To:</p>
                        <p className="text-sm font-medium text-gray-900">
                            {toDate 
                                ? dayjs(toDate).format('DD/MM/YYYY') 
                                : <span className="text-gray-400">Select date</span>
                            }
                        </p>
                    </div>
                    </div>
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
                        <div 
                            className="cursor-pointer select-none"
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
                <div className="border-t border-teal-200">
    <div className="p-2 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        <div className="text-lg font-semibold text-teal-700 font-serif">
            No of Days: {selectedDates.length}
        </div>
        <div className="flex space-x-3">
            <button 
                onClick={handleclear}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-400 rounded-full hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-colors duration-200"
            >
                Clear
            </button>
            <button 
                onClick={handleSaveDates}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-colors duration-200"
            >
                Add to Cart
            </button>
        </div>
    </div>
</div>
                {/* <div className="border-t border-gray-200">
                    <div className="p-2 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <div className="text-lg font-semibold font-medium text-gray-700 font-serif">
                            No of Days: {selectedDates.length}
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                onClick={handleclear}
                                className="px-1 py-2 text-sm font-medium text-white bg-teal-500 rounded-full hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors duration-200"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={handleSaveDates}
                                className="px-1 py-2 text-sm font-medium text-white bg-teal-600 rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-colors duration-200"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default DateComponent;