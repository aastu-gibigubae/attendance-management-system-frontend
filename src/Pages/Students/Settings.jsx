import { useState, useEffect } from 'react';
import { useMyProfile, useUpdateMyProfile } from '../../hooks/useStudentProfile';
import LoadingPage from '../../Components/LoadingPage';
import ErrorPage from '../../Components/ErrorPage';
import { Save } from 'lucide-react';
import '../../styles/Settings.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, isError, refetch } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  
  const [formData, setFormData] = useState({
    first_name: "",
    father_name: "",
    grand_father_name: "",
    christian_name: "",
    id_number: "",
    email: "",
    password: "",
    gender: "",
    phone_number: "",
    department: "",
    year: "",
    dorm_block: "",
    room_number: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form data when student data loads
  useEffect(() => {
    if (data?.data) {
      const student = data?.data;
      setFormData({
        first_name: student.first_name || "",
        father_name: student.father_name || "",
        grand_father_name: student.grand_father_name || "",
        christian_name: student.christian_name || "",
        id_number: student.id_number || "",
        email: student.email || "",
        password: "",
        gender: student.gender || "",
        phone_number: student.phone_number || "",
        department: student.department || "",
        year: student.year?.toString() || "",
        dorm_block: student.dorm_block || "",
        room_number: student.room_number || "",
      });
    }
  }, [data]);

  const handleBack = () => {
    return navigate('/student/courses')
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        first_name: formData.first_name,
        father_name: formData.father_name,
        grand_father_name: formData.grand_father_name,
        christian_name: formData.christian_name || null,
        confessionFatherId: null,
        id_number: formData.id_number,
        email: formData.email,
        gender: formData.gender,
        phone_number: formData.phone_number,
        department: formData.department,
        year: parseInt(formData.year, 10),
        dorm_block: formData.dorm_block || null,
        room_number: formData.room_number || null,
      };

      // Only include password if it's been filled in
      if (formData.password && formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await updateMutation.mutateAsync(payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (isLoading) return <LoadingPage message="Loading..." />;
  if (isError) return (
    <ErrorPage
      title="Error"
      message={error?.response?.data?.message || error?.message || "Unable to load data"}
      onRetry={() => refetch()}
    />
  );

  const student = data?.student;
  
  // Check if form has changes from original data
  const hasChanges = data?.student && (
    formData.first_name !== (student.first_name || "") ||
    formData.father_name !== (student.father_name || "") ||
    formData.grand_father_name !== (student.grand_father_name || "") ||
    formData.christian_name !== (student.christian_name || "") ||
    formData.id_number !== (student.id_number || "") ||
    formData.email !== (student.email || "") ||
    formData.gender !== (student.gender || "") ||
    formData.phone_number !== (student.phone_number || "") ||
    formData.department !== (student.department || "") ||
    formData.year?.toString() !== (student.year?.toString() || "") ||
    formData.dorm_block !== (student.dorm_block || "") ||
    formData.room_number !== (student.room_number || "") ||
    (formData.password && formData.password.trim() !== "")
  );

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button 
            onClick={handleBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: '#d4a574',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'background 0.2s',
              marginBottom: '12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={20} />
            Courses
          </button>
          <h1>Profile Settings</h1>
          <p>Update your profile information</p>
        </div>

        <form onSubmit={handleSave} className="settings-card">
          {/* Personal Information */}
          <div className="settings-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Father Name *</label>
                <input
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Grandfather Name *</label>
                <input
                  name="grand_father_name"
                  value={formData.grand_father_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Christian Name</label>
                <input
                  name="christian_name"
                  value={formData.christian_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="settings-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="9xxxxxxxx"
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="settings-section">
            <h3 className="section-title">Academic Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label>Department *</label>
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineering"
                  required
                />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                  required
                  min="1"
                  max="7"
                />
              </div>
            </div>
          </div>

          {/* Housing Information */}
          <div className="settings-section">
            <h3 className="section-title">Housing Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label>Dorm Block</label>
                <input
                  name="dorm_block"
                  value={formData.dorm_block}
                  onChange={handleChange}
                  placeholder="e.g. A, B, C"
                />
              </div>
              <div className="form-group">
                <label>Room Number</label>
                <input
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  placeholder="e.g. 101"
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="settings-section">
            <h3 className="section-title">Account Security</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current password"
                />
                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Only fill this if you want to change your password
                </small>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`save-btn ${updateMutation.isPending ? 'loading' : ''} ${!hasChanges ? 'disabled' : ''}`}
            disabled={updateMutation.isPending || !hasChanges}
          >
            <Save size={18} />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div className="success-message">
              ✓ Profile updated successfully!
            </div>
          )}

          {/* Error Message */}
          {updateMutation.isError && (
            <div className="error-message">
              ✗ {updateMutation.error?.response?.data?.message || 'Failed to update profile'}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;

