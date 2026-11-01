import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppState from '../../components/AppState';
import { clearSessionAiResults } from '../../utils/profileSession';

export default function GoogleAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token');

    if (!token) {
      navigate('/login?oauth=failed', { replace: true });
      return;
    }

    sessionStorage.removeItem('userData');
    clearSessionAiResults();
    sessionStorage.setItem('authToken', token);
    window.dispatchEvent(new Event('auth-updated'));
    window.history.replaceState({}, document.title, '/auth/google/callback');
    navigate('/profile/create-user-profile', { replace: true });
  }, [navigate]);

  return <AppState title="Finishing Google sign-in" description="Your secure session is being prepared." />;
}
