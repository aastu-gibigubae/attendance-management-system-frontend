import { AuthContext, useAuth } from "./context/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "./App.css";

// Auth & Public Pages
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import AttendanceHandler from "./Pages/AttendanceHandler";

// Student Pages
import CourseList from "./Pages/Students/CourseList";
import CourseDetail from "./Pages/Students/CourseDetail";
import Settings from "./Pages/Students/Settings";
import RecordAttendanceModal from "./Components/RecordAttendanceModal";
import StudentLayout from "./Pages/Students/StudentLayout";

// Admin Layout & Pages
import AdminLayout from "./Pages/Admin/AdminLayout";
import CourseLists from "./Pages/Admin/CourseLists";
import CreateCourses from "./Pages/Admin/CreateCourses";
import CourseDetails from "./Pages/Admin/CourseDetails";
import StudentList from "./Pages/Admin/StudentList";
import EnrollmentManager from "./Pages/Admin/EnrollmentManager";
import AnalyticsOverview from "./Pages/Admin/AnalyticsOverview";
import RegisterStudent from "./Pages/Admin/RegisterStudent";

import ErrorBoundary from "./Components/ErrorBoundary";
import LoadingPage from "./Components/LoadingPage";
import { useGetMe } from "./hooks/useAuth";

// ─── Auth Provider ────────────────────────────────────────────────────────────
// useGetMe() runs ONCE here for the whole app. ProtectedRoute and PublicOnlyRoute
// read the result from context — no extra requests, no loading flashes.

const AuthProvider = ({ children }) => {
  const { data, isLoading, isError } = useGetMe();

  // Show loading ONCE on app start while we verify the session.
  // After this resolves it is cached forever (staleTime: Infinity)
  // so any route change is instant — no more flashing.
  if (isLoading) return <LoadingPage />;

  const user = data?.data ?? null; // null = not logged in

  return (
    <AuthContext.Provider value={{ user, isError }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Reads from context — zero extra network calls, zero loading states.

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  // Keep localStorage in sync for any component that still reads it
  if (user.role) localStorage.setItem("userRole", user.role);

  if (requiredRole === "admin") {
    if (user.role !== "admin" && user.role !== "super_admin") {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole) {
    if (user.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

// ─── PublicOnlyRoute ──────────────────────────────────────────────────────────
// Reads from context — if already logged in, redirect to dashboard instantly.

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();

  if (user?.role) {
    if (user.role === "admin" || user.role === "super_admin") {
      return <Navigate to="/admin/courses" replace />;
    }
    return <Navigate to="/student/courses" replace />;
  }

  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      <Router>
        {/* AuthProvider wraps the entire router so it runs once */}
        <AuthProvider>
          <Routes>
            {/* Public routes — redirect to dashboard if already logged in */}
            <Route path="/" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/signup" element={<PublicOnlyRoute><SignUp /></PublicOnlyRoute>} />

            {/* Attendance is fully public — accessed via QR code links */}
            <Route path="/attendance" element={<AttendanceHandler />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="courses" element={<CourseList />} />
              <Route path="course/:id" element={<CourseDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="attendance" element={<RecordAttendanceModal />} />
              <Route index element={<Navigate to="courses" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="courses" element={<CourseLists />} />
              <Route path="create-course" element={<CreateCourses />} />
              <Route path="course/:courseId" element={<CourseDetails />} />
              <Route path="student-management" element={<StudentList />} />
              <Route path="register-student" element={<RegisterStudent />} />
              <Route path="Enroll-students" element={<EnrollmentManager />} />
              <Route path="analytics" element={<AnalyticsOverview />} />
              <Route index element={<Navigate to="courses" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
