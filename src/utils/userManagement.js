/**
 * User & Officer Profile Management for IRD Forced Registration Unit (FRU)
 * Password Protected with LocalStorage Persistence
 */

// Simple robust string hash helper for local client-side password hashing
export async function hashPassword(plainPassword) {
  if (!plainPassword) return '';
  const msgUint8 = new TextEncoder().encode(plainPassword + '_ird_novix_salt_2026');
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    let hash = 0;
    for (let i = 0; i < plainPassword.length; i++) {
      hash = (hash << 5) - hash + plainPassword.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }
}

export const DEFAULT_OFFICER_PROFILES = [];

const STORAGE_KEY_PROFILES = 'ird_fru_officer_profiles_v3';
const STORAGE_KEY_ACTIVE = 'ird_fru_active_officer_id_v3';
const STORAGE_KEY_AUTH_SESSION = 'ird_fru_auth_session_active_v3';

export function loadOfficerProfiles() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strip out any obsolete demo accounts
        const cleaned = parsed.filter(
          (p) =>
            p.username &&
            !['bandara', 'wickramasinghe', 'perera', 'jayawardena'].includes(p.username.toLowerCase())
        );
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed to load profiles from localStorage', e);
  }
  return [];
}

export function saveOfficerProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles to localStorage', e);
  }
}

export function getActiveOfficerProfile(profiles = []) {
  try {
    const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (activeId) {
      const found = profiles.find((p) => p.id === activeId);
      if (found) return found;
    }
  } catch (e) {
    console.error('Failed to get active profile from localStorage', e);
  }
  return profiles[0] || null;
}

export function setActiveOfficerProfileId(id) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  } catch (e) {
    console.error('Failed to set active profile in localStorage', e);
  }
}

export function isUserAuthenticated() {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTH_SESSION) === 'true';
  } catch (e) {
    return false;
  }
}

export function setAuthenticationSession(isAuthenticated) {
  try {
    if (isAuthenticated) {
      localStorage.setItem(STORAGE_KEY_AUTH_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
    }
  } catch (e) {
    console.error('Failed to update auth session', e);
  }
}

/**
 * Find and authenticate officer by Username, Service ID, or Email and Password
 */
export async function authenticateOfficerCredentials(profiles, identifier, inputPassword) {
  if (!identifier || !inputPassword) {
    return { success: false, error: 'Please enter both Username/Service ID and Password.' };
  }

  const cleanIdent = String(identifier).trim().toLowerCase();
  const officer = profiles.find((p) => {
    return (
      (p.username && p.username.toLowerCase() === cleanIdent) ||
      (p.serviceNo && p.serviceNo.toLowerCase() === cleanIdent) ||
      (p.email && p.email.toLowerCase() === cleanIdent) ||
      (p.name && p.name.toLowerCase() === cleanIdent) ||
      (p.id && p.id.toLowerCase() === cleanIdent)
    );
  });

  if (!officer) {
    return { success: false, error: 'Invalid Username or Service ID. Officer not found.' };
  }

  const hash = await hashPassword(inputPassword);
  const isValid = officer.passwordHash === hash;

  if (isValid) {
    return { success: true, officer };
  } else {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }
}
