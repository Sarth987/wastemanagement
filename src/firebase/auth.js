import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Register a new user with email and password.
 * Automatically creates a Firestore user profile with role = 'citizen'.
 */
export async function registerWithEmail(email, password, name, phone = '') {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name
  await updateProfile(user, { displayName: name });

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    name,
    email: user.email,
    phone,
    role: 'citizen', // Always citizen for public registration
    photoURL: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isActive: true,
  });

  return user;
}

/**
 * Sign in with email and password.
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Set up reCAPTCHA verifier for phone auth.
 */
export function setupRecaptcha(elementId) {
  const recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
  return recaptchaVerifier;
}

/**
 * Send OTP to phone number using Firebase Phone Authentication.
 */
export async function sendPhoneOTP(phoneNumber, appVerifier) {
  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
}

/**
 * Verify the OTP code.
 */
export async function verifyOTP(confirmationResult, otpCode) {
  const result = await confirmationResult.confirm(otpCode);
  const user = result.user;

  // Check if user doc exists, if not create one
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      phone: user.phoneNumber || '',
      role: 'citizen',
      photoURL: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });
  }

  return user;
}

/**
 * Sign out the current user.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Get user profile from Firestore.
 */
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
