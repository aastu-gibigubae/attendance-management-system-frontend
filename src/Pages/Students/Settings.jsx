import { useState } from 'react';
import { useMyProfile, useUpdateMyProfile } from '../../hooks/useStudentProfile';
import LoadingPage from '../../Components/LoadingPage';
import ErrorPage from '../../Components/ErrorPage';
import { Calendar, Save } from 'lucide-react';
import '../../styles/Settings.css';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, isError, refetch } = useMyProfile();
  const updateMutation = useUpdateMyProfile();
  
  const [selectedYear, setSelectedYear] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize selectedYear when data loads
  // The /student/courses endpoint returns { student: {...}, courses: {...} }
  if (data && selectedYear === null) {
    setSelectedYear(data?.student?.year || 1);
  }

  const handleBack = () => {
    return navigate('/student/courses')
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ year: selectedYear });
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
  const hasChanges = selectedYear !== student?.year;

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
              color: '#3b82f6',
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
            Back to Courses
          </button>
          <h1>Settings</h1>
          <p>Update your academic year</p>
        </div>

        <div className="settings-card">
          <div className="year-section">
            <div className="year-label">
              <Calendar size={20} />
              <span>Academic Year</span>
            </div>
            
            <select
              className="year-select"
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
              <option value={5}>Year 5</option>
            </select>
          </div>

          <button
            className={`save-btn ${updateMutation.isPending ? 'loading' : ''} ${!hasChanges ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasChanges}
          >
            <Save size={18} />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div className="success-message">
              ✓ Year updated successfully!
            </div>
          )}

          {/* Error Message */}
          {updateMutation.isError && (
            <div className="error-message">
              ✗ {updateMutation.error?.response?.data?.message || 'Failed to update year'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

