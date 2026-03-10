import "../styles/AttendanceCard.css";

const AttendanceCard = ({
  date,
  timeStart,
  timeEnd,
  status,
  clickable,
  onPendingClick,
}) => {


  const handleClick = () => {
    // Only trigger click if the card is explicitly marked as clickable
    if (clickable && onPendingClick) {
      // Pass the full record data needed by handlePendingClick in CourseDetail
      onPendingClick({
        date,
        timeStart,
        timeEnd, 
        status /* Add other necessary fields like id if needed for modal context */,
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "present":
        return "✓";
      case "absent":
        return "✕";
      case "pending":
        return "⏱";
      case "expired": // New case for expired
        return "⨉";
      default:
        return "?";
    }
  };

  const getStatusClass = () => {
    // Use 'clickable' prop from CourseDetail to determine clickability/hover
    return `attendance-card ${status} ${clickable ? "clickable" : ""}`;
  };

  return (
    <div className={getStatusClass()} onClick={handleClick}>
      {/* ... rest of the card content ... */}
      <div className="attendance-icon">{getStatusIcon()}</div>
      <div className="attendance-date">{date}</div>
      <div className="attendance-time">
        {timeStart} — {timeEnd}
      </div>
    </div>
  );
};

export default AttendanceCard;
