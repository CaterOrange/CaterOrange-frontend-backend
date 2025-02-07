import React from 'react';
import { FaInstagram, FaLinkedin, FaPhoneAlt, FaWhatsapp, FaStar, FaQuoteLeft, FaArrowLeft } from "react-icons/fa";
import { MdLocationOn, MdEmail, MdFoodBank, MdDeliveryDining, MdSupportAgent } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Previous ServiceCard and TestimonialCard components remain the same...
const ServiceCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex flex-col items-center text-center space-y-4">
      <Icon className="text-4xl text-teal-600" />
      <h3 className="text-xl font-semibold text-neutral-800">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, image, rating, review, role }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <h4 className="font-semibold text-lg">{name}</h4>
          <p className="text-sm text-neutral-600">{role}</p>
        </div>
      </div>
      <div className="flex text-yellow-400">
        {[...Array(rating)].map((_, i) => (
          <FaStar key={i} />
        ))}
      </div>
      <div className="relative">
        <FaQuoteLeft className="absolute -left-2 -top-2 text-green-600 opacity-20 text-4xl" />
        <p className="text-neutral-700 italic pl-8">{review}</p>
      </div>
    </div>
  </div>
);

export const AboutUs = () => {
  const navigate = useNavigate();

  const goToHomePage = () => {
    navigate("/");
  };

  const handleWhatsAppFeedback = () => {
    const whatsappUrl = "https://wa.me/918123700851";
    window.open(whatsappUrl, "_blank");
  };

  // Services and testimonials data remain the same...
  const services = [
    {
      icon: MdFoodBank,
      title: "Premium Quality Food",
      description: "Expertly prepared dishes using the finest ingredients, ensuring a delightful dining experience."
    },
    {
      icon: MdDeliveryDining,
      title: "Swift Delivery",
      description: "Quick and reliable delivery service to bring fresh, hot meals right to your doorstep."
    },
    {
      icon: MdSupportAgent,
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you with any queries or concerns."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Food Enthusiast",
      image: "https://media.istockphoto.com/id/1326417862/photo/young-woman-laughing-while-relaxing-at-home.jpg?s=612x612&w=0&k=20&c=cd8e6RBGOe4b8a8vTcKW0Jo9JONv1bKSMTKcxaCra8c=",
      rating: 5,
      review: "The biryani from Cater Orange is absolutely divine! The flavors are authentic and the portion sizes are generous. My go-to for special occasions!"
    },
    {
      name: "Rahul Mehta",
      role: "Corporate Professional",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDtd0soCSRdpo8Y5klekJdABh4emG2P29jwg&s",
      rating: 5,
      review: "We regularly order from Cater Orange for our office lunches. The food is consistently excellent and the service is impeccable."
    },
    {
      name: "Anjali Reddy",
      role: "Food Blogger",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmVtYWxlJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
      rating: 5,
      review: "Their attention to detail in packaging and delivery is outstanding. The food arrives hot and fresh every single time!"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 text-white">
        {/* Back Button */}
        <button
          onClick={goToHomePage}
          className="absolute top-6 left-6 flex items-center space-x-2 bg-white text-teal-700 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition duration-300"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight animate-fade-in">
                  Delicious Food,
                  <br />
                  <span className="text-yellow-300">Delivered Fresh</span>
                </h1>
                <p className="text-xl leading-relaxed text-white/90">
                  Experience Delicious Food at your doorstep. Our master chefs craft each dish with passion, 
                  using premium ingredients to create memorable dining experiences.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleWhatsAppFeedback}
                  className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition duration-300 flex items-center gap-2"
                >
                  <FaWhatsapp className="text-xl text-green-700" />
                  Order Now
                </button>
                <a 
                  href="#contact"
                  className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition duration-300"
                >
                  Contact Us
                </a>
              </div>
              <div className="flex space-x-8">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition duration-300"
                >
                  <FaInstagram className="text-3xl" />
                </a>
                <a
                  href="https://wa.me/918123700851"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition duration-300"
                >
                  <FaWhatsapp className="text-3xl" />
                </a>
                <a
                  href="https://www.linkedin.com/in/abhisheksusarla/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition duration-300"
                >
                  <FaLinkedin className="text-3xl" />
                </a>
                <a
                  href="mailto:info@caterorange.com"
                  className="hover:text-teal-400 transition duration-300"
                >
                  <MdEmail className="text-3xl" />
                </a>
              </div>
              <div className="flex gap-8 text-white/90">
                <div>
                  <div className="text-3xl font-bold">10k+</div>
                  <div className="text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.9</div>
                  <div className="text-sm">Customer Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">30+</div>
                  <div className="text-sm">Menu Items</div>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -top-8 -left-8 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl"></div>
              <div className="bg-white rounded-xl shadow-lg p-8" id="contact">
      <h2 className="text-3xl font-semibold text-center mb-8 text-neutral-800">Get in Touch</h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-lg">
            <MdLocationOn className="text-red-600 text-2xl" />
            <span className="text-neutral-700">Madhapur, Hyderabad</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <FaPhoneAlt className="text-teal-600 text-xl" />
            <span className="text-neutral-700">+91 81237 00851</span>
          </div>
          <div className="flex items-center gap-3 text-lg">
            <MdEmail className="text-yellow-500 text-2xl" />
            <a href="mailto:info@caterorange.com" className="text-teal-600 hover:underline">
              info@caterorange.com
            </a>
          </div>
        </div>
        <div className="flex-shrink-0">
          <img 
            src="https://static.vecteezy.com/system/resources/thumbnails/004/416/293/small/delivery-man-on-scooter-free-vector.jpg" 
            alt="Delivery Person" 
            className="rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of the components remain the same... */}
      {/* Services Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>

      {/* Quote Section */}
      <div className="bg-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl italic text-teal-800">"Food is not just fuel, it's information. It talks to your DNA and tells it what to do. The most powerful tool to change your health, environment, and entire world is your fork."</p>
          <p className="mt-4 text-yellow-700 font-bold text-xl">~ Cater Orange Philosophy</p>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>


      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
          
            <p className="text-center text-neutral-400">
              © 2025 Cater Orange. All rights reserved. Bringing delicious food to your doorstep.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;