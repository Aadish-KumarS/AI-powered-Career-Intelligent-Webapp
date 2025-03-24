import { useState } from "react";

const InterestSelection = ({ profileData, setProfileData, prevStep, handleSubmit }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    // Validate input using backend API
    const response = await fetchAISuggestions(value);
    if (response.error) {
      setError("Inappropriate input detected");
      return;
    }

    setError("");
    setSuggestions(response.suggestions);
  };

  const fetchAISuggestions = async (query) => {
    try {
      const response = await fetch("http://localhost:5000/get-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: query }),
      });

      const data = await response.json();
      return { suggestions: data.suggestions || [] };
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      return { suggestions: [] };
    }
  };

  const addInterest = (interest) => {
    if (!profileData.interests.includes(interest)) {
      setProfileData({ ...profileData, interests: [...profileData.interests, interest] });
    }
    setInputValue("");
    setSuggestions([]);
  };

  return (
    <div className="form-step">
      <h3>Your Interests</h3>
      <div className="interests-container">
        <label>Type and select your interests</label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type an interest..."
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => addInterest(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="error-text">{error}</p>}
      </div>
      <div className="buttons-container">
        <button type="button" className="create-profile-back-btn" onClick={prevStep}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button type="submit" className="create-btn" onClick={handleSubmit}>
          Create Profile
        </button>
      </div>
    </div>
  );
};

export default InterestSelection;