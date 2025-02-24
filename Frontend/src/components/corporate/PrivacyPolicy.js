import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-teal-800 mb-6">Privacy Policy</h1>
        
        <section className="mb-6">
          <p className="mb-4">
            Your privacy is important to us. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our app.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Information We Collect</h2>
          <p className="mb-2">
            We may collect the following types of information:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">
              <strong>Personal Identifiers:</strong> Name, email address, phone number, postal address
            </li>
            <li className="mb-1">
              <strong>Account Information:</strong> Username, password, profile information
            </li>
            <li className="mb-1">
              <strong>Transaction Information:</strong> Payment details, purchase history
            </li>
            <li className="mb-1">
              <strong>Device Information:</strong> IP address, device type, operating system
            </li>
            <li className="mb-1">
              <strong>Usage Data:</strong> Interactions with the app, browsing history, time spent
            </li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">How We Use Your Information</h2>
          <p className="mb-2">
            We may use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">Providing and maintaining our services</li>
            <li className="mb-1">Processing transactions and sending related information</li>
            <li className="mb-1">Responding to inquiries and providing customer support</li>
            <li className="mb-1">Improving our app and user experience</li>
            <li className="mb-1">Sending promotional communications (with your consent)</li>
            <li className="mb-1">Protecting against fraudulent or illegal activity</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Information Sharing</h2>
          <p className="mb-2">
            We may share your information with:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">
              <strong>Service Providers:</strong> Third parties that help us operate our app
            </li>
            <li className="mb-1">
              <strong>Business Partners:</strong> With your consent, for marketing purposes
            </li>
            <li className="mb-1">
              <strong>Legal Requirements:</strong> To comply with applicable laws or legal processes
            </li>
            <li className="mb-1">
              <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
            </li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to protect your 
            personal information from unauthorized access, disclosure, alteration, and destruction.
            However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Your Rights</h2>
          <p className="mb-2">
            Depending on your location, you may have the right to:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li className="mb-1">Access the personal information we have about you</li>
            <li className="mb-1">Correct inaccurate or incomplete information</li>
            <li className="mb-1">Delete your personal information</li>
            <li className="mb-1">Object to or restrict certain processing of your data</li>
            <li className="mb-1">Data portability (receiving your data in a structured format)</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Children's Privacy</h2>
          <p className="mb-4">
            Our app is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13. If you are a parent or guardian 
            and believe your child has provided us with personal information, please contact us.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Contact Us</h2>
          <p className="mb-2">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mb-2">
            privacy@example.com
          </p>
        </section>
        
        <div className="mt-8 text-right text-sm text-gray-600 italic">
          Last Updated: February 24, 2025
        </div>
        
        <div className="mt-8">
          <Link to="/" className="text-teal-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;