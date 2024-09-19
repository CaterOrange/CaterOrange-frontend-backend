// import React, { useState, useCallback } from 'react';
// import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
// const containerStyle = {
//   width: '100%',
//   height: '500px',
// };
// const center = {
//   lat: 17.441660, // Default center location
//   lng: 78.386940,
// };
// const apiKey = 'AIzaSyDiEyNHzIRaWtyzDkR95XtLD1q5gUu1XC4'; // Replace with your API key
// const GoogleMapComponent = () => {
//   const [selectedPosition, setSelectedPosition] = useState(null);
//   const [address, setAddress] = useState('');
//   const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
//   const [a,seta]=useState('')

//   const handleMapClick = useCallback(async (event) => {
//     const { latLng } = event;
//     const lat = latLng.lat();
//     const lng = latLng.lng();
  
//     // Set the selected position and coordinates
//     setSelectedPosition({ lat, lng });
//     setCoordinates({ lat, lng });
  
//     // Get address from latitude and longitude
//     try {
//       const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
//       const data = await response.json();
//       console.log('Geocoding API response:', data); // Log API response for debugging
//       if (data.results && data.results.length > 0) {
//         setAddress(data.results[0].formatted_address);
//       } else {
//         setAddress('No address found');
//       }
//     } catch (error) {
//       console.error('Error fetching address:', error);
//       setAddress('Error fetching address');
//     }
//   }, []);
  
//   return (
//     <div>
//       <LoadScript googleMapsApiKey={apiKey}>
//         <GoogleMap
//           mapContainerStyle={containerStyle}
//           center={center}
//           zoom={14}
//           options={{ tilt: 45 }} // Tilt for 3D view
//           onClick={handleMapClick}
//         >
//           {selectedPosition && <Marker position={selectedPosition} />}
          

//         </GoogleMap>
//       </LoadScript>
//       {address && (
//         <div>
//           {/* <p>Address: {address}</p> */}
//           <p>Latitude: {coordinates.lat}</p>
//           <p>Longitude: {coordinates.lng}</p>
//         </div>
//       )}
//     </div>
//   );
// };
// export default GoogleMapComponent;

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
        onLocationSelect({ lat, lng, address: formattedAddress }); // Pass data back to parent
      } else {
        setAddress('No address found');
        onLocationSelect({ lat, lng, address: 'No address found' });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress('Error fetching address');
      onLocationSelect({ lat, lng, address: 'Error fetching address' });
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
