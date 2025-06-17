import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import MyCourses from './pages/dashboard/MyCourses';
import MyCertificates from './pages/dashboard/MyCertificates';
import ProfilePage from './pages/dashboard/ProfilePage';
import CoursesPage from './pages/courses/CoursesPage';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CourseManagement from './pages/instructor/CourseManagement';
import EarningsAnalytics from './pages/instructor/EarningsAnalytics';
import StudentManagement from './pages/instructor/StudentManagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import CourseLearningPage from './pages/courses/CourseLearningPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ 
  children, 
  roles 
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="courses"
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
          <Route
            path="learn/:courseId"
            element={
              <ProtectedRoute>
                <CourseLearningPage />
              </ProtectedRoute>
            }
          />
          
          {/* Instructor Routes */}
          <Route 
            path="instructor/dashboard" 
            element={
              <ProtectedRoute roles={['INSTRUCTOR']}>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="admin/dashboard" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </ProtectedRoute>
            } 
          />

          {/* Student Routes */}
          <Route
            path="my-courses"
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="my-certificates"
            element={
              <ProtectedRoute>
                <MyCertificates />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes */}
          <Route
            path="instructor-dashboard"
            element={
              <ProtectedRoute>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="course-management"
            element={
              <ProtectedRoute>
                <CourseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="earnings-analytics"
            element={
              <ProtectedRoute>
                <EarningsAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="student-management"
            element={
              <ProtectedRoute>
                <StudentManagement />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Placeholder Routes */}
          <Route path="wishlist" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Wishlist</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
          <Route path="settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;