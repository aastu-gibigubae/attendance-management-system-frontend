import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
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

// Protected Route Component (string-only roles)
const ProtectedRoute = ({ children, requiredRole }) => {
  const userRole = localStorage.getItem("userRole");

  // Not logged in
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "admin") {
    if (userRole !== "admin" && userRole !== "super_admin") {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole) {
    if (userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Analytics />
      <Router>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/attendance" element={<AttendanceHandler />} />

          {/* --- Student Routes (Wrapped in Layout, protected) --- */}
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

          {/* --- Admin Routes (Wrapped in Layout, protected) --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested Routes - These render inside the <Outlet /> of AdminLayout */}
            <Route path="courses" element={<CourseLists />} />
            <Route path="create-course" element={<CreateCourses />} />
            <Route path="course/:courseId" element={<CourseDetails />} />
            <Route path="student-management" element={<StudentList />} />
            <Route path="register-student" element={<RegisterStudent />} />
            <Route path="Enroll-students" element={<EnrollmentManager />} />
            <Route path="analytics" element={<AnalyticsOverview />} />

            {/* Default redirect for /admin */}
            <Route index element={<Navigate to="courses" replace />} />
          </Route>

          {/* --- Fallback Route --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
