/**
 * Seed script to populate mock incidents, fleet vehicles, and drivers in Firestore.
 * 
 * Usage:
 *   node scripts/seed-data.js
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
} else {
  initializeApp();
}

const db = getFirestore();

const mockDrivers = [
  {
    name: 'Rajesh Sharma',
    driverName: 'Rajesh Sharma',
    phone: '+91 98112 34567',
    licenseNumber: 'DL-0420180045231',
    shift: 'Morning (06:00 - 14:00)',
    status: 'available',
    currentLatitude: 28.6139,
    currentLongitude: 77.2090,
    rating: 4.9,
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    name: 'Vikram Singh',
    driverName: 'Vikram Singh',
    phone: '+91 98223 45678',
    licenseNumber: 'DL-0420190089123',
    shift: 'Afternoon (14:00 - 22:00)',
    status: 'available',
    currentLatitude: 28.6219,
    currentLongitude: 77.2190,
    rating: 4.8,
    createdAt: FieldValue.serverTimestamp(),
  },
];

const mockVehicles = [
  {
    vehicleNumber: 'DL-01-AX-4412',
    type: 'Heavy Compactor Truck',
    capacity: '10 Ton',
    fuelType: 'Electric (BEV)',
    driverName: 'Rajesh Sharma',
    status: 'available',
    currentLatitude: 28.6150,
    currentLongitude: 77.2100,
    batteryOrFuelLevel: 88,
    telemetryOnline: true,
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    vehicleNumber: 'DL-01-CZ-8921',
    type: 'Medium Tipper Truck',
    capacity: '6 Ton',
    fuelType: 'CNG Clean Fuel',
    driverName: 'Vikram Singh',
    status: 'available',
    currentLatitude: 28.6250,
    currentLongitude: 77.2150,
    batteryOrFuelLevel: 74,
    telemetryOnline: true,
    createdAt: FieldValue.serverTimestamp(),
  },
];

const mockReports = [
  {
    wasteType: 'Overflowing Public Bin',
    priority: 'high',
    status: 'verified',
    description: 'Commercial market primary dumpster completely overflowing onto pedestrian sidewalk.',
    location: {
      address: 'Connaught Place Outer Circle, Block C, New Delhi',
      lat: 28.6328,
      lng: 77.2197,
    },
    photoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80',
    createdAt: FieldValue.serverTimestamp(),
    submittedAt: FieldValue.serverTimestamp(),
  },
  {
    wasteType: 'Illegal Dump Site',
    priority: 'critical',
    status: 'pending_verification',
    description: 'Construction debris and mixed bulk plastic dumped near storm runoff canal.',
    location: {
      address: 'Barakhamba Road Junction, Ward 12, New Delhi',
      lat: 28.6270,
      lng: 77.2280,
    },
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80',
    createdAt: FieldValue.serverTimestamp(),
    submittedAt: FieldValue.serverTimestamp(),
  },
  {
    wasteType: 'Bulk Appliance / Furniture',
    priority: 'medium',
    status: 'verified',
    description: 'Discarded industrial refrigeration unit and broken wooden palettes.',
    location: {
      address: 'Janpath Lane, Near Metro Gate 3, New Delhi',
      lat: 28.6210,
      lng: 77.2180,
    },
    photoUrl: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80',
    createdAt: FieldValue.serverTimestamp(),
    submittedAt: FieldValue.serverTimestamp(),
  },
];

async function seed() {
  console.log('Seeding demo data into Firestore...');

  for (const driver of mockDrivers) {
    const ref = await db.collection('drivers').add(driver);
    await ref.update({ driverId: ref.id });
    console.log(`Added driver: ${driver.name} (${ref.id})`);
  }

  for (const vehicle of mockVehicles) {
    const ref = await db.collection('vehicles').add(vehicle);
    await ref.update({ vehicleId: ref.id });
    console.log(`Added vehicle: ${vehicle.vehicleNumber} (${ref.id})`);
  }

  for (const report of mockReports) {
    const ref = await db.collection('wasteReports').add(report);
    await ref.update({ reportId: ref.id });
    console.log(`Added report: ${report.wasteType} (${ref.id})`);
  }

  console.log('Seeding completed successfully!');
}

seed().catch(console.error);
