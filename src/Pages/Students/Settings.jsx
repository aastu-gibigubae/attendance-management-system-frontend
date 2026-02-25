import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useMe, useUpdateMe } from '../../hooks/useStudentProfile';
import LoadingPage from '../../Components/LoadingPage';
import ErrorPage from '../../Components/ErrorPage';
import '../../styles/Settings.css';

const EMPTY_FORM = {
  first_name: '',
  father_name: '',
  grand_father_name: '',
  christian_name: '',
  id_number: '',
  email: '',
  gender: '',
  phone_number: '',
  is_graduated: false,
  department: '',
  year: '',
  dorm_block: '',
  room_number: '',
  password: '',
  confirm_password: '',
};

const Settings = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useMe();
  const updateMutation = useUpdateMe();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Populate form when data loads
  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setFormData({
        first_name: s.first_name ?? '',
        father_name: s.father_name ?? '',
        grand_father_name: s.grand_father_name ?? '',
        christian_name: s.christian_name ?? '',
        id_number: s.id_number ?? '',
        email: s.email ?? '',
        gender: s.gender ?? '',
        phone_number: s.phone_number ?? '',
        is_graduated: s.is_graduated ?? false,
        department: s.department ?? '',
        year: s.year?.toString() ?? '',
        dorm_block: s.dorm_block?.toString() ?? '',
        room_number: s.room_number?.toString() ?? '',
        password: '',
        confirm_password: '',
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Detect if the form differs from the server data
  const hasChanges = (() => {
    if (!data?.data) return false;
    const s = data.data;
    return (
      formData.first_name !== (s.first_name ?? '') ||
      formData.father_name !== (s.father_name ?? '') ||
      formData.grand_father_name !== (s.grand_father_name ?? '') ||
      formData.christian_name !== (s.christian_name ?? '') ||
      formData.id_number !== (s.id_number ?? '') ||
      formData.email !== (s.email ?? '') ||
      formData.gender !== (s.gender ?? '') ||
      formData.phone_number !== (s.phone_number ?? '') ||
      formData.is_graduated !== (s.is_graduated ?? false) ||
      formData.department !== (s.department ?? '') ||
      formData.year !== (s.year?.toString() ?? '') ||
      formData.dorm_block !== (s.dorm_block?.toString() ?? '') ||
      formData.room_number !== (s.room_number?.toString() ?? '') ||
      formData.password.trim() !== ''
    );
  })();

  const handleSave = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate password match if user is attempting to change it
    if (formData.password.trim()) {
      if (formData.password !== formData.confirm_password) {
        setPasswordError('Passwords do not match.');
        return;
      }
    }

    try {
      const payload = {
        first_name: formData.first_name,
        father_name: formData.father_name,
        grand_father_name: formData.grand_father_name,
        christian_name: formData.christian_name || null,
        id_number: formData.id_number,
        email: formData.email,
        gender: formData.gender,
        phone_number: formData.phone_number,
        is_graduated: formData.is_graduated,
        department: formData.department,
        year: parseInt(formData.year, 10),
        dorm_block: formData.dorm_block ? parseInt(formData.dorm_block, 10) : null,
        room_number: formData.room_number ? parseInt(formData.room_number, 10) : null,
      };

      // Only include password if the user filled it in
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      await updateMutation.mutateAsync(payload);
      // Clear password fields after successful save
      setFormData((prev) => ({ ...prev, password: '', confirm_password: '' }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch {
      // Error is surfaced via updateMutation.isError
    }
  };

  if (isLoading) return <LoadingPage message="Loading your profile..." />;
  if (isError)
    return (
      <ErrorPage
        title="Error"
        message={error?.response?.data?.message || error?.message || 'Unable to load profile'}
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <button
            type="button"
            onClick={() => navigate('/student/courses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#d4a574',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'background 0.2s',
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fdf5ec')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ArrowLeft size={16} />
            Back to Courses
          </button>
          <h1>Profile Settings</h1>
          <p>View and update your personal information</p>
        </div>

        <form onSubmit={handleSave} className="settings-card">
          {/* ── Personal Information ─────────────────────── */}
          <div className="settings-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="father_name">Father&apos;s Name *</label>
                <input
                  id="father_name"
                  name="father_name"
                  value={formData.father_name}
                  onChange={handleChange}
                  placeholder="Father's name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="grand_father_name">Grandfather&apos;s Name *</label>
                <input
                  id="grand_father_name"
                  name="grand_father_name"
                  value={formData.grand_father_name}
                  onChange={handleChange}
                  placeholder="Grandfather's name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="christian_name">Christian Name</label>
                <input
                  id="christian_name"
                  name="christian_name"
                  value={formData.christian_name}
                  onChange={handleChange}
                  placeholder="e.g. Birhane Meskel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="id_number">ID Number *</label>
                <input
                  id="id_number"
                  name="id_number"
                  value={formData.id_number}
                  onChange={handleChange}
                  placeholder="e.g. ETS0132/14"
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Contact Information ───────────────────────── */}
          <div className="settings-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Phone Number *</label>
                <input
                  id="phone_number"
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

          {/* ── Academic Information ──────────────────────── */}
          <div className="settings-section">
            <h3 className="section-title">Academic Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineering"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  min="1"
                  max="7"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label
                  htmlFor="is_graduated"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    fontWeight: '500',
                  }}
                >
                  <input
                    id="is_graduated"
                    type="checkbox"
                    name="is_graduated"
                    checked={formData.is_graduated}
                    onChange={handleChange}
                    style={{ width: 'auto', margin: 0 }}
                  />
                  Graduated
                </label>
              </div>
            </div>
          </div>

          {/* ── Housing Information ───────────────────────── */}
          <div className="settings-section">
            <h3 className="section-title">Housing Information</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="dorm_block">Dorm Block</label>
                <input
                  id="dorm_block"
                  name="dorm_block"
                  type="number"
                  value={formData.dorm_block}
                  onChange={handleChange}
                  placeholder="e.g. 14"
                />
              </div>

              <div className="form-group">
                <label htmlFor="room_number">Room Number</label>
                <input
                  id="room_number"
                  name="room_number"
                  type="number"
                  value={formData.room_number}
                  onChange={handleChange}
                  placeholder="e.g. 317"
                />
              </div>
            </div>
          </div>

          {/* ── Account Security ──────────────────────────── */}
          <div className="settings-section">
            <h3 className="section-title">Change Password</h3>
            <div className="settings-grid">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                    autoComplete="new-password"
                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat new password"
                    autoComplete="new-password"
                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <XCircle size={16} />
                {passwordError}
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────── */}
          <button
            type="submit"
            className={`save-btn${updateMutation.isPending ? ' loading' : ''}${!hasChanges ? ' disabled' : ''}`}
            disabled={updateMutation.isPending || !hasChanges}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>

          {/* Success feedback */}
          {showSuccess && (
            <div className="success-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              Profile updated successfully!
            </div>
          )}

          {/* Error feedback */}
          {updateMutation.isError && (
            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={16} />
              {updateMutation.error?.response?.data?.message || 'Failed to update profile. Please try again.'}
            </div>
          )}
        </form>
      </div>

      {/* Spin animation for loader icon */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Settings;
