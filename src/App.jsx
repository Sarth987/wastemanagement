import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportWastePage from './pages/citizen/ReportWastePage';
import MyReportsPage from './pages/citizen/MyReportsPage';
import ReportDetailsPage from './pages/citizen/ReportDetailsPage';
import NotificationsPage from './pages/citizen/NotificationsPage';
import ProfilePage from './pages/citizen/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminReportDetailsPage from './pages/admin/AdminReportDetailsPage';
import AdminLiveMapPage from './pages/admin/AdminLiveMapPage';
import AdminRoutesPage from './pages/admin/AdminRoutesPage';
import AdminFleetPage from './pages/admin/AdminFleetPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminDriversPage from './pages/admin/AdminDriversPage';
import AdminVehiclesPage from './pages/admin/AdminVehiclesPage';

// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverRoutesPage from './pages/driver/DriverRoutesPage';
import DriverRouteDetailsPage from './pages/driver/DriverRouteDetailsPage';
import DriverProfilePage from './pages/driver/DriverProfilePage';

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="w-full pt-20 bg-surface min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

function CitizenLayout({ children }) {
  return (
    <>
      <Header />
      <main className="w-full pt-20 bg-surface min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

function DriverLayout({ children }) {
  return (
    <>
      <Header />
      <main className="w-full pt-20 bg-surface min-h-screen">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
            },
          }}
        />
        <Routes>
          {/* ─── Public Routes ─── */}
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPasswordPage /></PublicLayout>} />

          {/* ─── Citizen Routes ─── */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenLayout><CitizenDashboard /></CitizenLayout>
            </ProtectedRoute>
          } />
          <Route path="/report-waste" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenLayout><ReportWastePage /></CitizenLayout>
            </ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenLayout><MyReportsPage /></CitizenLayout>
            </ProtectedRoute>
          } />
          <Route path="/report/:id" element={
            <ProtectedRoute allowedRoles={['citizen', 'admin']}>
              <CitizenLayout><ReportDetailsPage /></CitizenLayout>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenLayout><NotificationsPage /></CitizenLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <CitizenLayout><ProfilePage /></CitizenLayout>
            </ProtectedRoute>
          } />

          {/* ─── Admin Routes ─── */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="reports/:id" element={<AdminReportDetailsPage />} />
            <Route path="map" element={<AdminLiveMapPage />} />
            <Route path="routes" element={<AdminRoutesPage />} />
            <Route path="fleet" element={<AdminFleetPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="drivers" element={<AdminDriversPage />} />
            <Route path="vehicles" element={<AdminVehiclesPage />} />
          </Route>

          {/* ─── Driver Routes ─── */}
          <Route path="/driver/dashboard" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout><DriverDashboard /></DriverLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/routes" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout><DriverRoutesPage /></DriverLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/route/:id" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout><DriverRouteDetailsPage /></DriverLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/profile" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverLayout><DriverProfilePage /></DriverLayout>
            </ProtectedRoute>
          } />

          {/* ─── Catch-all ─── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
