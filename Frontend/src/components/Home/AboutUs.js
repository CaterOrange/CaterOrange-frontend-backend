import React, { useState, useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaPhoneAlt, FaWhatsapp, FaStar, FaQuoteLeft, FaArrowLeft } from 'react-icons/fa';
import { MdLocationOn, MdEmail, MdFoodBank, MdDeliveryDining, MdSupportAgent } from 'react-icons/md';
import { UserCircleIcon } from '@heroicons/react/solid';

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

const Navbar = ({ toggleSidenav }) => (
  <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-teal-700 to-teal-600 text-white shadow-md py-4 px-6 z-20">
    <div className="flex items-center justify-between relative">
      <div className="absolute left-0">
        <UserCircleIcon
          className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={toggleSidenav}
        />
      </div>
      <div className="flex-1 flex justify-center">
        <h2 className="text-lg md:text-2xl font-bold text-white text-center font-serif">
          Contact Us
        </h2>
      </div>
    </div>
  </header>
);

const Sidenav = ({ isOpen, onClose, sidenavRef, userProfile }) => {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleNavigation = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDP');
    localStorage.removeItem('address');
    window.location.href = '/';
  };

  const navigationItems = [
    { label: 'Home', path: '/home' },
    { label: 'My Orders', path: '/orders' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Settings', path: '/settings' }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        ref={sidenavRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white text-black shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 bg-teal-800 text-white">
          <div className="flex justify-end p-2">
            <button
              className="text-white hover:opacity-80 transition-opacity"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="flex flex-col items-center">
            {userProfile?.picture ? (
              <img
                src={userProfile.picture}
                alt="Profile"
                className="rounded-full w-16 h-16 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="rounded-full w-16 h-16 bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
                {getInitials(userProfile?.name)}
              </div>
            )}
            <h3 className="mt-2 font-medium">{userProfile?.name || 'Guest'}</h3>
            {userProfile?.phone && <p className="text-sm mt-1">{userProfile.phone}</p>}
            <p className="text-sm mt-1">{userProfile?.email || 'No email provided'}</p>
          </div>
        </div>

        <nav>
          <ul className="p-2 space-y-1">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <button
                  className="w-full p-3 text-left rounded hover:bg-gray-100 transition-colors"
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                className="w-full p-3 text-left text-red-600 rounded hover:bg-red-50 transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

// Data
const SERVICES = [
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

const TESTIMONIALS = [
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

const CONTACT_INFO = {
  whatsapp: "918123700851",
  email: "info@caterorange.com",
  location: "Madhapur, Hyderabad",
  phone: "+91 81237 00851"
};

export const AboutUs = () => {
  const navigate = useNavigate();
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const sidenavRef = useRef(null);
  
  // Get user profile from localStorage
  const userProfile = JSON.parse(localStorage.getItem('userDP')) || {
    name: '',
    email: '',
    phone: '',
    picture: null
  };
  const handleMyOrders=()=>{
    navigate('/home');
  }

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${CONTACT_INFO.whatsapp}`, "_blank");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidenavRef.current && !sidenavRef.current.contains(event.target)) {
        setIsSidenavOpen(false);
      }
    }

    if (isSidenavOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidenavOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidenav={() => setIsSidenavOpen(true)} />
      
      <Sidenav 
        isOpen={isSidenavOpen}
        onClose={() => setIsSidenavOpen(false)}
        sidenavRef={sidenavRef}
        userProfile={userProfile}
      />

      <div className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-teal-600 text-white">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 flex items-center space-x-2 bg-white text-teal-700 px-4 py-2 rounded-lg hover:bg-white/30 transition duration-300"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold leading-tight">
                  Delicious Food,
                  <br />
                  <span className="text-yellow-300">Delivered Fresh</span>
                </h1>
                <p className="text-xl leading-relaxed text-white/90">
                  Experience delicious food at your doorstep. Our master chefs craft each dish with passion, 
                  using premium ingredients to create memorable dining experiences.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={handleMyOrders}
                  className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition duration-300 flex items-center gap-2"
                >
                  Order Now
                </button>
                <button 
                  onClick={handleWhatsAppClick}
                  className="bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition duration-300 flex items-center gap-2"
                >
                  <FaWhatsapp className="text-xl text-green-700" />
                  Contact Us
                </button>
              </div>

              {/* Social Links */}
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
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
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
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="hover:text-teal-400 transition duration-300"
                >
                  <MdEmail className="text-3xl" />
                </a>
              </div>

              {/* Stats */}
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

            {/* Right Column - Contact Card */}
            <div className="relative hidden md:block">
              <div className="absolute -top-8 -left-8 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -right-8 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl" />
              <div className="bg-white rounded-xl shadow-lg p-8" id="contact">
                <h2 className="text-3xl font-semibold text-center mb-8 text-neutral-800">Get in Touch</h2>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-lg">
                      <MdLocationOn className="text-red-600 text-2xl" />
                      <span className="text-neutral-700">{CONTACT_INFO.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-lg">
                      <FaPhoneAlt className="text-teal-600 text-xl" />
                      <span className="text-neutral-700">{CONTACT_INFO.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-lg">
                      <MdEmail className="text-yellow-500 text-2xl" />
                      <a href={`mailto:${CONTACT_INFO.email}`} className="text-teal-600 hover:underline">
                        {CONTACT_INFO.email}
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

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-teal-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-2xl italic text-teal-800">
            "Food is not just fuel, it's information. It talks to your DNA and tells it what to do. 
            The most powerful tool to change your health, environment, and entire world is your fork."
          </p>
          <p className="mt-4 text-yellow-700 font-bold text-xl">~ Cater Orange Philosophy</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            <p className="text-center text-neutral-400">
              © {new Date().getFullYear()} Cater Orange. All rights reserved. 
              Bringing delicious food to your doorstep.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;