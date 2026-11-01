const PROFILE_SESSION_KEY = 'userData';
const AI_RESULT_PREFIX = 'aiResult:';

export const getSessionProfile = () => {
  try {
    const rawProfile = sessionStorage.getItem(PROFILE_SESSION_KEY);
    if (!rawProfile) return null;

    const profile = JSON.parse(rawProfile);
    return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : null;
  } catch {
    // A malformed cache must never block the application. It will be replaced
    // by the next successful profile request.
    sessionStorage.removeItem(PROFILE_SESSION_KEY);
    return null;
  }
};

export const setSessionProfile = (profile) => {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) return null;

  sessionStorage.setItem(PROFILE_SESSION_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('profile-updated'));
  return profile;
};

export const mergeSessionProfile = (updates) => {
  const currentProfile = getSessionProfile() || {};
  return setSessionProfile({ ...currentProfile, ...updates });
};

export const getSessionAiResult = (service) => {
  try {
    const rawResult = sessionStorage.getItem(`${AI_RESULT_PREFIX}${service}`);
    return rawResult ? JSON.parse(rawResult) : null;
  } catch {
    sessionStorage.removeItem(`${AI_RESULT_PREFIX}${service}`);
    return null;
  }
};

export const setSessionAiResult = (service, result) => {
  if (result === undefined || result === null) return null;
  try {
    sessionStorage.setItem(`${AI_RESULT_PREFIX}${service}`, JSON.stringify(result));
    return result;
  } catch (error) {
    // Session storage has a finite quota. The database remains the durable
    // source if an exceptionally large result cannot be cached in the tab.
    console.warn(`Unable to cache ${service} for this session.`, error);
    return null;
  }
};

export const clearSessionAiResults = () => {
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(AI_RESULT_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
};
