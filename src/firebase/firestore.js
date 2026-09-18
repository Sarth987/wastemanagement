import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

// ─── Generic Helpers ───

/**
 * Add a document with auto-generated ID.
 */
export async function addDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Set a document with a specific ID.
 */
export async function setDocument(collectionName, docId, data) {
  await setDoc(doc(db, collectionName, docId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get a single document by ID.
 */
export async function getDocument(collectionName, docId) {
  const docSnap = await getDoc(doc(db, collectionName, docId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Update specific fields in a document.
 */
export async function updateDocument(collectionName, docId, data) {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a document.
 */
export async function deleteDocument(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

/**
 * Query documents with filters.
 */
export async function queryDocuments(collectionName, conditions = [], sortBy = null, limitCount = null) {
  let q = collection(db, collectionName);
  const constraints = [];

  conditions.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator, value));
  });

  if (sortBy) {
    constraints.push(orderBy(sortBy.field, sortBy.direction || 'desc'));
  }

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  q = query(q, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Subscribe to real-time updates on a collection with filters.
 */
export function subscribeToCollection(collectionName, conditions = [], sortBy = null, callback) {
  let q = collection(db, collectionName);
  const constraints = [];

  conditions.forEach(({ field, operator, value }) => {
    constraints.push(where(field, operator, value));
  });

  if (sortBy) {
    constraints.push(orderBy(sortBy.field, sortBy.direction || 'desc'));
  }

  q = query(q, ...constraints);
  return onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(docs);
  });
}

/**
 * Subscribe to a single document.
 */
export function subscribeToDocument(collectionName, docId, callback) {
  return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
}

// ─── Waste Reports ───

export async function createWasteReport(reportData) {
  const reportId = await addDocument('wasteReports', {
    ...reportData,
    status: 'pending_verification',
    priority: reportData.priority || 'medium',
    assignedVehicleId: null,
    assignedDriverId: null,
    submittedAt: serverTimestamp(),
    verifiedAt: null,
    assignedAt: null,
    collectedAt: null,
    resolvedAt: null,
    adminNotes: '',
  });
  // Update reportId field
  await updateDoc(doc(db, 'wasteReports', reportId), { reportId });
  return reportId;
}

export async function getUserReports(userId) {
  return queryDocuments(
    'wasteReports',
    [{ field: 'userId', operator: '==', value: userId }],
    { field: 'createdAt', direction: 'desc' }
  );
}

export async function updateReportStatus(reportId, status, additionalData = {}) {
  const timestampFields = {};
  if (status === 'verified') timestampFields.verifiedAt = serverTimestamp();
  if (status === 'assigned') timestampFields.assignedAt = serverTimestamp();
  if (status === 'in_progress') timestampFields.collectedAt = serverTimestamp();
  if (status === 'resolved') timestampFields.resolvedAt = serverTimestamp();

  await updateDocument('wasteReports', reportId, {
    status,
    ...timestampFields,
    ...additionalData,
  });
}

// ─── Vehicles ───

export async function createVehicle(vehicleData) {
  const vehicleId = await addDocument('vehicles', {
    ...vehicleData,
    status: vehicleData.status || 'available',
    currentLatitude: null,
    currentLongitude: null,
    activeRouteId: null,
  });
  await updateDoc(doc(db, 'vehicles', vehicleId), { vehicleId });
  return vehicleId;
}

export async function getVehicles() {
  return queryDocuments('vehicles', [], { field: 'createdAt', direction: 'desc' });
}

// ─── Drivers ───

export async function createDriver(driverData) {
  const driverId = await addDocument('drivers', {
    ...driverData,
    status: driverData.status || 'available',
    currentLatitude: null,
    currentLongitude: null,
    activeRouteId: null,
  });
  await updateDoc(doc(db, 'drivers', driverId), { driverId });
  return driverId;
}

export async function getDrivers() {
  return queryDocuments('drivers', [], { field: 'createdAt', direction: 'desc' });
}

// ─── Routes ───

export async function createRoute(routeData) {
  const routeId = await addDocument('routes', {
    ...routeData,
    status: 'planned',
    startedAt: null,
    completedAt: null,
  });
  await updateDoc(doc(db, 'routes', routeId), { routeId });
  return routeId;
}

export async function getDriverRoutes(driverId) {
  return queryDocuments(
    'routes',
    [{ field: 'driverId', operator: '==', value: driverId }],
    { field: 'createdAt', direction: 'desc' }
  );
}

// ─── Notifications ───

export async function createNotification(notificationData) {
  return addDocument('notifications', {
    ...notificationData,
    read: false,
  });
}

export async function getUserNotifications(userId) {
  return queryDocuments(
    'notifications',
    [{ field: 'userId', operator: '==', value: userId }],
    { field: 'createdAt', direction: 'desc' }
  );
}

export async function markNotificationRead(notificationId) {
  await updateDocument('notifications', notificationId, { read: true });
}

// Re-export useful Firestore utilities
export { serverTimestamp, Timestamp, collection, doc, query, where, orderBy, limit, getDocs, onSnapshot };
