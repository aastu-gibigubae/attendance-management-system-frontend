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
  Printer,
  FileText,
} from "lucide-react";
import { useCourse, useCourseStudents } from "../../hooks/useCourses";
import {
  useCourseAttendance,
  useCreateAttendance,
} from "../../hooks/useAttendance";
import AttendanceTable from "../../Components/AttendanceTable";
import "../../styles/CourseDetails.css";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [showQRCode, setShowQRCode] = useState(false);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Use React Query hooks for parallel data fetching
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(courseId);
  const { data: studentsData, isLoading: studentsLoading } =
    useCourseStudents(courseId);
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useCourseAttendance(courseId);

  // Create attendance mutation
  const createAttendanceMutation = useCreateAttendance();

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

  const handleCreateAttendance = () => {
    createAttendanceMutation.mutate(
      {
        courseId,
        minutes: 15, // Default: 15 minutes attendance window
      },
      {
        onSuccess: () => {
          setSuccessMessage("Attendance created successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        },
        onError: (error) => {
          console.error("Error creating attendance:", error);
          alert(
            error?.response?.data?.message || "Failed to create attendance",
          );
        },
      },
    );
  };

  if (isLoading) return <LoadingPage message="Loading course details..." />;
  if (error)
    return (
      <ErrorPage
        message={
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load details"
        }
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

                              const handleDownloadPDF = async () => {
                                try {
                                  // Dynamically import libraries
                                  const html2canvas = (
                                    await import("html2canvas")
                                  ).default;
                                  const { jsPDF } = await import("jspdf");

                                  // Get the print content element
                                  const printElement =
                                    document.querySelector(".pdf-content");
                                  if (!printElement) return;

                                  // Temporarily show the element
                                  printElement.style.display = "block";
                                  printElement.style.position = "relative";

                                  // Capture as canvas
                                  const canvas = await html2canvas(
                                    printElement,
                                    {
                                      scale: 2,
                                      backgroundColor: "#ffffff",
                                    },
                                  );

                                  // Hide it again
                                  printElement.style.display = "none";
                                  printElement.style.position = "absolute";

                                  // Create PDF
                                  const imgData = canvas.toDataURL("image/png");
                                  const pdf = new jsPDF({
                                    orientation: "portrait",
                                    unit: "mm",
                                    format: "a4",
                                  });

                                  const imgWidth = 210; // A4 width in mm
                                  const imgHeight =
                                    (canvas.height * imgWidth) / canvas.width;

                                  pdf.addImage(
                                    imgData,
                                    "PNG",
                                    0,
                                    0,
                                    imgWidth,
                                    imgHeight,
                                  );
                                  pdf.save(`Attendance-QR-${att.code}.pdf`);
                                } catch (error) {
                                  console.error("Error generating PDF:", error);
                                  alert(
                                    "Failed to generate PDF. Please try again.",
                                  );
                                }
                              };

                              return (
                                <>
                                  {/* Screen View */}
                                  <div className="screen-only">
                                    <QRCode value={attendanceUrl} size={150} />
                                    <p className="qr-code-text">{att.code}</p>
                                    <button
                                      onClick={handleDownloadPDF}
                                      style={{
                                        marginTop: "16px",
                                        padding: "12px 24px",
                                        background: "#2196F3",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <FileText size={18} /> Download PDF
                                    </button>
                                  </div>

                                  {/* PDF Content - Hidden on screen */}
                                  <div
                                    className="pdf-content"
                                    style={{ display: "none" }}
                                  >
                                    <div
                                      style={{
                                        padding: "40px",
                                        textAlign: "center",
                                      }}
                                    >
                                      <h1
                                        style={{
                                          fontSize: "28px",
                                          margin: "0 0 10px",
                                        }}
                                      >
                                        {course.title}
                                      </h1>
                                      <h2
                                        style={{
                                          fontSize: "20px",
                                          margin: "0 0 10px",
                                          fontWeight: "normal",
                                        }}
                                      >
                                        Attendance QR Code
                                      </h2>
                                      <p
                                        style={{
                                          fontSize: "14px",
                                          color: "#999",
                                        }}
                                      >
                                        {att.date} • {att.time}
                                      </p>

                                      <div
                                        style={{
                                          margin: "40px 0",
                                          padding: "20px",
                                          border: "2px solid #333",
                                          borderRadius: "12px",
                                          display: "inline-block",
                                        }}
                                      >
                                        <QRCode
                                          value={attendanceUrl}
                                          size={300}
                                        />
                                      </div>

                                      <div
                                        style={{
                                          margin: "30px 0",
                                          padding: "20px",
                                          background: "#f5f5f5",
                                          borderRadius: "8px",
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: "14px",
                                            color: "#666",
                                            margin: "0 0 8px",
                                          }}
                                        >
                                          Manual Code:
                                        </p>
                                        <p
                                          style={{
                                            fontSize: "32px",
                                            fontWeight: "bold",
                                            letterSpacing: "4px",
                                            margin: 0,
                                            fontFamily: "monospace",
                                          }}
                                        >
                                          {att.code}
                                        </p>
                                      </div>

                                      <div
                                        style={{
                                          margin: "30px 0",
                                          textAlign: "left",
                                          maxWidth: "500px",
                                          marginLeft: "auto",
                                          marginRight: "auto",
                                        }}
                                      >
                                        <h3
                                          style={{
                                            fontSize: "18px",
                                            marginBottom: "15px",
                                          }}
                                        >
                                          How to Mark Attendance:
                                        </h3>
                                        <ol
                                          style={{
                                            paddingLeft: "25px",
                                            lineHeight: "1.8",
                                          }}
                                        >
                                          <li>
                                            Scan the QR code with your phone
                                            camera
                                          </li>
                                          <li>
                                            Or manually enter the code in the
                                            app
                                          </li>
                                          <li>
                                            Submit to record your attendance
                                          </li>
                                        </ol>
                                      </div>
                                    </div>
                                  </div>
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
          {/* Success Message */}
          {successMessage && (
            <div
              style={{
                position: "fixed",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#10b981",
                color: "white",
                padding: "14px 24px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                zIndex: 1000,
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              ✓ {successMessage}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleCreateAttendance}
            disabled={createAttendanceMutation.isPending}
          >
            <span className="btn-icon">+</span>
            {createAttendanceMutation.isPending
              ? "Creating..."
              : "Create Attendance"}
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
      </div>
    </>
  );
};

export default CourseDetails;
