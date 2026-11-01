/**
 * Unified Authentication & Database Service for IRD FRU
 * Supports Google Firebase (Auth + Cloud Firestore) with seamless Local Offline Fallback
 */

import { auth, db, isFirebaseConfigured, firebaseConfig } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

import {
  authenticateOfficerCredentials,
  saveOfficerProfiles,
  loadOfficerProfiles,
  hashPassword,
} from '../utils/userManagement';

/**
 * Returns active network mode: 'AIRGAP_OFFLINE' (RAMIS Intranet / No Internet) or 'FIREBASE_CLOUD'
 */
export function getNetworkMode() {
  const saved = localStorage.getItem('ird_network_mode');
  if (saved) return saved;
  // If Firebase is configured, default to cloud, otherwise default to airgap offline
  return isFirebaseConfigured() ? 'FIREBASE_CLOUD' : 'AIRGAP_OFFLINE';
}

/**
 * Switch network mode between 'AIRGAP_OFFLINE' and 'FIREBASE_CLOUD'
 */
export function setNetworkMode(mode) {
  const validMode = mode === 'AIRGAP_OFFLINE' ? 'AIRGAP_OFFLINE' : 'FIREBASE_CLOUD';
  localStorage.setItem('ird_network_mode', validMode);
  return validMode;
}

/**
 * Returns current Database status
 */
export function getDatabaseStatus() {
  const configured = isFirebaseConfigured();
  const mode = getNetworkMode();
  const isAirGap = mode === 'AIRGAP_OFFLINE';

  return {
    networkMode: mode,
    isAirGap,
    isCloud: !isAirGap && configured,
    type: isAirGap ? 'RAMIS_INTRANET_OFFLINE' : configured ? 'FIREBASE_CLOUD' : 'OFFLINE_LOCAL',
    provider: isAirGap ? 'RAMIS Intranet Local Engine (Offline / Air-Gapped)' : 'Google Firebase / Firestore',
    projectId: configured ? firebaseConfig.projectId : null,
    isConfigured: configured,
  };
}

/**
 * Login Officer using Firebase Auth + Firestore, or Local Profiles fallback
 * @param {string} identifier - Username, Service ID, or Email
 * @param {string} password - Officer Password
 * @param {Array} localProfiles - Local profiles array
 */
