import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoadingPage from '../Components/LoadingPage';

/**
 * AttendanceHandler - Handles deep link for QR code attendance
 * 
 * Flow:
 * 1. User scans QR code with camera → Opens URL with code & courseId
 * 2. This component extracts the parameters
 * 3. Checks if user is authenticated (via userRole in localStorage)
 * 4. Redirects to course detail page with code to auto-fill
 */
const AttendanceHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const courseId = searchParams.get('courseId');

    // Validate parameters
    if (!code || !courseId) {
      console.error('Missing required parameters');
      navigate('/student/courses');
      return;
    }

    // Check if user is authenticated by checking for userRole (cookie-based auth)
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
      // Not authenticated - redirect to login with return URL
      const returnUrl = `/student/course/${courseId}?attendanceCode=${code}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      // Authenticated - go directly to course detail with code
      navigate(`/student/course/${courseId}?attendanceCode=${code}`);
    }
  }, [navigate, searchParams]);

  return <LoadingPage message="Opening attendance..." />;
};

export default AttendanceHandler;
