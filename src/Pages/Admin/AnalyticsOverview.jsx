import { useState } from "react";
import {
  useDailyOverview,
  useCourseListAnalytics,
  useAttendanceTrend,
  useCoursesSummary,
  useAtRiskStudents,
  useCourseAttendanceAnalysis,
  useCourseParticipationInsights,
  useDepartmentAnalytics,
  useCourseSessionEffectiveness,
  useTopMetrics,
  useStudentMonthlyAttendance,
  useAttendanceBreakdown,
  useCourseMonthlySummary,
} from "../../hooks/useAnalytics";
import { useCourses } from "../../hooks/useCourses";
import { useStudents } from "../../hooks/useStudents";
import { useCourseAttendance } from "../../hooks/useAttendance";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Award,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react";
import "../../styles/Analytics.css";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

const COLORS = ["#2e7d32", "#1976d2", "#f57c00", "#d32f2f", "#7b1fa2"];

const AnalyticsOverview = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
  
  // Get current month and year for student analytics
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  
  // Month/year for course monthly summary
  const [courseMonthlyYear, setCourseMonthlyYear] = useState(currentDate.getFullYear());
  const [courseMonthlyMonth, setCourseMonthlyMonth] = useState(currentDate.getMonth() + 1);

  // Fetch data for Overview tab
  const {
    data: dailyData,
    isLoading: dailyLoading,
    error: dailyError,
    refetch: refetchDaily,
  } = useDailyOverview(); // refetchDaily still used in ErrorPage onRetry
  const { data: trendData, isLoading: trendLoading } = useAttendanceTrend();
  const { data: summaryData, isLoading: summaryLoading } = useCoursesSummary();

  // Fetch data for Courses tab
  const { data: courseListData, isLoading: courseListLoading } =
    useCourseListAnalytics();
  const { data: coursesOptions } = useCourses();


  // Fetch data for course-specific analytics
  const { data: atRiskData } = useAtRiskStudents(selectedCourseId);
  const { data: courseAnalysisData } =
    useCourseAttendanceAnalysis(selectedCourseId);
  const { data: participationData } =
    useCourseParticipationInsights(selectedCourseId);
  const { data: effectivenessData } =
    useCourseSessionEffectiveness(selectedCourseId);
  
  // Fetch course monthly summary
  const { data: courseMonthlyData, isLoading: courseMonthlyLoading } = 
    useCourseMonthlySummary(selectedCourseId, courseMonthlyYear, courseMonthlyMonth);
  
  // Fetch attendance sessions for selected course
  const { data: attendanceSessionsData, isLoading: sessionsLoading } = 
    useCourseAttendance(selectedCourseId);
  
  // Fetch breakdown for selected attendance session
  const { data: attendanceBreakdownData, isLoading: breakdownLoading } = 
    useAttendanceBreakdown(selectedAttendanceId);

  // Fetch data for Department tab
  const { data: departmentData } = useDepartmentAnalytics(selectedDepartment);

  // Fetch data for Students tab
  const { data: studentMonthlyData, isLoading: studentMonthlyLoading } = 
    useStudentMonthlyAttendance(selectedStudentId, selectedYear, selectedMonth);

  // Fetch data for Insights tab
  const { data: topMetricsData, isLoading: metricsLoading } = useTopMetrics();

  // Get students list for dropdown
  const { data: studentsData } = useStudents();


  const getTrendIcon = (trend) => {
    if (!trend) return <Minus size={16} />;
    if (trend === "increasing" || trend === "improving")
      return <TrendingUp size={16} color="#2e7d32" />;
    if (trend === "decreasing") return <TrendingDown size={16} color="#d32f2f" />;
    return <Minus size={16} color="#757575" />;
  };

  // Render Overview Tab
  const renderOverviewTab = () => {
    if (dailyLoading || trendLoading || summaryLoading)
      return <LoadingPage message="Loading overview..." />;
    if (dailyError)
      return (
        <ErrorPage
          title="Overview Error"
          message={dailyError?.message || "Unable to load overview"}
          onRetry={refetchDaily}
        />
      );

    const present = dailyData?.total_students_present_today || 0;
    const absent = dailyData?.total_students_absent_today || 0;
    const sessions = dailyData?.total_sessions_today || 0;
    const rate = Math.min(Math.max(dailyData?.today_rate || 0, 0), 100);

    const doughnutData = {
      labels: ["Present", "Absent"],
      datasets: [
        {
          data: [present, absent],
          backgroundColor: ["#2e7d32", "#e0e0e0"],
          borderWidth: 0,
        },
      ],
    };

    const trendChartData = trendData?.trend || [];

    return (
      <div className="tab-content">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="kpi-label">Today's Rate</p>
              <p className="kpi-value">{rate}%</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon">
              <Calendar size={24} />
            </div>
            <div>
              <p className="kpi-label">Sessions Today</p>
              <p className="kpi-value">{sessions}</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green">
              <Users size={24} />
            </div>
            <div>
              <p className="kpi-label">Present</p>
              <p className="kpi-value">{present}</p>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon red">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="kpi-label">Absent</p>
              <p className="kpi-value">{absent}</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Today's Attendance */}
          <div className="chart-card">
            <h2>Today's Attendance</h2>
            <div className="chart-box">
              <Doughnut
                data={doughnutData}
                options={{
                  cutout: "70%",
                  plugins: { legend: { display: true, position: "bottom" } },
                }}
              />
            </div>
          </div>

          {/* 7-Day Trend */}
          <div className="chart-card">
            <h2>7-Day Attendance Trend</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ fill: "#1976d2" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summaryData && (
          <div className="summary-section">
            <h2>Overall Summary</h2>
            <div className="kpi-grid">
              <div className="kpi-card">
                <p className="kpi-label">Average Attendance</p>
                <p className="kpi-value">{summaryData.data?.avg_attendance}%</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Total Enrollments</p>
                <p className="kpi-value">{summaryData.data?.total_enrollments}</p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Total Sessions</p>
                <p className="kpi-value">
                  {summaryData.data?.total_sessions_all_courses}
                </p>
              </div>
              <div className="kpi-card">
                <p className="kpi-label">Best Course</p>
                <p className="kpi-value-small">
                  {summaryData.data?.highest_attended_course}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Courses Tab
  const renderCoursesTab = () => {
    if (courseListLoading) return <LoadingPage message="Loading courses..." />;

    const courses = courseListData?.data || [];

    return (
      <div className="tab-content">
        {/* Course Selector */}
        <div className="filter-section">
          <label htmlFor="course-select">Select Course for Detailed Analytics:</label>
          <select
            id="course-select"
            value={selectedCourseId || ""}
            onChange={(e) => setSelectedCourseId(e.target.value || null)}
            className="course-selector"
          >
            <option value="">-- Select a Course --</option>
            {coursesOptions?.data?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Courses Table */}
        <div className="table-card">
          <h2>All Courses Analytics</h2>
          <div className="table-container">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Enrollment</th>
                  <th>Attendance Rate</th>
                  <th>Sessions</th>
                  <th>Alerts</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.name}</td>
                    <td>{course.enrollment}</td>
                    <td>
                      <span className={`rate-badge ${course.attendance_rate < 50 ? 'low' : course.attendance_rate < 75 ? 'medium' : 'high'}`}>
                        {course.attendance_rate}%
                      </span>
                    </td>
                    <td>{course.sessions}</td>
                    <td>
                      {course.alerts > 0 ? (
                        <span className="alert-badge">{course.alerts}</span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{getTrendIcon(course.course_trend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Course-Specific Analytics */}
        {selectedCourseId && (
          <>
            {courseAnalysisData && (
              <div className="chart-card">
                <h2>Course Attendance Analysis</h2>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <p className="kpi-label">Overall Rate</p>
                    <p className="kpi-value">
                      {courseAnalysisData.data?.overall_rate}%
                    </p>
                  </div>
                  <div className="kpi-card">
                    <p className="kpi-label">Trend</p>
                    <p className="kpi-value-small">
                      {getTrendIcon(courseAnalysisData.data?.trend)}
                      {courseAnalysisData.data?.trend}
                    </p>
                  </div>
                </div>
                {courseAnalysisData.data?.by_day?.length > 0 && (
                  <div className="chart-box">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={courseAnalysisData.data.by_day}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#1976d2"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {effectivenessData && (
              <div className="effectiveness-section">
                <h2>Session Effectiveness</h2>
                <div className="kpi-grid">
                  <div className="kpi-card green-border">
                    <Award size={24} color="#2e7d32" />
                    <div>
                      <p className="kpi-label">Best Session</p>
                      <p className="kpi-value-small">
                        {new Date(
                          effectivenessData.data?.best_session?.date
                        ).toLocaleDateString()}
                      </p>
                      <p className="kpi-value">
                        {effectivenessData.data?.best_session?.rate}%
                      </p>
                    </div>
                  </div>
                  <div className="kpi-card red-border">
                    <AlertTriangle size={24} color="#d32f2f" />
                    <div>
                      <p className="kpi-label">Worst Session</p>
                      <p className="kpi-value-small">
                        {new Date(
                          effectivenessData.data?.worst_session?.date
                        ).toLocaleDateString()}
                      </p>
                      <p className="kpi-value">
                        {effectivenessData.data?.worst_session?.rate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {atRiskData && atRiskData.data?.length > 0 && (
              <div className="table-card">
                <h2>
                  <AlertTriangle size={20} color="#d32f2f" /> At-Risk Students
                </h2>
                <div className="table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Overall Rate</th>
                        <th>Consecutive Absences</th>
                        <th>Courses Affected</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atRiskData.data.map((student, index) => (
                        <tr key={index}>
                          <td>{student.name}</td>
                          <td>{student.department}</td>
                          <td>
                            <span className="rate-badge low">
                              {student.overall_rate}%
                            </span>
                          </td>
                          <td>{student.consecutive_absences}</td>
                          <td>{student.courses_affected}</td>
                          <td>
                            <div className="contact-info">
                              <div>{student.contact_info?.phone}</div>
                              <div className="email-small">
                                {student.contact_info?.email}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Course Monthly Summary */}
            <div className="course-monthly-section">
              <div className="monthly-header">
                <h3>Monthly Summary</h3>
                <div className="monthly-filters">
                  <select
                    value={courseMonthlyMonth}
                    onChange={(e) => setCourseMonthlyMonth(parseInt(e.target.value))}
                    className="month-selector"
                  >
                    {[
                      { value: 1, label: "Jan" },
                      { value: 2, label: "Feb" },
                      { value: 3, label: "Mar" },
                      { value: 4, label: "Apr" },
                      { value: 5, label: "May" },
                      { value: 6, label: "Jun" },
                      { value: 7, label: "Jul" },
                      { value: 8, label: "Aug" },
                      { value: 9, label: "Sep" },
                      { value: 10, label: "Oct" },
                      { value: 11, label: "Nov" },
                      { value: 12, label: "Dec" },
                    ].map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={courseMonthlyYear}
                    onChange={(e) => setCourseMonthlyYear(parseInt(e.target.value))}
                    className="month-selector"
                  >
                    {[2024, 2025, 2026, 2027].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {courseMonthlyLoading ? (
                <div className="monthly-loading">Loading monthly data...</div>
              ) : courseMonthlyData?.data ? (
                <div className="monthly-content">
                  <div className="monthly-stats-grid">
                    <div className="monthly-stat-card primary">
                      <span className="monthly-stat-label">Average Attendance</span>
                      <span className="monthly-stat-value">
                        {courseMonthlyData.data.average_attendance || 0}%
                      </span>
                    </div>
                    <div className="monthly-stat-card success">
                      <span className="monthly-stat-label">Improvement from Last Month</span>
                      <span className="monthly-stat-value">
                        {courseMonthlyData.data.improvement_from_last_month >= 0 ? '+' : ''}
                        {courseMonthlyData.data.improvement_from_last_month || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="student-performance-grid">
                    {/* Best Student */}
                    <div className="performance-card best">
                      <div className="performance-header">
                        <span className="performance-icon">🏆</span>
                        <h4>Best Student</h4>
                      </div>
                      <div className="performance-details">
                        <span className="student-name">
                          {courseMonthlyData.data.best_student?.name || 'N/A'}
                        </span>
                        <span className="student-rate">
                          {courseMonthlyData.data.best_student?.rate || 0}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Worst Student */}
                    <div className="performance-card worst">
                      <div className="performance-header">
                        <span className="performance-icon">⚠️</span>
                        <h4>Needs Attention</h4>
                      </div>
                      <div className="performance-details">
                        <span className="student-name">
                          {courseMonthlyData.data.worst_student?.name || 'N/A'}
                        </span>
                        <span className="student-rate">
                          {courseMonthlyData.data.worst_student?.rate || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="monthly-no-data">
                  No data available for the selected month
                </div>
              )}
            </div>

            {/* Attendance Sessions Table */}
            {attendanceSessionsData && attendanceSessionsData.data?.length > 0 && (
              <div className="table-card">
                <h2>Attendance Sessions</h2>
                {sessionsLoading ? (
                  <LoadingPage message="Loading sessions..." />
                ) : (
                  <div className="table-container">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>Session ID</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Course</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceSessionsData.data.map((session) => {
                          const sessionDate = new Date(session.session_date || session.date || session.created_at);
                          const isExpanded = selectedAttendanceId === session.id;
                          
                          return (
                            <>
                              <tr key={session.id}>
                                <td>{session.id}</td>
                                <td>{sessionDate.toLocaleDateString()}</td>
                                <td>{sessionDate.toLocaleTimeString()}</td>
                                <td>{session.course_name || session.course_id}</td>
                                <td>
                                  <button
                                    className="view-breakdown-btn"
                                    onClick={() => setSelectedAttendanceId(
                                      isExpanded ? null : session.id
                                    )}
                                  >
                                    {isExpanded ? "Hide" : "View"} details
                                  </button>
                                </td>
                              </tr>
                              
                              {/* Breakdown Row */}
                              {isExpanded && (
                                <tr className="breakdown-row">
                                  <td colSpan="5">
                                    {breakdownLoading ? (
                                      <div className="breakdown-loading">Loading details...</div>
                                    ) : attendanceBreakdownData ? (
                                      <div className="breakdown-content">
                                        <div className="breakdown-stats">
                                          <div className="breakdown-stat">
                                            <span className="stat-label">Total Students:</span>
                                            <span className="stat-value">
                                              {attendanceBreakdownData.data?.total_students_in_course}
                                            </span>
                                          </div>
                                          <div className="breakdown-stat green">
                                            <span className="stat-label">Present:</span>
                                            <span className="stat-value">
                                              {attendanceBreakdownData.data?.total_students_present}
                                            </span>
                                          </div>
                                          <div className="breakdown-stat red">
                                            <span className="stat-label">Absent:</span>
                                            <span className="stat-value">
                                              {attendanceBreakdownData.data?.total_students_absent}
                                            </span>
                                          </div>
                                        </div>
                                        
                                        <div className="breakdown-lists">
                                          {/* Present Students */}
                                          <div className="student-list present">
                                            <h4>✓ Present Students</h4>
                                            {attendanceBreakdownData.data?.present_students_list?.length > 0 ? (
                                              <ul>
                                                {attendanceBreakdownData.data.present_students_list.map((student) => (
                                                  <li key={student.id}>
                                                    <span className="student-name">{student.name}</span>
                                                    <span className="student-dept">{student.department}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            ) : (
                                              <p className="empty-list">No students marked present</p>
                                            )}
                                          </div>
                                          
                                          {/* Absent Students */}
                                          <div className="student-list absent">
                                            <h4>✗ Absent Students</h4>
                                            {attendanceBreakdownData.data?.absent_students_list?.length > 0 ? (
                                              <ul>
                                                {attendanceBreakdownData.data.absent_students_list.map((student) => (
                                                  <li key={student.id}>
                                                    <span className="student-name">{student.name}</span>
                                                    <span className="student-dept">{student.department}</span>
                                                  </li>
                                                ))}
                                              </ul>
                                            ) : (
                                              <p className="empty-list">No students marked absent</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {participationData && (
              <div className="participation-section">
                <h2>Participation Insights</h2>
                <div className="insights-grid">
                  <div className="insight-card">
                    <h3>Perfect Attendance</h3>
                    {participationData.data?.students_with_perfect_attendance
                      ?.length > 0 ? (
                      <ul>
                        {participationData.data.students_with_perfect_attendance.map(
                          (student, idx) => (
                            <li key={idx}>
                              {typeof student === 'string' ? student : student.name || student.student_name}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="empty-state">No students</p>
                    )}
                  </div>
                  <div className="insight-card">
                    <h3>Improving Trend</h3>
                    {participationData.data?.students_with_improving_trend
                      ?.length > 0 ? (
                      <ul>
                        {participationData.data.students_with_improving_trend.map(
                          (student, idx) => (
                            <li key={idx}>
                              {typeof student === 'string' ? student : student.name || student.student_name}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="empty-state">No students</p>
                    )}
                  </div>
                  <div className="insight-card">
                    <h3>Frequently Absent</h3>
                    {participationData.data?.frequently_absent_students?.length >
                    0 ? (
                      <ul>
                        {participationData.data.frequently_absent_students.map(
                          (student, idx) => (
                            <li key={idx}>
                              {typeof student === 'string' ? student : student.name || student.student_name}
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="empty-state">No students</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Render Students Tab
  const renderStudentsTab = () => {
    return (
      <div className="tab-content">
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-item">
              <label htmlFor="student-select">Select Student:</label>
              <select
                id="student-select"
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(e.target.value || null)}
                className="course-selector"
              >
                <option value="">-- Select a Student --</option>
                {studentsData?.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.father_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="year-select">Year:</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="course-selector"
              >
                {[2024, 2025, 2026, 2027].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label htmlFor="month-select">Month:</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="course-selector"
              >
                {[
                  { value: 1, label: "January" },
                  { value: 2, label: "February" },
                  { value: 3, label: "March" },
                  { value: 4, label: "April" },
                  { value: 5, label: "May" },
                  { value: 6, label: "June" },
                  { value: 7, label: "July" },
                  { value: 8, label: "August" },
                  { value: 9, label: "September" },
                  { value: 10, label: "October" },
                  { value: 11, label: "November" },
                  { value: 12, label: "December" },
                ].map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {studentMonthlyLoading && <LoadingPage message="Loading student data..." />}

        {selectedStudentId && studentMonthlyData && !studentMonthlyLoading && (
          <div className="student-analytics">
            <h2>
              Monthly Attendance - {
                [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ][selectedMonth - 1]
              } {selectedYear}
            </h2>
            
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon green">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <p className="kpi-label">Attendance Rate</p>
                  <p className="kpi-value">
                    {studentMonthlyData.data?.attendance_rate_for_month}%
                  </p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green">
                  <Users size={24} />
                </div>
                <div>
                  <p className="kpi-label">Sessions Attended</p>
                  <p className="kpi-value">
                    {studentMonthlyData.data?.sessions_attended}
                  </p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon red">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="kpi-label">Sessions Missed</p>
                  <p className="kpi-value">
                    {studentMonthlyData.data?.sessions_missed}
                  </p>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="kpi-label">Total Records</p>
                  <p className="kpi-value">
                    {studentMonthlyData.data?.daily_records?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Records Table */}
            {studentMonthlyData.data?.daily_records?.length > 0 && (
              <div className="table-card">
                <h2>Daily Attendance Records</h2>
                <div className="table-container">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentMonthlyData.data.daily_records.map((record, index) => {
                        const date = new Date(record.date);
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{date.toLocaleDateString()}</td>
                            <td>{date.toLocaleTimeString()}</td>
                            <td>
                              <span className={`rate-badge ${record.present ? 'high' : 'low'}`}>
                                {record.present ? '✓ Present' : '✗ Absent'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!studentMonthlyData.data?.daily_records || 
              studentMonthlyData.data.daily_records.length === 0) && (
              <div className="empty-state-card">
                <p>No attendance records found for this month.</p>
              </div>
            )}
          </div>
        )}

        {!selectedStudentId && (
          <div className="empty-state-card">
            <p>Please select a student to view their monthly attendance.</p>
          </div>
        )}
      </div>
    );
  };

  // Render Departments Tab
  const renderDepartmentsTab = () => {
    // Get unique departments from students data
    const departments = [
      ...new Set(
        studentsData?.data
          ?.map((s) => s.department)
          .filter(Boolean) || []
      ),
    ];

    return (
      <div className="tab-content">
        <div className="filter-section">
          <label htmlFor="dept-select">Select Department:</label>
          <select
            id="dept-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="course-selector"
          >
            <option value="">-- Select a Department --</option>
            {departments.map((dept, idx) => (
              <option key={idx} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {departmentData && (
          <div className="department-analytics">
            <h2>{selectedDepartment} - Department Analytics</h2>
            <div className="kpi-grid">
              <div className="kpi-card">
                <BookOpen size={24} />
                <div>
                  <p className="kpi-label">Average Attendance</p>
                  <p className="kpi-value">
                    {departmentData.data?.average_attendance?.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="kpi-card">
                <Users size={24} />
                <div>
                  <p className="kpi-label">Total Students</p>
                  <p className="kpi-value">{departmentData.data?.total_students}</p>
                </div>
              </div>
              <div className="kpi-card">
                <BookOpen size={24} />
                <div>
                  <p className="kpi-label">Total Courses</p>
                  <p className="kpi-value">{departmentData.data?.total_courses}</p>
                </div>
              </div>
              <div className="kpi-card">
                <Award size={24} />
                <div>
                  <p className="kpi-label">Department Rank</p>
                  <p className="kpi-value">
                    #{departmentData.data?.overall_department_rank}
                  </p>
                </div>
              </div>
            </div>
            {departmentData.data?.attendance_improvement_rate !== 0 && (
              <div className="improvement-indicator">
                {getTrendIcon(
                  departmentData.data?.attendance_improvement_rate > 0
                    ? "increasing"
                    : "decreasing"
                )}
                <span>
                  Improvement Rate:{" "}
                  {departmentData.data?.attendance_improvement_rate}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Insights Tab
  const renderInsightsTab = () => {
    if (metricsLoading) return <LoadingPage message="Loading insights..." />;

    return (
      <div className="tab-content">
        <div className="insights-comparison">
          <div className="top-courses-section">
            <div className="top-courses-card green-bg">
              <h2>
                <Award size={24} /> Best Performing Courses
              </h2>
              <div className="courses-list">
                {topMetricsData?.data?.best_courses?.map((course, idx) => (
                  <div key={idx} className="course-item">
                    <span className="course-name">{course.name}</span>
                    <span className="course-rate">{course.rate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="top-courses-card red-bg">
              <h2>
                <AlertTriangle size={24} /> Needs Improvement
              </h2>
              <div className="courses-list">
                {topMetricsData?.data?.worst_courses?.map((course, idx) => (
                  <div key={idx} className="course-item">
                    <span className="course-name">{course.name}</span>
                    <span className="course-rate">{course.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="page-header">
        <div className="title-group">
          <BarChart3 size={24} />
          <h1>Analytics Dashboard</h1>
        </div>

      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
        <button
          className={`tab-button ${activeTab === "students" ? "active" : ""}`}
          onClick={() => setActiveTab("students")}
        >
          Students
        </button>
        <button
          className={`tab-button ${activeTab === "departments" ? "active" : ""}`}
          onClick={() => setActiveTab("departments")}
        >
          Departments
        </button>
        <button
          className={`tab-button ${activeTab === "insights" ? "active" : ""}`}
          onClick={() => setActiveTab("insights")}
        >
          Insights
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "courses" && renderCoursesTab()}
      {activeTab === "students" && renderStudentsTab()}
      {activeTab === "departments" && renderDepartmentsTab()}
      {activeTab === "insights" && renderInsightsTab()}
    </div>
  );
};

export default AnalyticsOverview;