export async function authenticateOfficer(identifier, password, localProfiles = []) {
  if (!identifier || !password) {
    return { success: false, error: 'Please enter both Username/Service ID and Password.' };
  }

  const cleanIdent = String(identifier).trim();
  const mode = getNetworkMode();

  // If RAMIS Air-Gapped Intranet Mode or Firebase is NOT configured, use Local Secure Engine immediately
  if (mode === 'AIRGAP_OFFLINE' || !isFirebaseConfigured() || !auth || !db) {
    const localResult = await authenticateOfficerCredentials(localProfiles, cleanIdent, password);
    return {
      ...localResult,
      source: 'LOCAL_STORAGE',
      databaseNotice: 'RAMIS Intranet / Offline Local Storage Mode Active.',
    };
  }

  // --- FIREBASE CLOUD MODE ---
  try {
    let emailToAuth = cleanIdent;
    const noSpaceIdent = cleanIdent.toLowerCase().replace(/[^a-z0-9]/g, '');

    // If identifier is not an email (e.g. username 'NSD Alwis' or serviceNo 'intern'), lookup in Firestore
    if (!cleanIdent.includes('@')) {
      try {
        const officersRef = collection(db, 'officers');

        // Query by username (both with spaces and stripped)
        let snapUser = await getDocs(query(officersRef, where('username', '==', cleanIdent.toLowerCase())));
        if (snapUser.empty && noSpaceIdent) {
          snapUser = await getDocs(query(officersRef, where('username', '==', noSpaceIdent)));
        }

        if (!snapUser.empty) {
          const officerDoc = snapUser.docs[0].data();
          emailToAuth = officerDoc.email || `${noSpaceIdent}@ird.gov.lk`;
        } else {
          // Query by serviceNo
          let snapService = await getDocs(query(officersRef, where('serviceNo', '==', cleanIdent)));
          if (snapService.empty) {
            snapService = await getDocs(query(officersRef, where('serviceNo', '==', cleanIdent.toLowerCase())));
          }
          if (snapService.empty) {
            snapService = await getDocs(query(officersRef, where('serviceNo', '==', cleanIdent.toUpperCase())));
          }

          if (!snapService.empty) {
            const officerDoc = snapService.docs[0].data();
            emailToAuth = officerDoc.email || `${officerDoc.username || noSpaceIdent}@ird.gov.lk`;
          } else {
            emailToAuth = `${noSpaceIdent}@ird.gov.lk`;
          }
        }
      } catch (firestorePermErr) {
        // If unauthenticated Firestore read is restricted by security rules, fallback to generated official email
        console.warn('Firestore pre-auth lookup skipped due to rules:', firestorePermErr);
        emailToAuth = `${noSpaceIdent}@ird.gov.lk`;
      }
    }

    // Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, emailToAuth, password);
    const uid = userCredential.user.uid;

    // Fetch official profile from Firestore 'officers' collection
    let officerProfile = null;
    try {
      const officerDocRef = doc(db, 'officers', uid);
      const officerDocSnap = await getDoc(officerDocRef);

      if (officerDocSnap.exists()) {
        officerProfile = { id: officerDocSnap.id, ...officerDocSnap.data() };
        try {
          await updateDoc(officerDocRef, { lastLoginAt: new Date().toISOString() });
        } catch (err) {
          console.warn('Failed to update lastLoginAt in Firestore', err);
        }
      } else {
        // Create Firestore officer document if it doesn't exist yet
        officerProfile = {
          id: uid,
          uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || cleanIdent,
          username: cleanIdent.toLowerCase(),
          serviceNo: cleanIdent,
          designation: 'Senior Assessor / Assistant Commissioner',
          role: 'SENIOR_ASSESSOR',
          regionalOffice: 'Head Office - Forced Registration Unit, Colombo 02',
          regionalCode: 'HQ-FRU',
          phone: '',
          badgeColor: '#f59e0b',
          canApproveNotices: true,
          canEditRules: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        try {
          await setDoc(officerDocRef, officerProfile);
        } catch (writeErr) {
          console.warn('Firestore officer creation skipped due to rules:', writeErr);
        }
      }
    } catch (firestoreDocErr) {
      console.warn('Firestore doc read error:', firestoreDocErr);
      officerProfile = {
        id: uid,
        uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || cleanIdent,
        username: cleanIdent.toLowerCase(),
        serviceNo: cleanIdent,
        designation: 'Senior Assessor / Assistant Commissioner',
        role: 'SENIOR_ASSESSOR',
        regionalOffice: 'Head Office - Forced Registration Unit, Colombo 02',
        regionalCode: 'HQ-FRU',
        phone: '',
        badgeColor: '#f59e0b',
        canApproveNotices: true,
        canEditRules: true,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      success: true,
      officer: officerProfile,
      source: 'FIREBASE_CLOUD',
      databaseNotice: `Cloud Database Connected (${firebaseConfig.projectId})`,
    };
  } catch (firebaseError) {
    console.error('Firebase Auth Error:', firebaseError);

    // If on intranet / no internet or user exists locally, sign in via Local Profile seamlessly
    const localResult = await authenticateOfficerCredentials(localProfiles, cleanIdent, password);
    if (localResult.success) {
      return {
        ...localResult,
        source: 'LOCAL_FALLBACK',
        databaseNotice: 'RAMIS Intranet: Signed in via Local Profile (No Cloud Internet required).',
      };
    }

    let userFriendlyError = 'Authentication failed. Please check your credentials.';
    if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password') {
      userFriendlyError = 'Incorrect password or officer identifier.';
    } else if (firebaseError.code === 'auth/user-not-found') {
      userFriendlyError = 'Officer not found. If this is a new office PC, please switch to "Register Officer" to set up your account.';
    } else if (firebaseError.code === 'auth/network-request-failed' || firebaseError.message?.includes('network')) {
      userFriendlyError = 'RAMIS Intranet Network: Firebase cloud unreachable. Please click "Register Officer" to initialize your local account.';
    }

    return { success: false, error: userFriendlyError };
  }
}

/**
 * Register a new Officer in Firebase Auth + Firestore, and sync locally
 */
export async function registerNewOfficer(regData, localProfiles = []) {
  const cleanUsername = String(regData.username || regData.name.split(' ')[0] || 'officer')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const cleanEmail = regData.email?.trim() || `${cleanUsername}@ird.gov.lk`;
  const mode = getNetworkMode();

  // Local fallback object
  const passwordHash = await hashPassword(regData.password);
  const localOfficer = {
    id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
    username: cleanUsername,
    serviceNo: regData.serviceNo,
    name: regData.name,
    designation: regData.designation,
    role: regData.role,
    regionalOffice: regData.regionalOffice,
    regionalCode: regData.regionalCode,
    email: cleanEmail,
    phone: regData.phone,
    badgeColor: regData.badgeColor || '#f59e0b',
    passwordHash,
    defaultPlainPass: regData.password,
    canApproveNotices: true,
    canEditRules: regData.role === 'ADMIN' || regData.role === 'SENIOR_ASSESSOR',
    createdAt: new Date().toISOString(),
  };

  // If RAMIS Air-Gapped Intranet Mode or Firebase is NOT configured, save locally
  if (mode === 'AIRGAP_OFFLINE' || !isFirebaseConfigured() || !auth || !db) {
    const updated = [...localProfiles, localOfficer];
    saveOfficerProfiles(updated);
    return {
      success: true,
      officer: localOfficer,
      source: 'LOCAL_STORAGE',
      databaseNotice: 'Officer registered in Local Secure Storage (RAMIS Intranet / Air-Gapped Mode).',
    };
  }

  // --- FIREBASE CLOUD REGISTRATION ---
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, regData.password);
    const uid = userCredential.user.uid;

    const cloudOfficer = {
      ...localOfficer,
      id: uid,
      uid,
      email: cleanEmail,
    };

    // Save to Firestore 'officers' collection (non-blocking if rules not yet updated)
    try {
      await setDoc(doc(db, 'officers', uid), cloudOfficer);
    } catch (firestoreWriteErr) {
      console.warn('Firestore setDoc rule notice:', firestoreWriteErr);
    }

    // Also update local profiles cache
    const updated = [...localProfiles, cloudOfficer];
    saveOfficerProfiles(updated);

    return {
      success: true,
      officer: cloudOfficer,
      source: 'FIREBASE_CLOUD',
      databaseNotice: `Officer successfully registered in Firebase Cloud Database (${firebaseConfig.projectId})`,
    };
  } catch (firebaseError) {
    console.error('Firebase Registration Error:', firebaseError);

    // If network error (RAMIS Intranet with no public internet), gracefully save locally!
    if (
      firebaseError.code === 'auth/network-request-failed' ||
      firebaseError.code === 'auth/internal-error' ||
      firebaseError.message?.toLowerCase().includes('network')
    ) {
      const updated = [...localProfiles, localOfficer];
      saveOfficerProfiles(updated);
      return {
        success: true,
        officer: localOfficer,
        source: 'LOCAL_STORAGE',
        databaseNotice: 'RAMIS Intranet: Profile saved securely in Local Offline Database (No Internet required).',
      };
    }

    let err = firebaseError.message;
    if (firebaseError.code === 'auth/email-already-in-use') {
      try {
        // If already registered, attempt to authenticate immediately
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, regData.password);
        const uid = userCred.user.uid;
        const officerDocRef = doc(db, 'officers', uid);
        const officerDocSnap = await getDoc(officerDocRef);
        let officerProfile = null;
        if (officerDocSnap.exists()) {
          officerProfile = { id: officerDocSnap.id, ...officerDocSnap.data() };
        } else {
          officerProfile = {
            ...localOfficer,
            id: uid,
            uid,
            email: cleanEmail,
          };
          await setDoc(officerDocRef, officerProfile);
        }
        const updated = [...localProfiles, officerProfile];
        saveOfficerProfiles(updated);
        return {
          success: true,
          officer: officerProfile,
          source: 'FIREBASE_CLOUD',
          databaseNotice: 'ගිණුම සාර්ථකව හඳුනාගෙන පද්ධතියට පිවිසුණි (Signed In)!',
        };
      } catch (signInErr) {
        err = 'මෙම පරිශීලක නාමය (Username / Email) දැනටමත් Firebase හි ලියාපදිංචි වී ඇත. කරුණාකර "Officer Sign-In" Tab එක වෙත ගොස් Login වන්න.';
      }
    } else if (firebaseError.code === 'auth/weak-password') {
      err = 'Password should be at least 6 characters for security.';
    }

    return { success: false, error: err };
  }
}

/**
 * Fetch all officer profiles from Firestore (if configured)
 */
export async function fetchCloudOfficerProfiles() {
  if (!isFirebaseConfigured() || !db) return null;
  try {
    const officersRef = collection(db, 'officers');
    const snap = await getDocs(officersRef);
    if (!snap.empty) {
      const list = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    }
  } catch (err) {
    console.warn('Failed to load cloud officers from Firestore:', err);
  }
  return null;
}


