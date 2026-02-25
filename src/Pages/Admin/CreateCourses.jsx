import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCourse } from "../../hooks/useCourses";
import "../../styles/CreateCourse.css";

const CreateCourses = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course_name: "",
    description: "",
    course_type: "regular",
    year_level: "",
    semester: "",
    start_date: "",
    end_date: "",
    enrollment_start_date: "",
    enrollment_deadline: "",
  });

  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  // Use React Query mutation
  const createCourseMutation = useCreateCourse();

  const isEvent = formData.course_type === "event";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear year_level/semester when switching to event
      ...(name === "course_type" && value === "event"
        ? { year_level: "", semester: "" }
        : {}),
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.course_name.trim())
      newErrors.course_name = "Course name is required";

    if (!formData.description.trim())
      newErrors.description = "Course description is required";
    else if (formData.description.length > 280)
      newErrors.description = "Description must be 280 characters or less";

    // year_level and semester are required only for regular courses
    if (!isEvent) {
      if (!formData.year_level) newErrors.year_level = "Year level is required";
      if (!formData.semester) newErrors.semester = "Semester is required";
    }

    if (!formData.start_date)
      newErrors.start_date = "Course start date is required";

    if (!formData.end_date) newErrors.end_date = "Course end date is required";
    else if (new Date(formData.end_date) <= new Date(formData.start_date))
      newErrors.end_date = "End date must be after start date";

    if (!formData.enrollment_start_date)
      newErrors.enrollment_start_date = "Enrollment start date is required";

    if (!formData.enrollment_deadline)
      newErrors.enrollment_deadline = "Enrollment end date is required";
    else if (
      new Date(formData.enrollment_deadline) <=
      new Date(formData.enrollment_start_date)
    )
      newErrors.enrollment_deadline =
        "Enrollment end date must be after start date";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSuccessMsg("");

    // Build payload — omit year_level/semester for event courses
    const payload = {
      course_name: formData.course_name,
      description: formData.description,
      course_type: formData.course_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      enrollment_start_date: formData.enrollment_start_date,
      enrollment_deadline: formData.enrollment_deadline,
    };

    if (!isEvent) {
      payload.year_level = parseInt(formData.year_level, 10);
      payload.semester = parseInt(formData.semester, 10);
    }

    createCourseMutation.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg("Course created successfully!");
        setTimeout(() => {
          setSuccessMsg("");
          navigate("/admin/courses");
        }, 2000);

        // Reset form
        setFormData({
          course_name: "",
          description: "",
          course_type: "regular",
          year_level: "",
          semester: "",
          start_date: "",
          end_date: "",
          enrollment_start_date: "",
          enrollment_deadline: "",
        });
      },
      onError: (error) => {
        setErrors({
          submit:
            error?.response?.data?.message ||
            error?.message ||
            "Course Creation Failed",
        });
      },
    });
  };

  const charCount = formData.description.length;

  return (
    <>
      <div className="create-course-container">
        <div className="create-course-card">
          <h1 className="create-course-title">Create Course</h1>

          {successMsg && <div className="success-popup">{successMsg}</div>}
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="create-course-form">
            {/* Course Name */}
            <div className="form-group">
              <label className="form-label">Course name</label>
              <input
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                placeholder="e.g., Introduction to Product Design"
                className={`form-input ${
                  errors.course_name ? "input-error" : ""
                }`}
              />
              {errors.course_name && (
                <span className="error-text">{errors.course_name}</span>
              )}
            </div>

            {/* Course Description */}
            <div className="form-group">
              <label className="form-label">Course description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a concise summary..."
                className={`form-textarea ${
                  errors.description ? "input-error" : ""
                }`}
                rows="4"
              />
              <div className="char-count">
                Keep it under 280 characters. ({charCount}/280)
              </div>
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
            </div>

            {/* Course Type */}
            <div className="form-group">
              <label className="form-label">Course type</label>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                {["regular", "event"].map((type) => (
                  <label
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      cursor: "pointer",
                      fontWeight: formData.course_type === type ? "700" : "400",
                    }}
                  >
                    <input
                      type="radio"
                      name="course_type"
                      value={type}
                      checked={formData.course_type === type}
                      onChange={handleChange}
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
              {isEvent && (
                <p
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "0.78rem",
                    color: "#6b7280",
                  }}
                >
                  Event courses are visible to students of all years &amp; semesters.
                </p>
              )}
            </div>

            {/* Year Level & Semester — only for regular courses */}
            {!isEvent && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Year Level</label>
                  <input
                    type="number"
                    name="year_level"
                    value={formData.year_level}
                    onChange={handleChange}
                    placeholder="e.g., 3"
                    min="1"
                    className={`form-input ${
                      errors.year_level ? "input-error" : ""
                    }`}
                  />
                  {errors.year_level && (
                    <span className="error-text">{errors.year_level}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                    min="1"
                    max="3"
                    className={`form-input ${
                      errors.semester ? "input-error" : ""
                    }`}
                  />
                  {errors.semester && (
                    <span className="error-text">{errors.semester}</span>
                  )}
                </div>
              </div>
            )}

            {/* Date Fields */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course start date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.start_date ? "input-error" : ""
                  }`}
                />
                {errors.start_date && (
                  <span className="error-text">{errors.start_date}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Course end date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.end_date ? "input-error" : ""
                  }`}
                />
                {errors.end_date && (
                  <span className="error-text">{errors.end_date}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Enrollment start date</label>
                <input
                  type="date"
                  name="enrollment_start_date"
                  value={formData.enrollment_start_date}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.enrollment_start_date ? "input-error" : ""
                  }`}
                />
                {errors.enrollment_start_date && (
                  <span className="error-text">
                    {errors.enrollment_start_date}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Enrollment end date</label>
                <input
                  type="date"
                  name="enrollment_deadline"
                  value={formData.enrollment_deadline}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.enrollment_deadline ? "input-error" : ""
                  }`}
                />
                {errors.enrollment_deadline && (
                  <span className="error-text">
                    {errors.enrollment_deadline}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="create-course-button"
            >
              {createCourseMutation.isPending ? "Creating course..." : "Create course"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateCourses;
