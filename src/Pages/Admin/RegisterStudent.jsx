import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAdminRegisterStudent } from "../../hooks/useAdmin";
import "../Auth.css";
import ErrorPage from "../../Components/ErrorPage";
import Swal from "sweetalert2";

const RegisterStudent = () => {
  // Removed idFile from state
  const[formData, setFormData] = useState({
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
    email: "",
    password: "",
  });

  const [validationError, setValidationError] = useState("");
  const[emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Use admin-specific registration hook — does NOT set auth cookies,
  // so the admin's session is preserved after registering a student.
  const { mutate: adminRegisterStudent, isPending, error, isError } = useAdminRegisterStudent({
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Student Registered!",
        text: "The student has been successfully registered.",
        timer: 2000,
        showConfirmButton: false,
      });
      // Reset form
      setFormData({
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
        email: "",
        password: "",
      });
    },
  });

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }

    const domain = email.split('@')[1].toLowerCase();

    const blockedDomains =[
      'example.com', 'test.com', 'sample.com', 'demo.com',
      'localhost', 'fake.com', 'invalid.com', 'placeholder.com',
    ];

    if (blockedDomains.includes(domain)) {
      return `Email domain @${domain} is not allowed. Please use a real email address.`;
    }

    if (domain === 'aastustudent.edu.et') {
      return null;
    }

    const allowedDomains =[
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'live.com', 'icloud.com', 'protonmail.com', 'zoho.com',
      'aol.com', 'mail.com',
    ];

    if (allowedDomains.includes(domain)) {
      return null;
    }

    const legitimateTLDs =['.com', '.net', '.org', '.edu', '.gov', '.et', '.edu.et'];
    const hasLegitTLD = legitimateTLDs.some(tld => domain.endsWith(tld));
    
    if (!hasLegitTLD) {
      return 'Please use a recognized email domain';
    }

    return null;
  };

  // Phone number validation function
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 0) {
      return null;
    }
    
    if (cleanPhone.length !== 9) {
      return 'Phone number must be exactly 9 digits';
    }
    
    const firstDigit = cleanPhone[0];
    if (firstDigit !== '9' && firstDigit !== '7') {
      return 'Phone number must start with 9 or 7 (e.g., 912345678 or 712345678)';
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error || '');
    }
    
    if (name === 'phoneNumber') {
      const error = validatePhone(value);
      setPhoneError(error || '');
    }
    
    // Set form data directly (file logic removed)
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    // Validation (idFile removed from check)
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
      !formData.email ||
      !formData.password
    ) {
      setValidationError("Please fill in all required fields");
      return;
    }

    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      setValidationError(emailValidationError);
      return;
    }

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

    // ---------------------------------------------------------
    // THE FIX: Create a real 1x1 pixel image (Base64 -> Blob)
    // ---------------------------------------------------------
    const base64Image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const byteCharacters = atob(base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Create a Blob from the binary data
    const blob = new Blob([byteArray], { type: "image/gif" });
    
    // Create a File object from the Blob
    const dummyFile = new File([blob], "placeholder.gif", { type: "image/gif" });

    // Append this valid file to FormData
    formDataWithFile.append("id_card", dummyFile); 

    // Submit via admin-only endpoint (no auth cookies set)
    adminRegisterStudent(formDataWithFile);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        padding: '32px' 
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          marginBottom: '8px',
          color: '#1f2937'
        }}>
          Register New Student
        </h1>
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          Fill in the student information to create a new account
        </p>

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

        <form onSubmit={handleSubmit}>
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
                <option value="Electromechanical Engineering">Electromechanical Engineering</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical and Computer Engineering">Electrical and Computer Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Applied Science">Applied Science</option>
                <option value="Freshman Engineering">Freshman Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Industrial Chemistry">Industrial Chemistry</option>
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

          {/* ID Number */}
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
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
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

          <button 
            type="submit" 
            disabled={isPending} 
            className="auth-button"
            style={{ width: '100%' }}
          >
            {isPending ? "Registering Student..." : "Register Student"}
            {!isPending && <span className="button-arrow">→</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;