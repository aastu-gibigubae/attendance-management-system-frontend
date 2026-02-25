import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignup } from "../hooks/useAuth";
import "./Auth.css";
import ErrorPage from "../Components/ErrorPage";

const SignUp = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    fatherName: "",
    grandfatherName: "",
    christianName: "",
    phoneNumber: "",
    department: "",
    year: "",
    dormBlock: "",
    roomNumber: "",
    gender: "",
    id: "",
    idFile: null,
    email: "",
    password: "",
  });

  const [validationError, setValidationError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Use React Query mutation hook for signup
  const { mutate: signup, isPending, error, isError } = useSignup({
    onSuccess: (data) => {
      const role = data?.data?.role || "student";
      localStorage.setItem("userRole", role);
      // Invalidate the auth query so PublicOnlyRoute / ProtectedRoute
      // immediately sees the newly authenticated session
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/student/courses");
    },
  });



  // Email validation function
  const validateEmail = (email) => {
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    // Extract domain
    const domain = email.split('@')[1].toLowerCase();

    // Block placeholder/test domains
    const blockedDomains = [
      'example.com',
      'test.com',
      'sample.com',
      'demo.com',
      'localhost',
      'fake.com',
      'invalid.com',
      'placeholder.com',
    ];

    if (blockedDomains.includes(domain)) {
      return `Email domain @${domain} is not allowed. Please use a real email address.`;
    }

    // Allow university domain
    if (domain === 'aastustudent.edu.et') {
      return null; // Valid
    }

    // Allow common email providers
    const allowedDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'live.com',
      'icloud.com',
      'protonmail.com',
      'zoho.com',
      'aol.com',
      'mail.com',
    ];

    if (allowedDomains.includes(domain)) {
      return null; // Valid
    }

    // For other domains, check if they look legitimate (have proper TLD)
    const legitimateTLDs = ['.com', '.net', '.org', '.edu', '.gov', '.et', '.edu.et'];
    const hasLegitTLD = legitimateTLDs.some(tld => domain.endsWith(tld));
    
    if (!hasLegitTLD) {
      return 'Please use a recognized email domain';
    }

    return null; // Valid for other legitimate domains
  };

  // Phone number validation function
  const validatePhone = (phone) => {
    // Remove any spaces, dashes, or other non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Must be exactly 9 digits
    if (cleanPhone.length === 0) {
      return null; // Empty is okay, required validation will catch it
    }
    
    if (cleanPhone.length !== 9) {
      return 'Phone number must be exactly 9 digits';
    }
    
    // Must start with 9 or 7
    const firstDigit = cleanPhone[0];
    if (firstDigit !== '9' && firstDigit !== '7') {
      return 'Phone number must start with 9 or 7 (e.g., 912345678 or 712345678)';
    }
    
    return null; // Valid
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // Validate email on change
    if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error || '');
    }
    
    // Validate phone on change
    if (name === 'phoneNumber') {
      const error = validatePhone(value);
      setPhoneError(error || '');
    }
    
    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validation to check required fields
    if (
      !formData.firstName ||
      !formData.fatherName ||
      !formData.grandfatherName ||
      !formData.phoneNumber ||
      !formData.department ||
      !formData.year ||
      !formData.dormBlock ||
      !formData.roomNumber ||
      !formData.gender ||
      !formData.id ||
      !formData.idFile ||
      !formData.email ||
      !formData.password
    ) {
      setValidationError("Please fill in all required fields");
      return;
    }

    // Validate email
    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setValidationError(emailValidationError);
      return;
    }

    // Validate phone number
    const phoneValidationError = validatePhone(formData.phoneNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setValidationError(phoneValidationError);
      return;
    }

    // Prepare FormData
    const formDataWithFile = new FormData();
    formDataWithFile.append("first_name", formData.firstName);
    formDataWithFile.append("father_name", formData.fatherName);
    formDataWithFile.append("grand_father_name", formData.grandfatherName);
    formDataWithFile.append("christian_name", formData.christianName);
    formDataWithFile.append("phone_number", formData.phoneNumber);
    formDataWithFile.append("department", formData.department);
    formDataWithFile.append("year", formData.year);
    formDataWithFile.append("dorm_block", formData.dormBlock);
    formDataWithFile.append("room_number", formData.roomNumber);
    formDataWithFile.append("gender", formData.gender);
    formDataWithFile.append("id_number", formData.id);
    formDataWithFile.append("email", formData.email);
    formDataWithFile.append("password", formData.password);

    if (formData.idFile) {
      formDataWithFile.append("id_card", formData.idFile);
    }

    // Call the signup mutation
    signup(formDataWithFile);
  };
 
  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Welcome Section */}
        <div className="auth-welcome-section hide-on-mobile">
          <div className="welcome-card">
            <div className="logo-circle">
              <span className="logo-text">
                GIBI
                <br />
                GUBAE
              </span>
            </div>
            <h2 className="welcome-title">Hello. Welcome</h2>
            <p className="welcome-message">
              Create your account to get started. Stay connected, manage your
              profile, and access all available services. Already have an
              account?{" "}
              <span onClick={() => navigate("/")} className="welcome-link">
                Sign in to continue.
              </span>
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="auth-form-section">
          <div className="auth-form">
            <h1 className="auth-title">Create your account</h1>

            {validationError && (
              <ErrorPage compact title="Validation Error" message={validationError} />
            )}

            {isError && (
              <ErrorPage
                compact
                title="Registration Error"
                message={error?.response?.data?.message || error?.message || "Registration failed"}
              />
            )}

            <form onSubmit={handleSignUp}>
              {/* Name Row 1 */}
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="Father Name"
                    value={formData.fatherName}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Name Row 2 */}
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="grandfatherName"
                    placeholder="Grandfather Name"
                    value={formData.grandfatherName}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="christianName"
                    placeholder="Christian Name"
                    value={formData.christianName}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Phone & Gender */}
              <div className="form-row">
                <div className="form-group">
                  <div className={`phone-input-wrapper ${phoneError ? 'input-error' : ''}`}>
                    <span className="phone-prefix">+251</span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="9** ** ** ** (9 digits)"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      maxLength="9"
                      pattern="[79][0-9]{8}"
                      className="form-input phone-input"
                    />
                  </div>
                  {phoneError && (
                    <span className="error-text">{phoneError}</span>
                  )}
                </div>
                <div className="form-group">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Department & Year */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select Department</option>
                    <option value="Electromechanical Engineering">
                      Electromechanical Engineering
                    </option>
                    <option value="Chemical Engineering">
                      Chemical Engineering
                    </option>
                    <option value="Software Engineering">
                      Software Engineering
                    </option>
                    <option value="Mechanical Engineering">
                      Mechanical Engineering
                    </option>
                    <option value="Electrical and Computer Engineering">
                      Electrical and Computer Engineering
                    </option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Applied Science">Applied Science</option>
                    <option value="Freshman Engineering">
                      Freshman Engineering
                    </option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Industrial Chemistry">
                      Industrial Chemistry
                    </option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <input
                    type="number"
                    name="year"
                    placeholder="Year"
                    min="1"
                    max="7"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Dorm & Room */}
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="dormBlock"
                    placeholder="Dorm Block"
                    value={formData.dormBlock}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="roomNumber"
                    placeholder="Room Number"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* ID Number & Upload */}
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="id"
                    placeholder="ID Number"
                    value={formData.id}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address (e.g., name@gmail.com or name@aastustudent.edu.et)"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`form-input ${emailError ? 'input-error' : ''}`}
                />
                {emailError && (
                  <span className="error-text">{emailError}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  required
                  className="form-input"
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button type="submit" disabled={isPending} className="auth-button">
                {isPending ? "Registering..." : "Register"}
                {!isPending && <span className="button-arrow">→</span>}
              </button>
            </form>

            <div className="auth-link">
              Already have an account?{" "}
              <span onClick={() => navigate("/")} className="link-text">
                login
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
