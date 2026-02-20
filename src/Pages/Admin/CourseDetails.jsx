import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  ChevronLeft,
  Clock,
  Users,
  Calendar,
  BarChart3,
  CheckSquare,
  FileText,
  Timer,
  Trash2,
} from "lucide-react";
import { useCourse, useCourseStudents } from "../../hooks/useCourses";
import {
  useCourseAttendance,
  useCreateAttendance,
  useDeleteAttendance,
} from "../../hooks/useAttendance";
import AttendanceTable from "../../Components/AttendanceTable";
import "../../styles/CourseDetails.css";
import Swal from "sweetalert2";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";

// =============================================================
// Countdown Timer Component
// =============================================================
const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(null);
  const calledExpire = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
      if (diff === 0 && !calledExpire.current) {
        calledExpire.current = true;
        onExpire?.();
      }
    };

    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (remaining === null) return null;

  if (remaining === 0) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#fee2e2",
          color: "#dc2626",
          padding: "2px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.5px",
        }}
      >
        <Timer size={12} /> Expired
      </span>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 60;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: isUrgent ? "#fee2e2" : "#dcfce7",
        color: isUrgent ? "#dc2626" : "#16a34a",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700",
        fontFamily: "monospace",
        letterSpacing: "0.5px",
        transition: "background 0.3s",
      }}
    >
      <Timer size={12} />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} left
    </span>
  );
};

