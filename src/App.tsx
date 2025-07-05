import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DocumentProvider } from './contexts/DocumentContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import DocumentViewer from './pages/DocumentViewer';
import PublicSignPage from './pages/PublicSignPage';
import AuditTrailPage from './pages/AuditTrailPage';
import ProfilePage from './pages/ProfilePage';
import { Toaster } from './components/ui/sonner';

// Loader component shown while auth status is being checked
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// ProtectedRoute ensures only logged-in users access children routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// PublicRoute redirects logged-in users away from login/register pages
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loader />;

  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              {/* Public signing link */}
              <Route path="/sign/:token" element={<PublicSignPage />} />

              {/* Protected routes wrapped in Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Default dashboard */}
                <Route index element={<Dashboard />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="documents" element={<Dashboard />} />
                <Route path="document/:id" element={<DocumentViewer />} />
                <Route path="audit" element={<AuditTrailPage />} />
                <Route path="audit/:documentId" element={<AuditTrailPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Redirect unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </DocumentProvider>
    </AuthProvider>
  );
}

export default App;
