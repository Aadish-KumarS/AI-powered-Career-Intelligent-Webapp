import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiBarChart2, FiBookOpen, FiCompass, FiEdit2, FiMail, FiMapPin, FiUserCheck } from 'react-icons/fi';
import '../../styles/Global Styles/profile-theme.css';
import '../../styles/UserProfile Styles/UserProfile.css';
import Navbar from '../LandingPageComponents/Navbar';
import { getUserDetail } from '../../utils/helper';
import { API_BASE_URL } from '../../config/api';

const profileTabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'focus', label: 'Focus areas' },
  { id: 'tools', label: 'Career tools' },
];

export default function UserProfileView() {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    name: '',
    title: '',
    location: '',
    email: '',
    profileImage: '',
    interests: [],
    education: {
      highestLevel: '',
      institution: '',
      graduationYear: '',
      fieldOfStudy: '',
    },
  });
  const navigate = useNavigate();
  const token = sessionStorage.getItem('authToken');

  useEffect(() => {
    getUserDetail(token, navigate, API_BASE_URL, setUserData);
  }, [navigate, token]);

  const profileReadiness = useMemo(() => {
    const completedFields = [
      userData.name,
      userData.location,
      userData.education?.fieldOfStudy,
      userData.interests?.length,
    ].filter(Boolean).length;
    return Math.round((completedFields / 4) * 100);
  }, [userData]);

  const educationSummary = [
    userData.education?.fieldOfStudy,
    userData.education?.highestLevel,
  ].filter(Boolean).join(' · ');
  const initial = userData.name?.trim().charAt(0).toUpperCase() || 'U';
  const actions = [
    {
      icon: <FiCompass aria-hidden="true" />,
      title: 'Career guidance',
      copy: 'Discover directions that match the profile you have built.',
      to: '/services/career-guid/career-recommendation',
    },
    {
      icon: <FiBarChart2 aria-hidden="true" />,
      title: 'Career analysis',
      copy: 'See the skills, path signals, and market context that matter.',
      to: '/services/career-guid/career-analysis',
    },
    {
      icon: <FiBookOpen aria-hidden="true" />,
      title: 'Build a roadmap',
      copy: 'Turn a role goal into a paced plan you can follow.',
      to: '/services/generate-roadmap',
    },
  ];

  const renderPanel = () => {
    if (activeTab === 'focus') {
      return (
        <section className="profile-content-card profile-focus-panel" id="focus-panel" role="tabpanel">
          <div className="profile-section-heading">
            <p className="profile-eyebrow">What you have told us</p>
            <h2>Focus areas</h2>
            <p>Your interests help the career services adapt their suggestions to you.</p>
          </div>
          {userData.interests?.length ? (
            <div className="profile-interest-cloud" aria-label="Your interests">
              {userData.interests.map((interest) => <span key={interest}>{interest}</span>)}
            </div>
          ) : (
            <div className="profile-empty-note">
              <FiUserCheck aria-hidden="true" />
              <p>Add a few interests to make your recommendations more specific.</p>
              <button type="button" onClick={() => navigate('/profile/edit-profile')}>Add interests <FiArrowUpRight aria-hidden="true" /></button>
            </div>
          )}
          <div className="focus-guidance">
            <strong>Useful next move</strong>
            <p>Keep your interests and education current before generating a new recommendation or analysis.</p>
            <button type="button" className="text-action" onClick={() => navigate('/profile/edit-profile')}>Edit profile <FiEdit2 aria-hidden="true" /></button>
          </div>
        </section>
      );
    }

    if (activeTab === 'tools') {
      return (
        <section className="profile-content-card profile-tools-panel" id="tools-panel" role="tabpanel">
          <div className="profile-section-heading">
            <p className="profile-eyebrow">Ready when you are</p>
            <h2>Put your profile to work.</h2>
            <p>Each tool uses your saved information to make its output more relevant.</p>
          </div>
          <div className="profile-action-grid">
            {actions.map(({ icon, title, copy, to }) => (
              <button type="button" className="profile-action-card" key={title} onClick={() => navigate(to)}>
                <span className="profile-action-icon">{icon}</span>
                <span className="profile-action-copy">
                  <strong>{title}</strong>
                  <small>{copy}</small>
                </span>
                <FiArrowUpRight className="profile-action-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      );
    }

    return (
      <section className="profile-content-card profile-details-panel" id="profile-panel" role="tabpanel">
        <div className="profile-section-heading">
          <p className="profile-eyebrow">Your foundation</p>
          <h2>Profile details</h2>
          <p>A clear record of the information guiding your career experience.</p>
        </div>
        <div className="profile-details-grid">
          <article className="profile-detail-card">
            <FiMapPin aria-hidden="true" />
            <span>Location</span>
            <strong>{userData.location || 'Not added yet'}</strong>
          </article>
          <article className="profile-detail-card">
            <FiBookOpen aria-hidden="true" />
            <span>Education</span>
            <strong>{educationSummary || 'Not added yet'}</strong>
            {userData.education?.institution && <small>{userData.education.institution}</small>}
          </article>
          <article className="profile-detail-card">
            <FiMail aria-hidden="true" />
            <span>Email</span>
            <strong>{userData.email || 'Not available'}</strong>
          </article>
        </div>
        <div className="profile-detail-footer">
          <span>{userData.interests?.length || 0} saved interest{userData.interests?.length === 1 ? '' : 's'}</span>
          <button type="button" className="text-action" onClick={() => navigate('/profile/edit-profile')}>Update details <FiEdit2 aria-hidden="true" /></button>
        </div>
      </section>
    );
  };

  return (
    <div className="view-profile-container">
      <Navbar variant="app" />
      <main className="profile-workspace">
        <section className="profile-hero">
          <div className="profile-identity">
            <div className="profile-avatar" aria-label={`${userData.name || 'User'} profile image`}>
              {userData.profileImage ? <img src={userData.profileImage} alt="Profile" /> : <span>{initial}</span>}
            </div>
            <div>
              <p className="profile-eyebrow">Career profile</p>
              <h1>{userData.name || 'Your profile'}</h1>
              <p className="profile-subtitle">{userData.title || 'The details that shape your career guidance.'}</p>
              <div className="profile-meta">
                {userData.location && <span><FiMapPin aria-hidden="true" /> {userData.location}</span>}
                {userData.education?.fieldOfStudy && <span><FiBookOpen aria-hidden="true" /> {userData.education.fieldOfStudy}</span>}
              </div>
            </div>
          </div>
          <aside className="profile-readiness" aria-label="Profile readiness">
            <div className="readiness-heading"><span>Profile readiness</span><strong>{profileReadiness}%</strong></div>
            <div className="readiness-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={profileReadiness}>
              <span style={{ width: `${profileReadiness}%` }} />
            </div>
            <p>{profileReadiness === 100 ? 'Your essentials are ready for a more specific result.' : 'Complete the remaining essentials for sharper recommendations.'}</p>
            <button type="button" onClick={() => navigate('/profile/edit-profile')}>Edit profile <FiEdit2 aria-hidden="true" /></button>
          </aside>
        </section>

        <section className="profile-dashboard">
          <nav className="profile-tabs" role="tablist" aria-label="Profile workspace">
            {profileTabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          {renderPanel()}
        </section>
      </main>
    </div>
  );
}
