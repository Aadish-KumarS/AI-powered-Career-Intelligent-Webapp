import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import '../../styles/LearningPath styles/LearningPath.css';
import Navbar from '../../components/LandingPageComponents/Navbar';

const LearningPath = ({ skillData, onSave }) => {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const pathRef = useRef(null);
  const milestonesRef = useRef(null);
  const progressRef = useRef(null);
  const resourcesRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    // If skillData is provided, use it
    if (skillData) {
      setData(skillData);
    }
  }, [skillData]);

  // Handle form submission when user starts with empty state
  const handleSubmit = (e) => {
    e.preventDefault();
    const newSkill = {
      skill_name: e.target.skill_name.value,
      current_proficiency: e.target.current_proficiency.value || "Beginner",
      overall_progress: 0.0,
      start_date: new Date().toISOString(),
      target_completion_date: e.target.target_completion_date.value,
      resources_progress: [],
      completed_milestones: []
    };
    localStorage.setItem('newSkill', newSkill);
    
    setData(newSkill);
    if (onSave) onSave(newSkill);
  };

  const handleUpdateSkill = (e) => {
    e.preventDefault();
    const updatedSkill = {
      ...data,
      skill_name: e.target.skill_name.value,
      current_proficiency: e.target.current_proficiency.value,
      target_completion_date: e.target.target_completion_date.value,
    };
    setData(updatedSkill);
    setIsEditing(false);
    if (onSave) onSave(updatedSkill);
  };

    // State to manage new step text inputs for each resource
  const [newStepTexts, setNewStepTexts] = useState({});

  // Calculate progress percentage based on completed steps
  const calculateProgressPercentage = (steps) => {
    if (!steps || steps.length === 0) return 0;
    
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Handle step status change (checking/unchecking)
  const handleStepStatusChange = (resourceId, stepIndex, isCompleted) => {
    const updatedResources = data.resources_progress.map(resource => {
      if (resource.resource_id === resourceId) {
        const updatedSteps = [...resource.steps];
        updatedSteps[stepIndex].completed = isCompleted;
        
        // Automatically update resource status based on steps
        const completedPercentage = calculateProgressPercentage(updatedSteps);
        let updatedStatus = resource.status;
        
        if (completedPercentage === 100) {
          updatedStatus = "completed";
        } else if (completedPercentage > 0) {
          updatedStatus = "in_progress";
        } else {
          updatedStatus = "not_started";
        }

        return {
          ...resource,
          steps: updatedSteps,
          progress_percentage: completedPercentage,
          status: updatedStatus
        };
      }
      return resource;
    });
    
    // Update in database and state
    updateResourceProgress(resourceId, updatedResources.find(r => r.resource_id === resourceId));
    setData({...data, resources_progress: updatedResources});
  };

  // Add a new step to a resource
  const handleAddStep = (resourceId, stepDescription) => {
    const updatedResources = data.resources_progress.map(resource => {
      if (resource.resource_id === resourceId) {
        const newStep = {
          description: stepDescription,
          completed: false
        };
        
        const updatedSteps = resource.steps ? [...resource.steps, newStep] : [newStep];
        const completedPercentage = calculateProgressPercentage(updatedSteps);
        
        return {
          ...resource,
          steps: updatedSteps,
          progress_percentage: completedPercentage
        };
      }
      return resource;
    });
    
    // Update in database and state
    updateResourceSteps(resourceId, updatedResources.find(r => r.resource_id === resourceId).steps);
    setData({...data, resources_progress: updatedResources});
  };

  // Delete a step
  const handleDeleteStep = (resourceId, stepIndex) => {
    const updatedResources = data.resources_progress.map(resource => {
      if (resource.resource_id === resourceId) {
        const updatedSteps = [...resource.steps];
        updatedSteps.splice(stepIndex, 1);
        
        const completedPercentage = calculateProgressPercentage(updatedSteps);
        let updatedStatus = resource.status;
        
        if (completedPercentage === 100 && updatedSteps.length > 0) {
          updatedStatus = "completed";
        } else if (completedPercentage > 0) {
          updatedStatus = "in_progress";
        } else {
          updatedStatus = "not_started";
        }
        
        return {
          ...resource,
          steps: updatedSteps,
          progress_percentage: completedPercentage,
          status: updatedStatus
        };
      }
      return resource;
    });
    
    // Update in database and state
    updateResourceSteps(resourceId, updatedResources.find(r => r.resource_id === resourceId).steps);
    setData({...data, resources_progress: updatedResources});
  };

  // Database update functions (implement these based on your backend)
  const updateResourceSteps = (resourceId, steps) => {
    // Implementation depends on your backend/database
    // Example: API call to update steps
    // fetch(`/api/resources/${resourceId}/steps`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ steps }),
    // });
    console.log(1);
    
  };

  const updateResourceProgress = (resourceId, resourceData) => {
    // Implementation depends on your backend/database
    // Example: API call to update resource progress
    // fetch(`/api/resources/${resourceId}/progress`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(resourceData),
    // });
    console.log(3);
    
  };

  // Initialize animations when data is available
  useEffect(() => {
    if (data && pathRef.current) {
      // Animation timeline
      const tl = gsap.timeline();
      
      // Animate header
      tl.fromTo(headerRef.current, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
      
      // Animate progress section
      tl.fromTo(progressRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );
      
      // Animate milestones
      if (milestonesRef.current) {
        tl.fromTo(milestonesRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "back.out(1.2)" },
          "-=0.2"
        );
      }
      
      // Animate resources
      if (resourcesRef.current) {
        tl.fromTo(resourcesRef.current.children,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "elastic.out(1, 0.5)" },
          "-=0.3"
        );
      }
    }
  }, [data]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate days remaining
  const calculateDaysRemaining = () => {
    if (!data || !data.target_completion_date) return 0;
    const targetDate = new Date(data.target_completion_date);
    const today = new Date();
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Generate stats about learning path
  const generatePathStats = () => {
    if (!data || !data.resources_progress) return {};
    
    const totalResources = data.resources_progress.length;
    const completedResources = data.resources_progress.filter(r => r.status === "completed").length;
    const inProgressResources = data.resources_progress.filter(r => r.status === "in_progress").length;
    const totalTimeHours = data.resources_progress.reduce((sum, r) => sum + (r.estimated_time_hours || 0), 0);
    const completedTimeHours = data.resources_progress
      .filter(r => r.status === "completed")
      .reduce((sum, r) => sum + (r.estimated_time_hours || 0), 0);
    
    return {
      totalResources,
      completedResources,
      inProgressResources,
      totalTimeHours,
      completedTimeHours,
      completionPercentage: totalTimeHours > 0 ? (completedTimeHours / totalTimeHours) * 100 : 0
    };
  };
  

  // Add new resource
  const handleAddResource = (e) => {
    e.preventDefault();
    const form = e.target;
    
    const newResource = {
      resource_id: `resource-${Date.now()}`,
      title: form.title.value,
      platform: form.platform.value,
      type: form.type.value,
      difficulty: form.difficulty.value,
      estimated_time_hours: parseFloat(form.estimated_time.value) || 0,
      cost: form.cost.value || "Free",
      url: form.url.value,
      status: "not_started",
      progress_percentage: 0
    };
    
    setData(prevData => {
      const updatedData = {
        ...prevData,
        resources_progress: [...(prevData.resources_progress || []), newResource]
      };
      localStorage.setItem('learningResources', updatedData)
      if (onSave) onSave(updatedData);
      return updatedData;
    });
    
    setShowAddResource(false);
  };


  // Add new milestone
  const handleAddMilestone = (e) => {
    e.preventDefault();
    const form = e.target;
    
    const newMilestone = {
      title: form.milestone_title.value,
      completion_date: form.completion_date.value ? new Date(form.completion_date.value).toISOString() : new Date().toISOString(),
      notes: form.notes.value || ""
    };
    
    setData(prevData => {
      const updatedData = {
        ...prevData,
        completed_milestones: [...(prevData.completed_milestones || []), newMilestone]
      };
      
      if (onSave) onSave(updatedData);
      return updatedData;
    });
    
    setShowAddMilestone(false);
  };

  // Delete a resource
  const handleDeleteResource = (resourceId) => {
    if (!data) return;
    
    setData(prevData => {
      const updatedResources = prevData.resources_progress.filter(
        resource => resource.resource_id !== resourceId
      );
      
      // Recalculate overall progress
      const totalResources = updatedResources.length;
      const completedResourcesWeight = updatedResources.reduce((sum, resource) => sum + resource.progress_percentage, 0);
      const overallProgress = totalResources > 0 ? completedResourcesWeight / (totalResources * 100) : 0;
      
      const updatedData = {
        ...prevData,
        resources_progress: updatedResources,
        overall_progress: overallProgress
      };
      
      if (onSave) onSave(updatedData);
      return updatedData;
    });
    
    setConfirmDeleteId(null);
  };

  // Delete a milestone
  const handleDeleteMilestone = (index) => {
    if (!data) return;
    
    setData(prevData => {
      const updatedMilestones = prevData.completed_milestones.filter((_, i) => i !== index);
      
      const updatedData = {
        ...prevData,
        completed_milestones: updatedMilestones
      };
      
      if (onSave) onSave(updatedData);
      return updatedData;
    });
    
    setConfirmDeleteId(null);
  };

  // Edit a resource
  const handleEditResource = (e) => {
    e.preventDefault();
    if (!editingResource || !data) return;
    
    const form = e.target;
    
    setData(prevData => {
      const updatedResources = prevData.resources_progress.map(resource => {
        if (resource.resource_id === editingResource) {
          return {
            ...resource,
            title: form.title.value,
            platform: form.platform.value,
            type: form.type.value,
            difficulty: form.difficulty.value,
            estimated_time_hours: parseFloat(form.estimated_time.value) || 0,
            cost: form.cost.value || "Free",
            url: form.url.value,
          };
        }
        return resource;
      });
      
      const updatedData = {
        ...prevData,
        resources_progress: updatedResources
      };
      
      if (onSave) onSave(updatedData);
      return updatedData;
    });
    
    setEditingResource(null);
  };

  // Calculate proficiency level based on progress
  const calculateProficiencyLevel = (progress) => {
    if (progress >= 0.9) return "Expert";
    if (progress >= 0.7) return "Advanced";
    if (progress >= 0.4) return "Intermediate";
    return "Beginner";
  };

  // Update proficiency level if needed
  useEffect(() => {
    if (data && data.overall_progress) {
      const calculatedLevel = calculateProficiencyLevel(data.overall_progress);
      
      if (calculatedLevel !== data.current_proficiency) {
        setData(prevData => {
          const updatedData = {
            ...prevData,
            current_proficiency: calculatedLevel
          };
          
          if (onSave) onSave(updatedData);
          return updatedData;
        });
      }
    }
  }, [data?.overall_progress]);

  // Get resource being edited
  const getEditingResourceData = () => {
    if (!editingResource || !data?.resources_progress) return null;
    return data.resources_progress.find(r => r.resource_id === editingResource);
  };

  // Time tracking functions
  const startLearningSession = (resourceId) => {
    if (!data) return;
    
    const now = new Date().toISOString();
    
    setData(prevData => {
      const updatedResources = prevData.resources_progress.map(resource => {
        if (resource.resource_id === resourceId) {
          return { 
            ...resource, 
            current_session_start: now,
            status: resource.status === "not_started" ? "in_progress" : resource.status,
            progress_percentage: resource.progress_percentage === 0 ? 5 : resource.progress_percentage
          };
        }
        return resource;
      });
      
      const updatedData = {
        ...prevData,
        resources_progress: updatedResources
      };
      
      if (onSave) onSave(updatedData);
      return updatedData;
    });
  };

  const endLearningSession = (resourceId) => {
    if (!data) return;
    
    setData(prevData => {
      const updatedResources = prevData.resources_progress.map(resource => {
        if (resource.resource_id === resourceId && resource.current_session_start) {
          // Calculate session duration in hours
          const startTime = new Date(resource.current_session_start);
          const endTime = new Date();
          const durationHours = (endTime - startTime) / (1000 * 60 * 60);
          
          const timeSpent = (resource.time_spent_hours || 0) + durationHours;
          let progressPercentage = resource.progress_percentage;
          
          // Update progress percentage based on time spent relative to estimated time
          if (resource.estimated_time_hours > 0) {
            progressPercentage = Math.min(
              100, 
              Math.max(
                resource.progress_percentage,
                (timeSpent / resource.estimated_time_hours) * 100
              )
            );
          } else {
            // If no estimated time, increment by 10%
            progressPercentage = Math.min(100, resource.progress_percentage + 10);
          }
          
          // Add session to history
          const sessionHistory = [...(resource.session_history || []), {
            start: resource.current_session_start,
            end: endTime.toISOString(),
            duration_hours: durationHours
          }];
          
          return { 
            ...resource, 
            current_session_start: null,
            time_spent_hours: timeSpent,
            progress_percentage: progressPercentage,
            status: progressPercentage >= 100 ? "completed" : "in_progress",
            session_history: sessionHistory
          };
        }
        return resource;
      });
      
      // Recalculate overall progress
      const totalResources = updatedResources.length;
      const completedResourcesWeight = updatedResources.reduce((sum, resource) => sum + resource.progress_percentage, 0);
      const overallProgress = totalResources > 0 ? completedResourcesWeight / (totalResources * 100) : 0;
      
      const updatedData = {
        ...prevData,
        resources_progress: updatedResources,
        overall_progress: overallProgress,
        current_proficiency: calculateProficiencyLevel(overallProgress)
      };
      
      if (onSave) onSave(updatedData);
      return updatedData;
    });
  };

  // If no data is available, show input form
  if (!data) {
    return (
      <>
        <Navbar />
        <div className="learning-path-container">
          <form onSubmit={handleSubmit} className="learning-path-form">
            <h2>Create Your Learning Path</h2>
            
            <div className="form-group">
              <label htmlFor="skill_name">Skill Name:</label>
              <input 
                type="text" 
                id="skill_name" 
                name="skill_name" 
                required
                placeholder="e.g. Python Programming"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="current_proficiency">Current Level:</label>
              <select id="current_proficiency" name="current_proficiency">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="target_completion_date">Target Completion Date:</label>
              <input 
                type="date" 
                id="target_completion_date" 
                name="target_completion_date" 
                required
              />
            </div>
            
            <button type="submit" className="create-button">Create Learning Path</button>
          </form>
        </div>
      </>
    );
  }

  // Get stats for the dashboard
  const stats = generatePathStats();
  const resourceBeingEdited = getEditingResourceData();

  // Check if any resource has an active learning session
  const activeSession = data.resources_progress?.find(r => r.current_session_start);

  return (
    <>
      <Navbar />
      <div className="learning-path-container" ref={pathRef}>
        {isEditing ? (
          <div className="learning-path-edit-form">
            <form onSubmit={handleUpdateSkill}>
              <h2>Edit Learning Path</h2>
              <div className="form-group">
                <label htmlFor="skill_name">Skill Name:</label>
                <input 
                  type="text" 
                  id="skill_name" 
                  name="skill_name" 
                  defaultValue={data.skill_name}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="current_proficiency">Current Level:</label>
                <select 
                  id="current_proficiency" 
                  name="current_proficiency"
                  defaultValue={data.current_proficiency}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="target_completion_date">Target Completion Date:</label>
                <input 
                  type="date" 
                  id="target_completion_date" 
                  name="target_completion_date" 
                  defaultValue={data.target_completion_date ? data.target_completion_date.split('T')[0] : ''}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="learning-path-header" ref={headerRef}>
              <div className="header-main">
                <h1>{data.skill_name}</h1>
                <button 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit learning path"
                >
                  Edit
                </button>
              </div>
              <div className="learning-path-dates">
                <div className="date-item">
                  <span className="date-label">Started:</span>
                  <span className="date-value">{formatDate(data.start_date)}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Target completion:</span>
                  <span className="date-value">{formatDate(data.target_completion_date)}</span>
                </div>
                <div className="date-item highlight">
                  <span className="date-label">Days remaining:</span>
                  <span className="date-value">{calculateDaysRemaining()}</span>
                </div>
              </div>
            </div>

            <div className="learning-path-progress" ref={progressRef}>
              <div className="progress-stats">
                <div className="progress-stat">
                  <span className="stat-label">Current level</span>
                  <span className="stat-value">{data.current_proficiency}</span>
                </div>
                <div className="progress-stat">
                  <span className="stat-label">Overall progress</span>
                  <span className="stat-value">{Math.round(data.overall_progress * 100)}%</span>
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.round(data.overall_progress * 100)}%` }}
                ></div>
              </div>

              <div className="dashboard-stats">
                <div className="stat-card">
                  <span className="stat-number">{stats.completedResources || 0}</span>
                  <span className="stat-label">Resources Complete</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{stats.inProgressResources || 0}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{stats.completedTimeHours?.toFixed(1) || 0}</span>
                  <span className="stat-label">Hours Spent</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{(stats.totalTimeHours - stats.completedTimeHours)?.toFixed(1) || 0}</span>
                  <span className="stat-label">Hours Remaining</span>
                </div>
              </div>
            </div>

            {/* Active Learning Session Banner */}
            {activeSession && (
              <div className="active-session-banner">
                <div className="session-info">
                  <div className="resource-name">
                    Currently learning: <strong>{activeSession.title}</strong>
                  </div>
                  <div className="session-timer">
                    Session started: {new Date(activeSession.current_session_start).toLocaleTimeString()}
                  </div>
                </div>
                <button 
                  className="end-session-button"
                  onClick={() => endLearningSession(activeSession.resource_id)}
                >
                  End Session
                </button>
              </div>
            )}

            {/* Milestones Section */}
            <div className="learning-path-milestones" ref={milestonesRef}>
              <div className="section-header">
                <h2>Completed Milestones</h2>
                <button 
                  className="add-button"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                >
                  {showAddMilestone ? "Cancel" : "Add Milestone"}
                </button>
              </div>
              
              {showAddMilestone && (
                <form onSubmit={handleAddMilestone} className="add-milestone-form">
                  <div className="form-group">
                    <label htmlFor="milestone_title">Milestone Title:</label>
                    <input 
                      type="text" 
                      id="milestone_title" 
                      name="milestone_title" 
                      required
                      placeholder="e.g. Completed Basic Syntax"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="completion_date">Completion Date:</label>
                    <input 
                      type="date" 
                      id="completion_date" 
                      name="completion_date" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Notes:</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      placeholder="Any additional details about this milestone"
                    ></textarea>
                  </div>
                  
                  <button type="submit">Add Milestone</button>
                </form>
              )}
              
              {data.completed_milestones && data.completed_milestones.length > 0 ? (
                <ul className="milestones-list">
                  {data.completed_milestones.map((milestone, index) => (
                    <li key={index} className="milestone-item">
                      <div className="milestone-content">
                        <span className="milestone-title">{milestone.title}</span>
                        <span className="milestone-date">{formatDate(milestone.completion_date)}</span>
                        {milestone.notes && <p className="milestone-notes">{milestone.notes}</p>}
                      </div>
                      <div className="milestone-actions">
                        {confirmDeleteId === `milestone-${index}` ? (
                          <>
                            <button 
                              className="confirm-delete"
                              onClick={() => handleDeleteMilestone(index)}
                            >
                              Confirm
                            </button>
                            <button 
                              className="cancel-delete"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button 
                            className="delete-button"
                            onClick={() => setConfirmDeleteId(`milestone-${index}`)}
                            aria-label="Delete milestone"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="no-milestones">No milestones added yet</div>
              )}
            </div>

            {/* Resources Section */}
            <div className="learning-path-resources" ref={resourcesRef}>
              <div className="section-header">
                <h2>Learning Resources</h2>
                <button 
                  className="add-button"
                  onClick={() => setShowAddResource(!showAddResource)}
                >
                  {showAddResource ? "Cancel" : "Add Resource"}
                </button>
              </div>
              
              {showAddResource && (
                <form onSubmit={handleAddResource} className="add-resource-form">
                  <div className="form-group">
                    <label htmlFor="title">Resource Title:</label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title" 
                      required
                      placeholder="e.g. Python Crash Course"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="platform">Platform:</label>
                      <input 
                        type="text" 
                        id="platform" 
                        name="platform" 
                        placeholder="e.g. Udemy, YouTube"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="type">Type:</label>
                      <select id="type" name="type">
                        <option value="Course">Course</option>
                        <option value="Book">Book</option>
                        <option value="Video">Video</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Project">Project</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="difficulty">Difficulty:</label>
                      <select id="difficulty" name="difficulty">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="estimated_time">Est. Time (hours):</label>
                      <input 
                        type="number" 
                        id="estimated_time" 
                        name="estimated_time" 
                        min="0.5" 
                        step="0.5"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cost">Cost:</label>
                      <input 
                        type="text" 
                        id="cost" 
                        name="cost" 
                        placeholder="e.g. Free, $19.99"
                        defaultValue="Free"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="url">URL:</label>
                      <input 
                        type="url" 
                        id="url" 
                        name="url" 
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <button type="submit">Add Resource</button>
                </form>)}
            </div>

            <div>
              {console.log(editingResource && resourceBeingEdited ,editingResource , resourceBeingEdited )}
              {editingResource && resourceBeingEdited ? (
                <form onSubmit={handleEditResource} className="edit-resource-form">
                  <h3>Edit Resource</h3>
                  <div className="form-group">
                    <label htmlFor="title">Resource Title:</label>
                    <input 
                      type="text" 
                      id="title" 
                      name="title" 
                      required
                      defaultValue={resourceBeingEdited.title}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="platform">Platform:</label>
                      <input 
                        type="text" 
                        id="platform" 
                        name="platform" 
                        defaultValue={resourceBeingEdited.platform}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="type">Type:</label>
                      <select 
                        id="type" 
                        name="type"
                        defaultValue={resourceBeingEdited.type}
                      >
                        <option value="Course">Course</option>
                        <option value="Book">Book</option>
                        <option value="Video">Video</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Documentation">Documentation</option>
                        <option value="Project">Project</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="difficulty">Difficulty:</label>
                      <select 
                        id="difficulty" 
                        name="difficulty"
                        defaultValue={resourceBeingEdited.difficulty}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="estimated_time">Est. Time (hours):</label>
                      <input 
                        type="number" 
                        id="estimated_time" 
                        name="estimated_time" 
                        min="0.5" 
                        step="0.5"
                        defaultValue={resourceBeingEdited.estimated_time_hours}
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cost">Cost:</label>
                      <input 
                        type="text" 
                        id="cost" 
                        name="cost" 
                        defaultValue={resourceBeingEdited.cost}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="url">URL:</label>
                      <input 
                        type="url" 
                        id="url" 
                        name="url" 
                        defaultValue={resourceBeingEdited.url}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={() => setEditingResource(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="resources-list">
                {data.resources_progress && data.resources_progress.length > 0 ? (
                  data.resources_progress.map(resource => (
                    <div 
                      key={resource.resource_id} 
                      className={`resource-card ${resource.status}`}
                    >
                      <div className="resource-header">
                        <h3 className="resource-title">{resource.title}</h3>
                        <div className="resource-tags">
                          <span className="resource-platform">{resource.platform}</span>
                          <span className="resource-type">{resource.type}</span>
                        </div>
                        <div className="resource-actions">
                          <button 
                            className="edit-resource-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingResource(resource.resource_id);
                            }}
                            aria-label="Edit resource"
                          >
                            Edit
                          </button>
                          {confirmDeleteId === resource.resource_id ? (
                            <>
                              <button 
                                className="confirm-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteResource(resource.resource_id);
                                }}
                              >
                                Confirm
                              </button>
                              <button 
                                className="cancel-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(null);
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button 
                              className="delete-resource-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(resource.resource_id);
                              }}
                              aria-label="Delete resource"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="resource-details">
                        <div className="resource-difficulty">
                          <span className="detail-label">Difficulty:</span>
                          <span className="detail-value">{resource.difficulty}</span>
                        </div>
                        <div className="resource-time">
                          <span className="detail-label">Est. Time:</span>
                          <span className="detail-value">{resource.estimated_time_hours} hours</span>
                        </div>
                        {resource.time_spent_hours && (
                          <div className="resource-time-spent">
                            <span className="detail-label">Time Spent:</span>
                            <span className="detail-value">{resource.time_spent_hours.toFixed(1)} hours</span>
                          </div>
                        )}
                        {resource.cost && (
                          <div className="resource-cost">
                            <span className="detail-label">Cost:</span>
                            <span className="detail-value">{resource.cost}</span>
                          </div>
                        )}
                        {resource.url && (
                          <div className="resource-url">
                            <a 
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open Link
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {/* Steps Progress System */}
                      <div className="resource-steps-container">
                        <div className="resource-progress-bar-container">
                          <div 
                            className="resource-progress-bar" 
                            style={{ width: `${calculateProgressPercentage(resource.steps)}%` }}
                          ></div>
                        </div>
                        <span className="resource-progress-text">
                          {calculateProgressPercentage(resource.steps)}% Complete
                        </span>
                        
                        <div className="resource-steps">
                          {resource.steps && resource.steps.length > 0 ? (
                            <ul className="steps-list">
                              {resource.steps.map((step, index) => (
                                <li key={index} className="step-item">
                                  <label className="step-label">
                                    <input 
                                      type="checkbox"
                                      checked={step.completed}
                                      onChange={(e) => {
                                        handleStepStatusChange(
                                          resource.resource_id,
                                          index,
                                          e.target.checked
                                        );
                                      }}
                                    />
                                    <span className="step-text">{step.description}</span>
                                  </label>
                                  <button 
                                    className="delete-step-button"
                                    onClick={() => handleDeleteStep(resource.resource_id, index)}
                                    aria-label="Delete step"
                                  >
                                    ×
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="no-steps">No steps added yet</p>
                          )}
                          
                          <div className="add-step-container">
                            <input
                              type="text"
                              className="add-step-input"
                              value={newStepTexts[resource.resource_id] || ''}
                              onChange={(e) => {
                                setNewStepTexts({
                                  ...newStepTexts,
                                  [resource.resource_id]: e.target.value
                                });
                              }}
                              placeholder="Add a new step"
                            />
                            <button
                              className="add-step-button"
                              onClick={() => {
                                if (newStepTexts[resource.resource_id]?.trim()) {
                                  handleAddStep(
                                    resource.resource_id, 
                                    newStepTexts[resource.resource_id]
                                  );
                                  setNewStepTexts({
                                    ...newStepTexts,
                                    [resource.resource_id]: ''
                                  });
                                }
                              }}
                            >
                              Add Step
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="resource-footer">
                        <div className="resource-status">
                          {resource.status === "completed" ? "Completed" : 
                            resource.status === "in_progress" ? "In Progress" : "Not Started"}
                        </div>
                        
                        <div className="resource-session-controls">
                          {resource.current_session_start ? (
                            <button 
                              className="end-session-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                endLearningSession(resource.resource_id);
                              }}
                            >
                              End Learning Session
                            </button>
                          ) : (
                            <button 
                              className="start-session-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startLearningSession(resource.resource_id);
                              }}
                              disabled={resource.status === "completed"}
                            >
                              Start Learning Session
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {resource.session_history && resource.session_history.length > 0 && (
                        <div className="session-history">
                          <details>
                            <summary>Session History ({resource.session_history.length})</summary>
                            <ul className="sessions-list">
                              {resource.session_history.map((session, idx) => (
                                <li key={idx} className="session-item">
                                  <div className="session-date">
                                    {new Date(session.start).toLocaleDateString()}
                                  </div>
                                  <div className="session-time">
                                    {new Date(session.start).toLocaleTimeString()} - {new Date(session.end).toLocaleTimeString()}
                                  </div>
                                  <div className="session-duration">
                                    {session.duration_hours.toFixed(2)} hours
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-resources">No resources added yet</div>
                )}
              </div>
              )}
            </div>
            </>
          )}
      </div>
    </>
    );
  };
  
  export default LearningPath;