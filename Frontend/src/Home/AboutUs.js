import React from "react";
import { FaInstagram, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export const AboutUs = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  VerifyToken();
  const goToHomePage = () => {
    navigate("/"); // Navigate to the homepage
  };

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden flex items-center justify-center">
      <div className="relative max-w-[900px] rounded-lg bg-white shadow-lg p-12 space-y-8">
        <h1 className="text-4xl font-semibold mb-6 text-neutral-900">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-lg text-neutral-800">
                <MdLocationOn className="text-primary-600" /> Madhapur, Hyderabad
              </p>
              <p className="flex items-center gap-2 text-lg text-neutral-800">
                <FaPhoneAlt className="text-primary-600" /> +91 81237 00851
              </p>
              <p className="flex items-center gap-2 text-lg text-neutral-800">
                <MdEmail className="text-primary-600" />
                <a
                  href="mailto:info@company.com"
                  className="text-primary-600 hover:underline"
                >
                  info@caterorange.com
                </a>
              </p>
            </div>
          </div>

          {/* Contact Form Placeholder (if needed) */}
        </div>

        {/* Home Button */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-500 transition duration-300"
            onClick={goToHomePage}
          >
            Go to Home
          </button>
        </div>

        {/* Footer Section */}
        <footer className="border-t pt-6">
          <div className="flex justify-center space-x-8">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:scale-110 transition transform duration-300"
            >
              <FaInstagram className="text-4xl text-primary-600" />
            </a>

            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:scale-110 transition transform duration-300"
            >
              <FaLinkedin className="text-4xl text-primary-600" />
            </a>

            <a
              href="mailto:info@company.com"
              aria-label="Email"
              className="hover:scale-110 transition transform duration-300"
            >
              <MdEmail className="text-4xl text-primary-600" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};
