import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLogin } from "../hooks/useAuth";
import "./Auth.css";
import ErrorPage from "../Components/ErrorPage";

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check for redirect parameter (for QR code deep linking)
  const redirectUrl = searchParams.get("redirect");

  const { mutate: login, isPending, error, isError } = useLogin({
    onSuccess: (data) => {
      const role = data.data?.role;

      // Store role for components that still read from localStorage
      if (role) localStorage.setItem("userRole", role);

      // Invalidate the cached /student/me query so ProtectedRoute
      // and PublicOnlyRoute immediately see the new authenticated session
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      // Navigate based on redirect param or role
      if (redirectUrl) {
        navigate(decodeURIComponent(redirectUrl));
      } else if (role === "admin" || role === "super_admin") {
        navigate("/admin/courses");
      } else {
        navigate("/student/courses");
      }
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Right Section - Welcome Card */}
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

        {/* Left Section - Form */}
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

              <div className="form-group" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  style={{ paddingRight: "45px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9ca3af",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
