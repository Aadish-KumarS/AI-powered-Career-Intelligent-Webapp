import axios from "axios";
import gsap from "gsap";


export const resendOTP = async () => {

  try {
    const response = await axios.post('http://localhost:5000/otp/request-otp');

    if (response.data.success) {
      alert('OTP sent to your email.');
    } else {
      alert('Failed to send OTP. Please try again.');
    }
  } catch (err) {
    alert('Error sending OTP. Please try again later.');
    console.error(err);
  }
};


//USER PROFILE 
// create profile component helper functions 
export async function getUserData(BASE_URL,token,setProfileData,profileData) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/users/profile`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedUserData = {
        name: response.data.name, 
        education:response.data.education,
        location: response.data.location,
        longitude: response.data.longitude,
        latitude: response.data.latitude,
        interests: response.data.interests,
        profilePicture: response.data.profilePicture
      }
      setProfileData({...profileData, 
        ...fetchedUserData});
      sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
    } catch (error) {
      console.error('Error fetching the data',error);
    }
}

export async function getUserDetail(token,navigate,BASE_URL,setUserData) {
  try {
    if (!token) {
      navigate('/signup');
      return;
    }

    const response = await axios.get(
      `${BASE_URL}/api/users/profile`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    setUserData({
      name: response.data.name || "",
      title: response.data.title || "",
      location: response.data.location || "",
      education: response.data.education || "",
      email: response.data.email || "",
      profileImage: response.data.profilePicture || "",
      interests: response.data.interests || [],
      isFirstTime: response.data.isFirstTime || true,
    });
  } catch (error) {
    console.error('Error fetching the data:', error);
  }
}

export const getIsFirstTime = async (token,navigate,BASE_URL,setIsFirstTime) => {
  try {
    if (!token) {
      navigate('/signup');
      return;
    }

    const response = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setIsFirstTime(response.data.isFirstTime); 
  } catch (error) {
    console.error('Error fetching the data:', error);
  }
};



//EDIT USER PROFILE
// edit profile component helper functions 
export const handleInputChange = (setter) => (e) => {
  const { name, value } = e.target;
  setter(prevData => ({ ...prevData, [name]: value }));
};

export const handlePasswordChange = (setter) => (e) => {
  const { name, value } = e.target;
  setter(prevData => ({ ...prevData, [name]: value }));
};

export const handleInterestToggle = (setter, userData) => (interest) => {
  const currentInterests = userData.interests || [];
  const newInterests = currentInterests.includes(interest)
    ? currentInterests.filter(i => i !== interest)
    : [...currentInterests, interest];

  setter(prevData => ({ ...prevData, interests: newInterests }));
};

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

export const updatePassword = async (e, passwordData, setError, setSuccessMessage, setPasswordData, setLoading) => {
  e.preventDefault();
  
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    const token = sessionStorage.getItem('authToken');
    console.log(passwordData);
    
    await axios.put(
      'http://localhost:5000/api/users/change-password', 
      passwordData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setSuccessMessage('Password updated successfully');
    setError('');

    sessionStorage.removeItem('authToken');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
    
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to update password');
    setSuccessMessage('');
  } finally {
    setLoading(false); 
  }
};

export const deleteAccount = async (setError) => {
  const confirmDelete = window.confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );
  
  if (confirmDelete) {
    try {
      const token = sessionStorage.getItem('authToken');
      await axios.delete('http://localhost:5000/api/users/delete-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      sessionStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      setError('Failed to delete account');
    }
  }
};

export const updateProfile = async (e, userData, setError, setSuccessMessage,setLoading,navigate) => {
  e.preventDefault();
  try {
    const token = sessionStorage.getItem('authToken');
    setLoading(true)
    await axios.put(
      'http://localhost:5000/api/users/update-profile', 
      userData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Update session storage
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    setSuccessMessage('Profile updated successfully');
    setError('');
  } catch (err) {
    setError('Failed to update profile',err);
    setSuccessMessage('');
  } finally{
    setLoading(false);
    navigate('/profile/user-profile')
  }
};


//CREATE USER PROFILE
// create profile component helper functions 
export const handleStepChange = (formRef, setStep, step, direction, setError = null, profileData = null) => {
  if (direction === "next") {
    if (step === 1 && profileData && !profileData.name) {
      setError && setError("Name is required");
      return;
    }
    setError && setError("");

    if (step === 1 && profileData && !profileData.education) {
      setError && setError("Education is required");
      return;
    }
    setError && setError("");
  }

  gsap.to(formRef.current, {
    opacity: 0,
    y: direction === "next" ? -30 : 30,
    ease: "power3.in",
    duration: 0.5,
    onComplete: () => {
      setStep((prevStep) => prevStep + (direction === "next" ? 1 : -1));
    }
  });
};

export const handleCreateUserFileChange = (e,setProfileData,profileData) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, profilePicture: reader.result });
    };
    reader.readAsDataURL(file);
  }
};


//INTEREST COMPONENT
// interest component helper functions 
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const handleInterestInputChange = (e, setInputValue, debouncedFetchSuggestions) => {
  const value = e.target.value;
  setInputValue(value);
  debouncedFetchSuggestions(value);
};

export const addInterest = (interest, userData, setUserData, setInputValue, setSuggestions) => {
  
  if (!userData?.interests || !Array.isArray(userData.interests)) {
    setUserData(prev => ({
      ...prev,
      interests:  interest
    }));
  } else if (!userData.interests.includes(interest)) {
    setUserData(prev => ({
      ...prev,
      interests: [...prev.interests, interest]  
    }));
  }
  setInputValue("");
  setSuggestions([]);
};

export const removeInterest = (interest, setUserData) => {
  setUserData(prev => ({
    ...prev,
    interests: prev.interests.filter(item => item !== interest) 
  }));
};

