import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiSave, FiCopy, FiRefreshCw, FiDownload, FiChevronDown, 
  FiChevronUp, FiFileText, FiAward, FiTarget, FiTrendingUp, 
  FiClock, FiBookOpen, FiArrowRight, FiCheck, FiStar,
  FiLayers, FiBarChart2, FiPieChart, FiActivity, FiEdit
} from 'react-icons/fi';
import { gsap } from 'gsap';
import html2pdf from 'html2pdf.js';
import '../../styles/CareerGuid Styles/CareerRecommendation.css';
import Navbar from '../../components/LandingPageComponents/Navbar'

const CareerRecommendation = () => {
  const [userData, setUserData] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePathIndex, setActivePathIndex] = useState(0);
  const [currentView, setCurrentView] = useState('overview');
  const [careerPaths, setCareerPaths] = useState([]);
  const [showComparisonMode, setShowComparisonMode] = useState(false);
  const [comparedPaths, setComparedPaths] = useState([0, 1]);
  const [comparisonCategory, setComparisonCategory] = useState('skills');
  const [animateSkills, setAnimateSkills] = useState(false);
  
  // Refs for animations
  const cardRef = useRef(null);
  const actionButtonsRef = useRef(null);
  const careerPathsRef = useRef([]);
  const timelineRef = useRef(null);
  const chartsRef = useRef(null);

  // Parse career paths from recommendation string
  const parseRecommendation = (recData) => {
    if (!recData || !recData.recommendation) return [];
  
    const recText = recData.recommendation;
    const sections = recText.split(/## \d+\. /);
    if (sections.length <= 1) return [];
  
    sections.shift(); // Remove the first empty section
  
    return sections.map((section, index) => {
      // Extract title
      const titleMatch = section.match(/^Career Path Name:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : `Career Path ${index + 1}`; 
  
      // Extract overview
      const overview = extractSection(section, "Overview", "Why This Career Fits");
  
      // Extract sections
      const whyFits = extractSection(section, "Why This Career Fits", "Skills to Develop");
      const skills = extractSection(section, "Skills to Develop", "3–6 Month Learning Roadmap");
      const roadmap = extractSection(section, "3–6 Month Learning Roadmap", "Learning Curve");
      const learningCurve = extractSection(section, "Learning Curve", "Entry Strategies");
      const entryStrategies = extractSection(section, "Entry Strategies", "5-Year Career Growth Path");
      const growthPath = extractSection(section, "5-Year Career Growth Path", "---");
  
      // Extract structured lists
      const skillsList = extractSkillsData(skills);
      const roadmapSteps = extractRoadmapData(roadmap);
      // const learningCurveSteps = extractLearningCurveData(learningCurve);
      const growthSteps = extractGrowthData(growthPath);
  
      // Calculate match score
      const matchScore = 100 - (index * 15);
  
      return {
        title,
        overview,
        whyFits,
        skills,
        roadmap,
        learningCurve,
        entryStrategies,
        growthPath,
        skillsList,
        roadmapSteps,
        // learningCurveSteps,
        growthSteps,
        isBestFit: index === 0,
        matchScore
      };
    });
  };

  const extractSection = (text, sectionStart, sectionEnd) => {
    const startIndex = text.indexOf(`### ${sectionStart}`);
    if (startIndex === -1) return "";
    
    let endIndex = text.indexOf(`### ${sectionEnd}`, startIndex);
    if (endIndex === -1) endIndex = text.length;
    
    return text.substring(startIndex + sectionStart.length + 4, endIndex).trim();
  };

  // Extract skills as structured data
  const extractSkillsData = (skillsText) => {
    if (!skillsText) return [];
    
    const lines = skillsText.split('\n');
    return lines
      .filter(line => line.trim().startsWith('- '))
      .map(line => {
        line = line.replace('- ', '').trim();
        
        // Check if there's a description
        const parts = line.split('—');
        let name = parts[0].trim();
        let description = parts.length > 1 ? parts[1].trim() : '';
        
        // Remove ** markdown if present
        name = name.replace(/\*\*/g, '');
        
        // Generate a random proficiency level (1-5) for visualization
        // In a real app, this would come from actual data
        const proficiency = Math.floor(Math.random() * 3) + 3; // 3-5 range to show reasonably developed skills
        
        return { name, description, proficiency };
      });
  };

  // Extract roadmap as structured data
  const extractRoadmapData = (roadmapText) => {
    if (!roadmapText) return [];
    
    const lines = roadmapText.split('\n');
    return lines
      .filter(line => line.trim().startsWith('- **Month'))
      .map(line => {
        line = line.replace('- ', '').trim();
        
        // Extract month range
        const monthMatch = line.match(/\*\*Month (\d+)–(\d+)\*\*:/);
        if (!monthMatch) return null;
        
        const startMonth = parseInt(monthMatch[1]);
        const endMonth = parseInt(monthMatch[2]);
        
        // Get everything after the month range
        let fullText = line.substring(monthMatch[0].length).trim();
        
        // Find all resource links and titles
        const resourceMatches = [...fullText.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
        
        // Extract titles and resources
        const resources = resourceMatches.map(match => ({
          title: match[1],
          url: match[2]
        }));
        
        // Extract description (text before first link and after last link)
        let descriptionParts = [];
        
        // Text before first link
        if (resourceMatches.length > 0) {
          const firstLinkIndex = fullText.indexOf(resourceMatches[0][0]);
          if (firstLinkIndex > 0) {
            descriptionParts.push(fullText.substring(0, firstLinkIndex).trim());
          }
          
          // Replace all resource matches with an empty string to get the text between/after links
          let tempText = fullText;
          resourceMatches.forEach(match => {
            tempText = tempText.replace(match[0], "|||");
          });
          
          // Split by the placeholder and filter out empty parts
          const textParts = tempText.split("|||").filter(part => part.trim());
          
          // Add the text parts except the first one (which we already added)
          if (textParts.length > 1) {
            descriptionParts = descriptionParts.concat(textParts.slice(1));
          } else if (textParts.length === 1 && firstLinkIndex === 0) {
            // If there's only one part and it's after the links
            descriptionParts.push(textParts[0]);
          }
        } else {
          // No links found, entire text is description
          descriptionParts.push(fullText);
        }
        
        const description = descriptionParts.join(' ').trim();
        
        return {
          startMonth,
          endMonth,
          resources,
          description
        };
      })
      .filter(Boolean);
  };

  // Extract growth path as structured data
  const extractGrowthData = (growthText) => {
    if (!growthText) return [];
    
    const lines = growthText.split('\n');
    return lines
      .filter(line => line.trim().startsWith('- '))
      .map(line => {
        line = line.replace('- ', '').trim();
        
        // Extract year range and description
        const yearMatch = line.match(/\*\*Year (\d+)–(\d+)\*\*:/);
        if (!yearMatch) {
          const finalYearMatch = line.match(/\*\*Year (\d+)\*\*:/);
          if (!finalYearMatch) return null;
          
          const year = parseInt(finalYearMatch[1]);
          const description = line.replace(`**Year ${year}**: `, '');
          
          // Extract salary range if available
          const salaryMatch = description.match(/\$(\d+),(\d+)-\$(\d+),(\d+)/);
          
          return {
            startYear: year,
            endYear: year,
            description: description.split(' + ')[0] || description,
            salary: salaryMatch ? {
              min: parseInt(`${salaryMatch[1]}${salaryMatch[2]}`),
              max: parseInt(`${salaryMatch[3]}${salaryMatch[4]}`)
            } : null
          };
        }
        
        const startYear = parseInt(yearMatch[1]);
        const endYear = parseInt(yearMatch[2]);
        const description = line.replace(`**Year ${startYear}–${endYear}**: `, '');
        
        return {
          startYear,
          endYear,
          description,
          salary: null
        };
      })
      .filter(Boolean);
  };

  // Extract bullet points from text
  const extractBulletPoints = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n');
    return lines
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.replace('- ', '').trim());
  };

  // Fetch user data from backend
  const fetchUserData = async () => {
    const token = sessionStorage.getItem('authToken');
    try {
      const response = await axios.get(
        `http://localhost:5000/api/users/profile`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching the data', error);
    }
  };

  // Fetch career recommendation
  const getCareerRecommendation = async () => {
    if (!userData) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const userDataa = {
        "personality_type": userData.preferences.personalityType,
        "interests": userData.interests,
        "goals": userData.insights.fiveYearGoal,
        "education_level": userData.education.fieldOfStudy,
        "experience_years": userData.experience.yearsOfExperience,
        "current_role": userData.experience.currentRole,
        "work_type": userData.workStyle,
        "desired_industries" : userData.careerInfo.desiredIndustries,
        "career_goals" : userData.careerInfo.careerGoals,
        "career_stage" : userData.careerInfo.careerStage,
        "desired_roles" : userData.careerInfo.desiredRoles,
      };
      
      // Mock response for development
      const mockResponse ={
        "recommendation": " ## 1. Career Path Name: Educational Psychology Consultant\n\n### Overview\nThis career path involves working as a consultant in educational psychology, helping educational institutions and organizations create tailored educational programs that support students' emotional, social, and academic growth, based on the insights provided by psychological research.\n\n### Why This Career Fits\n- Alignment with personality type: INFJs are perceptive, intuitive, and empathetic, which makes them naturally suited to understanding and addressing the emotional needs of their clients.\n- Psychological strengths: INFJs are adept at understanding complex concepts, uncovering patterns, and motivating others—skills that are essential for consulting and designing effective educational programs.\n\n### Skills to Develop\n- **Psychological research skills** — Understanding the latest research in educational psychology is crucial for delivering evidence-based recommendations.\n- **Program design and evaluation** — Creating successful educational programs requires the ability to design and evaluate strategies effectively.\n- **Communication and presentation** — Clear communication is essential for translating complex psychological concepts to various stakeholders, such as educators, administrators, and parents.\n- **Consultation and collaboration** — Successful educational psychology consultants must collaborate with educators and administrators to develop practical and implementable solutions.\n\n### 3–6 Month Learning Roadmap\n- **Month 1–2**: Learn about the theoretical foundations of educational psychology by taking an online course like [Introduction to Educational Psychology](https://www.coursera.org/courses/educationalpsychology) or [Educational Psychology and Development](https://www.edx.org/professional-certificate/bcgx-psychology-child-development).\n- **Month 3–4**: Dive into program design and evaluation, by enrolling in [Designing and Implementing Effective Educational Programs](https://www.edx.org/professional-certificate/berkeleyx-edx-sd-designing-implementing-effective-pedagogical-programs) or [Evaluating Educational Programs](https://www.coursera.org/courses/evaluation).\n- **Month 5–6**: Gain hands-on experience by participating in a project or internship related to educational psychology consulting. For example, work on a program evaluation for a school or organization, or consult with educators on designing strategy for enhancing students' well-being.\n- **Estimated weekly time commitment**: 5-10 hours per week\n\n### Learning Curve\nThe educational psychology consulting field can be competitive, but it presents opportunities for those who are passionate, dedicated, and committed to continued learning.\n\n### Entry Strategies\n- **Entry Role 1**: Junior Educational Psychology Consultant at educational organizations, research institutions, or consulting firms.\n- **Entry Role 2**: School Psychologist or Educational Psychologist working directly with students and educators to create supportive learning environments.\n- **Optional freelance/startup path**: Offer consultations and program design services independently to schools and educational organizations.\n\n### 5-Year Career Growth Path\n- **Year 1–2**: Build a portfolio of successful projects and collaborations, and establish a professional network.\n- **Year 3–4**: Specialize in a particular area, such as social-emotional learning, academic achievement, or career development, to become a recognized expert in your field.\n- **Year 5**: Seek opportunities to speak at conferences, publish research, or coach other educational psychologists to demonstrate your thought leadership in the field.\n\n---\n\n## 2. Career Path Name: Learning & Development Specialist in Corporate HR\n\n### Overview\nLearning & Development (L&D) Specialists focus on developing and implementing training programs and initiatives to help employees improve their skills, increase their productivity, and reach their potential. Within HR, L&D Specialists work closely with employees and management to meet business goals and foster personal growth.\n\n### Why This Career Fits\n- Alignment with personality type: INFJs possess strong empathy and intuition, which make them well-suited to understanding the unique learning needs of individuals, as well as the organizational goals that must be met.\n- Psychological strengths: INFJs are natural motivators, adept at identifying the potential within others and tailoring content to meet individual learning preferences.\n\n### Skills to Develop\n- **Training design, delivery, and evaluation** — Proficiency in creating training programs, facilitating sessions, and evaluating the effects on employee performance.\n- **Instructional design principles** — Understanding and applying effective strategies for course structure, interaction, and assessment.\n- **Collaboration** — Ability to work effectively with other HR professionals, management, and departments.\n- **Technical skills (e.g., e-learning tools, Learning Management Systems)** — Proficiency in utilizing and adapting technology to support learning and development.\n\n### 3–6 Month Learning Roadmap\n- **Month 1–2**: Brush up on these essential skills with courses like [Learning & Development Fundamentals](https://www.linkedin.com/learning/learning-and-development-fundamentals) or [Introduction to Instructional Design](https://www.edx.org/professional-certificate/purduex-instructional-design-introduction).\n- **Month 3–4**: Learn how to create engaging online training programs by enrolling in [Designing Digital Learning](https://www.edx.org/professional-certificate/edx-designing-digital-learning) or [Creating eLearning: Instructional Design](https://www.pluralsight.com/courses/creating-elearning-instructional-design).\n- **Month 5–6**: Gain hands-on experience by working on a training project or internship within an HR department. For example, collaborate with colleagues to create a training program for onboarding new employees or develop a workshop on communication skills.\n- **Estimated weekly time commitment**: 5-10 hours per week\n\n### Learning Curve\nThe Learning & Development field is evolving rapidly with the increased use of technology, so continuous learning is essential to remain current in this career.\n\n### Entry Strategies\n- **Entry Role 1**: HR Training Specialist or L&D Coordinator in a small to medium-sized organization.\n- **Entry Role 2**: HR Generalist with a focus on learning & development within a department or division.\n- **Optional freelance/startup path**: Offer training and development services to small businesses or organizations as an independent contractor.\n\n### 5-Year Career Growth Path\n- **Year 1–2**: Gain experience in multiple areas of HR to develop a broad understanding of organizational issues and challenges.\n- **Year 3–4**: Specialize in a specific area, such as leadership development, diversity & inclusion, or technical skills training, to become an expert in that area.\n- **Year 5**: Seek opportunities to lead large-scale training initiatives, drive best practices, and influence the strategic direction of a company's learning and development programs.\n\n---\n\n## 3. Career Path Name: Mental Health Counselor in Education\n\n### Overview\nMental Health Counselors in Education work with students and their families, teachers, and administrators to create supportive learning environments that address emotional, behavioral, and academic challenges. They provide counseling services, consultation, and collaboration to promote student success.\n\n### Why This Career Fits\n- Alignment with personality type: INFJs possess strong empathy, understanding, and intuitiveness, making them well-suited to genuinely connecting with students and understanding their complex emotional needs.\n- Psychological strengths: INFJs are skilled at uncovering patterns, identifying solutions, and advocating for the well-being of others.\n\n### Skills to Develop\n- **Counseling techniques and therapeutic interventions** — Proficiency in a variety of therapeutic approaches, such as cognitive-behavioral therapy and solution-focused brief therapy.\n- **Assessment and diagnostic skills** — Ability to accurately diagnose mental health conditions and develop appropriate treatment plans.\n- **Collaboration** — Developing effective working relationships with teachers, administrators, and families to support students.\n- **Cultural competence** — Sensitivity to the diversity of students and families and the ability to adapt counseling approaches accordingly.\n\n### 3–6 Month Learning Roadmap\n- **Month 1–2**: Gain a foundational understanding of psychology and counseling through online courses like [Introduction to Psychology](https://www.coursera.org/courses/introduction-to-psychology) or [Basic Counseling Skills](https://www.upenn.edu/citizenship/education/counselor-education/basic-counseling-skills/index.html).\n- **Month 3–4**: Learn about mental health conditions and therapeutic techniques by taking courses like [Abnormal Psychology](https://www.coursera.org/courses/abnormal-psychology) or [Introduction to Counseling Theories](https://www.coursera.org/courses/introduction-to-counseling-theories).\n- **Month 5–6**: Obtain hands-on experience through a counseling practicum or internship at a school or counseling center. This will provide opportunities to apply your knowledge in real-world contexts and receive feedback.\n- **Estimated weekly time commitment**: 5-10 hours per week\n\n### Learning Curve\nThe mental health field requires significant education and ongoing training to maintain competence and licensure.\n\n### Entry Strategies\n- **Entry Role 1**: School Counselor, responsible for academic, career, and personal/social counseling for students.\n- **Entry Role 2**: Mental Health Counselor in a school setting, providing counseling services to students specifically focused on emotional and behavioral challenges.\n- **Optional freelance/startup path**: Offer your counseling services to schools and organizations on a contract basis.\n\n### 5-Year Career Growth Path\n- **Year 1–2**: Gain experience in a school setting and become familiar with the unique challenges and opportunities of working with student populations.\n- **Year 3–4**: Specialize in a specific population, such as young children, special education students, or highly gifted learners, to gain expertise and become an expert in that area.\n- **Year 5**: Advance to leadership roles, such as Department Chair or Program Director, or consider furthering your education to pursue an advanced degree in areas like school psychology or educational leadership."
    }
      
      // Uncomment for actual API call
      // const response = await axios.post('http://localhost:8001/api/v1/recommend-career', userData, {
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // });
      // setRecommendation(response.data);
      
      setRecommendation(mockResponse);
      const paths = parseRecommendation(mockResponse);
      setCareerPaths(paths);
      
    } catch (error) {
      setError('Error fetching career recommendation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Call fetchUserData on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Call getCareerRecommendation when userData is fetched
  useEffect(() => {
    if (userData) {
      getCareerRecommendation();
    }
  }, [userData]);

  // Parse recommendation data when recommendation changes
  useEffect(() => {
    if (recommendation) {
      const paths = parseRecommendation(recommendation);
      setCareerPaths(paths);
      careerPathsRef.current = paths;
      
      // Trigger skill animation after a short delay
      setTimeout(() => {
        setAnimateSkills(true);
      }, 500);
    }
  }, [recommendation]);

  // Apply animations when recommendation is loaded
  useEffect(() => {
    if (recommendation && cardRef.current) {
      // Card entry animation
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      
      // Action buttons staggered animation
      if (actionButtonsRef.current) {
        gsap.fromTo(
          actionButtonsRef.current.children,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: "back.out(1.7)"
          }
        );
      }
      
      // Career paths staggered animation
      const pathElements = document.querySelectorAll('.career-path-selector');
      if (pathElements.length > 0) {
        gsap.fromTo(
          pathElements,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out"
          }
        );
      }
    }
  }, [recommendation]);

  // Apply animation to timeline when view changes to roadmap
  useEffect(() => {
    if (currentView === 'roadmap' && timelineRef.current) {
      const timelineItems = timelineRef.current.querySelectorAll('.timeline-item');
      
      gsap.fromTo(
        timelineItems,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.15,
          ease: "power2.out"
        }
      );
    }
    
    if (currentView === 'skills' && chartsRef.current) {
      const skillBars = chartsRef.current.querySelectorAll('.skill-progress-bar-fill');
      
      gsap.fromTo(
        skillBars,
        { width: '0%' },
        {
          width: (el) => el.getAttribute('data-percent') + '%',
          duration: 1,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [currentView]);

  // Handle copy to clipboard
  const copyToClipboard = () => {
    // Create formatted text version
    const paths = careerPaths;
    let formattedText = "# Career Recommendations\n\n";
    
    paths.forEach((path, index) => {
      formattedText += `## ${index + 1}. ${path.title}\n`;
      formattedText += `### Overview\n${path.overview}\n\n`;
      formattedText += `### Why This Career Fits\n${path.whyFits}\n\n`;
      formattedText += `### Skills to Develop\n${path.skills}\n\n`;
      formattedText += `### 3–6 Month Learning Roadmap\n${path.roadmap}\n\n`;
      formattedText += `### Entry Strategies\n${path.entryStrategies}\n\n`;
      formattedText += `### 5-Year Career Growth Path\n${path.growthPath}\n\n`;
      
      if (index < paths.length - 1) {
        formattedText += "---\n\n";
      }
    });
    
    navigator.clipboard.writeText(formattedText);
    toast.success('Recommendation copied to clipboard!');
    
    // Copy animation
    const copyButton = document.querySelector('.copy-button');
    if (copyButton) {
      gsap.fromTo(
        copyButton,
        { scale: 1 },
        { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
      );
    }
  };

  // Handle download as text file
  const downloadRecommendationAsText = () => {
    // Create formatted text version (same as copy)
    const paths = careerPaths;
    let formattedText = "# Career Recommendations\n\n";
    
    paths.forEach((path, index) => {
      formattedText += `## ${index + 1}. ${path.title}\n`;
      formattedText += `### Overview\n${path.overview}\n\n`;
      formattedText += `### Why This Career Fits\n${path.whyFits}\n\n`;
      formattedText += `### Skills to Develop\n${path.skills}\n\n`;
      formattedText += `### 3–6 Month Learning Roadmap\n${path.roadmap}\n\n`;
      formattedText += `### Entry Strategies\n${path.entryStrategies}\n\n`;
      formattedText += `### 5-Year Career Growth Path\n${path.growthPath}\n\n`;
      
      if (index < paths.length - 1) {
        formattedText += "---\n\n";
      }
    });
    
    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'career_recommendation.txt';
    link.click();
    
    toast.success('Text file downloaded!');
  };

  // Handle download as PDF
  const downloadRecommendationAsPDF = () => {
    // Create temporary div for PDF
    const pdfContent = document.createElement('div');
    pdfContent.className = 'pdf-container';
    
    // Create header with title
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.innerHTML = `
      <h1>Career Recommendation Report</h1>
      <div class="pdf-date">Generated on ${new Date().toLocaleDateString()}</div>
    `;
    pdfContent.appendChild(header);
    
    // Add user profile
    if (userData) {
      const userProfile = document.createElement('div');
      userProfile.className = 'pdf-user-profile';
      userProfile.innerHTML = `
        <h2>Your Profile</h2>
        <div class="profile-details">
          <p><strong>Education Level:</strong> ${userData.education || 'Bachelor\'s in Computer Science'}</p>
          <p><strong>Personality Type:</strong> INTJ</p>
          <p><strong>Interests:</strong> technology, problem-solving, innovation</p>
          <p><strong>Strengths:</strong> critical thinking, strategic planning</p>
        </div>
      `;
      pdfContent.appendChild(userProfile);
    }
    
    // Add summary section
    const summarySection = document.createElement('div');
    summarySection.className = 'pdf-summary-section';
    summarySection.innerHTML = `
      <h2>Career Recommendations Summary</h2>
      <p>Based on your profile, we've identified the following career paths that align with your skills, 
      interests, and personality. The recommendations are ranked by match score with the top recommendation 
      representing the strongest alignment with your profile.</p>
    `;
    pdfContent.appendChild(summarySection);
    
    // Add career paths
    const paths = careerPaths;
    if (paths.length > 0) {
      paths.forEach((path, index) => {
        const pathElement = document.createElement('div');
        pathElement.className = 'pdf-career-path';
        
        // Add best fit badge if applicable
        const bestFitBadge = path.isBestFit ? 
          '<span class="best-fit-badge">Best Match</span>' : '';
        
        pathElement.innerHTML = `
          <h2>${index + 1}. ${path.title} ${bestFitBadge}</h2>
          
          <h3>Overview</h3>
          <div class="path-section">${formatContentForPDF(path.overview)}</div>
          
          <h3>Why This Career Fits</h3>
          <div class="path-section">${formatContentForPDF(path.whyFits)}</div>
          
          <h3>Skills to Develop</h3>
          <div class="path-section">${formatContentForPDF(path.skills)}</div>
          
          <h3>Learning Roadmap</h3>
          <div class="path-section">${formatContentForPDF(path.roadmap)}</div>
          
          <h3>Entry Strategies</h3>
          <div class="path-section">${formatContentForPDF(path.entryStrategies)}</div>
          
          <h3>Career Growth Path</h3>
          <div class="path-section">${formatContentForPDF(path.growthPath)}</div>
        `;
        pdfContent.appendChild(pathElement);
      });
    }
    
    // Add footer
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.innerHTML = `
      <p>This recommendation is based on your profile data and AI analysis.</p>
      <p>© ${new Date().getFullYear()} Career Guidance System</p>
    `;
    pdfContent.appendChild(footer);
    
    // Apply styling
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.color = '#333';
    pdfContent.style.padding = '20px';
    
    // Append to document (hidden)
    pdfContent.style.position = 'absolute';
    pdfContent.style.left = '-9999px';
    document.body.appendChild(pdfContent);
    
    // PDF options
    const options = {
      margin: 10,
      filename: 'career_recommendation.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate PDF
    html2pdf().from(pdfContent).set(options).save().then(() => {
      document.body.removeChild(pdfContent);
      toast.success('PDF downloaded successfully!');
    });
  };

  // Format content for PDF
  const formatContentForPDF = (content) => {
    if (!content) return '';
    
    let formattedContent = content
      .replace(/\n- /g, '<li>')
      .replace(/\n/g, '<br>');
    
    if (formattedContent.includes('<li>')) {
      formattedContent = formattedContent.replace(/(<li>.*?)(?=<li>|$)/g, '$1</li>');
      formattedContent = `<ul>${formattedContent}</ul>`;
    }
    
    return formattedContent;
  };

// Handle regenerate recommendation
const regenerateRecommendation = () => {
  getCareerRecommendation();
  toast.info('Regenerating career recommendation...');
  
  // Animation for regeneration
  if (cardRef.current) {
    gsap.fromTo(
      cardRef.current,
      { opacity: 0.7, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.3)" }
    );
  }
  
  // Reset animation states
  setAnimateSkills(false);
  setTimeout(() => {
    setAnimateSkills(true);
  }, 1000);
};

// Handle save recommendation
const saveRecommendation = () => {
  localStorage.setItem('careerRecommendation', JSON.stringify(recommendation));
  
  // Save animation
  const saveButton = document.querySelector('.save-button');
  if (saveButton) {
    gsap.fromTo(
      saveButton,
      { scale: 1 },
      { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: "power1.inOut" }
    );
  }
  
  toast.success('Recommendation saved!');
};

// Switch to a different career path
const switchCareerPath = (index) => {
  setActivePathIndex(index);
  
  // Animate path switch
  const pathElements = document.querySelectorAll('.career-path-card');
  if (pathElements.length > 0) {
    gsap.fromTo(
      '.career-path-card',
      { opacity: 0.7, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );
  }
  
  // Reset animation states for the new path
  setAnimateSkills(false);
  setTimeout(() => {
    setAnimateSkills(true);
  }, 300);
};

// Toggle comparison mode
const toggleComparisonMode = () => {
  setShowComparisonMode(!showComparisonMode);
  
  // Reset compared paths if needed
  if (!showComparisonMode && comparedPaths.length < 2) {
    setComparedPaths([0, Math.min(1, careerPaths.length - 1)]);
  }
};

// Update comparison paths
const updateComparedPath = (index, pathIndex) => {
  const newComparedPaths = [...comparedPaths];
  newComparedPaths[index] = pathIndex;
  setComparedPaths(newComparedPaths);
};

// Switch to a different view
const switchView = (view) => {
  setCurrentView(view);
  
  // Animate view switch
  const contentElement = document.querySelector('.career-details-content');
  if (contentElement) {
    gsap.fromTo(
      contentElement,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );
  }
};

// Render skill proficiency bar
const renderSkillBar = (skill, index) => {
  const proficiencyPercent = (skill.proficiency / 5) * 100;
  
  return (
    <div className="skill-progress" key={index}>
      <div className="skill-progress-header">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-level">{skill.proficiency}/5</span>
      </div>
      <div className="skill-progress-bar">
        <div 
          className="skill-progress-bar-fill"
          data-percent={proficiencyPercent}
          style={{
            width: animateSkills ? `${proficiencyPercent}%` : '0%',
            backgroundColor: getColorForProficiency(skill.proficiency)
          }}
        />
      </div>
      {skill.description && (
        <div className="skill-description">{skill.description}</div>
      )}
    </div>
  );
};

// Get color based on proficiency level
const getColorForProficiency = (level) => {
  const colors = [
    '#ff4d4d', // Level 1 (Red)
    '#ffa64d', // Level 2 (Orange)
    '#ffdb4d', // Level 3 (Yellow)
    '#4dff88', // Level 4 (Light Green)
    '#4d99ff'  // Level 5 (Blue)
  ];
  
  return colors[level - 1] || colors[2]; // Default to middle level if invalid
};

// Render roadmap timeline
const renderRoadmapTimeline = (roadmapSteps) => {
  if (!roadmapSteps || roadmapSteps.length === 0) return null;

  return (
    <div className="roadmap-timeline" ref={timelineRef}>
      {roadmapSteps.map((step, index) => (
        <div className="timeline-item" key={index}>
          <div className="timeline-marker">
            <div className="timeline-marker-inner" />
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <span className="timeline-period">Month {step.startMonth}–{step.endMonth}</span>
              {step.resources.map((resource, resourceIndex) => (
                <h4 key={resourceIndex} className="timeline-title">
                  {resource.title}{resourceIndex < step.resources.length - 1 ? ',' : ''}
                </h4>
              ))}
            </div>
            <p className="timeline-description">{step.description}</p>
            <div className="resources-links">
              {step.resources.map((resource, resourceIndex) => (
                  <a 
                    key={resourceIndex} 
                    href={resource.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timeline-resource"
                  >
                    <FiBookOpen/> {resource.url}
                  </a>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Render career growth chart
const renderCareerGrowth = (growthSteps) => {
  if (!growthSteps || growthSteps.length === 0) return null;
  
  return (
    <div className="career-growth-chart">
      <div className="growth-timeline">
        {growthSteps.map((step, index) => (
          <div className="growth-step" key={index}>
            <div className="growth-year">
              {step.startYear === step.endYear ? 
                `Year ${step.startYear}` : 
                `Years ${step.startYear}–${step.endYear}`}
            </div>
            <div className="growth-milestone">
              <div className="growth-marker" />
              <div className="growth-content">
                <div className="growth-description">{step.description}</div>
                {step.salary && (
                  <div className="growth-salary">
                    Expected salary: ${step.salary.min.toLocaleString()}–${step.salary.max.toLocaleString()} USD/year
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Render entry strategies
const renderEntryStrategies = (entryText) => {
  if (!entryText) return null;
  
  const strategies = extractBulletPoints(entryText);
  
  return (
    <div className="entry-strategies">
      {strategies.map((strategy, index) => {
        // Parse strategy text to extract role title and description
        const roleTitleMatch = strategy.match(/^.*?:(.*?)–(.*)/);
        let roleTitle = '';
        let roleDescription = strategy;
        
        if (roleTitleMatch) {
          roleTitle = roleTitleMatch[1].trim();
          roleDescription = roleTitleMatch[2].trim();
        }
        
        return (
          <div className="entry-strategy" key={index}>
            <div className="strategy-number">{index + 1}</div>
            <div className="strategy-content">
              {roleTitle && <h4 className="strategy-title">{roleTitle}</h4>}
              <p className="strategy-description">{roleDescription}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Render comparison view
const renderComparisonView = () => {
  if (!showComparisonMode || careerPaths.length < 2) return null;
  
  const path1 = careerPaths[comparedPaths[0]];
  const path2 = careerPaths[comparedPaths[1]];
  
  if (!path1 || !path2) return null;
  
  switch (comparisonCategory) {
    case 'overview':
      return (
        <div className="comparison-container">
          <div className="comparison-header">
            <h3>Overview Comparison</h3>
            <p>Compare general information and fit for each career path</p>
          </div>
          
          <div className="comparison-content">
            <div className="comparison-column">
              <h4>{path1.title}</h4>
              <div className="comparison-card">
                <h5>Overview</h5>
                {renderFormattedContent(path1.overview)}
              </div>
              <div className="comparison-card">
                <h5>Why This Fits You</h5>
                {renderFormattedContent(path1.whyFits)}
              </div>
              <div className="match-score">
                <div className="match-score-value">{path1.matchScore}%</div>
                <div className="match-score-label">Match Score</div>
              </div>
            </div>
            
            <div className="comparison-column">
              <h4>{path2.title}</h4>
              <div className="comparison-card">
                <h5>Overview</h5>
                {renderFormattedContent(path2.overview)}
              </div>
              <div className="comparison-card">
                <h5>Why This Fits You</h5>
                {renderFormattedContent(path2.whyFits)}
              </div>
              <div className="match-score">
                <div className="match-score-value">{path2.matchScore}%</div>
                <div className="match-score-label">Match Score</div>
              </div>
            </div>
          </div>
        </div>
      );
      
    case 'skills':
      return (
        <div className="comparison-container">
          <div className="comparison-header">
            <h3>Skills Comparison</h3>
            <p>Compare required skills for each career path</p>
          </div>
          
          <div className="comparison-content">
            <div className="comparison-column">
              <h4>{path1.title}</h4>
              <div className="comparison-card skills-card" ref={chartsRef}>
                {path1.skillsList.map((skill, index) => renderSkillBar(skill, index))}
              </div>
            </div>
            
            <div className="comparison-column">
              <h4>{path2.title}</h4>
              <div className="comparison-card skills-card">
                {path2.skillsList.map((skill, index) => renderSkillBar(skill, index))}
              </div>
            </div>
          </div>
        </div>
      );
      
    case 'growth':
      return (
        <div className="comparison-container">
          <div className="comparison-header">
            <h3>Career Growth Comparison</h3>
            <p>Compare 5-year growth trajectories and salary expectations</p>
          </div>
          
          <div className="comparison-content">
            <div className="comparison-column">
              <h4>{path1.title}</h4>
              <div className="comparison-card">
                {renderCareerGrowth(path1.growthSteps)}
              </div>
            </div>
            
            <div className="comparison-column">
              <h4>{path2.title}</h4>
              <div className="comparison-card">
                {renderCareerGrowth(path2.growthSteps)}
              </div>
            </div>
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

// Render career paths
const renderCareerPaths = () => {
  if (showComparisonMode) {
    return (
      <div className="career-comparison-view">
        <div className="comparison-controls">
          <div className="comparison-paths-selector">
            <div className="comparison-path-select">
              <label>Path 1:</label>
              <select 
                value={comparedPaths[0]} 
                onChange={(e) => updateComparedPath(0, parseInt(e.target.value))}
              >
                {careerPaths.map((path, index) => (
                  <option key={index} value={index}>{path.title}</option>
                ))}
              </select>
            </div>
            
            <div className="comparison-path-select">
              <label>Path 2:</label>
              <select 
                value={comparedPaths[1]} 
                onChange={(e) => updateComparedPath(1, parseInt(e.target.value))}
              >
                {careerPaths.map((path, index) => (
                  <option key={index} value={index}>{path.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="comparison-category-tabs">
            <button 
              className={`category-tab ${comparisonCategory === 'overview' ? 'active' : ''}`}
              onClick={() => setComparisonCategory('overview')}
            >
              <FiTarget className="tab-icon" />
              Overview
            </button>
            <button 
              className={`category-tab ${comparisonCategory === 'skills' ? 'active' : ''}`}
              onClick={() => setComparisonCategory('skills')}
            >
              <FiAward className="tab-icon" />
              Skills
            </button>
            <button 
              className={`category-tab ${comparisonCategory === 'growth' ? 'active' : ''}`}
              onClick={() => setComparisonCategory('growth')}
            >
              <FiTrendingUp className="tab-icon" />
              Growth
            </button>
          </div>
          
          <button 
            className="exit-comparison-button"
            onClick={toggleComparisonMode}
          >
            Exit Comparison
          </button>
        </div>
        
        {renderComparisonView()}
      </div>
    );
  }
  
  const paths = careerPaths;
  if (!paths || paths.length === 0) return null;
  
  return (
    <div className="career-paths-container">
      <div className="career-paths-sidebar">
        <div className="career-paths-selector">
          {paths.map((path, index) => (
            <div 
              key={index}
              className={`career-path-selector ${activePathIndex === index ? 'active' : ''}`}
              onClick={() => switchCareerPath(index)}
            >
              {path.isBestFit && <div className="best-match-badge">Best Match</div>}
              <h3>{path.title}</h3>
              <div className="match-indicator">
                <div 
                  className="match-indicator-bar" 
                  style={{ width: `${path.matchScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {paths.length > 1 && (
          <button 
            className="compare-careers-button"
            onClick={toggleComparisonMode}
          >
            <FiBarChart2 className="button-icon" />
            Compare Careers
          </button>
        )}
      </div>
      
      <div className="career-content-container">
        <div className="career-path-card">
          <div className="career-path-header">
            <h2>{paths[activePathIndex].title}</h2>
            {paths[activePathIndex].isBestFit && (
              <div className="best-fit-tag">
                <FiStar className="best-fit-icon" />
                Best Match For Your Profile
              </div>
            )}
          </div>
          
          <div className="career-navigation-tabs">
            <button 
              className={`nav-tab ${currentView === 'overview' ? 'active' : ''}`}
              onClick={() => switchView('overview')}
            >
              <FiTarget className="tab-icon" />
              Overview
            </button>
            <button 
              className={`nav-tab ${currentView === 'skills' ? 'active' : ''}`}
              onClick={() => switchView('skills')}
            >
              <FiAward className="tab-icon" />
              Skills
            </button>
            <button 
              className={`nav-tab ${currentView === 'roadmap' ? 'active' : ''}`}
              onClick={() => switchView('roadmap')}
            >
              <FiClock className="tab-icon" />
              Learning Curve
            </button>
            <button 
              className={`nav-tab ${currentView === 'entry' ? 'active' : ''}`}
              onClick={() => switchView('entry')}
            >
              <FiLayers className="tab-icon" />
              Entry
            </button>
            <button 
              className={`nav-tab ${currentView === 'growth' ? 'active' : ''}`}
              onClick={() => switchView('growth')}
            >
              <FiTrendingUp className="tab-icon" />
              Growth
            </button>
          </div>
          
          <div className="career-details-content">
            {renderCareerDetails(paths[activePathIndex])}
          </div>
        </div>
      </div>
    </div>
  );
};

// Render career details based on current view
const renderCareerDetails = (careerPath) => {
  if (!careerPath) return null;
  
  switch (currentView) {
    case 'overview':
      return (
        <div className="career-overview">
          <div className="overview-section">
            <h3>Career Overview</h3>
            {renderFormattedContent(careerPath.overview)}
          </div>
          
          <div className="overview-section">
            <h3>Why {careerPath.title} Fits You</h3>
            {renderFormattedContent(careerPath.whyFits)}
          </div>
          
          <div className="career-match-score">
            <div className="match-score-ring">
              <svg viewBox="0 0 100 100" className="score-chart">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4f8fda"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 45 * careerPath.matchScore / 100} ${2 * Math.PI * 45 * (100 - careerPath.matchScore) / 100}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="match-score-value">{careerPath.matchScore}%</div>
            </div>
            <div className="match-score-label">Match Score</div>
            <div className="match-score-explanation">
              Based on your profile, personality type, and career goals
            </div>
          </div>
        </div>
      );
    case 'skills':
      return (
        <div className="career-skills" ref={chartsRef}>
          <h3>Skills to Develop</h3>
          <div className="skills-grid">
            {careerPath.skillsList.map((skill, index) => renderSkillBar(skill, index))}
          </div>
        </div>
      );
    case 'roadmap' :
      return (
        <div className="career-roadmap">
          <h3>3-6 Month Learning Curve</h3>
          <div className="roadmap-info">
            <div className="roadmap-commitment">
              <FiClock className="commitment-icon" />
              <span>Estimated weekly time commitment: 8-10 hours/week</span>
            </div>
          </div>
          {renderRoadmapTimeline(careerPath.roadmapSteps)}
        </div>
      );
    case 'entry':
      return (
        <div className="career-entry">
          <h3>Entry Strategies</h3>
          {renderEntryStrategies(careerPath.entryStrategies)}
        </div>
      );
    case 'growth':
      return (
        <div className="career-growth">
          <h3>5-Year Career Growth Path</h3>
          {renderCareerGrowth(careerPath.growthSteps)}
        </div>
      );
    default:
      return null;
  }
};

// Render formatted content
const renderFormattedContent = (content) => {
  if (!content) return null;
  
  const lines = content.split('\n');
  
  return (
    <div className="formatted-content">
      {lines.map((line, index) => {
        // Handle bullet points
        if (line.trim().startsWith('- ')) {
          return <li key={index}>{line.replace('- ', '')}</li>;
        }
        // Handle empty lines as spacing
        if (line.trim() === '') {
          return <div key={index} className="content-space"></div>;
        }
        // Regular text
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};

return (
  <div className="career-recommendation-container">
    <Navbar />
    {loading && (
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
          <div className="loading-circle"></div>
        </div>
        <p className="loading-text">Analyzing your profile and generating personalized career recommendations...</p>
        <p className="loading-subtext">This may take a moment while we match your skills and interests to optimal career paths.</p>
      </div>
    )}
    
    {error && (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={getCareerRecommendation} className="retry-button">
          <FiRefreshCw className="retry-icon" />
          Try Again
        </button>
      </div>
    )}

    {!loading && !error && careerPaths.length > 0 && (
      <div className="recommendation-container" ref={cardRef}>
        <div className="recommendation-header">
          <div className="header-content">
            <h2>Your AI-Generated Career Recommendation</h2>
            
            <div className="user-profile-summary">
              <div className="profile-item">
                <span className="profile-label">Personality:</span>
                <span className="profile-value">INTJ</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Education:</span>
                <span className="profile-value">Bachelor's in CS</span>
              </div>
              <div className="profile-item">
                <span className="profile-label">Experience:</span>
                <span className="profile-value">1 year</span>
              </div>
            </div>
          </div>
          
          <div className="action-buttons" ref={actionButtonsRef}>
            <button className="action-button save-button" onClick={saveRecommendation} title="Save Recommendation">
              <FiSave className="button-icon" /> Save
            </button>
            <button className="action-button copy-button" onClick={copyToClipboard} title="Copy to Clipboard">
              <FiCopy className="button-icon" /> Copy
            </button>
            <div className="download-dropdown">
              <button className="action-button download-button" title="Download Options">
                <FiDownload className="button-icon" /> Download
                <FiChevronDown className="dropdown-icon" />
              </button>
              <div className="download-options">
                <button onClick={downloadRecommendationAsText}>
                  <FiFileText className="option-icon" /> Text File
                </button>
                <button onClick={downloadRecommendationAsPDF}>
                  <FiFileText className="option-icon" /> PDF Report
                </button>
              </div>
            </div>
            <button className="action-button regenerate-button" onClick={regenerateRecommendation} title="Regenerate Recommendation">
              <FiRefreshCw className="button-icon" /> Regenerate
            </button>
          </div>
        </div>
        
        <div className="recommendation-content">
          {renderCareerPaths()}
        </div>
      </div>
    )}
  </div>
);
};

export default CareerRecommendation;