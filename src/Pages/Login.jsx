import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import "./Auth.css";
import ErrorPage from "../Components/ErrorPage";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Check for redirect parameter (for QR code deep linking)
  const redirectUrl = searchParams.get('redirect');

  // Use React Query mutation hook for login
  const { mutate: login, isPending, error, isError } = useLogin({
    onSuccess: (data) => {
      const role = data.data?.role;
      // Store role
      localStorage.setItem("userRole", role);

      // If there's a redirect URL (from QR code), go there
      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));
      } else {
        // Otherwise, navigate based on role
        if (role === "admin" || role === "super_admin") {
          navigate("/admin/courses");
        } else {
          navigate("/student/courses");
        }
      }
    },
  });
 
  // Clear any stale role when the login page mounts
  useEffect(() => {
    localStorage.removeItem("userRole");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Right Section - Welcome Card (moved to appear first) */}
        <div className="auth-welcome-section">
          <div className="welcome-card">
            <div className="logo-circle">
              <span className="logo-text">
                GIBI
                <br />
                GUBAE
              </span>
            </div>
            <h2 className="welcome-title">Welcome back!</h2>
            <p className="welcome-message">
              Log in to your account to access your courses, track attendance,
              and manage your academic progress. We're glad to see you again!
            </p>
          </div>
        </div>

        {/* Left Section - Form (moved to appear after welcome) */}
        <div className="auth-form-section">
          <div className="auth-form">
            <h1 className="auth-title">Login</h1>

            {isError && (
              <ErrorPage
                compact
                title="Login Error"
                message={error?.response?.data?.message || error?.message || "Login failed"}
              />
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={isPending} className="auth-button">
                {isPending ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="auth-link">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")} className="link-text">
                Sign up
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
