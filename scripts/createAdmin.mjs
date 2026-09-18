import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAfnQmhFcfb-2HeiPvXBZ-zRVuFdbtIo5A',
  authDomain: 'smart-waste-platform-9f926.firebaseapp.com',
  projectId: 'smart-waste-platform-9f926',
  storageBucket: 'smart-waste-platform-9f926.firebasestorage.app',
  messagingSenderId: '468825230098',
  appId: '1:468825230098:web:07a2b94128b0ac496f01cb',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'admin@smartwaste.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Municipal Administrator';

async function createAdmin() {
  let user;
  try {
    console.log(`Attempting to create user: ${ADMIN_EMAIL}...`);
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    user = cred.user;
    console.log(`User created successfully! UID: ${user.uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`User already exists, signing in to update profile...`);
      const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      user = cred.user;
      console.log(`Signed in successfully! UID: ${user.uid}`);
    } else {
      console.error('Error creating user:', err);
      process.exit(1);
    }
  }

  await updateProfile(user, { displayName: ADMIN_NAME });

  console.log(`Saving admin profile to Firestore...`);
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: '+919999999999',
      role: 'admin',
      photoURL: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    }, { merge: true });
    console.log('SUCCESS: Admin document written to Firestore with role="admin"!');
  } catch (dbErr) {
    console.error('Warning/Error writing to Firestore:', dbErr);
    console.log('If Firestore is offline or uninitialized, ensure Firestore is enabled in Firebase Console.');
  }

  process.exit(0);
}

createAdmin();
