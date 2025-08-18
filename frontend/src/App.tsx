import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSession } from "./components/hooks/useSession";

// Import all page components
import LandingPage from "./components/citizen/landingpage";
import GrievanceSubmission from "./components/citizen/GrievanceSubmission";
import GrievanceTracking from './components/citizen/GrievanceTracking';
import CitizenLogin from "./components/citizen/CitizenLogin";
import CitizenDashboard from "./components/citizen/CitizenDashboard";
import GrievanceReopen from "./components/citizen/GrievanceReopen";
import OfficerLogin from "./components/officer/OfficerLogin";
import OfficerDashboard from './components/officer/OfficerDashboard';
import OfficerAnalytics from './components/officer/Analytics';
import OfficerGrievanceDetails from './components/officer/OfficerGrivanceDetails';
import AdminDashboard from "./components/admin/Dashboard";
import AdminAnalytics from "./components/admin/Analytics";

// Define a union type for user roles for better type safety
type UserRole = "citizen" | "officer" | "admin";

// Define the props interface for the ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;
  role: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  // useSession hook provides authentication state
  const { isAuthenticated, loading } = useSession(role);

  // Show a loading indicator while session is being verified
  if (loading) {
    return <div>Loading...</div>;
  }

  //Redirect to the landing page if the user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component if the user is authenticated
  return children;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/citizen/login" element={<CitizenLogin />} />
         {/* <Route path="/officer/login" element={<OfficerLogin />} /> */}
        <Route path="/submit" element={<GrievanceSubmission />} />
        <Route path="/track/:trackingId" element={<GrievanceTracking />} />
        <Route path="/officer/login" element={<OfficerLogin />} />
        <Route path="/submit" element={<GrievanceSubmission />} />

        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/citizen/reopen/:grievanceId"
          element={
            <ProtectedRoute role="citizen">
              <GrievanceReopen />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/officer/dashboard"
          element={
            <ProtectedRoute role="officer">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/officer/analytics"
          element={
            <ProtectedRoute role="officer">
              <OfficerAnalytics />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/officer/grievance/:grievanceId"
          element={
            <ProtectedRoute role="officer">
              <OfficerGrievanceDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute role="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route to redirect any unknown paths to the homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
