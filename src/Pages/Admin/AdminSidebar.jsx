import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Menu,
  BookOpen,
  PlusCircle,
  Users,
  GraduationCap,
  LogOut,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "../../hooks/useAuth";
import "../../styles/AdminSidebar.css";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    window.innerWidth < 1024
  );

  const logoutMutation = useLogout({
    onSuccess: () => {
      localStorage.removeItem("userRole");
      // Set to null so AuthProvider instantly sees user=null — no refetch, no loop
      queryClient.setQueryData(["auth", "me"], null);
      navigate("/");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      localStorage.removeItem("userRole");
      queryClient.setQueryData(["auth", "me"], null);
      navigate("/");
    },
  });

  // Detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-title">GEBI GUBAE</span>}

        <button
          className="collapse-btn"
          onClick={() => !isMobileOrTablet && setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          disabled={isMobileOrTablet}
          style={{
            cursor: isMobileOrTablet ? "not-allowed" : "pointer",
            opacity: isMobileOrTablet ? 0.5 : 1,
          }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Menu */}
      <ul className="sidebar-menu">
        <li
          onClick={() => navigate("/admin/courses")}
          className={isActive("/admin/courses") ? "active" : ""}
          title={collapsed ? "Courses" : ""}
        >
          <BookOpen size={20} />
          {!collapsed && <span>Courses</span>}
        </li>

        <li
          onClick={() => navigate("/admin/create-course")}
          className={isActive("/admin/create-course") ? "active" : ""}
          title={collapsed ? "Create Course" : ""}
        >
          <PlusCircle size={20} />
          {!collapsed && <span>Create Course</span>}
        </li>

        <li
          onClick={() => navigate("/admin/student-management")}
          className={isActive("/admin/student-management") ? "active" : ""}
          title={collapsed ? "Student Management" : ""}
        >
          <Users size={20} />
          {!collapsed && <span>Student Management</span>}
        </li>

        <li
          onClick={() => navigate("/admin/register-student")}
          className={isActive("/admin/register-student") ? "active" : ""}
          title={collapsed ? "Register Student" : ""}
        >
          <UserPlus size={20} />
          {!collapsed && <span>Register Student</span>}
        </li>

        <li
          onClick={() => navigate("/admin/Enroll-students")}
          className={isActive("/admin/Enroll-students") ? "active" : ""}
          title={collapsed ? "Enroll Students" : ""}
        >
          <GraduationCap size={20} />
          {!collapsed && <span>Enroll Students</span>}
        </li>

        <li
          onClick={() => navigate("/admin/analytics")}
          className={isActive("/admin/analytics") ? "active" : ""}
          title={collapsed ? "Analytics" : ""}
        >
          <BarChart3 size={20} />
          {!collapsed && <span>Analytics</span>}
        </li>
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
