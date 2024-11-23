import React, { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Settings = () => {
  const navigate = useNavigate();
  VerifyToken();
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative w-[600px] min-h-[700px] bg-white rounded-lg shadow-lg p-8">
        <header className="w-full border-b border-neutral-300 pb-4 mb-6">
          <h1 className="font-title text-3xl text-primary text-center">Settings</h1>
        </header>

        <div className="space-y-6">
          <h2 className="font-title text-xl text-primary mb-4">Change Password</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="text-sm font-semibold block mb-2 text-primary-950">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-4 border rounded-md border-neutral-300 text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.name}
                onChange={handleChange}
                placeholder="abc"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold block mb-2 text-primary-950">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-4 border rounded-md border-neutral-300 text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.email}
                onChange={handleChange}
                placeholder="abc@gmail.com"
              />
              {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
            </div>

            <div className="relative">
              <label htmlFor="password" className="text-sm font-semibold block mb-2 text-primary-950" placeholder="*********">
                New Password
              </label>
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                className="w-full p-4 border rounded-md border-neutral-300 text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {passwordVisible ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
              </button>
              {error.password && <p className="text-red-500 text-sm">{error.password}</p>}
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="text-sm font-semibold block mb-2 text-primary-950">
                Confirm Password
              </label>
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmPassword"
                className="w-full p-4 border rounded-md border-neutral-300 text-neutral-950 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="*********"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {confirmPasswordVisible ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
              </button>
              {error.confirmPassword && <p className="text-red-500 text-sm">{error.confirmPassword}</p>}
            </div>

            {error.submit && <p className="text-red-500 text-sm">{error.submit}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

            <div className="flex space-x-4">
              <button type="submit" className="flex-1 py-3 rounded-full bg-gray-500 text-white hover:bg-gray-700">
                Update Password
              </button>
              <button type="button" className="flex-1 bg-gray-500 text-white py-3 rounded-full hover:bg-gray-700" onClick={handleCancel}>
                Cancel
              </button>
            </div>

            <button
              type="button"
              className="mt-4 w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-700"
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
