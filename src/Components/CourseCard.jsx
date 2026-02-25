import { Edit2, Eye, Trash2, UserPlus } from "lucide-react";
import "../styles/CourseCard.css";
import Swal from "sweetalert2";

const CourseCard = ({
  course,
  onEdit,
  onDelete,
  onView,
  onEnroll,
  userType = "student",
  alreadyEnrolled = true,
  isEnrolling = false,
}) => {
  const handleDeleteClick = async () => {
    try {
      await onDelete(course.id);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleEnrollClick = () => {
    if (onEnroll) {
      onEnroll(course.id);
    }
  };

  // Check if the enrollment window is currently open
  const now = new Date();
  const enrollStart = course.enrollment_start_date
    ? new Date(course.enrollment_start_date)
    : null;
  const enrollDeadline = course.enrollment_deadline
    ? new Date(course.enrollment_deadline)
    : null;

  const enrollmentNotStarted = enrollStart && now < enrollStart;
  const enrollmentClosed = enrollDeadline && now > enrollDeadline;

  // Show alert if disabled view button is clicked
  const handleViewClick = (e) => {
    if (userType === "student" && !alreadyEnrolled) {
      e.preventDefault();
      Swal.fire({
        icon: "info",
        title: "Please Enroll",
        text: "Please enroll first",
      });
      return;
    }
    onView(course.id);
  };

  return (
    <div className="course-card">
      {/* Status Badge */}
      <div
        className={`course-status-badge status-${
          course.status?.toLowerCase() || "all"
        }`}
      >
        {course.status || "All"}
      </div>

      {/* Course Title */}
      <h3 className="course-title">{course.title}</h3>

      {/* Course Description */}
      <p className="course-description">{course.description}</p>

      {/* Enrollment Status */}
      {userType === "student" && (
        <div style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}>
          {alreadyEnrolled ? (
            <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
              ✓ Enrolled
            </span>
          ) : (
            <span style={{ color: "#FF9800", fontStyle: "italic" }}>
              Not enrolled
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="course-actions">
        {userType !== "student" && (
          <>
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(course)}
              aria-label="Edit course"
              title="Edit"
            >
              <Edit2 size={18} />
              <span className="btn-text">Edit</span>
            </button>

            <button
              className="action-btn delete-btn"
              onClick={handleDeleteClick}
              aria-label="Delete course"
              title="Delete"
            >
              <Trash2 size={18} />
              <span className="btn-text">Delete</span>
            </button>
          </>
        )}

        {/* Enroll button for students who haven't enrolled yet */}
        {userType === "student" && !alreadyEnrolled && onEnroll && (
          enrollmentClosed ? (
            <button
              className="action-btn enroll-btn"
              disabled
              title="Enrollment deadline has passed"
              style={{ backgroundColor: "#9e9e9e", color: "white", cursor: "not-allowed", opacity: 0.7 }}
            >
              <UserPlus size={18} />
              <span className="btn-text">Closed</span>
            </button>
          ) : enrollmentNotStarted ? (
            <button
              className="action-btn enroll-btn"
              disabled
              title={`Enrollment opens on ${enrollStart?.toLocaleDateString()}`}
              style={{ backgroundColor: "#90CAF9", color: "#1a237e", cursor: "not-allowed", opacity: 0.8 }}
            >
              <UserPlus size={18} />
              <span className="btn-text">Opens soon</span>
            </button>
          ) : (
            <button
              className="action-btn enroll-btn"
              onClick={handleEnrollClick}
              disabled={isEnrolling}
              aria-label="Enroll in course"
              title="Enroll"
              style={{ backgroundColor: "#4CAF50", color: "white" }}
            >
              <UserPlus size={18} />
              <span className="btn-text">
                {isEnrolling ? "Enrolling..." : "Enroll"}
              </span>
            </button>
          )
        )}

        <button
          className="action-btn view-btn"
          onClick={handleViewClick}
          aria-label="View course"
          title="View"
        >
          <span className="btn-text">View</span>
          <Eye size={18} />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
