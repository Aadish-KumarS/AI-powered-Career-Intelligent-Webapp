import { useEffect, useRef } from "react";
import L from "leaflet";

const MapComponent = ({ userData, locationAccessStatus }) => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);

  useEffect(() => {
    if (!userData.latitude || !userData.longitude || !mapRef.current) return;

    
    if (!leafletMap.current) {
      // Initialize map only once
      leafletMap.current = L.map(mapRef.current).setView(
        [userData.latitude, userData.longitude],
        13
      );

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(leafletMap.current);
    } else {
      // If map already exists, just update the view
      leafletMap.current.setView([userData.latitude, userData.longitude], 13);
    }

    // Add or update marker
    L.marker([userData.latitude, userData.longitude])
      .addTo(leafletMap.current)
      .bindPopup(userData.location || "Current Location")
      .openPopup();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [userData.latitude, userData.longitude]);

  return (
    <div 
      ref={mapRef} 
      className="map-container" 
      style={{ 
        height: '300px', 
        width: '100%', 
        marginTop: '15px',
        backgroundColor: !userData.latitude ? '#f0f0f0' : 'transparent'
      }}
    >
      {!userData.latitude && (
        <div className="location-loading">
          {locationAccessStatus === 'pending' && 'Fetching location...'}
          {locationAccessStatus === 'error' && 'Could not retrieve location'}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
