import React from 'react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Shipping Policy</h1>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Delivery Areas</h2>
          <p className="mb-2">
            We currently offer meal delivery services within a 15-mile radius of our central kitchen. 
            For areas outside this radius, additional delivery charges may apply.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Delivery Schedule</h2>
          <p className="mb-2">
            Corporate meal deliveries are available Monday through Friday, from 9:00 AM to 5:00 PM.
            We require all orders to be placed at least 24 hours in advance to ensure timely preparation and delivery.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Delivery Fees</h2>
          <p className="mb-2">
            Standard delivery fee is $15 for orders under $150. 
            Orders above $150 qualify for free delivery within our standard service area.
          </p>
          <p className="mb-2">
            For rush orders (less than 24 hours notice), an additional fee of $25 will be applied.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Order Tracking</h2>
          <p className="mb-2">
            Once your order has been dispatched for delivery, you will receive an email notification with 
            estimated arrival time. You can track the status of your delivery through your account dashboard.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Special Instructions</h2>
          <p className="mb-2">
            If you have specific delivery instructions (building access codes, preferred entrance, etc.), 
            please include these details in the "Delivery Notes" section when placing your order.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Food Safety & Handling</h2>
          <p className="mb-2">
            All meals are prepared and packaged following strict food safety guidelines. Our delivery 
            vehicles are equipped with temperature-controlled compartments to ensure your food remains 
            at the proper temperature during transit.
          </p>
        </section>
        
        <p className="mt-10 text-sm text-gray-500">
          Last Updated: February 24, 2025
        </p>
        
        <div className="mt-8 border-t pt-6">
          <Link to="/" className="text-teal-600 hover:text-teal-800 transition duration-300">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;