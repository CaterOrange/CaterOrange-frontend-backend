import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = (index) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqItems = [
    {
      question: "How do I place an order?",
      answer: "You can place an order through our website or mobile app. Simply browse our menu, select your items, choose delivery date and time, and proceed to checkout. You'll receive an order confirmation via email once your order is successfully placed."
    },
    {
      question: "What are your delivery hours?",
      answer: "We deliver Monday through Friday from 9:00 AM to 6:00 PM. For corporate events and large orders, we offer weekend deliveries with advance notice. Please note that delivery times may vary based on your location and traffic conditions."
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer: "Yes, we offer a variety of options for different dietary needs including vegetarian, vegan, gluten-free, dairy-free, and nut-free meals. You can filter our menu by dietary preference or add special instructions when placing your order. For severe allergies, please contact our team directly."
    },
    {
      question: "What is the minimum order amount?",
      answer: "Our minimum order amount is $50 for individual orders and $200 for corporate catering. For recurring meal plans, different minimums may apply. Please check our corporate plans page for more details on bulk ordering options."
    },
    {
      question: "How far in advance should I place my order?",
      answer: "For individual meals, we recommend placing orders at least 24 hours in advance. For corporate events and large gatherings (10+ people), we request a minimum of 48-72 hours notice. During peak seasons or holidays, additional advance notice may be required."
    },
    {
      question: "Do you offer recurring order options?",
      answer: "Yes, we offer weekly, bi-weekly, and monthly recurring order options for both individual and corporate clients. You can set up a recurring order through your account dashboard and easily modify or pause your schedule at any time."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and corporate purchase orders. For corporate accounts, we also offer invoicing options with approved credit applications. All payments are processed securely through our platform."
    },
    {
      question: "How can I track my delivery?",
      answer: "Once your order is out for delivery, you'll receive a tracking notification via email and/or text message. You can also check the status of your delivery in real-time through your account dashboard or our mobile app."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Frequently Asked Questions</h1>
        
        <div className="mb-6">
          <p className="mb-4">
            Find answers to the most common questions about our corporate meal delivery service. 
            If you can't find what you're looking for, please contact our customer support team.
          </p>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
              <button
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex justify-between items-center focus:outline-none"
                onClick={() => toggleItem(index)}
              >
                <span className="font-medium text-teal-700">{item.question}</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${openItem === index ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {openItem === index && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <section className="mt-8 p-4 bg-gray-50 rounded-md border border-gray-200">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Still Have Questions?</h2>
          <p className="mb-4">
            Our customer support team is available Monday through Friday from 8:00 AM to 6:00 PM 
            to assist you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:support@corporatemeals.com" className="inline-block bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 text-center">
              Email Support
            </a>
            <a href="tel:+15551234567" className="inline-block bg-white border border-teal-600 text-teal-600 py-2 px-4 rounded hover:bg-gray-50 text-center">
              Call (555) 123-4567
            </a>
          </div>
        </section>
        
        <div className="mt-8">
          <Link to="/" className="text-teal-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQ;