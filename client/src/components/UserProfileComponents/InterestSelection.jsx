import React, { useState, useCallback, useRef, useEffect } from "react";
import '../../styles/UserProfile Styles/InterestSelection.css';
import { addInterest, debounce, fetchSuggestions, handleInterestInputChange, removeInterest } from "../../utils/helper";

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


  // Debounced suggestion fetch
  const handleFetchSuggestions = useCallback(
    (query) => fetchSuggestions(query, setSuggestions, setLoading, setError),
    []
  );

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

      <div className="interest-input-wrapper" ref={dropdownRef}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInterestInputChange(e, setInputValue, handleFetchSuggestions)}
          placeholder="Type to find professional skills/interests..."
          className="interest-input"
        />

        {inputValue && suggestions.length > 0 && (
          <ul className="interests-dropdown">
            {suggestions.slice(0, 10).map((suggestion, index) => (
              <li 
                key={index} 
                onClick={(e) => addInterest(e.target.textContent, profileData, setProfileData, setInputValue, setSuggestions,e)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="loading-text">Finding suggestions...</p>}
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="selected-interests">
        <h3>Selected Interests</h3>
        <div className="selected-interests-items">
          {profileData.interests.map(interest => (
            <span 
              key={interest} 
              className="selected-interest-tag"
            >
              {interest} <span className="deleted-interest-tag"  onClick={() => removeInterest(interest, setProfileData)}>✕</span> 
            </span>
          ))}
        </div>
      </div>

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