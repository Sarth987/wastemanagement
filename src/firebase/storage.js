import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Validate file before upload.
 */
function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: PNG, JPG, WebP, HEIC.`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum: 25MB.`);
  }
}

/**
 * Upload a waste report photo.
 * Path: reports/{uid}/{reportId}/photo.jpg
 */
export async function uploadReportPhoto(uid, reportId, file, onProgress) {
  validateFile(file);

  const extension = file.name.split('.').pop() || 'jpg';
  const storagePath = `reports/${uid}/${reportId}/photo.${extension}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            photoUrl: downloadURL,
            photoPath: storagePath,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Upload a profile photo.
 * Path: profiles/{uid}/profile.jpg
 */
export async function uploadProfilePhoto(uid, file, onProgress) {
  validateFile(file);

  const extension = file.name.split('.').pop() || 'jpg';
  const storagePath = `profiles/${uid}/profile.${extension}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            photoURL: downloadURL,
            photoPath: storagePath,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(storagePath) {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
