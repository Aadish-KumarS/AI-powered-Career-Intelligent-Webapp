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
export async function getUserName(BASE_URL,token,setProfileData,profileData) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/users/profile`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProfileData({...profileData, name: response.data.name})
      
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
      skills: response.data.skills || [],
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