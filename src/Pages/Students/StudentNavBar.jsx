"use client"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useLogout } from "../../hooks/useAuth"
import "./StudentNavBar.css"

const StudentNavBar = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const logoutMutation = useLogout({
    onSuccess: () => {
      localStorage.removeItem("userRole")
      // Set query data to null — AuthProvider immediately sees user=null and redirects.
      // Do NOT use removeQueries here: removing triggers a refetch which hits GET /student/me
      // with no cookies → 401 → interceptor tries refresh → also 401 → infinite reload loop.
      queryClient.setQueryData(["auth", "me"], null)
      navigate("/")
    },
    onError: (error) => {
      console.error("Logout error:", error)
      localStorage.removeItem("userRole")
      queryClient.setQueryData(["auth", "me"], null)
      navigate("/")
    },
  })

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    queryClient.invalidateQueries()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [queryClient])

  return (
    <nav className="student-navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-text">GIBI GUBAE</span>
        </div>
        
        <div className="navbar-actions">
          <button
            className={`nav-refresh-btn${isRefreshing ? " refreshing" : ""}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title={isRefreshing ? "Refreshing..." : "Refresh"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRefreshing ? "spin" : ""}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M8 16H3v5" />
            </svg>
          </button>

          <button 
            className="settings-btn" 
            onClick={() => navigate("/student/settings")}
            title="Settings"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default StudentNavBar
