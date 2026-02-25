import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStudentCourses,
  useMyCourses,
  useEventCourses,
} from "../../hooks/useCourses";
import { useSelfEnroll } from "../../hooks/useEnrollment";
import CourseCard from "../../Components/CourseCard";
import "../../styles/CourseList.css";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";
import Swal from "sweetalert2";

const CourseList = () => {
  const navigate = useNavigate();

  // Use React Query hooks
  const { data, isLoading, error, isError } = useStudentCourses();
  const { data: myCoursesData, isLoading: myCoursesLoading } = useMyCourses();
  const { data: eventData, isLoading: eventLoading } = useEventCourses();
  const enrollMutation = useSelfEnroll();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");

  // Helper: compute status from dates
  const computeStatus = (start_date, end_date) => {
    const now = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (start > now) return "Upcoming";
    if (end < now) return "Past";
    return "Current";
  };

  // ── Build regular course list from useStudentCourses ─────────────────────
  const allCourses = [];
  const semesterOptions = ["all"];
  const seenIds = new Set();

  if (data?.success && data?.courses) {
    Object.keys(data.courses).forEach((semesterKey) => {
      const semesterNumber = semesterKey.split("_")[1];
      if (!semesterOptions.includes(semesterKey)) {
        semesterOptions.push(semesterKey);
      }

      data.courses[semesterKey].forEach((course) => {
        seenIds.add(course.id);
        allCourses.push({
          id: course.id,
          title: course.course_name,
          description: course.description,
          start_date: course.start_date,
          end_date: course.end_date,
          semester: semesterNumber,
          semesterKey: semesterKey,
          status: computeStatus(course.start_date, course.end_date),
          alreadyEnrolled: course.alreadyEnrolled,
        });
      });
    });
  }

  // ── Build a set of event course IDs so we never show them in the
  //    regular section (they live exclusively in the Events section below)
  const eventCourseIdSet = new Set(
    (eventData?.data ?? []).map((c) => c.id)
  );

  // ── Append extra courses from useMyCourses (deduplicate by id) ───────────
  const myCoursesRaw =
    myCoursesData?.courses ??
    myCoursesData?.data ??
    (Array.isArray(myCoursesData) ? myCoursesData : []);
  const myCoursesArr = Array.isArray(myCoursesRaw) ? myCoursesRaw : [];

  myCoursesArr.forEach((course) => {
    const courseId = course.id;
    const courseName = course.course_name ?? course.title ?? "";

    // Never render event courses in the regular section
    if (eventCourseIdSet.has(courseId)) return;
    if (seenIds.has(courseId)) return;
    const alreadyByName = allCourses.some(
      (c) => c.title.toLowerCase() === courseName.toLowerCase()
    );
    if (alreadyByName) return;

    seenIds.add(courseId);

    const semKey =
      course.semesterKey ??
      course.semester_key ??
      (course.semester != null ? `semester_${course.semester}` : "enrolled");
    const semNum = semKey === "enrolled" ? "Enrolled" : semKey.split("_")[1];

    if (!semesterOptions.includes(semKey)) {
      semesterOptions.push(semKey);
    }

    allCourses.push({
      id: courseId,
      title: courseName,
      description: course.description ?? "",
      start_date: course.start_date ?? null,
      end_date: course.end_date ?? null,
      semester: semNum,
      semesterKey: semKey,
      status: computeStatus(course.start_date, course.end_date),
      alreadyEnrolled: true,
    });
  });

  // ── Apply filters to regular courses ──────────────────────────────────────
  const filteredCourses = allCourses.filter((course) => {
    const matchesStatus =
      filterStatus === "All" || course.status === filterStatus;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester =
      selectedSemester === "all" || course.semesterKey === selectedSemester;
    return matchesStatus && matchesSearch && matchesSemester;
  });

  // ── Build event course list ───────────────────────────────────────────────
  const eventCoursesRaw = eventData?.data ?? [];
  const eventCourses = Array.isArray(eventCoursesRaw)
    ? eventCoursesRaw.map((course) => ({
        id: course.id,
        title: course.course_name,
        description: course.description,
        start_date: course.start_date,
        end_date: course.end_date,
        semester: null,
        semesterKey: "event",
        status: computeStatus(course.start_date, course.end_date),
        alreadyEnrolled: course.alreadyEnrolled,
      }))
    : [];

  const filteredEventCourses = eventCourses.filter((course) => {
    const matchesStatus =
      filterStatus === "All" || course.status === filterStatus;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleView = (courseId) => {
    if (!courseId) return;
    navigate(`/student/course/${courseId}`);
  };

  const handleEdit = () => {
    Swal.fire({
      icon: "info",
      title: "Action Restricted",
      text: "Students cannot edit courses.",
    });
  };

  const handleEnroll = (courseId) => {
    enrollMutation.mutate(courseId, {
      onSuccess: () => {
        // Course list will auto-refresh due to query invalidation
      },
      onError: (error) => {
        Swal.fire({
          icon: "error",
          title: "Enrollment Failed",
          text: error?.response?.data?.message || "Failed to enroll in course",
        });
      },
    });
  };

  const combinedLoading = isLoading || myCoursesLoading;

  return (
    <>
      <div className="course-list-container">
        <div className="course-list-header">
          <h1 className="page-title">Courses</h1>

          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="filter-tabs">
            {semesterOptions.map((semester) => (
              <button
                key={semester}
                className={`filter-tab ${
                  selectedSemester === semester ? "active" : ""
                }`}
                onClick={() => setSelectedSemester(semester)}
              >
                {semester === "all"
                  ? "All"
                  : semester === "enrolled"
                  ? "Enrolled"
                  : `Semester ${semester.split("_")[1]}`}
              </button>
            ))}
          </div>

          <div className="filter-tabs">
            {["All", "Upcoming", "Current", "Past"].map((status) => (
              <button
                key={status}
                className={`filter-tab ${
                  filterStatus === status ? "active" : ""
                }`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* ── Regular Courses Section ── */}
        {combinedLoading ? (
          <LoadingPage message="Loading courses..." />
        ) : isError ? (
          <ErrorPage
            title="Failed to Load Courses"
            message={
              error?.response?.data?.message ||
              error?.message ||
              "Failed to load courses"
            }
            onRetry={() => window.location.reload()}
          />
        ) : filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onView={handleView}
                onEdit={handleEdit}
                onEnroll={handleEnroll}
                userType="student"
                alreadyEnrolled={course.alreadyEnrolled}
                isEnrolling={enrollMutation.isPending}
              />
            ))}
          </div>
        ) : (
          <p>No courses found.</p>
        )}

        {/* ── Event Courses Section ── */}
        {!eventLoading && filteredEventCourses.length > 0 && (
          <div style={{ marginTop: "2.5rem" }}>
            <div className="courses-grid">
              {filteredEventCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={handleView}
                  onEdit={handleEdit}
                  onEnroll={handleEnroll}
                  userType="student"
                  alreadyEnrolled={course.alreadyEnrolled}
                  isEnrolling={enrollMutation.isPending}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseList;
