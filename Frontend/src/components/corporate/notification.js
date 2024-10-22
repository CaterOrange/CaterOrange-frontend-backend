// Notification.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const Notification = ({ onClick }) => {
  return (
    <div 
      className="fixed bottom-20 right-5 bg-white border border-gray-300 shadow-md p-4 rounded-lg flex items-center cursor-pointer" 
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faSyncAlt} className="mr-2" />
      <span>Click here to display dates</span>
    </div>
  );
};

export default Notification;
