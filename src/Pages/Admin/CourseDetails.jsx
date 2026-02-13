import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  ChevronLeft,
  Clock,
  Users,
  Calendar,
  Edit2,
  BarChart3,
  CheckSquare,
} from "lucide-react";
import { useCourse, useCourseStudents } from "../../hooks/useCourses";
import { useCourseAttendance } from "../../hooks/useAttendance";
import CreateAttendanceModal from "../../Components/CreateAttendanceModal";
import AttendanceTable from "../../Components/AttendanceTable";
import "../../styles/CourseDetails.css";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [showQRCode, setShowQRCode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);

  // Use React Query hooks for parallel data fetching
  const { data: courseData, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: studentsData, isLoading: studentsLoading } = useCourseStudents(courseId);
  const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError } = useCourseAttendance(courseId);

  // Combined loading and error states
  const isLoading = courseLoading || studentsLoading || attendanceLoading;
  const error = courseError || attendanceError;

  // Transform data
  const course = courseData?.success
    ? {
        id: courseData.data.id,
        title: courseData.data.course_name,
        description: courseData.data.description,
        startDate: new Date(courseData.data.start_date).toLocaleDateString(),
        endDate: new Date(courseData.data.end_date).toLocaleDateString(),
        instructor: courseData.data.instructor || "Admin",
      }
    : null;

  const totalStudents = studentsData?.success ? studentsData.totalStudents : 0;

  const attendance = attendanceData?.success
    ? attendanceData.data.map((item) => ({
        id: item.id,
        date: new Date(item.date).toLocaleDateString(),
        time: new Date(item.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        code: item.code,
        highlighted: item.status === "present",
      }))
    : [];

  const reversedAttendance = [...attendance].reverse();

  const handleAttendanceCreated = () => {
    setShowAttendanceTable(true);
  };

  if (isLoading) return <LoadingPage message="Loading course details..." />;
  if (error)
    return (
      <ErrorPage
        message={error?.response?.data?.message || error?.message || "Failed to load details"}
        title="Failed to Load Course"
        onRetry={() => window.location.reload()}
      />
    );
  if (!course) return <p>Course not found.</p>;

  return (
    <>
      <div className="course-details-container">
        {/* Header Section */}
        <div className="details-header">
          <button
            className="back-button"
            onClick={() => navigate("/admin/courses")}
          >
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="header-content">
            <h1 className="course-title">{course.title}</h1>
            <p className="course-meta">By {course.instructor}</p>
          </div>
        </div>

        {/* --- CONDITIONAL VIEW --- */}
        {showAttendanceTable ? (
          // TABLE VIEW
          <div style={{ marginTop: "20px" }}>
            <div className="section-header">
              <h2 className="section-title">Attendance Sheet</h2>
              <button
                className="view-all-link"
                onClick={() => setShowAttendanceTable(false)}
              >
                Back to Dashboard
              </button>
            </div>
            <AttendanceTable courseId={courseId} />
          </div>
        ) : (
          // DASHBOARD / CARD VIEW
          <>
            <div className="info-cards-grid">
              <div className="info-card">
                <div className="info-icon calendar-icon">
                  <Calendar size={24} />
                </div>
                <div className="info-content">
                  <p className="info-label">Duration</p>
                  <p className="info-value">
                    {course.startDate} to {course.endDate}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon users-icon">
                  <Users size={24} />
                </div>
                <div className="info-content">
                  <p className="info-label">Students</p>
                  <p className="info-value">{totalStudents} Enrolled</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon clock-icon">
                  <Clock size={24} />
                </div>
                <div className="info-content">
                  <p className="info-label">Sessions</p>
                  <p className="info-value">{attendance.length} Scheduled</p>
                </div>
              </div>
            </div>

            <div className="attendance-section">
              <div className="section-header">
                <h2 className="section-title">Attendance Dates</h2>
                <button
                  className="view-all-link"
                  onClick={() => setShowAttendanceTable(true)}
                >
                  View All (Table)
                </button>
              </div>

              <div className="attendance-grid">
                {reversedAttendance.map((att, idx) => {
                  const isLatest = idx === 0;

                  return (
                    <div key={att.id}>
                      {isLatest ? (
                        <div
                          onClick={() => setShowQRCode(!showQRCode)}
                          className={`attendance-card ${
                            att.highlighted ? "highlighted" : ""
                          } clickable`}
                        >
                          <button onClick={() => setShowQRCode(!showQRCode)}>
                            <div className="attendance-date">
                              <span className="date-text">{att.date}</span>
                            </div>
                            <div className="attendance-time">
                              <Clock size={16} />
                              <span>{att.time}</span>
                            </div>
                            <div>
                              <span>code: {att.code}</span>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`attendance-card ${
                            att.highlighted ? "highlighted" : ""
                          }`}
                        >
                          <div className="attendance-date">
                            <span className="date-text">{att.date}</span>
                          </div>
                          <div className="attendance-time">
                            <Clock size={16} />
                            <span>{att.time}</span>
                          </div>
                          <div>
                            <span>code: {att.code}</span>
                          </div>
                        </div>
                      )}

                      {isLatest && showQRCode && (
                        <div
                          className="qr-overlay"
                          onClick={() => setShowQRCode(false)}
                        >
                          <div
                            className="qr-popup"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Generate deep link URL for QR code */}
                            {(() => {
                              const attendanceUrl = `${window.location.origin}/attendance?code=${att.code}&courseId=${courseId}`;
                              return (
                                <>
                                  <QRCode value={attendanceUrl} size={150} />
                                  <p className="qr-code-text">{att.code}</p>
                                  <p style={{ fontSize: '10px', marginTop: '8px', color: '#666' }}>
                                    Scan to open app automatically
                                  </p>
                                </>
                              );
                            })()}

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <span className="btn-icon">+</span>
            Create Attendance
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setShowAttendanceTable(!showAttendanceTable)}
          >
            <CheckSquare size={18} style={{ marginRight: "8px" }} />
            {showAttendanceTable ? "View Dashboard" : "Mark Attendance"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => navigate("/admin/analytics")}
          >
            <BarChart3 size={18} />
            Analytics
          </button>
        </div>

        {/* Modal with Success Callback */}
        <CreateAttendanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAttendanceCreated}
          courseTitle={course.title}
        />
      </div>
    </>
  );
};

export default CourseDetails;
