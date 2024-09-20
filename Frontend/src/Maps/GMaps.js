import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '200px',
};

const center = {
  lat: 17.441660,
  lng: 78.386940,
};

const apiKey = 'AIzaSyDiEyNHzIRaWtyzDkR95XtLD1q5gUu1XC4'; // Replace with your API key

const GoogleMapComponent = ({ onLocationSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState('');

  const handleMapClick = useCallback(async (event) => {
    const { latLng } = event;
    const lat = latLng.lat();
    const lng = latLng.lng();

    setSelectedPosition({ lat, lng });

    // Fetch address using Google Geocoding API
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        setAddress(formattedAddress);
        onLocationSelect({ lat, lng}); // Pass data back to parent
      } else {
        setAddress('No address found');
        onLocationSelect({ lat, lng });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Error fetching address');
      onLocationSelect({ lat, lng});
    }
    onLocationSelect({ lat, lng});
  }, [onLocationSelect]);

  return (
    <div>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onClick={handleMapClick}
        >
          {selectedPosition && <Marker position={selectedPosition} />}
        </GoogleMap>
      </LoadScript>
      {address && (
        <div>
          {/* <p>Address: {address}</p> */}
          {/* <p>Latitude: {selectedPosition?.lat}</p>
          <p>Longitude: {selectedPosition?.lng}</p> */}
        </div>
      )}
    </div>
  );
};

export default GoogleMapComponent;