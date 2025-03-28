import axios from "axios";


export const fetchIPBasedLocation = async (setUserData, setError, setLocationAccessStatus) => {
  try {
    //CHANGE IT LATER
    const response = await axios.get('http://localhost:5000/api/location/sds');
    const { latitude, longitude, city, region, country_name } = response.data;
    
    setUserData(prevData => ({
      ...prevData,
      location: `${city}, ${region}, ${country_name}`,
      latitude,
      longitude
    }));

    setLocationAccessStatus('fallback');
  } catch (error) {
    console.error('Error fetching location:', error);
    setError('Could not fetch location');
    setLocationAccessStatus('error');
  }
};

export const getGeoLocation = async (setUserData,setLocationAccessStatus, setError)=> {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => {
          const locationName = response.data.display_name;
          
          setUserData(prevData => ({
            ...prevData,
            location: locationName,
            latitude,
            longitude
          }));
          
          setLocationAccessStatus('success');
        })
        .catch(() => {
          setUserData(prevData => ({
            ...prevData,
            latitude,
            longitude,
            location: 'Current Location'
          }));
          
          setLocationAccessStatus('partial');
        });
    },
    (error) => {
      console.warn('Geolocation failed:', error);
      fetchIPBasedLocation(setUserData, setError, setLocationAccessStatus);
    }
  );
}

export const fetchUserProfile = async (setUserData,setError) => {
  try {
    const token = sessionStorage.getItem('authToken');
    const response = await axios.get('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const fetchedUserData = response.data;
    setUserData(prevData => ({
      ...prevData,
      ...fetchedUserData
    }));
    
    sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
  } catch (err) {
    setError('Failed to fetch profile data',err);
  }
};