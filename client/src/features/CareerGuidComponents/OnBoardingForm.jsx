import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import '../../styles/CareerGuid Styles/OnBoarding.css';
import { handleAddPastRole, handleAddSkill, handleInputChange, handleMultiSelectChange, handlePrevious, handleRemoveSkill, handleSelectChange, selectSuggestion, toggleSection } from '../../utils/MVPformHanderls.js';
import Navbar from '../../components/LandingPageComponents/Navbar.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import { getSessionProfile, setSessionProfile } from '../../utils/profileSession';

const FORM_STEPS = [
  { name: 'Your Profile', sections: ['personalInfo', 'education'] },
  { name: 'Skills & Expertise', sections: ['skills'] },
  { name: 'Career Goals', sections: ['careerInfo', 'preferences'] },
  { name: 'Experience & Insights', sections: ['experience', 'insights'] },
];

const OnboardingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    personalInfo: {
      currentOccupation: '',
    },
    education: {
      highestLevel: '',
      fieldOfStudy: '',
      institution: '',
      graduationYear: '',
    },
    skills: {
      selectedSkills: [], 
      technicalSkills: [],
      softSkills: [],
    },
    careerInfo: {
      careerStage: '',
      careerGoals: [],
      desiredIndustries: [],
      desiredRoles: [],
    },
    preferences: {
      personalityType: '',
      workEnvironment: '',
      workStyle: [],
      notifications: false,
      darkMode: false,
    },
    experience: {
      currentRole: '',
      yearsOfExperience: '',
      pastRoles: [],
    },
    insights: {
      careerMotivation: '',
      careerChallenges: '',
      fiveYearGoal: '',
    }
  });
  
  const [expandedSection, setExpandedSection] = useState('personalInfo');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submissionError, setSubmissionError] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillType, setCustomSkillType] = useState('technical');
  const [customSkillLevel, setCustomSkillLevel] = useState('Intermediate');
  
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isRegenerationFlow = Boolean(location.state?.regenerate);
  
  const formRef = useRef(null);
  const nextBtnRef = useRef(null);
  const progressRef = useRef(null);
  const suggestionRef = useRef(null);
  
  const educationLevels = ['High School', 'Associate Degree', 'Bachelor\'s', 'Master\'s', 'PhD', 'Other'];
  const fieldOptions = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine', 'Law', 'Education', 'Other'];
  const careerStages = ['Student', 'Entry Level', 'Early Career', 'Mid Career', 'Senior Professional', 'Executive'];
  const workEnvironments = ['Remote', 'Hybrid', 'In-office', 'Flexible'];
  const workStyles = ['Independent', 'Collaborative', 'Leadership', 'Creative', 'Analytical', 'Detail-oriented'];
  
  const [skillOptions] = useState({
    technical: ['JavaScript', 'React', 'Python', 'UI/UX Design', 'Data Analysis', 'Project Management', 'DevOps'],
    soft: ['Communication', 'Leadership', 'Problem Solving', 'Time Management', 'Teamwork', 'Adaptability']
  });
  
  const [industryOptions] = useState([
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Media & Entertainment'
  ]);
  
  const [roleOptions] = useState([
    'Software Engineer', 'UX Designer', 'Product Manager', 'Data Scientist', 'Marketing Specialist', 'Business Analyst', 'Project Manager'
  ]);

  const totalSteps = FORM_STEPS.length;

  const validateCurrentStep = () => {
    const errors = {};
    // On the final screen re-check every required field. Users may have gone
    // back and edited an earlier step after it was initially validated.
    const validateEverything = currentStep === totalSteps;
    if (currentStep === 1 || validateEverything) {
      if (!formData.name.trim()) errors.name = 'Enter your full name.';
      if (!formData.education.highestLevel) errors['education.highestLevel'] = 'Select your education level.';
      if (!formData.education.fieldOfStudy.trim()) errors['education.fieldOfStudy'] = 'Enter your field of study.';
    }
    if ((currentStep === 2 || validateEverything) && formData.skills.selectedSkills.length === 0) {
      errors.skills = 'Add at least one technical or soft skill.';
    }
    if (currentStep === 3 || validateEverything) {
      if (!formData.careerInfo.careerStage) errors['careerInfo.careerStage'] = 'Select your career stage.';
      if (formData.careerInfo.desiredRoles.length === 0) errors['careerInfo.desiredRoles'] = 'Select at least one desired role.';
    }
    return errors;
  };

  const firstInvalidStep = (errors) => {
    if (errors.name || errors['education.highestLevel'] || errors['education.fieldOfStudy']) return 1;
    if (errors.skills) return 2;
    if (errors['careerInfo.careerStage'] || errors['careerInfo.desiredRoles']) return 3;
    return currentStep;
  };

  const errorFor = (key) => fieldErrors[key];

  useEffect(() => {
    setFieldErrors((previous) => {
      const next = { ...previous };
      if (formData.name.trim()) delete next.name;
      if (formData.education.highestLevel) delete next['education.highestLevel'];
      if (formData.education.fieldOfStudy.trim()) delete next['education.fieldOfStudy'];
      if (formData.skills.selectedSkills.length) delete next.skills;
      if (formData.careerInfo.careerStage) delete next['careerInfo.careerStage'];
      if (formData.careerInfo.desiredRoles.length) delete next['careerInfo.desiredRoles'];
      return Object.keys(next).length === Object.keys(previous).length ? previous : next;
    });
  }, [
    formData.name,
    formData.education.highestLevel,
    formData.education.fieldOfStudy,
    formData.skills.selectedSkills.length,
    formData.careerInfo.careerStage,
    formData.careerInfo.desiredRoles.length,
  ]);

  const addCustomSkill = () => {
    const skillName = customSkillName.trim();
    if (!skillName) return;

    handleAddSkill(skillName, customSkillType, customSkillLevel, setFormData);
    setCustomSkillName('');
    setFieldErrors(prev => ({ ...prev, skills: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError('');
    const errors = validateCurrentStep();
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      const invalidStep = firstInvalidStep(errors);
      if (invalidStep !== currentStep) setCurrentStep(invalidStep);
      if (errors.name) setExpandedSection('personalInfo');
      else if (errors['education.highestLevel'] || errors['education.fieldOfStudy']) setExpandedSection('education');
      else if (errors.skills) setExpandedSection('skills');
      else setExpandedSection('careerInfo');
      return;
    }

    const isLastStep = currentStep === totalSteps ;
  
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
      const nextSection = FORM_STEPS[currentStep + 1]?.sections?.[0];
      if (nextSection) setExpandedSection(nextSection);
  
    } else {
      try {
        setIsSubmitting(true);
  
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          setSubmissionError('Your session has expired. Please sign in again.');
          return;
        }
  
        
        const response = await fetch(`${API_BASE_URL}/api/users/onboarding`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            onboardingProgress: 100,
            isFirstTime: false,
          }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          if (body.errors) {
            setFieldErrors(body.errors);
            const invalidStep = firstInvalidStep(body.errors);
            if (invalidStep !== currentStep) setCurrentStep(invalidStep);
          }
          throw new Error(body.message || 'Unable to save onboarding data');
        }
        const savedPayload = await response.json().catch(() => ({}));
        setSessionProfile(savedPayload.user || {
          ...formData,
          onboardingProgress: 100,
          isFirstTime: false,
        });
        navigate('/services/career-guid/career-recommendation', {
          replace: true,
          // Only a deliberate regeneration journey should trigger a new
          // request after the profile is saved. A normal onboarding save
          // returns to the persisted result and never generates on reload.
          state: isRegenerationFlow ? { generate: true } : null,
        });
  
        if (formRef.current) {
          gsap.to(formRef.current, {
            scale: 1.05,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
            onComplete: () => {
            }
          });
        }
  
      } catch (error) {
        console.error('Error updating career guidance data:', error);
        setSubmissionError(error.message || 'Unable to save your onboarding profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  


  // GSAP animations for form elements when step changes
  useEffect(() => {
    // Animate the whole form
    gsap.fromTo(
      formRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
    
    // Animate progress bar
    gsap.to(progressRef.current, {
      width: `${(currentStep / totalSteps) * 100}%`,
      duration: 0.8,
      ease: "power2.inOut"
    });
    
    // Auto-expand the first section of the current step
    if (FORM_STEPS[currentStep - 1] && FORM_STEPS[currentStep - 1].sections.length > 0) {
      setExpandedSection(FORM_STEPS[currentStep - 1].sections[0]);
    }
  }, [currentStep, totalSteps]);

  // Returning users can safely resume and amend an unfinished profile. Merge
  // each persisted section so older accounts with partial profile data remain valid.
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (!token) return undefined;

    const cachedProfile = getSessionProfile();
    if (cachedProfile) {
      setFormData(prev => ({
        ...prev,
        ...cachedProfile,
        personalInfo: { ...prev.personalInfo, ...(cachedProfile.personalInfo || {}) },
        education: { ...prev.education, ...(cachedProfile.education || {}) },
        skills: { ...prev.skills, ...(cachedProfile.skills || {}) },
        careerInfo: { ...prev.careerInfo, ...(cachedProfile.careerInfo || {}) },
        preferences: { ...prev.preferences, ...(cachedProfile.preferences || {}) },
        experience: { ...prev.experience, ...(cachedProfile.experience || {}) },
        insights: { ...prev.insights, ...(cachedProfile.insights || {}) },
      }));
      return undefined;
    }

    let cancelled = false;
    const loadExistingProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const profile = await response.json();
        if (cancelled) return;
        setSessionProfile(profile);

        setFormData(prev => ({
          ...prev,
          name: profile.name ?? prev.name,
          personalInfo: { ...prev.personalInfo, ...(profile.personalInfo || {}) },
          education: { ...prev.education, ...(profile.education || {}) },
          skills: {
            ...prev.skills,
            ...(profile.skills || {}),
            selectedSkills: Array.isArray(profile.skills?.selectedSkills) ? profile.skills.selectedSkills : prev.skills.selectedSkills,
            technicalSkills: Array.isArray(profile.skills?.technicalSkills) ? profile.skills.technicalSkills : prev.skills.technicalSkills,
            softSkills: Array.isArray(profile.skills?.softSkills) ? profile.skills.softSkills : prev.skills.softSkills,
          },
          careerInfo: {
            ...prev.careerInfo,
            ...(profile.careerInfo || {}),
            careerGoals: Array.isArray(profile.careerInfo?.careerGoals) ? profile.careerInfo.careerGoals : prev.careerInfo.careerGoals,
            desiredIndustries: Array.isArray(profile.careerInfo?.desiredIndustries) ? profile.careerInfo.desiredIndustries : prev.careerInfo.desiredIndustries,
            desiredRoles: Array.isArray(profile.careerInfo?.desiredRoles) ? profile.careerInfo.desiredRoles : prev.careerInfo.desiredRoles,
          },
          preferences: {
            ...prev.preferences,
            ...(profile.preferences || {}),
            workStyle: Array.isArray(profile.preferences?.workStyle) ? profile.preferences.workStyle : prev.preferences.workStyle,
          },
          experience: {
            ...prev.experience,
            ...(profile.experience || {}),
            pastRoles: Array.isArray(profile.experience?.pastRoles) ? profile.experience.pastRoles : prev.experience.pastRoles,
          },
          insights: { ...prev.insights, ...(profile.insights || {}) },
        }));
      } catch (error) {
        // A profile load failure should never block the user from completing onboarding.
        console.warn('Unable to load existing onboarding data:', error);
      }
    };

    loadExistingProfile();
    return () => { cancelled = true; };
  }, []);

  // Button hover animation
  useEffect(() => {
    const button = nextBtnRef.current;
    
    if (!button) return;
    
    const hoverAnimation = gsap.timeline({ paused: true })
      .to(button, {
        scale: 1.05,
        backgroundColor: '#30443e',
        duration: 0.3,
        ease: "power2.out"
      });
    
    const handleMouseEnter = () => hoverAnimation.play();
    const handleMouseLeave = () => hoverAnimation.reverse();
    
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Calculate completion from explicit profile fields, not object keys.
  const calculateCompletion = () => {
    const fields = [
      formData.name, formData.personalInfo.currentOccupation,
      formData.education.highestLevel, formData.education.fieldOfStudy,
      formData.education.institution, formData.education.graduationYear,
      formData.skills.selectedSkills.length, formData.careerInfo.careerStage,
      formData.careerInfo.careerGoals.length, formData.careerInfo.desiredIndustries.length,
      formData.careerInfo.desiredRoles.length, formData.preferences.workEnvironment,
      formData.preferences.workStyle.length, formData.experience.currentRole,
      formData.experience.yearsOfExperience, formData.insights.fiveYearGoal
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  // Get current step title
  const getCurrentStepTitle = () => {
    return FORM_STEPS[currentStep - 1]?.name || "";
  };

  // Render input field with AI suggestions
  const renderInputWithSuggestions = (section, field, label, placeholder, required = false) => {
    return (
      <div className="input-group">
        <label htmlFor={field}>
          {label} {required && <span className="required">*</span>}
        </label>
        <div className="input-with-suggestions">
          <input
            type="text"
            id={field}
            name={field}
            value={formData[section][field]}
            onChange={(e) => handleInputChange(e, section, null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
            placeholder={placeholder}
            required={required}
            className="smart-input"
          />
          
          {showSuggestions && field === 'currentOccupation' && (
            <div ref={suggestionRef} className="ai-suggestions">
              {aiSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="suggestion-item"
                  onClick={() => selectSuggestion(suggestion, section, field,setFormData,setShowSuggestions)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render a select dropdown
  const renderSelect = (section, field, label, options, required = false) => {
    const fieldKey = `${section}.${field}`;
    return (
      <div className="input-group">
        <label htmlFor={field}>
          {label} {required && <span className="required">*</span>}
        </label>
        <select
          id={field}
          name={field}
          value={formData[section][field]}
          onChange={(e) => handleSelectChange(e, section,setFormData)}
          required={required}
          aria-invalid={Boolean(errorFor(fieldKey))}
          className="select-input"
        >
          <option value="">Select {label}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
        {errorFor(fieldKey) && <p className="field-error" role="alert">{errorFor(fieldKey)}</p>}
      </div>
    );
  };

  // Render Personal Information section
  const renderPersonalInfo = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'personalInfo' ? 'active' : ''}`} 
          onClick={() => toggleSection('personalInfo',setExpandedSection,expandedSection)}
        >
          <h3>Personal Information</h3>
          <span className="toggle-icon">{expandedSection === 'personalInfo' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'personalInfo' && (
          <div id="section-personalInfo" className="section-content">
            <div className="input-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, 'name', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="Your full name"
                required
                aria-invalid={Boolean(errorFor('name'))}
                className="focus-effect"
              />
              {errorFor('name') && <p className="field-error" role="alert">{errorFor('name')}</p>}
            </div>
            
            {renderInputWithSuggestions('personalInfo', 'currentOccupation', 'Current Occupation (Optional)', 'e.g. Software Engineer')}
          </div>
        )}
      </div>
    );
  };

  // Render Education section
  const renderEducation = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'education' ? 'active' : ''}`} 
          onClick={() => toggleSection('education',setExpandedSection,expandedSection)}
        >
          <h3>Background & Education</h3>
          <span className="toggle-icon">{expandedSection === 'education' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'education' && (
          <div id="section-education" className="section-content">
            {renderSelect('education', 'highestLevel', 'Highest Level of Education', educationLevels, true)}
            
            <div className="input-group">
              <label htmlFor="fieldOfStudy">Field of Study <span className="required">*</span></label>
              <input
                type="text"
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.education.fieldOfStudy}
                onChange={(e) => handleInputChange(e, 'education', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="e.g. Computer Science"
                required
                aria-invalid={Boolean(errorFor('education.fieldOfStudy'))}
                className="smart-input"
              />
              {errorFor('education.fieldOfStudy') && <p className="field-error" role="alert">{errorFor('education.fieldOfStudy')}</p>}
              
              {showSuggestions && (
                <div ref={suggestionRef} className="ai-suggestions">
                  {aiSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="suggestion-item"
                      onClick={() => selectSuggestion(suggestion, 'education', 'fieldOfStudy',setFormData,setShowSuggestions)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="input-group">
              <label htmlFor="institution">University/College Name (Optional)</label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.education.institution}
                onChange={(e) => handleInputChange(e, 'education', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="Institution name (optional)"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="graduationYear">Year of Graduation (Optional)</label>
              <input
                type="number"
                id="graduationYear"
                name="graduationYear"
                min="1950"
                max="2030"
                value={formData.education.graduationYear}
                onChange={(e) => handleInputChange(e, 'education', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="e.g. 2022"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Skills section
  const renderSkills = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'skills' ? 'active' : ''}`} 
          onClick={() => toggleSection('skills',setExpandedSection,expandedSection)}
        >
          <h3>Skills & Expertise</h3>
          <span className="toggle-icon">{expandedSection === 'skills' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'skills' && (
          <div id="section-skills" className="section-content">
            {errorFor('skills') && <p className="field-error" role="alert">{errorFor('skills')}</p>}
            <div className="skills-container">
              <div className="skills-column">
                <h4>Technical Skills</h4>
                <div className="skill-selector">
                  <div className="skill-options">
                    {skillOptions.technical.map((skill, index) => (
                      <div 
                        key={index} 
                        className="skill-option-card"
                        onClick={() => handleAddSkill(skill, 'technical', 'Intermediate',setFormData)}
                      >
                        <span className="skill-name">{skill}</span>
                        <span className="add-skill">+</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="selected-skills">
                  {formData.skills.technicalSkills.map((skill, index) => (
                    <div key={index} className="selected-skill">
                      <span>{skill.name}</span>
                      <div className="skill-level-select">
                        <select 
                          value={skill.level} 
                          onChange={(e) => {
                            const newSkills = [...formData.skills.technicalSkills];
                            newSkills[index].level = e.target.value;
                            setFormData({
                              ...formData,
                              skills: {
                                ...formData.skills,
                                technicalSkills: newSkills,
                                selectedSkills: formData.skills.selectedSkills.map(s => 
                                  s.name === skill.name ? {...s, level: e.target.value} : s
                                )
                              }
                            });
                          }}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <button 
                          type="button"
                          className="remove-skill" 
                          onClick={() => handleRemoveSkill(skill.name, 'technical',setFormData)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="skills-column">
                <h4>Soft Skills</h4>
                <div className="skill-selector">
                  <div className="skill-options">
                    {skillOptions.soft.map((skill, index) => (
                      <div 
                        key={index} 
                        className="skill-option-card"
                        onClick={() => handleAddSkill(skill, 'soft', 'Intermediate',setFormData)}
                      >
                        <span className="skill-name">{skill}</span>
                        <span className="add-skill">+</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="selected-skills">
                  {formData.skills.softSkills.map((skill, index) => (
                    <div key={index} className="selected-skill">
                      <span>{skill.name}</span>
                      <div className="skill-level-select">
                        <select 
                          value={skill.level} 
                          onChange={(e) => {
                            const newSkills = [...formData.skills.softSkills];
                            newSkills[index].level = e.target.value;
                            setFormData({
                              ...formData,
                              skills: {
                                ...formData.skills,
                                softSkills: newSkills,
                                selectedSkills: formData.skills.selectedSkills.map(s => 
                                  s.name === skill.name ? {...s, level: e.target.value} : s
                                )
                              }
                            });
                          }}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                        <button 
                          type="button"
                          className="remove-skill" 
                          onClick={() => handleRemoveSkill(skill.name, 'soft',setFormData)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Custom skill input */}
            <div className="custom-skill-input">
              <h4>Add Custom Skill</h4>
              <div className="custom-skill-form">
                <input
                  type="text"
                  placeholder="Enter skill name"
                  className="custom-skill-field"
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                />
                <select value={customSkillType} onChange={(e) => setCustomSkillType(e.target.value)}>
                  <option value="technical">Technical</option>
                  <option value="soft">Soft</option>
                </select>
                <select value={customSkillLevel} onChange={(e) => setCustomSkillLevel(e.target.value)}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <button 
                  type='button'
                  onClick={addCustomSkill}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Career section
  const renderCareerInfo = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'careerInfo' ? 'active' : ''}`} 
          onClick={() => toggleSection('careerInfo',setExpandedSection,expandedSection)}
        >
          <h3>Career Interests & Goals</h3>
          <span className="toggle-icon">{expandedSection === 'careerInfo' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'careerInfo' && (
          <div id="section-careerInfo" className="section-content">
            {renderSelect('careerInfo', 'careerStage', 'Career Stage', careerStages, true)}
            
            <div className="input-group">
              <label>Career Goals (Optional)</label>
              <div className="tags-input-container">
                <input
                  type="text"
                  id="career-goal-input"
                  placeholder="Type a goal and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !formData.careerInfo.careerGoals.includes(value)) {
                        handleMultiSelectChange('careerInfo', 'careerGoals', value,setFormData);
                        e.target.value = '';
                      }
                    }
                  }}
                />
                
                <div className="tags-container">
                  {formData.careerInfo.careerGoals.map((goal, index) => (
                    <div key={index} className="tag">
                      {goal}
                      <span 
                        className="remove-tag" 
                        onClick={() => handleMultiSelectChange('careerInfo', 'careerGoals', goal,setFormData)}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="selection-group">
              <label>Desired Industries (Optional)</label>
              <div className="selection-grid">
                {industryOptions.map((industry, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleMultiSelectChange('careerInfo', 'desiredIndustries', industry,setFormData)}
                    className={`selection-item ${formData.careerInfo.desiredIndustries.includes(industry) ? 'selected' : ''}`}
                  >
                    {industry}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="selection-group">
              <label>Desired Roles <span className="required">*</span></label>
              {errorFor('careerInfo.desiredRoles') && <p className="field-error" role="alert">{errorFor('careerInfo.desiredRoles')}</p>}
              <div className="selection-grid">
                {roleOptions.map((role, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleMultiSelectChange('careerInfo', 'desiredRoles', role,setFormData)}
                    className={`selection-item ${formData.careerInfo.desiredRoles.includes(role) ? 'selected' : ''}`}
                  >
                    {role}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Preferences section
  const renderPreferences = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'preferences' ? 'active' : ''}`} 
          onClick={() => toggleSection('preferences',setExpandedSection,expandedSection)}
        >
          <h3>Personality & Preferences</h3>
          <span className="toggle-icon">{expandedSection === 'preferences' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'preferences' && (
          <div id="section-preferences" className="section-content">
            <div className="personality-test">
              <h4>Quick Personality Assessment</h4>
              <p className="assessment-intro">
                Answer these brief questions to help us understand your work preferences.
                For a more detailed assessment, you can take a full personality test later.
              </p>
              
              <div className="personality-question">
                <p>I prefer working with:</p>
                <div className="slider-container">
                  <span>Data & Facts</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={formData.preferences.analyticalCreative || 3} 
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          analyticalCreative: e.target.value
                        }
                      }));
                    }}
                  />
                  <span>Creative Ideas</span>
                </div>
              </div>
              
              <div className="personality-question">
                <p>I prefer making decisions:</p>
                <div className="slider-container">
                  <span>Quickly</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={formData.preferences.quickDeliberate || 3} 
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          quickDeliberate: e.target.value
                        }
                      }));
                    }}
                  />
                  <span>After deliberation</span>
                </div>
              </div>
            </div>
            
            {renderSelect('preferences', 'workEnvironment', 'Preferred Work Environment (Optional)', workEnvironments)}
            
            <div className="selection-group">
              <label>Work Style (Optional)</label>
              <div className="selection-grid">
                {workStyles.map((style, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleMultiSelectChange('preferences', 'workStyle', style,setFormData)}
                    className={`selection-item ${formData.preferences.workStyle.includes(style) ? 'selected' : ''}`}
                  >
                    {style}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Experience section
  const renderExperience = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'experience' ? 'active' : ''}`} 
          onClick={() => toggleSection('experience',setExpandedSection,expandedSection)}
        >
          <h3>Professional Experience</h3>
          <span className="toggle-icon">{expandedSection === 'experience' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'experience' && (
          <div id="section-experience" className="section-content">
            <div className="input-group">
              <label htmlFor="currentRole">Current Role (Optional)</label>
              <input
                type="text"
                id="currentRole"
                name="currentRole"
                value={formData.experience.currentRole}
                onChange={(e) => handleInputChange(e, 'experience', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="e.g. Senior Developer at XYZ Corp"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="yearsOfExperience">Years of Experience (Optional)</label>
              <input
                type="number"
                id="yearsOfExperience"
                name="yearsOfExperience"
                min="0"
                max="50"
                value={formData.experience.yearsOfExperience}
                onChange={(e) => handleInputChange(e, 'experience', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="Years in your field"
              />
            </div>
            
            <div className="input-group">
              <label>Past Roles (Optional)</label>
              <div className="past-roles-input">
                <input
                  type="text"
                  id="past-role-input"
                  placeholder="Add a past role and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPastRole(e.target.value,setFormData);
                      e.target.value = '';
                    }
                  }}
                />
                
                <div className="past-roles-list">
                  {formData.experience.pastRoles.map((role, index) => (
                    <div key={index} className="past-role-item">
                      <span>{role}</span>
                      <button 
                        type="button"
                        className="remove-role" 
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            experience: {
                              ...prev.experience,
                              pastRoles: prev.experience.pastRoles.filter((_, i) => i !== index)
                            }
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Insights section
  const renderInsights = () => {
    return (
      <div className="form-section">
        <div 
          className={`section-header ${expandedSection === 'insights' ? 'active' : ''}`} 
          onClick={() => toggleSection('insights',setExpandedSection,expandedSection)}
        >
          <h3>Additional Insights</h3>
          <span className="toggle-icon">{expandedSection === 'insights' ? '−' : '+'}</span>
        </div>
        
        {expandedSection === 'insights' && (
          <div id="section-insights" className="section-content">
            <div className="input-group">
              <label htmlFor="careerMotivation">What motivates you in your career? (Optional)</label>
              <textarea
                id="careerMotivation"
                name="careerMotivation"
                value={formData.insights.careerMotivation}
                onChange={(e) => handleInputChange(e, 'insights', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="Share what drives you professionally..."
                rows="3"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="careerChallenges">What challenges are you facing in your career? (Optional)</label>
              <textarea
                id="careerChallenges"
                name="careerChallenges"
                value={formData.insights.careerChallenges}
                onChange={(e) => handleInputChange(e, 'insights', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="Share your current obstacles or challenges..."
                rows="3"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="fiveYearGoal">Where do you see yourself in 5 years? (Optional)</label>
              <textarea
                id="fiveYearGoal"
                name="fiveYearGoal"
                value={formData.insights.fiveYearGoal}
                onChange={(e) => handleInputChange(e, 'insights', null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef)}
                placeholder="Describe your long-term career vision..."
                rows="3"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render form sections based on current step
  const renderFormSections = () => {
    const currentSections = FORM_STEPS[currentStep - 1]?.sections || [];
    
    return (
      <>
        {currentSections.includes('personalInfo') && renderPersonalInfo()}
        {currentSections.includes('education') && renderEducation()}
        {currentSections.includes('skills') && renderSkills()}
        {currentSections.includes('careerInfo') && renderCareerInfo()}
        {currentSections.includes('preferences') && renderPreferences()}
        {currentSections.includes('experience') && renderExperience()}
        {currentSections.includes('insights') && renderInsights()}
      </>
    );
  };

  return (
    <div className="onboarding-container">
      <Navbar variant="app" />
      <form ref={formRef} onSubmit={handleSubmit} className="onboarding-form" noValidate>
        <div className="form-header">
          <h2>Career Guidance Profile</h2>
          <div className="progress-container">
            <div className="progress-steps">
              {FORM_STEPS.map((step, index) => (
                <div 
                  key={index} 
                  className={`step ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
                  onClick={() => {
                    if (currentStep > index + 1) {
                      setCurrentStep(index + 1);
                    }
                  }}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-title">{step.name}</div>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div ref={progressRef} className="progress-fill"></div>
            </div>
          </div>
          
          <div className="completion-indicator">
            <div className="completion-circle" style={{
              background: `conic-gradient(#b35a3c ${calculateCompletion()}%, #e8ece5 0)`
            }}>
              <div className="completion-inner">
                <span className="completion-percent">{calculateCompletion()}%</span>
                <span className="completion-text">Complete</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="step-content">
          <h3 className="step-title">{getCurrentStepTitle()}</h3>
          <p className="required-fields-note"><span className="required">*</span> Required for personalized career guidance. All other fields are optional.</p>
          {submissionError && <p className="form-error" role="alert">{submissionError}</p>}
          <div className="sections-container">
            {renderFormSections()}
          </div>
        </div>
        
        <div className="form-controls">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="prev-button" 
              onClick={() => handlePrevious(currentStep,setCurrentStep)}
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
          
          <button 
            ref={nextBtnRef}
            type="submit"
            className="next-button"
            disabled={isSubmitting}
          >
            {currentStep < totalSteps ? 'Continue' : 'Submit'}
            {isSubmitting && <span className="spinner"></span>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
