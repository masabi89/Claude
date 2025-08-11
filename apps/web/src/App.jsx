import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public routes */}
              <Route index element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              
              {/* Protected routes */}
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              
              {/* Placeholder routes for future implementation */}
              <Route path="projects" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Projects Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              <Route path="tasks" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Tasks Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              <Route path="team" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Team Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Analytics Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              <Route path="admin" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Admin Panel</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Settings Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><div className="p-8 text-center"><h1 className="text-2xl font-bold">Profile Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div></ProtectedRoute>} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

