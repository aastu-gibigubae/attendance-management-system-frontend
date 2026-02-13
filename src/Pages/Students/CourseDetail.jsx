import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useCourse } from "../../hooks/useCourses";
import {
  useStudentAttendance,
  useMarkAttendanceStudent,
} from "../../hooks/useAttendance";
import AttendanceCard from "../../Components/AttendanceCard";
import RecordAttendanceModal from "../../Components/RecordAttendanceModal";
import "../../styles/CourseDetail.css";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";
import Swal from "sweetalert2";

const CourseDetail = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState("cards");
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoFillCode, setAutoFillCode] = useState(null);

  // Check for attendance code in URL (from QR code scan)
  useEffect(() => {
    const attendanceCode = searchParams.get('attendanceCode');
    if (attendanceCode) {
      // Auto-fill the code and open modal
      setAutoFillCode(attendanceCode);
      setIsModalOpen(true);
      
      // Clear the URL parameter so it doesn't persist
      searchParams.delete('attendanceCode');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Use React Query hooks for parallel data fetching
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(courseId);
  const { 
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useStudentAttendance(courseId);
  const markAttendanceMutation = useMarkAttendanceStudent();

  // Combined loading and error states
  const isLoading = courseLoading || attendanceLoading;
  const error = courseError || attendanceError;

  // Transform attendance data
  const attendanceRecords = attendanceData?.success
    ? (() => {
        const now = new Date();
        return attendanceData.data
          .map((rec) => {
            const rawDate = rec.attendance.date;
            const startDate = new Date(rawDate);
            const endDate = new Date(startDate.getTime() + 16 * 60000); // 16 minutes

            const timeOptions = {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            };
            const timeStart = startDate.toLocaleTimeString(
              "en-US",
              timeOptions,
            );
            const timeEnd = endDate.toLocaleTimeString("en-US", timeOptions);

            let status = "";
            if (rec.present === true) {
              status = "present";
            } else if (rec.present === false) {
              status = "absent";
            } else if (endDate < now) {
              status = "expired";
            } else {
              status = "pending";
            }

            return {
              id: rec.attendance.id,
              rawDate: rawDate,
              date: new Date(rawDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              timeStart: timeStart,
              timeEnd: timeEnd,
              status: status,
              code: rec.attendance.code,
            };
          })
          .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
      })()
    : [];

  const course = courseData?.success ? courseData.data : null;

  if (isLoading) return <LoadingPage message="Loading course..." />;
  if (error || !course)
    return (
      <ErrorPage
        title="Error Loading Course"
        message={
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load course"
        }
      />
    );

  // Get the most recent attendance record (the last one in the array after sorting)
  const mostRecentRecord = attendanceRecords[attendanceRecords.length - 1];

  // Only make it clickable if the student is NOT present on it
  const isClickable = mostRecentRecord && mostRecentRecord.status !== "present";

  const handlePendingClick = (record) => {
    // Only allow clicking on the most recent record if student is not present
    if (!isClickable || record.id !== mostRecentRecord.id) return;

    setSelectedAttendance(record);
    setIsModalOpen(true);
  };

  const handleAttendanceSubmit = async (code) => {
    if (!selectedAttendance) return;

    markAttendanceMutation.mutate(
      {
        attendanceId: selectedAttendance.id,
        code,
      },
      {
        onSuccess: () => {
          // The modal will close after success
          // React Query automatically refetches the attendance data
        },
        onError: (error) => {
          Swal.fire({
            icon: "error",
            title: "Attendance Error",
            text:
              error?.response?.data?.message ||
              error?.message ||
              "Invalid code or system error.",
          });
        },
      },
    );
  };

  return (
    <>
      <div className="course-detail-container">
        <div className="course-detail-header">
          {/* ... (Breadcrumb and Title remain the same) ... */}
          <div className="breadcrumb">
            <button
              onClick={() => navigate("/student/courses")}
              className="breadcrumb-link"
            >
              Courses
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{course.course_name}</span>
          </div>
          <h1 className="course-title">{course.course_name}</h1>
        </div>

        <div className="attendance-section">
          <div className="attendance-header">
            <h2 className="attendance-title">Attendance</h2>
            <button
              onClick={() =>
                setViewMode(viewMode === "cards" ? "list" : "cards")
              }
              className={`view-toggle ${viewMode === "list" ? "active" : ""}`}
            >
              {viewMode === "cards" ? "List" : "Cards"}
            </button>
          </div>

          {viewMode === "cards" ? (
            <div className="attendance-cards-grid">
              {attendanceRecords.map((rec) => (
                <AttendanceCard
                  key={rec.id}
                  date={rec.date}
                  timeStart={rec.timeStart}
                  timeEnd={rec.timeEnd}
                  status={rec.status}
                  // Make clickable only if it's the most recent record and student is not present
                  clickable={isClickable && rec.id === mostRecentRecord?.id}
                  onPendingClick={() => handlePendingClick(rec)}
                />
              ))}
            </div>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    // Added onClick for table view
                    onClick={
                      isClickable && rec.id === mostRecentRecord?.id
                        ? () => handlePendingClick(rec)
                        : undefined
                    }
                    style={
                      isClickable && rec.id === mostRecentRecord?.id
                        ? {
                            cursor: "pointer",
                            fontWeight: "bold",
                          }
                        : {}
                    }
                  >
                    <td>{rec.date}</td>
                    <td>
                      {rec.timeStart} <br/>{rec.timeEnd}
                    </td>
                    <td>
                      <span className={`status-badge ${rec.status}`}>
                        {rec.status.charAt(0).toUpperCase() +
                          rec.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <RecordAttendanceModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setAutoFillCode(null); // Clear auto-fill code when modal closes
            }}
            onSubmit={handleAttendanceSubmit}
            initialCode={autoFillCode} // Pass code from QR for auto-fill
          />

        </div>
      </div>
    </>
  );
};

export default CourseDetail;
