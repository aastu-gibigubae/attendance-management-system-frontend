import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
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
} from "lucide-react";
import { useCourse, useCourseStudents } from "../../hooks/useCourses";
import {
  useCourseAttendance,
  useCreateAttendance,
  useDeleteAttendance,
} from "../../hooks/useAttendance";
import AttendanceTable from "../../Components/AttendanceTable";
import "../../styles/CourseDetails.css";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";

// =============================================================
// CountdownTimer
// Receives a JS timestamp (ms). Ticks every second.
// Always re-derives remaining time from Date.now() — perfect on refresh.
// =============================================================
const CountdownTimer = ({ expiresAt }) => {
  const calc = () => Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  const [remaining, setRemaining] = useState(calc);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!expiresAt) return;
    setRemaining(calc());
    intervalRef.current = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(intervalRef.current);
  }, [expiresAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!expiresAt) return null;

  if (remaining === 0) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "#fee2e2",
          color: "#dc2626",
          padding: "3px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "700",
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
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "700",
        fontFamily: "monospace",
        transition: "background 0.3s",
      }}
    >
      <Timer size={12} />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")} left
    </span>
  );
};

// =============================================================
// CreateAttendanceDialog
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
        <h2 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "700", color: "#111" }}>
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
            <Timer size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} />
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
              marginBottom: "16px",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            autoFocus
          />

          {/* Quick-select chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
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
                color: isPending ? "#92400e" : "white",
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
// Main Page
// =============================================================
const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [showQRCode, setShowQRCode] = useState(false);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: courseData, isLoading: courseLoading, error: courseError } =
    useCourse(courseId);
  const { data: studentsData, isLoading: studentsLoading } =
    useCourseStudents(courseId);
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useCourseAttendance(courseId);

  const createAttendanceMutation = useCreateAttendance();
  const deleteAttendanceMutation = useDeleteAttendance();

  const handleDeleteAttendance = async (attendanceId) => {
    const result = await Swal.fire({
      title: "Delete Attendance?",
      text: "This session and all its records will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      deleteAttendanceMutation.mutate({ attendanceId });
    }
  };

  const isLoading = courseLoading || studentsLoading || attendanceLoading;
  const error = courseError || attendanceError;

  // ---- Transform course ----
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

  /**
   * Transform attendance records from GET /attendance/course/:id
   *
   * The backend returns each record with a `meta` object:
   *   meta: { startTime, expiresAt, isExpired, status }
   *
   * `expiresAt` is computed server-side as  date + minutes * 60 000 ms
   * so it is ALWAYS correct on every page load / refresh / navigation.
   * We never store this in local state — it is always derived from the API.
   */
  const attendance = attendanceData?.success
    ? attendanceData.data.map((item) => ({
        id: item.id,
        date: item.date,
        minutes: item.minutes,
        displayDate: new Date(item.date).toLocaleDateString(),
        displayTime: new Date(item.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        code: item.code,
        highlighted: item.status === "present",
        // expiresAt derived from DB fields: date (start time) + minutes * 60s
        // Both come from the server on every load → timer is always refresh-persistent
        expiresAt: item.date && item.minutes != null
          ? new Date(item.date).getTime() + Number(item.minutes) * 60_000
          : null,
        isExpired: item.date && item.minutes != null
          ? Date.now() > new Date(item.date).getTime() + Number(item.minutes) * 60_000
          : false,
      }))
    : [];

  // Most-recent session first
  const reversedAttendance = [...attendance].reverse();

  // ---- Create handler ----
  const handleConfirmCreate = (minutes) => {
    createAttendanceMutation.mutate(
      { courseId, minutes },
      {
        onSuccess: (data) => {
          setShowCreateDialog(false);

          // POST response: data.data.expiresAt  (flat, as per current backend)
          const serverExpiresAt = data?.data?.expiresAt
            ? new Date(data.data.expiresAt)
            : null;
          const startTime = data?.data?.attendance?.date
            ? new Date(data.data.attendance.date)
            : new Date();
          const durationMins = serverExpiresAt
            ? Math.round((serverExpiresAt - startTime) / 60_000)
            : minutes;

          setSuccessMessage(
            `Attendance created! Students have ${durationMins} minute${durationMins !== 1 ? "s" : ""} to check in.`
          );
          setTimeout(() => setSuccessMessage(""), 5000);
        },
        onError: (err) => {
          setShowCreateDialog(false);
          console.error("Error creating attendance:", err);
          alert(err?.response?.data?.message || "Failed to create attendance");
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
      <CreateAttendanceDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onConfirm={handleConfirmCreate}
        isPending={createAttendanceMutation.isPending}
      />

      <div className="course-details-container">
        {/* Header */}
        <div className="details-header">
          <button className="back-button" onClick={() => navigate("/admin/courses")}>
            <ChevronLeft size={20} />
            Back
          </button>
          <div className="header-content">
            <h1 className="course-title">{course.title}</h1>
            <p className="course-meta">By {course.instructor}</p>
          </div>
        </div>

        {/* Success toast */}
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

        {/* Conditional view */}
        {showAttendanceTable ? (
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
          <>
            {/* Info cards */}
            <div className="info-cards-grid">
              <div className="info-card">
                <div className="info-icon calendar-icon">
                  <Calendar size={24} />
                </div>
                <div className="info-content">
                  <p className="info-label">Duration</p>
                  <p className="info-value">{course.startDate} to {course.endDate}</p>
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

            {/* Attendance list */}
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
                  const isActive = att.expiresAt && Date.now() < att.expiresAt;

                  return (
                    <div key={att.id}>
                      {/* ── Attendance card ── */}
                      <div
                        onClick={
                          isLatest && isActive
                            ? () => setShowQRCode(!showQRCode)
                            : undefined
                        }
                        className={`attendance-card${att.highlighted ? " highlighted" : ""}${
                          isLatest && isActive ? " clickable" : ""
                        }`}
                      >
                        <div className="attendance-date">
                          <span className="date-text">{att.displayDate}</span>
                          {isLatest && isActive && (
                            <span
                              style={{
                                marginLeft: "auto",
                                fontSize: "10px",
                                background: "#fef3c7",
                                color: "#b45309",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                fontWeight: "700",
                              }}
                            >
                              LIVE
                            </span>
                          )}
                        </div>

                        <div className="attendance-time">
                          <Clock size={16} />
                          <span>{att.displayTime}</span>
                          <span style={{ color: "#9ca3af" }}>
                            · {att.minutes}m window
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            Code:{" "}
                            <strong style={{ color: "#1f2937" }}>{att.code}</strong>
                          </span>
                        </div>

                        {/* Countdown timer — only on the latest card */}
                        {isLatest && att.expiresAt && (
                          <div style={{ marginTop: "6px" }}>
                            <CountdownTimer expiresAt={att.expiresAt} />
                          </div>
                        )}

                        {isLatest && isActive && (
                          <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#9ca3af" }}>
                            Tap to show QR code
                          </p>
                        )}

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAttendance(att.id);
                          }}
                          disabled={deleteAttendanceMutation.isPending}
                          style={{
                            marginTop: "10px",
                            padding: "4px 12px",
                            borderRadius: "6px",
                            border: "1px solid #fecaca",
                            background: "#fff5f5",
                            color: "#dc2626",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: deleteAttendanceMutation.isPending ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          🗑 Delete
                        </button>
                      </div>

                      {/* ── QR popup — latest active session only ── */}
                      {isLatest && isActive && showQRCode && (
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
                                  const html2canvas = (await import("html2canvas")).default;
                                  const { jsPDF } = await import("jspdf");
                                  const printElement = document.querySelector(".pdf-content");
                                  if (!printElement) return;
                                  printElement.style.display = "block";
                                  printElement.style.position = "relative";
                                  const canvas = await html2canvas(printElement, {
                                    scale: 2,
                                    backgroundColor: "#ffffff",
                                  });
                                  printElement.style.display = "none";
                                  printElement.style.position = "absolute";
                                  const imgData = canvas.toDataURL("image/png");
                                  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
                                  const imgWidth = 210;
                                  const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
                                  pdf.save(`Attendance-QR-${att.code}.pdf`);
                                } catch (err) {
                                  console.error("Error generating PDF:", err);
                                  alert("Failed to generate PDF.");
                                }
                              };

                              return (
                                <>
                                  {/* Screen view */}
                                  <div className="screen-only">
                                    <div style={{ marginBottom: "12px", textAlign: "center" }}>
                                      <CountdownTimer expiresAt={att.expiresAt} />
                                    </div>
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

                                  {/* Hidden PDF content */}
                                  <div className="pdf-content" style={{ display: "none" }}>
                                    <div style={{ padding: "40px", textAlign: "center" }}>
                                      <h1 style={{ fontSize: "28px", margin: "0 0 10px" }}>
                                        {course.title}
                                      </h1>
                                      <h2 style={{ fontSize: "20px", margin: "0 0 10px", fontWeight: "normal" }}>
                                        Attendance QR Code
                                      </h2>
                                      <p style={{ fontSize: "14px", color: "#999" }}>
                                        {att.displayDate} • {att.displayTime}
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
                                        <QRCode value={attendanceUrl} size={300} />
                                      </div>
                                      <div
                                        style={{
                                          margin: "30px 0",
                                          padding: "20px",
                                          background: "#f5f5f5",
                                          borderRadius: "8px",
                                        }}
                                      >
                                        <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px" }}>
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
                                        <h3 style={{ fontSize: "18px", marginBottom: "15px" }}>
                                          How to Mark Attendance:
                                        </h3>
                                        <ol style={{ paddingLeft: "25px", lineHeight: "1.8" }}>
                                          <li>Scan the QR code with your phone camera</li>
                                          <li>Or manually enter the code in the app</li>
                                          <li>Submit to record your attendance</li>
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

        {/* Action buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateDialog(true)}
            disabled={createAttendanceMutation.isPending}
          >
            <span className="btn-icon">+</span>
            {createAttendanceMutation.isPending ? "Creating..." : "Create Attendance"}
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
