import InterestSelection from "./InterestSelection";
import MapComponent from './MapComponent'

const FormStep = ({ step, profileData, setProfileData, handleFileChange, nextStep, prevStep, handleSubmit, error, formRef }) => {

  switch (step) {
    case 1:
      return (
        <div className="form-step" ref={formRef}>
          <h3>Basic Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, [e.target.name]: e.target.value })}
            required
          />
          <div className="file-upload">
            <label>Profile Picture (Optional)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="education-container">
            <label>Education</label>
            <input
              type="text"
              name="education"
              placeholder="Your Education Background"
              value={profileData.education.fieldOfStudy}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  education: {
                    ...prev.education,
                    fieldOfStudy: e.target.value,
                  },
                }))
              }
              required={true}
            />
          </div>
          {profileData.profilePicture && (
            <img src={profileData.profilePicture} alt="Profile Preview" className="profile-preview" />
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="button" className="next-btn" onClick={nextStep}>
            Next <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      );

    case 2:
      return (
        <div className="form-step" ref={formRef}>
          <h3>Location </h3>
          <div className="location-container">
            <MapComponent userData={profileData} setUserData={setProfileData} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="buttons-container">
            <button type="button" className="create-profile-back-btn" onClick={prevStep}>
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <button type="button" className="next-btn" onClick={nextStep}>
              Next <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      );

    case 3:
      return (
        <InterestSelection
          profileData={profileData}
          setProfileData={setProfileData}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      );

    default:
      return null;
  }
};

export default FormStep;