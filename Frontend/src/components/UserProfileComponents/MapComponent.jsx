import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";

const LocationInput = ({ onLocationSelected, selectedLocation,userData }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const searchLocation = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      
      const data = await response.json();
      setSuggestions(data);
      setError(null);
    } catch (err) {
      console.error("Error searching for location:", err);
      setError("Could not search for locations");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = (location) => {
    const newLocation = {
      id: Date.now(),
      name: location.display_name,
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon)
    };
    
    setInputValue("");
    setSuggestions([]);
    
    if (onLocationSelected) {
      onLocationSelected(newLocation);
    }
  };

  const removeLocation = () => {
    if (onLocationSelected) {
      onLocationSelected(null);
    }
  };

  return (
    <div className="location-input-container">
      <div className="search-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search for a location or click on the map"
          className="location-search-input"
        />
        
        {loading && <div className="loading-indicator">Searching...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {suggestions.length > 0 && (
          <ul className="location-suggestions">
            {suggestions.map((location) => (
              <li 
                key={location.place_id} 
                className="location-suggestion-item"
              >
                <span className="location-name">{location.display_name}</span>
                <button 
                  className="add-location-btn"
                  onClick={() => addLocation(location)}
                  aria-label="Add location"
                >
                  <span className="plus-symbol">+</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
        <div className="selected-location">
          <h4>Selected Location</h4>
          <div className="location-item">
            <span className="location-info">
              {selectedLocation ?selectedLocation.name  :userData.location }
            </span>
            <button 
              className="remove-location-btn"
              onClick={removeLocation}
              aria-label="Remove location"
            >
              Remove
            </button>
          </div>
        </div>
      {/* {selectedLocation && (
      )} */}
    </div>
  );
};

const MapComponent = ({ userData, setUserData }) => {
    
  const defaultLocation = { 
    latitude: 40.7128, 
    longitude: -74.0060, 
    location: "New York, USA" 
  };
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  
  // Handle location selection from search
  const handleLocationSelected = (location) => {
    if (location) {
      
      setSelectedLocation(location);
      if (setUserData) {
        setUserData({
          ...userData,
          latitude: location.latitude,
          longitude: location.longitude,
          location: location.name
        });
      }
    } else {
      
      setSelectedLocation(null);
      if (setUserData) {
        setUserData({
          ...userData,
          ...defaultLocation
        });
      }
    }
  };
  
  // Reverse geocoding function to get location name from coordinates
  const reverseGeocode = async (lat, lng) => {
    setIsMapLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to reverse geocode");
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error reverse geocoding:", err);
      return null;
    } finally {
      setIsMapLoading(false);
    }
  };
  
  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || !userData || Object.keys(userData).length === 0) return; // Ensure userData is loaded
  
    const latitude = userData.latitude || defaultLocation.latitude;
    const longitude = userData.longitude || defaultLocation.longitude;
    const locationName = userData.location || defaultLocation.location;
  
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([latitude, longitude], 13);
  
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(leafletMap.current);
  
      // Add click event handler to the map
      leafletMap.current.on("click", async (e) => {
        const { lat, lng } = e.latlng;
  
        // Reverse geocode to get location name
        const locationData = await reverseGeocode(lat, lng);
  
        if (locationData) {
          setUserData((prevUserData) => ({
            ...prevUserData, // Keep the latest data from backend
            latitude: lat,
            longitude: lng,
            location: locationData.display_name
          }));
        }
      });
    } else {
      leafletMap.current.setView([latitude, longitude], 13);
    }
  
    // Update marker on the map
    if (markerRef.current) {
      leafletMap.current.removeLayer(markerRef.current);
    }
  
    markerRef.current = L.marker([latitude, longitude])
      .addTo(leafletMap.current)
      .bindPopup(locationName)
      .openPopup();
  }, [userData]); // Runs only when userData updates
  
  
  // Cleanup map on component unmount
  useEffect(() => {
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  return (
    <div className="location-search-map-container">
      <div
        ref={mapRef}
        className="map-container"
        style={{
          height: '300px',
          width: '100%',
          marginTop: '15px',
          background: '#e5e3df',
          position: 'relative',
          cursor: 'pointer'
        }}
      >
        {isMapLoading && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '5px 10px',
              borderRadius: '4px',
              zIndex: 1000
            }}
          >
            Loading location...
          </div>
        )}
      </div>

      <p className="map-instructions" style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        Click anywhere on the map to select that location
      </p>

      <LocationInput 
        onLocationSelected={handleLocationSelected} 
        selectedLocation={selectedLocation}
        userData={userData}
      />

    </div>
  );
};

export default MapComponent;