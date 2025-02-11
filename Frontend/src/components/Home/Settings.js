import React, { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Settings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    setError((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });

    validateField(id, value);
  };

  const validateField = (field, value) => {
    let fieldError = null;
    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) fieldError = "Invalid email format.";
        break;
      case "password":
        if (value.length < 8 || value.length > 20) fieldError = "Password must be 8-20 characters.";
        else if (!/[A-Z]/.test(value)) fieldError = "Password must contain an uppercase letter.";
        else if (!/[a-z]/.test(value)) fieldError = "Password must contain a lowercase letter.";
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setError((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
        }
        break;
      case "confirmPassword":
        if (value !== formData.password) fieldError = "Passwords do not match.";
        break;
      default:
        break;
    }
    if (fieldError) setError((prev) => ({ ...prev, [field]: fieldError }));
  };

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError((prev) => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    try {
      await axios.post(`${process.env.REACT_APP_URL}/api/customer/updatePassword`, {
        customer_email: formData.email,
        customer_password: formData.password,
        confirm_password: formData.confirmPassword,
      }, {
        headers: { 'token': localStorage.getItem('token') }
      });
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error updating the password.";
      setError((prev) => ({ ...prev, submit: errorMessage }));
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setError({});
    setSuccessMessage("");
  };

  const goToHome = () => navigate("/");

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      navigate("/");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleBackdropClick}>
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <header className="w-full border-b border-neutral-300 pb-4 mb-6">
          <h1 className="font-title text-3xl text-primary text-center">Settings</h1>
        </header>

        <div className="max-h-[60vh] overflow-y-auto">
          <h2 className="font-title text-xl text-primary mb-4">Change Password</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="text-sm font-semibold block mb-2 text-primary-950">Name</label>
              <input
                type="text"
                id="name"
                className="w-full p-4 border rounded-md border-neutral-300 text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 ease-in-out"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold block mb-2 text-primary-950">Email</label>
              <input
                type="email"
                id="email"
                className={`w-full p-4 border rounded-md ${error.email ? 'border-red-500' : 'border-neutral-300'} text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 ease-in-out`}
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
              />
              {error.email && <p className="text-red-500 text-sm italic">{error.email}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="text-sm font-semibold block mb-2 text-primary-950">New Password</label>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                className={`w-full p-4 border rounded-md ${error.password ? 'border-red-500' : 'border-neutral-300'} text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 ease-in-out`}
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <EyeIcon className="h-5 w-5 text-gray-500" /> : <EyeOffIcon className="h-5 w-5 text-gray-500" />}
              </button>
              {error.password && <p className="text-red-500 text-sm italic">{error.password}</p>}
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="text-sm font-semibold block mb-2 text-primary-950">Confirm Password</label>
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmPassword"
                className={`w-full p-4 border rounded-md ${error.confirmPassword ? 'border-red-500' : 'border-neutral-300'} text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200 ease-in-out`}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="*********"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {confirmPasswordVisible ? <EyeIcon className="h-5 w-5 text-gray-500" /> : <EyeOffIcon className="h-5 w-5 text-gray-500" />}
              </button>
              {error.confirmPassword && <p className="text-red-500 text-sm italic">{error.confirmPassword}</p>}
            </div>

            {error.submit && <p className="text-red-500 text-sm italic">{error.submit}</p>}
            {successMessage && <p className="text-green-500 text-sm italic">{successMessage}</p>}

            <div className="flex space-x-4">
              <button type="submit" className="flex-1 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200 ease-in-out shadow-md">
                Update Password
              </button>
              <button type="button" className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-full hover:bg-gray-400 transition duration-200 ease-in-out shadow-md" onClick={handleCancel}>
                Cancel
              </button>
            </div>

            <button
              type="button"
              className="mt-4 w-full py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition duration-200 ease-in-out shadow-md"
              onClick={goToHome}
            >
              Go to Home
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};