// =============================================================
// Create Attendance Dialog
// =============================================================
const CreateAttendanceDialog = ({ isOpen, onClose, onConfirm, isPending }) => {
  const [minutes, setMinutes] = useState(15);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(minutes, 10);
    if (!val || val < 1 || val > 180) return;
    onConfirm(val);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          width: "min(360px, 90vw)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            margin: "0 0 6px",
            fontSize: "18px",
            fontWeight: "700",
            color: "#111",
          }}
        >
          Create Attendance Session
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#6b7280" }}>
          Set how long students have to submit their attendance code.
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            <Timer
              size={14}
              style={{ verticalAlign: "middle", marginRight: "6px" }}
            />
            Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={180}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#111",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "20px",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            autoFocus
          />

          {/* Quick select chips */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            {[5, 10, 15, 30, 60].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setMinutes(opt)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "2px solid",
                  borderColor: minutes == opt ? "#fbbf24" : "#e5e7eb",
                  background: minutes == opt ? "#fffbf0" : "white",
                  color: minutes == opt ? "#b45309" : "#6b7280",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {opt}m
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "10px",
                border: "2px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 2,
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: isPending ? "#fde68a" : "#fbbf24",
                color: "white",
                fontWeight: "700",
                cursor: isPending ? "not-allowed" : "pointer",
                fontSize: "14px",
                transition: "background 0.2s",
              }}
            >
              {isPending ? "Creating..." : "Start Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =============================================================
// Main Component
// =============================================================
const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [showQRCode, setShowQRCode] = useState(false);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deletingAttendanceId, setDeletingAttendanceId] = useState(null);

  // expiresAt is a JS timestamp (ms) stored after successful creation
  const [expiresAt, setExpiresAt] = useState(null);

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
  // Delete attendance mutation
  const deleteAttendanceMutation = useDeleteAttendance();

  const handleDeleteAttendance = async (attendanceId) => {
    const result = await Swal.fire({
      title: "Delete Attendance?",
      text: "This attendance session will be permanently deleted. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#0a20e8ff",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      borderRadius: "12px",
    });

    if (!result.isConfirmed) return;

    setDeletingAttendanceId(attendanceId);
    deleteAttendanceMutation.mutate(
      { attendanceId },
      {
        onSuccess: () => {
          setDeletingAttendanceId(null);
          setSuccessMessage("Attendance session deleted successfully.");
          setTimeout(() => setSuccessMessage(""), 3000);
        },
        onError: (error) => {
          setDeletingAttendanceId(null);
          Swal.fire({
            title: "Delete Failed",
            text: error?.response?.data?.message || "Failed to delete attendance",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        },
      }
    );
  };

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
        // If the API returns expires_at use it, otherwise fall back to minutes
        expiresAt: item.expires_at ? new Date(item.expires_at).getTime() : null,
        minutes: item.minutes ?? null,
      }))
    : [];

  const reversedAttendance = [...attendance].reverse();

  // When attendance list changes (e.g. new session created), re-derive expiry
  // for the LATEST attendance record from the server data (if the API returns it).
  // The client-side expiresAt state is used as a fallback for the just-created session.
  const latestFromServer = reversedAttendance[0];
  const latestExpiresAt =
    latestFromServer?.expiresAt ?? // from server
    expiresAt; // from client-side creation

  const handleConfirmCreate = (minutes) => {
    createAttendanceMutation.mutate(
      { courseId, minutes },
      {
        onSuccess: (data) => {
          setShowCreateDialog(false);

          // Read expiry from the server response: data.data.expiryData.expiresAt
          const rawExpiresAt = data?.data?.expiryData?.expiresAt;
          const serverExpiresAt = rawExpiresAt
            ? new Date(rawExpiresAt).getTime()
            : Date.now() + minutes * 60 * 1000; // fallback: compute client-side

          setExpiresAt(serverExpiresAt);

          // Compute human-readable duration from server timestamps
          const rawAttendanceTime = data?.data?.expiryData?.attendanceTime;
          const durationMs = rawExpiresAt && rawAttendanceTime
            ? new Date(rawExpiresAt) - new Date(rawAttendanceTime)
            : minutes * 60 * 1000;
          const durationMins = Math.round(durationMs / 60000);

          setSuccessMessage(
            `Attendance created! Students have ${durationMins} minute${durationMins !== 1 ? "s" : ""} to check in.`
          );
          setTimeout(() => setSuccessMessage(""), 4000);
        },
        onError: (error) => {
          setShowCreateDialog(false);
          console.error("Error creating attendance:", error);
          alert(
            error?.response?.data?.message || "Failed to create attendance"
          );
        },
      }
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
      {/* Create Attendance Dialog */}
      <CreateAttendanceDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onConfirm={handleConfirmCreate}
        isPending={createAttendanceMutation.isPending}
      />

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

                  // Determine effective expiresAt for this card
                  const cardExpiresAt = isLatest
                    ? (att.expiresAt ?? latestExpiresAt)
                    : att.expiresAt;

                  return (
                    <div key={att.id}>
                      {isLatest ? (
                        <div
                          onClick={() => setShowQRCode(!showQRCode)}
                          className={`attendance-card ${
                            att.highlighted ? "highlighted" : ""
                          } clickable`}
                          style={{ position: "relative" }}
                        >
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAttendance(att.id);
                            }}
                            disabled={deletingAttendanceId === att.id}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background: deletingAttendanceId === att.id ? "#fca5a5" : "#fee2e2",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 6px",
                              cursor: deletingAttendanceId === att.id ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              color: "#dc2626",
                              transition: "background 0.2s",
                              zIndex: 1,
                            }}
                            title="Delete attendance session"
                          >
                            <Trash2 size={14} />
                          </button>

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

                            {/* Countdown / Expiry badge for the latest session */}
                            {cardExpiresAt && (
                              <div
                                style={{ marginTop: "8px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <CountdownTimer
                                  expiresAt={cardExpiresAt}
                                  onExpire={undefined}
                                />
                              </div>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`attendance-card ${
                            att.highlighted ? "highlighted" : ""
                          }`}
                          style={{ position: "relative" }}
                        >
                          {/* Delete button */}
                          <button
                            onClick={() => handleDeleteAttendance(att.id)}
                            disabled={deletingAttendanceId === att.id}
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background: deletingAttendanceId === att.id ? "#fca5a5" : "#fee2e2",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 6px",
                              cursor: deletingAttendanceId === att.id ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              color: "#dc2626",
                              transition: "background 0.2s",
                            }}
                            title="Delete attendance session"
                          >
                            <Trash2 size={14} />
                          </button>

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
                          {/* Show expired badge for older sessions if server returns expiry */}
                          {att.expiresAt && Date.now() > att.expiresAt && (
                            <div style={{ marginTop: "8px" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  padding: "2px 10px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: "700",
                                }}
                              >
                                <Timer size={12} /> Expired
                              </span>
                            </div>
                          )}
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
                                    {/* Countdown inside QR popup */}
                                    {cardExpiresAt && (
                                      <div
                                        style={{
                                          marginBottom: "12px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <CountdownTimer
                                          expiresAt={cardExpiresAt}
                                          onExpire={undefined}
                                        />
                                      </div>
                                    )}
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
            onClick={() => setShowCreateDialog(true)}
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
