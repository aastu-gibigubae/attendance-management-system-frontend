import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCourses,
  useUpdateCourse,
  useDeleteCourse,
} from "../../hooks/useCourses";
import CourseCard from "../../Components/CourseCard";
import Swal from "sweetalert2";
import LoadingPage from "../../Components/LoadingPage";
import ErrorPage from "../../Components/ErrorPage";
import enrollmentService from "../../api/services/enrollmentService";
import "../../styles/CourseList.css";

const CourseLists = () => {
  const navigate = useNavigate();

  // Use React Query hooks
  const { data, isLoading, error, isError } = useCourses();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");
  const [editingCourse, setEditingCourse] = useState(null);

  // State for the edit form
  const [editForm, setEditForm] = useState({
    course_name: "",
    description: "",
    start_date: "",
    end_date: "",
    enrollment_start_date: "",
    enrollment_deadline: "",
    year_level: "",
    semester: "",
  });

  // Transform API data to component format
  const courses = data?.success
    ? data.data.map((course) => ({
        id: course.id,
        title: course.course_name,
        description: course.description,
        start_date: course.start_date,
        end_date: course.end_date,
        enrollment_start_date: course.enrollment_start_date,
        enrollment_deadline: course.enrollment_deadline,
        year_level: course.year_level,
        semester: course.semester,
        status:
          new Date(course.start_date) > new Date()
            ? "Upcoming"
            : new Date(course.end_date) < new Date()
              ? "Past"
              : "Current",
      }))
    : [];

  // Extract unique years and semesters for filter options
  const uniqueYears = [
    ...new Set(courses.map((c) => c.year_level).filter(Boolean)),
  ].sort();
  const uniqueSemesters = [
    ...new Set(courses.map((c) => c.semester).filter(Boolean)),
  ].sort();

  const filteredCourses = courses.filter((course) => {
    const matchesStatus =
      filterStatus === "All" || course.status === filterStatus;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear =
      filterYear === "All" || course.year_level === parseInt(filterYear);
    const matchesSemester =
      filterSemester === "All" || course.semester === parseInt(filterSemester);
    return matchesStatus && matchesSearch && matchesYear && matchesSemester;
  });

  const handleEdit = (course) => {
    setEditingCourse(course.id);
    setEditForm({
      course_name: course.title,
      description: course.description,
      start_date: toDateTimeLocal(course.start_date),
      end_date: toDateTimeLocal(course.end_date),
      enrollment_start_date: toDateTimeLocal(course.enrollment_start_date),
      enrollment_deadline: toDateTimeLocal(course.enrollment_deadline),
      year_level: course.year_level || "",
      semester: course.semester || "",
    });
  };

  const handleView = (courseId) => {
    navigate(`/admin/course/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Deleting...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    deleteCourseMutation.mutate(courseId, {
      onSuccess: () => {
        Swal.fire({
          title: "Deleted!",
          text: "The course has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      },
      onError: (error) => {
        console.error("Delete failed:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete course.",
          icon: "error",
        });
      },
    });
  };

  const submitEdit = async () => {
    // Find the original course to compare year_level
    const originalCourse = courses.find((c) => c.id === editingCourse);
    const yearLevelChanged =
      originalCourse &&
      parseInt(editForm.year_level) !== parseInt(originalCourse.year_level);

    // If year_level changed, check how many students will be unenrolled first
    if (yearLevelChanged) {
      let toUnenroll = [];
      try {
        const enrolledData = await enrollmentService.getEnrolledStudents(editingCourse);
        const enrolledStudents = enrolledData?.students || [];
        const newYearLevel = parseInt(editForm.year_level);
        toUnenroll = enrolledStudents.filter((s) => s.year !== newYearLevel);
      } catch (err) {
        console.error("Failed to fetch enrolled students:", err);
      }

      // Show confirmation alert with the count
      const confirmResult = await Swal.fire({
        icon: "warning",
        title: "Year Level Changed",
        html:
          toUnenroll.length > 0
            ? `<b>${toUnenroll.length} student(s)</b> will be unenrolled because their year level doesn't match the new year level.`
            : `No enrolled students are affected by this year level change.`,
        showCancelButton: true,
        confirmButtonText: "Yes, save changes",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#e92b2bff",
        cancelButtonColor: "#1960edff",
      });

      if (!confirmResult.isConfirmed) return;

      // Proceed with update + unenroll
      updateCourseMutation.mutate(
        { id: editingCourse, data: editForm },
        {
          onSuccess: async () => {
            setEditingCourse(null);
            try {
              if (toUnenroll.length > 0) {
                await Promise.all(
                  toUnenroll.map((s) =>
                    enrollmentService.unenrollStudent({
                      studentId: s.id,
                      courseId: editingCourse,
                    })
                  )
                );
                Swal.fire({
                  icon: "success",
                  title: "Updated",
                  html: `Course updated successfully.<br/><b>${toUnenroll.length} student(s)</b> were automatically unenrolled.`,
                  timer: 4000,
                  showConfirmButton: false,
                });
              } else {
                Swal.fire({
                  icon: "success",
                  title: "Updated",
                  text: "Course updated successfully.",
                  timer: 2000,
                  showConfirmButton: false,
                });
              }
            } catch (err) {
              console.error("Auto-unenroll error:", err);
              Swal.fire({
                icon: "warning",
                title: "Partially Updated",
                text: "Course updated, but failed to unenroll some students",
              });
            }
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Update Failed",
              text: "Failed to update course",
            });
          },
        }
      );
    } else {
      // No year_level change — just save directly
      updateCourseMutation.mutate(
        { id: editingCourse, data: editForm },
        {
          onSuccess: () => {
            setEditingCourse(null);
            Swal.fire({
              icon: "success",
              title: "Updated",
              text: "Course updated successfully.",
              timer: 2000,
              showConfirmButton: false,
            });
          },
          onError: () => {
            Swal.fire({
              icon: "error",
              title: "Update Failed",
              text: "Failed to update course",
            });
          },
        }
      );
    }
  };

  const toDateTimeLocal = (iso) => {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 16);
  };

  const closeModal = () => {
    setEditingCourse(null);
    setEditForm({
      course_name: "",
      description: "",
      start_date: "",
      end_date: "",
      enrollment_start_date: "",
      enrollment_deadline: "",
      year_level: "",
      semester: "",
    });
  };

  return (
    <>
      <div className="course-list-container">
        <div className="course-list-header">
          <h1 className="page-title">Courses</h1>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search courses..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              className="filter-select"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="All">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="All">All Semesters</option>
              {uniqueSemesters.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
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

        {isLoading ? (
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
                onEdit={() => handleEdit(course)}
                onDelete={handleDelete}
                onView={handleView}
                userType="admin"
              />
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <p>No courses found matching your search.</p>
          </div>
        )}
      </div>

      {/* --- UPDATED MODAL SECTION --- */}
      {editingCourse && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Course</h2>

            <div className="modal-form-group">
              <label className="modal-label">Course Name</label>
              <input
                type="text"
                className="modal-input"
                value={editForm.course_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, course_name: e.target.value })
                }
                placeholder="Enter course name"
              />
            </div>

            <div className="modal-form-group">
              <label className="modal-label">Description</label>
              <textarea
                className="modal-textarea"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter course description"
              />
            </div>

            <div className="modal-date-row">
              <div className="modal-form-group">
                <label className="modal-label">Start Date</label>
                <input
                  type="datetime-local"
                  className="modal-input"
                  value={editForm.start_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, start_date: e.target.value })
                  }
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">End Date</label>
                <input
                  type="datetime-local"
                  className="modal-input"
                  value={editForm.end_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, end_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-date-row">
              <div className="modal-form-group">
                <label className="modal-label">Enrollment Start</label>
                <input
                  type="datetime-local"
                  className="modal-input"
                  value={editForm.enrollment_start_date}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      enrollment_start_date: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Enrollment Deadline</label>
                <input
                  type="datetime-local"
                  className="modal-input"
                  value={editForm.enrollment_deadline}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      enrollment_deadline: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-date-row">
              <div className="modal-form-group">
                <label className="modal-label">Year Level *</label>
                <select
                  className="modal-input"
                  value={editForm.year_level}
                  onChange={(e) =>
                    setEditForm({ ...editForm, year_level: parseInt(e.target.value) || "" })
                  }
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Semester *</label>
                <select
                  className="modal-input"
                  value={editForm.semester}
                  onChange={(e) =>
                    setEditForm({ ...editForm, semester: parseInt(e.target.value) || "" })
                  }
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={submitEdit}
                disabled={updateCourseMutation.isPending}
              >
                {updateCourseMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseLists;
