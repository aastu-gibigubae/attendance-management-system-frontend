import { useState, useEffect } from "react"
import "../styles/RecordAttendanceModal.css"

const RecordAttendanceModal = ({ isOpen, onClose, onSubmit, initialCode }) => {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Auto-fill code when initialCode is provided (from QR scan)
  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^A-Z0-9]/g, "").slice(0, 6)
    setCode(value)
    setError("")
  } 


  const handleSubmit = () => {
    if (!code || code.length < 4) {
      setError("Please enter a valid code")
      return
    }

    setSuccess(true)
    onSubmit(code)
    setTimeout(() => {
      setSuccess(false)
      setCode("")
      onClose()
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Record Attendance</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Code Entry Section */}
          <div className="code-entry-section">
            <label className="section-label">Enter Code</label>
            <p className="section-description">
              Ask the admin for today's attendance code. It expires at the end of the session.
            </p>
            <div className="code-input-wrapper">
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="• • •"
                maxLength="6"
                className="code-input"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Success Message */}
          {success && <div className="success-message">✓ Attendance recorded successfully!</div>}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="record-button" onClick={handleSubmit} disabled={!code}>
            Record Attendance
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordAttendanceModal
