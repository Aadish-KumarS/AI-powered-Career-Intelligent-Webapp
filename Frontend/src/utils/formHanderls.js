import axios from "axios";
import gsap from "gsap";
import { getIsFirstTime } from "./helper";

//EMAIL VERIFICATION
export const handleSubmitEmailVerification = async (e, verificationCode, setError,navigate,location) => {
  e.preventDefault();

  if (verificationCode.length !== 6) {
    setError('Invalid verification code');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/otp/verify-otp', {
      otp: verificationCode,
    });

    const purpose = location?.state?.purpose;
    if (response.data.success) {
      if (purpose === 'forgot-password') {
        alert('Email verified successfully!');
        navigate('/reset-password')
      } else {
        alert('Email verified successfully!');
        navigate('/login');
      }
    } else {
      setError(response.data.message || 'Verification failed');
    }
  } catch (err) {
    console.error('Error during OTP verification:', err.response ? err.response.data : err);
    setError('An error occurred. Please try again later.');
  }
};

//FORGOT PASSWORD
export const handleSubmitForgotPassword = async (e,setError,setSuccess,setLoading,email,navigate) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setLoading(true); 

  if (!email.trim()) {
    setError('Please enter your email');
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
      email : email
    });

    const data = await response.data;
    if (response.status == 200) {
      setSuccess('A verification code has been sent to your email.');
      setTimeout(() => {
        navigate('/verify-email', { state: { purpose: 'forgot-password' } });
      }, 1000);
    } else {
      setError(data.message || 'Something went wrong.');
    }
  } catch (error) {
    setError('Server error. Please try again later.',error);
  } finally {
    setLoading(false);
  }
};

//LOGIN
export const handleSubmitLogin = async (e, setLoading, setError, formData, navigate, setIsFirstTime, setVerificationMessage) => {
  e.preventDefault();
  setLoading(true);
  setError(""); 
  setVerificationMessage(""); 

  if (!formData.email || !formData.password) {
    setError("All fields are required");
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", formData, { withCredentials: true });

    if (response.data) {
      const token = response.data.token;
      sessionStorage.setItem("authToken", token); 

      getIsFirstTime(token, navigate, "http://localhost:5000", (isFirstTime) => {
        setIsFirstTime(isFirstTime);

        if (isFirstTime) {
          navigate("/profile/create-user-profile");
        } else {
          navigate("/profile/user-profile");
        }
      });
    } 
  } catch (err) {
    if (err.response && err.response.data && err.response.data.message) {
      const errorMessage = err.response.data.message;

      if (errorMessage === "Please verify your email before logging in.") {
        setVerificationMessage(errorMessage);
      } else {
        setError(errorMessage);
      }
    } else {
      setError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false); 
  }
};

//RESET PASSWORD
export const handleSubmitResetPassword = async (e,setError,setSuccess,formData,navigate) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters long.');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
      password: formData.password
    });

    const data = await response.data;

    if (response.status == 200) {
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data.message || 'Something went wrong.');
    }
  } catch (error) {
    setError('Server error. Please try again later.',error);
  }
};

//SIGNUP
export const handleSubmitSignup = async (e,setLoading,formData,setError,validateEmail,setSuccess,navigate) => {
  e.preventDefault();
  setLoading(true);

  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters long.');
    setLoading(false);
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match');
    setLoading(false);
    return;
  }

  if (!validateEmail(formData.email)) {
    setError('Invalid email format');
    setLoading(false);
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    if (response.data) {
      setSuccess('Account created successfully! Please verify your email.');
      navigate('/verify-email',{ state: { purpose: "signup" } });

      // sessionStorage.setItem('email', JSON.stringify(formData.email));

      setError('');
    } else {
      setError(response.data.message);
    }
  } catch (err) {
    if (err.response && err.response.data) {
      if (err.response.data.message === 'User already exists') {
        setError('User already exists. Please use a different email.');
      } else if (err.response.data.message === 'Invalid input') {
        setError('Invalid input data. Please check your form.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } else {
      setError('An error occurred. Please check your network connection.');
    }
  } finally {
    setLoading(false);
  }
};

//CREATE PROFILE
export const handleSubmitCreateProfile = async (e,profileData,setError,BASE_URL,token,formRef,navigate) => {
  e.preventDefault();
  setError("");
  
  try {
    const response = await axios.put(
      `${BASE_URL}/api/users/create-profile`, 
      profileData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      gsap.to(formRef.current, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(formRef.current, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => navigate("/profile/user-profile"),
          });
        },
      });
    } else {
      setError(response.data.message);
    }
  } catch (err) {
    setError("Something went wrong. Please try again.");
    console.error(err);
  }
};

