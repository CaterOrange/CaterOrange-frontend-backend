import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const MapAddressSelector = ({ onAddressSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mapCenter, setMapCenter] = useState([17.441660, 78.386940]); // Default to London
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  const fetchAddress = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await response.json();
      setSelectedAddress(data);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const fetchSuggestions = useCallback(async (input) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=10`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchSuggestions]);

  const handleSearch = async () => {
    if (searchTerm.length < 3) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setMarkerPosition([parseFloat(lat), parseFloat(lon)]);
        setSelectedAddress(data[0]);
        setSuggestions('')
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion.display_name);
    setMapCenter([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setMarkerPosition([parseFloat(suggestion.lat), parseFloat(suggestion.lon)]);
    setSelectedAddress(suggestion);
    setSuggestions([]);
  };

  const handleOkayClick = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
        <style>
        {`
          .leaflet-control-attribution {
            display: none !important;
          }
        `}
      </style>

      <div className="search-bar mb-4 w-full max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an address"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
        {suggestions.length > 0 && (
        <div className="suggestions-container mb-4 w-full max-w-md">
          {/* <h3 className="font-bold mb-2">Suggestions:</h3> */}
          <ul className="suggestions-list h-40 overflow-y-auto border rounded">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        </div>
      )}
        
      </div>
      <div className="map-container mb-4 w-full max-w-md" style={{ height: '400px' }}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          key={mapCenter.join(',')}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            
          />
          {markerPosition && <Marker position={markerPosition} />}
          <MapEvents />
        </MapContainer>
      </div>
      
      {selectedAddress && (
        <div className="selected-address mb-4 w-full max-w-md p-4 border rounded">
          <h3 className="font-bold">Selected Address:</h3>
          <p>{selectedAddress.display_name}</p>
        </div>
      )}
      
    </div>
  );
};

export default MapAddressSelector;