import React, { useState, useCallback, useRef, useEffect } from "react";
import '../../styles/UserProfile Styles/InterestSelection.css';

const InterestSelection = ({ 
  profileData, 
  setProfileData, 
  prevStep, 
  handleSubmit 
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);


  // Wikipedia API for skill suggestions
  const fetchSuggestions = async (query) => {
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
      setSuggestions(data[1]); // Extract search results
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Could not fetch suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  console.log(profileData);
  

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
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

  // Debounced suggestion fetch
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedFetchSuggestions(value);
  };

  // Add interest to profile
  const addInterest = (interest) => {
    if (!profileData?.interests) {
      setProfileData(prev => ({
        ...prev,
        interests: [interest]
      }));
    } else if (!profileData.interests.includes(interest)) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
    setInputValue("");
    setSuggestions([]);
  };
  

  // Remove interest from profile
  const removeInterest = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(item => item !== interest)
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="form-step">
      <h3>Professional Interests</h3>
      
      {/* Selected Interests */}
      <div className="selected-interests">
        {profileData.interests.map(interest => (
          <span 
            key={interest} 
            className="selected-interest-tag"
            onClick={() => removeInterest(interest)}
          >
            {interest} ✕
          </span>
        ))}
      </div>

      {/* Interest Input */}
      <div className="interest-input-wrapper" ref={dropdownRef}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type to find professional skills/interests..."
          className="interest-input"
        />

        {/* Suggestions Dropdown */}
        {inputValue && suggestions.length > 0 && (
          <ul className="interests-dropdown">
            {suggestions.slice(0, 10).map((suggestion, index) => (
              <li 
                key={index} 
                onClick={() => addInterest(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        {/* Loading and Error States */}
        {loading && <p className="loading-text">Finding suggestions...</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      {/* Navigation Buttons */}
      <div className="buttons-container">
        <button 
          type="button" 
          className="create-profile-back-btn" 
          onClick={prevStep}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button 
          type="submit" 
          className="create-btn" 
          onClick={handleSubmit}
        >
          Create Profile
        </button>
      </div>
    </div>
  );
};

export default InterestSelection;