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

        <div className="print-instructions">
          <h3>How to Mark Attendance:</h3>
          <ol>
            <li>Scan the QR code with your phone camera</li>
            <li>Or manually enter the code in the app</li>
            <li>Submit to record your attendance</li>
          </ol>
        </div>

        <div className="print-footer">
          <p>Scan before the session expires!</p>
        </div>
      </div>
    </div>
  );
};

export default PrintQR;
