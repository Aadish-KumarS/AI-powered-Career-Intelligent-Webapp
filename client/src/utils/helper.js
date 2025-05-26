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
        name: response.data.name || "",
        profilePicture: response.data.profilePicture || "",
        location: response.data.location || "",
        latitude: response.data.latitude ?? null,
        longitude: response.data.longitude ?? null,
        education: {
          highestLevel: response.data.education?.highestLevel || "",
          institution: response.data.education?.institution || "",
          graduationYear: response.data.education?.graduationYear || "",
          fieldOfStudy: response.data.education?.fieldOfStudy || ""
        },
        interests: response.data.interests || [],
        isFirstTime: response.data.isFirstTime ?? null
      };
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

export const getIsFirstTime = async (token, BASE_URL) => {
  try {
    if (!token) return null;

    const response = await axios.get(`${BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.isFirstTime;
  } catch (error) {
    console.error("Error fetching the user profile:", error);
    return null;
  }
};


//EDIT USER PROFILE
export const handleInputChange = (setter) => (e) => {
  const { name, value } = e.target;

  if (name.includes(".")) {
    const [parent, child] = name.split(".");

    setter((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));
  } else {
    setter((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
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

export const fetchSuggestions = async (query, setSuggestions, setLoading, setError) => {
  if (query.length < 2) {
    setSuggestions([]);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${query}&limit=10&origin=*`
    );

    const data = await response.json();
    setSuggestions(data[1]); 
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    setError("Could not fetch suggestions");
    setSuggestions([]);
  } finally {
    setLoading(false);
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

//SKILL GAP RES
export const mergeAndTransformSkillGapData = (llmResponse, userData) => {
  // Handle case where either input is undefined
  if (!llmResponse) return userData;
  if (!userData) return { result: llmResponse };
  
  // Extract content from LLM response if needed
  const llmData = llmResponse.choices?.[0]?.message?.content 
    ? JSON.parse(llmResponse.choices[0].message.content) 
    : llmResponse;
  
  // Create base structure for result
  const result = {
    result: {
      skill_assessment: {
        current_strengths: llmData.skill_assessment?.current_strengths || [],
        current_skill_levels: {},
        transferable_skills: llmData.skill_assessment?.transferable_skills || [],
        skill_gaps: {}
      },
      missing_skills: [],
      learning_path: llmData.learning_path || {},
      industry_insights: {
        market_trends: llmData.industry_insights?.market_trends || [],
        regional_factors: llmData.industry_insights?.regional_factors || [],
        salary_expectations: llmData.industry_insights?.salary_expectations || []
      },
      career_trajectory: {
        short_term_goals: llmData.career_trajectory?.short_term_goals || [],
        medium_term_goals: llmData.career_trajectory?.medium_term_goals || [],
        long_term_goals: llmData.career_trajectory?.long_term_goals || [],
        estimated_timeline: llmData.career_trajectory?.estimated_timeline || "Not specified"
      },
      networking_recommendations: llmData.networking_recommendations || [],
      portfolio_recommendations: llmData.portfolio_recommendations || []
    },
    processed_at: new Date().toISOString(),
    request_id: `req-${Date.now()}`
  };
  
  // Transform current_skill_levels from array to object format
  if (llmData.skill_assessment?.current_skill_levels) {
    llmData.skill_assessment.current_skill_levels.forEach(skill => {
      result.result.skill_assessment.current_skill_levels[skill.skill] = 
        `(${skill.level}) Consider strengthening your knowledge in ${skill.skill}.`;
    });
  }
  
  // Transform skill_gaps from array to object format
  if (llmData.missing_skills) {
    llmData.missing_skills.forEach(role => {
      result.result.skill_assessment.skill_gaps[role.role] = {
        priority_level: role.essential_technical_skills?.[0]?.importance || "Medium",
        essential_technical_skills: role.essential_technical_skills?.map(skill => skill.skill) || [],
        essential_soft_skills: role.essential_soft_skills?.map(skill => ({
          skill: skill.skill,
          importance_rating: skill.importance
        })) || [],
        recommended_tools: Array.isArray(role.recommended_tools) 
          ? role.recommended_tools 
          : role.recommended_tools?.split(', ') || [],
        nice_to_have: Array.isArray(role.nice_to_have)
          ? role.nice_to_have
          : role.nice_to_have?.split(', ') || []
      };
    });
  }
  
  // Transform missing_skills to match expected format
  if (llmData.missing_skills) {
    result.result.missing_skills = llmData.missing_skills.map(role => ({
      role: role.role,
      essential_technical_skills: role.essential_technical_skills?.map(skill => ({
        skill: skill.skill,
        proficiency_level: skill.importance === "High" ? "Proficient" : 
                          skill.importance === "Medium" ? "Intermediate" : "Beginner"
      })) || [],
      essential_soft_skills: role.essential_soft_skills?.map(skill => ({
        skill: skill.skill,
        importance_rating: skill.importance
      })) || [],
      recommended_tools: Array.isArray(role.recommended_tools) 
        ? role.recommended_tools 
        : role.recommended_tools?.split(', ') || [],
      nice_to_have: Array.isArray(role.nice_to_have)
        ? role.nice_to_have
        : role.nice_to_have?.split(', ') || []
    }));
  }
  
  // Merge with any existing user data from MongoDB
  if (userData.result) {
    // Merge skill_assessment
    if (userData.result.skill_assessment) {
      Object.assign(result.result.skill_assessment, userData.result.skill_assessment);
    }
    
    // Merge learning_path
    if (userData.result.learning_path) {
      Object.assign(result.result.learning_path, userData.result.learning_path);
    }
    
    // Merge other sections as needed
    if (userData.result.industry_insights) {
      Object.assign(result.result.industry_insights, userData.result.industry_insights);
    }
    
    if (userData.result.career_trajectory) {
      Object.assign(result.result.career_trajectory, userData.result.career_trajectory);
    }
    
    // Use existing timestamps if available
    if (userData.processed_at) {
      result.processed_at = userData.processed_at;
    }
    
    if (userData.request_id) {
      result.request_id = userData.request_id;
    }
  }
  
  return result;
};
