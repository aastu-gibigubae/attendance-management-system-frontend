import QRCode from "react-qr-code";
import "./PrintQR.css";

const PrintQR = ({ attendanceUrl, code, courseTitle, date, time }) => {
  const handlePrint = () => {
    window.print();
  };
  return (
    <div className="print-qr-container">
      {/* Screen view - show print button */}
      <div className="screen-only">
        <button onClick={handlePrint} className="print-qr-button">
          🖨️ Print QR Code
        </button>
      </div>

      {/* Print view - optimized for printing */}
      <div className="print-content">
        <div className="print-header">
          <h1>{courseTitle}</h1>
          <h2>Attendance QR Code</h2>
          <p className="print-datetime">
            {date} • {time}
          </p>
        </div>

        <div className="print-qr-wrapper">
          <QRCode value={attendanceUrl} size={300} />
        </div>

        <div className="print-code">
          <p className="code-label">Manual Code:</p>
          <p className="code-value">{code}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintQR;
