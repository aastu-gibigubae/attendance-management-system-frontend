"use client"

import { useState, useRef, useEffect } from "react"
import "../styles/RecordAttendanceModal.css"

const RecordAttendanceModal = ({ isOpen, onClose, onSubmit, initialCode }) => {
  const [code, setCode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

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

  const startQRScan = async () => {
    try {
      setIsScanning(true)
      setError("")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      setError("Unable to access camera. Please enter code manually.")
      setIsScanning(false)
    }
  }

  const stopQRScan = () => {
    setIsScanning(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
    }
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
                disabled={isScanning}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="divider">
            <span className="divider-text">or</span>
          </div>

          {/* QR Scanner Section */}
          <div className="qr-scanner-section">
            {!isScanning ? (
              <>
                <div className="qr-icon">📱</div>
                <label className="section-label">Scan QR from Admin</label>
                <p className="section-description">
                  Use your device camera to scan the QR code shown by the admin to auto-fill the code.
                </p>
                <button className="scan-button" onClick={startQRScan}>
                  Start Camera
                </button>
              </>
            ) : (
              <>
                <video ref={videoRef} className="qr-video" />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <div className="scan-controls">
                  <button className="scan-button danger" onClick={stopQRScan}>
                    Stop Scanning
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Success Message */}
          {success && <div className="success-message">✓ Attendance recorded successfully!</div>}

          {/* Security Message */}
          <div className="security-message">
            <span className="security-icon">✓</span>
            <span className="security-text">Your attendance is tied to your account.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="record-button" onClick={handleSubmit} disabled={!code || isScanning}>
            Record Attendance
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordAttendanceModal
