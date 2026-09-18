/**
 * Script to assign admin or driver custom claims to a Firebase user.
 * 
 * Usage:
 *   node scripts/set-admin-role.js <uid> <role: admin|driver|citizen>
 * 
 * Prerequisites:
 *   Set GOOGLE_APPLICATION_CREDENTIALS pointing to your serviceAccountKey.json
 *   or run on a machine authorized with gcloud / firebase.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const args = process.argv.slice(2);
const uid = args[0];
const role = args[1] || 'admin';

if (!uid) {
  console.error('Usage: node scripts/set-admin-role.js <uid> [admin|driver|citizen]');
  process.exit(1);
}

// Check for service account key file
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
} else {
  console.log('No serviceAccountKey.json found. Initializing with default application credentials...');
  initializeApp();
}

const auth = getAuth();
const db = getFirestore();

async function setRole() {
  try {
    // 1. Set Firebase Auth Custom Claims
    await auth.setCustomUserClaims(uid, { role });
    console.log(`Successfully set custom claim { role: "${role}" } for user: ${uid}`);

    // 2. Update Firestore user document
    const userRef = db.collection('users').doc(uid);
    await userRef.set({ role, updatedAt: new Date() }, { merge: true });
    console.log(`Successfully updated Firestore users/${uid} document with role: "${role}"`);

    console.log('\nDone! The user will receive their new permissions on next token refresh/login.');
  } catch (err) {
    console.error('Failed to set role:', err);
    process.exit(1);
  }
}

setRole();
