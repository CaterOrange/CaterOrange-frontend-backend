import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Utensils, CreditCard } from 'lucide-react';

const WelcomePreview = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Utensils className="w-12 h-12 text-teal-600" />,
      title: "Welcome to CaterOrange",
      description: "Your corporate meal planning made simple and delicious",
      tip: "Browse our curated selection of quality meals perfect for your workplace"
    },
    {
      icon: <MapPin className="w-12 h-12 text-teal-600" />,
      title: "Set Your Location",
      description: "Start by adding your delivery address",
      tip: "You can update your address anytime for different office locations"
    },
    {
      icon: <Calendar className="w-12 h-12 text-teal-600" />,
      title: "Plan Your Meals",
      description: "Select meals and schedule delivery dates",
      tip: "Use our calendar to plan meals for multiple days or set recurring orders"
    },
    {
      icon: <CreditCard className="w-12 h-12 text-teal-600" />,
      title: "Check Your Orders",
      description: "Track your orders in MyOrders",
      tip: "Know when your orders will arrive and when to pick them up"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 overflow-hidden shadow-2xl">
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-teal-600 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Content */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-6 p-4 bg-teal-50 rounded-full">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600 mb-4">
              {steps[currentStep].description}
            </p>
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-teal-800">
                💡 Pro tip: {steps[currentStep].tip}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              className={`p-2 rounded-lg flex items-center ${
                currentStep === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-teal-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-2 rounded-lg flex items-center text-white bg-teal-600 hover:bg-teal-700"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePreview;