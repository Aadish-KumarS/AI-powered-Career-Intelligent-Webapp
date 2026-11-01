import axios from "axios";
import gsap from "gsap";
import { getIsFirstTime } from "./helper";
import { API_BASE_URL } from "../config/api";
import { toast } from 'react-toastify';
import { setSessionProfile } from './profileSession';
import { clearSessionAiResults } from './profileSession';

axios.defaults.withCredentials = true;

//EMAIL VERIFICATION
export const handleSubmitEmailVerification = async (e, verificationCode, setError, setLoading, navigate, location) => {
  e.preventDefault();
  setError('');

  if (verificationCode.length !== 6) {
    setError('Invalid verification code');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(`${API_BASE_URL}/otp/verify-otp`, {
      otp: verificationCode,
    });

    const purpose = location?.state?.purpose;
    if (response.data.success) {
      if (purpose === 'forgot-password') {
        toast.success('Email verified successfully. Choose a new password.');
        navigate('/reset-password')
      } else {
        toast.success('Email verified successfully. You can now sign in.');
        navigate('/login');
      }
    } else {
      setError(response.data.message || 'Verification failed');
    }
  } catch (err) {
    console.error('Error during OTP verification:', err.response ? err.response.data : err);
    setError('An error occurred. Please try again later.');
  } finally {
    setLoading(false);
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
    const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
      email : email
    });

    const data = response.data;
    if (response.status === 200) {
      setSuccess('A verification code has been sent to your email.');
      setTimeout(() => {
        navigate('/verify-email', { state: { purpose: 'forgot-password' } });
      }, 1000);
    } else {
      setError(data.message || 'Something went wrong.');
    }
  } catch (error) {
    setError(error.response?.data?.message || 'Server error. Please try again later.');
  } finally {
    setLoading(false);
  }
};

//LOGIN
export const handleSubmitLogin = async ( e, setLoading, setError, formData, navigate, setVerificationMessage) => {
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
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      formData,
      { withCredentials: true }
    );

    const { token } = response.data;

    if (token) {
      // Do not reuse a profile from a previous account in this browser tab.
      sessionStorage.removeItem('userData');
      clearSessionAiResults();
      sessionStorage.setItem("authToken", token);
      window.dispatchEvent(new Event('auth-updated'));

      const isFirstTime = await getIsFirstTime(token, API_BASE_URL);
      
      if (isFirstTime) {
        navigate("/profile/create-user-profile");
      } else {
        navigate("/profile/user-profile");
      }
    }
  } catch (err) {
    console.error("Login error:", err);
    console.error("Login status:", err.response?.status);
    console.error("Login response:", err.response?.data);
    console.error("Login error:", err.message);

    if (err.response?.data?.message) {
      const errorMessage = err.response.data.message;

      if (errorMessage === "Please verify your email before logging in.") {
        setVerificationMessage(errorMessage);
      } else {
        setError(errorMessage);
      }
    } else {
      setError("Something went wrong. Please try again."); }
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
    const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
      password: formData.password
    });

    const data = response.data;

    if (response.status === 200) {
      setSuccess('Password reset successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data.message || 'Something went wrong.');
    }
  } catch (error) {
    setError(error.response?.data?.message || 'Server error. Please try again later.');
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
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
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
      setSessionProfile(response.data?.user || profileData);
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

//LOGOUT 
export const logoutUser = async (navigate) => {
  try {
    await axios.get(`${API_BASE_URL}/api/auth/logout`, { withCredentials: true });
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userData');
    clearSessionAiResults();
    window.dispatchEvent(new Event('auth-updated'));
    navigate("/signup", { replace: true });
  }
};
