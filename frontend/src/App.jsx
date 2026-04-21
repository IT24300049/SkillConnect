import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import BookingsPage from './pages/BookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ReviewsPage from './pages/ReviewsPage';
import ComplaintsPage from './pages/ComplaintsPage';
import EquipmentPage from './pages/EquipmentPage';
import WorkersPage from './pages/WorkersPage';
import WorkerDetailPage from './pages/WorkerDetailPage';
import WorkerSchedulePage from './pages/WorkerSchedulePage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import AdminVerificationsPage from './pages/AdminVerificationsPage';

function AppLayout({ children }) {
    return (
        <div className="app-shell" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', width: '100%', flex: 1 }}>
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
            <Route path="/reset-password" element={user ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />} />
            <Route path="/about" element={<AppLayout><AboutPage /></AppLayout>} />
            <Route path="/privacy" element={<AppLayout><PrivacyPage /></AppLayout>} />
            <Route path="/terms" element={<AppLayout><TermsPage /></AppLayout>} />
            <Route path="/contact" element={<AppLayout><ContactPage /></AppLayout>} />

            {/* Protected routes wrapped in layout */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/workers" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><WorkersPage /></AppLayout></ProtectedRoute>} />
            <Route path="/workers/:id" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><WorkerDetailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/worker/schedule" element={<ProtectedRoute roles={['worker']}><AppLayout><WorkerSchedulePage /></AppLayout></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><JobsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/jobs/:id" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><JobDetailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><BookingsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><BookingDetailPage /></AppLayout></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><AppLayout><EquipmentPage /></AppLayout></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><ReviewsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute roles={['customer', 'worker', 'admin']}><AppLayout><ComplaintsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><AppLayout><MessagesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/messages/:threadId" element={<ProtectedRoute><AppLayout><MessagesPage /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminUsersPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminReportsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminComplaintsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/verifications" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminVerificationsPage /></AppLayout></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default App;
