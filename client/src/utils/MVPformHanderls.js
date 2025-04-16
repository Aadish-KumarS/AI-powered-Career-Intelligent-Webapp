import gsap from "gsap";
import { jwtDecode } from 'jwt-decode';



// Handle text input change - with deep nesting support
export const handleInputChange = (e, section, subsection = null,setFormData,setShowSuggestions,fieldOptions,setAiSuggestions,suggestionRef) => {
  const { name, value } = e.target;
  
  setFormData(prev => {
    if (subsection) {
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [subsection]: {
            ...prev[section][subsection],
            [name]: value
          }
        }
      };
    }
    
    return {
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    };
  });
  
  // Mock AI suggestions based on input
  if (value.length > 2) {
    // In a real app, this would call your AI service
    mockAiSuggestions(section, name, value,fieldOptions,setAiSuggestions,setShowSuggestions,suggestionRef);
  } else {
    setShowSuggestions(false);
  }
};

// Mock AI suggestions (replace with actual API call in production)
const mockAiSuggestions = (section, field, value,fieldOptions,setAiSuggestions,setShowSuggestions,suggestionRef) => {
  // Different suggestions based on what field the user is typing in
  let suggestions = [];
  
  if (section === 'personalInfo' && field === 'currentOccupation') {
    suggestions = [
      'Software Developer',
      'UX Designer',
      'Product Manager',
      'Data Scientist',
      'Marketing Specialist'
    ].filter(item => item.toLowerCase().includes(value.toLowerCase()));
  } else if (section === 'careerInfo' && field === 'careerGoals') {
    suggestions = [
      'Become a Senior Developer',
      'Move into Management',
      'Start my own business',
      'Transition to a new field',
      'Develop leadership skills'
    ].filter(item => item.toLowerCase().includes(value.toLowerCase()));
  } else if (section === 'education' && field === 'fieldOfStudy') {
    suggestions = fieldOptions
      .filter(item => item.toLowerCase().includes(value.toLowerCase()));
  }
  
  if (suggestions.length > 0) {
    setAiSuggestions(suggestions);
    setShowSuggestions(true);
    
    // Animate suggestions appearing
    if (suggestionRef.current) {
      gsap.fromTo(
        suggestionRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  } else {
    setShowSuggestions(false);
  }
};

// Handle dropdown select change
export const handleSelectChange = (e, section,setFormData) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [name]: value
    }
  }));
};

// Handle checkbox/toggle changes
export const handleCheckboxChange = (e, section,setFormData) => {
  const { name, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [name]: checked
    }
  }));
};

// Handle multi-select options
export const handleMultiSelectChange = (section, field, item,setFormData) => {
  setFormData(prev => {
    const currentItems = prev[section][field];
    const itemExists = currentItems.includes(item);
    
    return {
      ...prev,
      [section]: {
        ...prev[section],
        [field]: itemExists
          ? currentItems.filter(i => i !== item)
          : [...currentItems, item]
      }
    };
  });
};

// Add a skill with proficiency level
export const handleAddSkill = (skillName, skillType, level,setFormData) => {
  const newSkill = { name: skillName, level: level };
  
  setFormData(prev => ({
    ...prev,
    skills: {
      ...prev.skills,
      selectedSkills: [...prev.skills.selectedSkills, newSkill],
      [skillType === 'technical' ? 'technicalSkills' : 'softSkills']: 
        [...prev.skills[skillType === 'technical' ? 'technicalSkills' : 'softSkills'], newSkill]
    }
  }));
};

// Remove a skill from the list
export const handleRemoveSkill = (skillName, skillType,setFormData) => {
  setFormData(prev => ({
    ...prev,
    skills: {
      ...prev.skills,
      selectedSkills: prev.skills.selectedSkills.filter(s => s.name !== skillName),
      [skillType === 'technical' ? 'technicalSkills' : 'softSkills']: 
        prev.skills[skillType === 'technical' ? 'technicalSkills' : 'softSkills'].filter(s => s.name !== skillName)
    }
  }));
};

// Add past role to experience
export const handleAddPastRole = (role,setFormData) => {
  if (!role.trim()) return;
  
  setFormData(prev => ({
    ...prev,
    experience: {
      ...prev.experience,
      pastRoles: [...prev.experience.pastRoles, role]
    }
  }));
};

// Toggle section expansion
export const toggleSection = (section,setExpandedSection,expandedSection) => {
  setExpandedSection(expandedSection === section ? null : section);
  
  // Animate the section expanding
  setTimeout(() => {
    const element = document.getElementById(`section-${section}`);
    if (element) {
      gsap.fromTo(
        element,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, 0);
};

// Navigate to previous step
export const handlePrevious = (currentStep,setCurrentStep) => {
  if (currentStep > 1) {
    setCurrentStep(prev => prev - 1);
  }
};


// Select a suggestion from the AI dropdown
export const selectSuggestion = (suggestion, section, field,setFormData,setShowSuggestions) => {
  setFormData(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: suggestion
    }
  }));
  
  setShowSuggestions(false);
};


export const getUserIdFromToken = () => {
  const token = sessionStorage.getItem('authToken');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded?.id || decoded?.userId; 
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};