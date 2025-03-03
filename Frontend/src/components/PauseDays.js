import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const RescheduleDaysSelector = ({ onSaveRescheduleDays = () => {}, onError = () => {}, corporateOrderId }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [rescheduledFromDates, setRescheduledFromDates] = useState([]);
  const [processingDates, setProcessingDates] = useState([]);
  const [processingDateObjects, setProcessingDateObjects] = useState([]);
  const [alternateMode, setAlternateMode] = useState(false);
  const [message, setMessage] = useState('');
  const [individualToggles, setIndividualToggles] = useState({});
  const [monthlyIncludedDays, setMonthlyIncludedDays] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastClickedDate, setLastClickedDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [requiredRescheduleDays, setRequiredRescheduleDays] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Fetch processing dates from API
  useEffect(() => {
    const fetchProcessingDates = async () => {
      if (corporateOrderId && showDatePicker) {
        setIsLoading(true);
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_URL}/api/corporate-orders/${corporateOrderId}/processing-dates`,
            { headers: { token: localStorage.getItem('token') } }
          );
          
          if (response.data.success) {
            const dates = response.data.processingDates;
            // Filter only future dates
            const futureDates = dates.filter(date => {
              const processDate = new Date(date.processing_date);
              processDate.setHours(0, 0, 0, 0);
              return processDate >= currentDate;
            });
            
            setProcessingDates(futureDates);
            
            // Create date objects for easy manipulation
            const dateObjects = futureDates.map(date => {
              const dateObj = new Date(date.processing_date);
              dateObj.setHours(0, 0, 0, 0);
              return {
                ...date,
                dateObject: dateObj
              };
            });
            setProcessingDateObjects(dateObjects);
            
            // Initialize individualToggles with processing dates
            const newToggles = {};
            dateObjects.forEach(date => {
              newToggles[date.dateObject.toDateString()] = false;
            });
            setIndividualToggles(newToggles);
          } else {
            setMessage('Failed to fetch processing dates');
            setTimeout(() => setMessage(''), 3000);
          }
        } catch (error) {
          setMessage(error.response?.data?.error || 'Failed to fetch processing dates');
          setTimeout(() => setMessage(''), 3000);
          onError(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProcessingDates();
  }, [corporateOrderId, showDatePicker]);

  useEffect(() => {
    updateSelectedDates();
    updateMonthlyIncludedDays();
  }, [individualToggles, dragStart, dragEnd]);

  const isDateSelectable = (date) => {
    if (!date) return false;
    
    // Date must be in the future
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < currentDate) return false;
    
    // In regular mode, date must be a processing date
    if (!alternateMode) {
      return processingDateObjects.some(
        pd => pd.dateObject.toDateString() === checkDate.toDateString()
      );
    }
    
    // In alternate mode, date must not be a selected reschedule-from date
    const dateString = formatDate(checkDate);
    return !rescheduledFromDates.includes(dateString);
  };

  const isProcessingDate = (date) => {
    if (!date) return false;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return processingDateObjects.some(
      pd => pd.dateObject.toDateString() === checkDate.toDateString()
    );
  };

  const getProcessingDateInfo = (date) => {
    if (!date) return null;
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return processingDateObjects.find(
      pd => pd.dateObject.toDateString() === checkDate.toDateString()
    );
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

  const updateSelectedDates = () => {
    const allSelectedDates = Object.entries(individualToggles)
      .filter(([dateStr, isSelected]) => isSelected && isDateSelectable(new Date(dateStr)))
      .map(([dateStr]) => new Date(dateStr));

    if (dragStart && dragEnd) {
      const dragRange = generateDateRange(dragStart, dragEnd);
      
      let remainingDaysToAdd = alternateMode ? (requiredRescheduleDays - allSelectedDates.length) : Infinity;
      
      for (const date of dragRange) {
        if (alternateMode && remainingDaysToAdd <= 0) break;
        
        if (isDateSelectable(date) && !allSelectedDates.some(d => d.toDateString() === date.toDateString())) {
          allSelectedDates.push(date);
          if (alternateMode) remainingDaysToAdd--;
        }
      }
    }

    allSelectedDates.sort((a, b) => a - b);

    if (allSelectedDates.length > 0) {
      setFromDate(allSelectedDates[0]);
      setToDate(allSelectedDates[allSelectedDates.length - 1]);
    } else {
      setFromDate(null);
      setToDate(null);
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
    if (!date || !isDateSelectable(date)) {
      return;
    }

    const dateStr = date.toDateString();

    // First mode: selecting processing dates to reschedule
    if (!alternateMode) {
      // Only allow selection if it's a processing date
      if (!isProcessingDate(date)) {
        return;
      }
    } 
    // Second mode: selecting new dates for rescheduled items
    else {
      // Check if this is a rescheduled from date in alternate mode
      if (alternateMode && rescheduledFromDates.includes(formatDate(date))) {
        setMessage("You can't select an original delivery date as a new delivery date");
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      if (alternateMode && individualToggles[dateStr] && selectedDates.length <= requiredRescheduleDays) {
        setMessage(`You need to select ${requiredRescheduleDays} new delivery dates`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      if (alternateMode && !individualToggles[dateStr] && selectedDates.length >= requiredRescheduleDays) {
        setMessage(`You can only select ${requiredRescheduleDays} new delivery dates`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }

    if (lastClickedDate && !individualToggles[dateStr]) {
      if (alternateMode) {
        // In alternate mode, limit the range selection to remaining slots
        const remainingSlots = requiredRescheduleDays - selectedDates.length;
        if (remainingSlots <= 0) {
          setMessage(`You can only select ${requiredRescheduleDays} new delivery dates`);
          setTimeout(() => setMessage(''), 3000);
          return;
        }
        
        const dateRange = generateDateRange(lastClickedDate, date);
        // Only select up to the remaining slots
        const rangesToAdd = dateRange.slice(0, remainingSlots);
        
        const newToggles = { ...individualToggles };
        rangesToAdd.forEach(d => {
          if (isDateSelectable(d) && !rescheduledFromDates.includes(formatDate(d))) {
            const dStr = d.toDateString();
            newToggles[dStr] = true;
          }
        });

        setIndividualToggles(newToggles);
      } else {
        // Normal mode - only select processing dates in the range
        const dateRange = generateDateRange(lastClickedDate, date);
        const newToggles = { ...individualToggles };

        dateRange.forEach(d => {
          if (isDateSelectable(d) && isProcessingDate(d)) {
            const dStr = d.toDateString();
            newToggles[dStr] = true;
          }
        });

        setIndividualToggles(newToggles);
      }
      
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

  // Drag selection handlers
  const handleDragStart = (date) => {
    if (!isDateSelectable(date)) return;
    
    // In alternate mode, don't start drag if we've reached the limit
    if (alternateMode && selectedDates.length >= requiredRescheduleDays) {
      setMessage(`You can only select ${requiredRescheduleDays} new delivery dates`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setDragStart(date);
    setDragEnd(null);
    setIsDragging(true);
  };

  const handleDragEnter = (date) => {
    if (isDragging && isDateSelectable(date)) {
      setDragEnd(date);
    }
  };

  const handleDragEnd = () => {
    if (dragStart && dragEnd) {
      const dragRange = generateDateRange(dragStart, dragEnd);
      const newToggles = { ...individualToggles };
      const newMonthlyIncludedDays = { ...monthlyIncludedDays };

      // Count how many valid dates we can add
      let validDates = [];
      for (const date of dragRange) {
        if (!alternateMode) {
          // In normal mode, we can only select processing dates
          if (isDateSelectable(date) && isProcessingDate(date)) {
            const dateStr = date.toDateString();
            if (!individualToggles[dateStr]) {
              validDates.push(date);
            }
          }
        } else {
          // In alternate mode, we can select any future date that's not a rescheduled from date
          if (isDateSelectable(date)) {
            const dateStr = date.toDateString();
            if (!individualToggles[dateStr]) {
              // Skip rescheduled from dates in alternate mode
              if (alternateMode && rescheduledFromDates.includes(formatDate(date))) {
                continue;
              }
              validDates.push(date);
            }
          }
        }
      }

      // In alternate mode, limit selection to the required number
      let datesToAdd = validDates;
      if (alternateMode) {
        const currentCount = selectedDates.length;
        const remainingSlots = requiredRescheduleDays - currentCount;
        if (remainingSlots < datesToAdd.length) {
          datesToAdd = validDates.slice(0, remainingSlots);
          setMessage(`You can only select ${requiredRescheduleDays} new delivery dates. Selected the first ${datesToAdd.length} days.`);
          setTimeout(() => setMessage(''), 3000);
        }
      }

      // Add the selected dates
      for (const date of datesToAdd) {
        const dateStr = date.toDateString();
        newToggles[dateStr] = true;

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const dayOfWeek = date.getDay();
        if (!newMonthlyIncludedDays[monthKey]) {
          newMonthlyIncludedDays[monthKey] = {};
        }
        newMonthlyIncludedDays[monthKey][dayOfWeek] = true;
      }

      setIndividualToggles(newToggles);
      setMonthlyIncludedDays(newMonthlyIncludedDays);
    }
    
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
  };

  // Handle selecting all days of a certain weekday
  const handleIncludeDayChange = (day) => {
    if (!alternateMode) {
      // In normal mode, only allow selecting processing dates
      const processingDatesOnThisDay = processingDateObjects.filter(pd => {
        return pd.dateObject.getDay() === day && 
               pd.dateObject.getMonth() === currentMonth.getMonth() && 
               pd.dateObject.getFullYear() === currentMonth.getFullYear();
      });

      if (processingDatesOnThisDay.length === 0) {
        setMessage(`No processing dates on ${weekdays[day]} in this month`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      // Toggle based on whether any are already selected
      const anySelected = processingDatesOnThisDay.some(pd => 
        individualToggles[pd.dateObject.toDateString()]
      );

      const newToggles = { ...individualToggles };
      processingDatesOnThisDay.forEach(pd => {
        newToggles[pd.dateObject.toDateString()] = !anySelected;
      });

      setIndividualToggles(newToggles);
    } else {
      // In alternate mode, only allow this if we have capacity
      if (alternateMode && selectedDates.length >= requiredRescheduleDays) {
        setMessage(`You can only select ${requiredRescheduleDays} new delivery dates`);
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
      const newValue = !monthlyIncludedDays[monthKey]?.[day];

      setIndividualToggles(prev => {
        const newToggles = { ...prev };
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        // Count how many new days would be added
        let daysToAdd = 0;
        const daysToToggle = [];
        
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === day && isDateSelectable(d)) {
            const dateStr = d.toDateString();
            
            // Skip if it's a rescheduled from date in alternate mode
            if (alternateMode && rescheduledFromDates.includes(formatDate(d))) {
              continue;
            }
            
            // If toggling on and not already selected
            if (newValue && !newToggles[dateStr]) {
              daysToAdd++;
              daysToToggle.push(d);
            }
          }
        }
        
        // In alternate mode, check if adding would exceed the limit
        if (alternateMode && newValue) {
          const remainingSlots = requiredRescheduleDays - selectedDates.length;
          if (daysToAdd > remainingSlots) {
            setMessage(`Can't select all ${weekdays[day]} days. It would exceed the ${requiredRescheduleDays} new delivery days limit.`);
            setTimeout(() => setMessage(''), 3000);
            return newToggles;
          }
        }
        
        // Now apply the toggles
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
          if (d.getDay() === day && isDateSelectable(d)) {
            const dateStr = d.toDateString();
            
            // Skip if it's a rescheduled from date in alternate mode
            if (alternateMode && rescheduledFromDates.includes(formatDate(d))) {
              continue;
            }
            
            newToggles[dateStr] = newValue;
          }
        }
        
        return newToggles;
      });
    }
  };

  // Format date for backend
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle reschedule days button
  const handleRescheduleDays = () => {
    if (selectedDates.length === 0) {
      setMessage('Please select days to reschedule');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Store details of selected processing dates
    const selectedProcessingDates = selectedDates.map(date => {
      const formattedDate = formatDate(date);
      const processingDateInfo = getProcessingDateInfo(date);
      return {
        date: formattedDate,
        order_detail_id: processingDateInfo.order_detail_id,
        category_id: processingDateInfo.category_id,
        quantity: processingDateInfo.quantity
      };
    });

    const formattedRescheduledFromDates = selectedDates.map(date => formatDate(date));
    setRescheduledFromDates(formattedRescheduledFromDates);
    
    setRequiredRescheduleDays(selectedDates.length);
    
    setAlternateMode(true);
    setMessage(`Please select ${selectedDates.length} new delivery dates`);
    
    setIndividualToggles({});
    setSelectedDates([]);
    setFromDate(null);
    setToDate(null);
  };

  // Save the rescheduled days
  const handleSaveRescheduleDays = async () => {
    if (selectedDates.length === 0) {
      setMessage('Please select new delivery dates');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (selectedDates.length < rescheduledFromDates.length) {
      const remaining = rescheduledFromDates.length - selectedDates.length;
      setMessage(`Please select ${remaining} more new delivery date${remaining > 1 ? 's' : ''}`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (selectedDates.length > rescheduledFromDates.length) {
      const excess = selectedDates.length - rescheduledFromDates.length;
      setMessage(`Please remove ${excess} new delivery date${excess > 1 ? 's' : ''}`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Create payload for backend
    const payload = {
      pausedDates: rescheduledFromDates,
      alternateDates: selectedDates.map(date => formatDate(date))
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/api/corporate-orders/${corporateOrderId}/pause-days`, payload, {
        headers: { token: localStorage.getItem('token') }
      });
      if (response.data.success) {
        onSaveRescheduleDays(payload);
        setMessage('Delivery dates rescheduled successfully');
        setTimeout(() => {
          setShowDatePicker(false);
          setAlternateMode(false);
          setSelectedDates([]);
          setRescheduledFromDates([]);
          setIndividualToggles({});
          setMessage('');
          setRequiredRescheduleDays(0);
        }, 1500);
      } else {
        setMessage(response.data.error || 'Failed to reschedule delivery dates');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to reschedule delivery dates');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Clear all selections
  const handleClear = () => {
    setSelectedDates([]);
    setIndividualToggles({});
    setDragStart(null);
    setDragEnd(null);
    setIsDragging(false);
    setMonthlyIncludedDays({});
    setFromDate(null);
    setToDate(null);
    setLastClickedDate(null);
    if (alternateMode) {
      setMessage('');
    } else {
      setMessage('All selections cleared');
      setTimeout(() => setMessage(''), 1500);
    }
  };

  // Reset to initial state
  const handleResetToInitial = () => {
    setAlternateMode(false);
    setRescheduledFromDates([]);
    setRequiredRescheduleDays(0);
    setSelectedDates([]);
    setIndividualToggles({});
    setFromDate(null);
    setToDate(null);
    setMessage('');
  };

  // Set day class based on selection state
  const dayClassName = (date) => {
    if (!isDateSelectable(date)) return "disabled-day";
    
    // If this date is a processing date but not in alternate mode, highlight it
    if (!alternateMode && isProcessingDate(date)) {
      const dateStr = date.toDateString();
      return individualToggles[dateStr] ? "selected-day" : "processing-day";
    }
    
    // If in alternate mode and this is a rescheduled from date, make it orange
    if (alternateMode && rescheduledFromDates.includes(formatDate(date))) {
      return "rescheduled-from-day";
    }
    
    const dateStr = date.toDateString();
    return individualToggles[dateStr] ? "selected-day" : "default-day";
  };

  // Custom header renderer for DatePicker
  const renderCustomHeader = ({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
    <div className="calendar-header">
      <div className="month-navigation">
        <button
          className="month-nav-button"
          onClick={() => {
            decreaseMonth();
            setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1));
          }}
          disabled={prevMonthButtonDisabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="month-title">{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        <button
          className="month-nav-button"
          onClick={() => {
            increaseMonth();
            setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1));
          }}
          disabled={nextMonthButtonDisabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      {/* {!alternateMode && (
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-blue-200 mr-1"></div>
            <span className="text-xs text-gray-600">Processing Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
        </div>
      )} */}
      <div className="weekday-selector">
        {weekdays.map((day, index) => (
          <div key={day} className="weekday-item">
            <div 
              className={`weekday-checkbox ${monthlyIncludedDays[`${date.getFullYear()}-${date.getMonth()}`]?.[index] ? 'checked' : ''}`}
              onClick={() => handleIncludeDayChange(index)}
            >
              {monthlyIncludedDays[`${date.getFullYear()}-${date.getMonth()}`]?.[index] && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <span className={`weekday-label ${index === 0 || index === 6 ? 'weekend' : ''}`}>{day}</span>
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
      {!showDatePicker ? (
        <button
          className="px-4 py-3 my-2 w-full text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
          onClick={() => setShowDatePicker(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Schedule Delivery</span>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {alternateMode ? "Choose New Dates" : "Select Delivery Dates"}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={() => setShowDatePicker(false)}
                aria-label="Close calendar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
  
            {/* Info and selection count */}
            {selectedDates.length > 0 && (
              <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-center">
                  <div className="mr-2 rounded-full bg-blue-100 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {selectedDates.length} {alternateMode ? "new" : ""} date{selectedDates.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              </div>
            )}
  
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-3 py-2 text-xs text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center"
                onClick={handleClear}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M3 6h18"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                Clear
              </button>
              
              {alternateMode && (
                <button 
                  className="px-3 py-2 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                  onClick={handleResetToInitial}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M1 4v6h6"></path>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                  Back
                </button>
              )}
              
              <button 
                className={`px-3 py-2 text-xs text-white rounded-md flex items-center shadow-md ${
                  selectedDates.length > 0 ? 
                    'bg-blue-500 hover:bg-blue-600' : 
                    'bg-blue-300 cursor-not-allowed'
                }`}
                onClick={alternateMode ? handleSaveRescheduleDays : handleRescheduleDays}
                disabled={selectedDates.length === 0 || (alternateMode && selectedDates.length !== requiredRescheduleDays)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  {alternateMode ? (
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  ) : (
                    <path d="M5 12h14 M12 5l7 7-7 7"></path>
                  )}
                </svg>
                {alternateMode ? "Save Changes" : "Continue"}
              </button>
            </div>
  
            {/* Selection guidance for alternate mode */}
            {alternateMode && (
              <div className="mt-3 bg-amber-50 p-2 rounded-md border border-amber-200">
                <p className="text-xs text-amber-700">
                  <span className="font-bold">Please select {requiredRescheduleDays} new delivery date{requiredRescheduleDays !== 1 ? 's' : ''}.</span>
                  {' '}You've selected {selectedDates.length} so far.
                </p>
              </div>
            )}
          </div>
  
          {/* Calendar */}
          <div className="calendar-wrapper p-2">
            <DatePicker
              selected={currentMonth}
              onChange={() => {}}
              inline
              monthsShown={1}
              dayClassName={dayClassName}
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled
              }) => (
                <div className="px-2 py-2 flex items-center justify-between">
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <h2 className="text-base font-semibold">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              )}
              renderDayContents={(day, date) => {
                const dateObj = new Date(date);
                const isRescheduledFrom = alternateMode && rescheduledFromDates.includes(formatDate(dateObj));
                const isProcessing = !alternateMode && isProcessingDate(dateObj);
                const isSelected = selectedDates.includes(formatDate(dateObj));
                
                return (
                  <div
                    className="day-content"
                    onMouseDown={() => handleDragStart(dateObj)}
                    onMouseEnter={() => handleDragEnter(dateObj)}
                    onMouseUp={handleDragEnd}
                    onTouchStart={() => handleTouchStart(dateObj)}
                    onTouchMove={(e) => handleTouchMove(e, dateObj)}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => handleDateClick(dateObj)}
                  >
                    <span>{day}</span>
                    
                    {isProcessing && !alternateMode && (
                      <div className="processing-indicator"></div>
                    )}
                    
                    {isRescheduledFrom && (
                      <div className="reschedule-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4v6h6"></path>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="selected-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
          
         
        </div>
      )}
      
      {/* Improved styling */}
      <style jsx>{`
        .day-content {
          position: relative;
          height: 32px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 0.25rem;
          transition: all 0.15s ease;
        }
        
        .day-content:hover {
          background-color: #f3f4f6;
          transform: scale(1.1);
          z-index: 10;
        }
        
        .processing-indicator {
          position: absolute;
          bottom: 2px;
          height: 4px;
          width: 4px;
          background-color: #3b82f6;
          border-radius: 50%;
        }
        
        .reschedule-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          color: #f59e0b;
        }
        
        .selected-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          color: #3b82f6;
        }
        
        /* DatePicker overrides for better integration */
        .react-datepicker {
          font-family: inherit !important;
          border: none !important;
          width: 100% !important;
        }
        
        .react-datepicker__month-container {
          width: 100% !important;
        }
        
        .react-datepicker__day {
          margin: 0 !important;
          width: 32px !important;
          height: 32px !important;
        }
        
        .react-datepicker__day--selected {
          background-color: transparent !important; 
        }
        
        .react-datepicker__day--keyboard-selected {
          background-color: transparent !important;
        }
        
        .react-datepicker__day-name {
          width: 32px !important;
          margin: 0 !important;
        }
        
        .react-datepicker__day--outside-month {
          color: #d1d5db !important;
        }
        
        .react-datepicker__header {
          background-color: transparent !important;
          border-bottom: none !important;
        }
        
        /* Custom day states */
        .react-datepicker__day.processing-day {
          background-color: rgba(59, 130, 246, 0.1) !important;
          color: #3b82f6 !important;
          font-weight: 500;
        }
        
        .react-datepicker__day.selected-day {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .react-datepicker__day.rescheduled-from-day {
          background-color: rgba(245, 158, 11, 0.1) !important;
          color: #b45309 !important;
        }
      `}</style>
    </div>
  );
};

export default RescheduleDaysSelector;