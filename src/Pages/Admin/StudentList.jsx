import { useState } from "react";
import { Search, Edit2, Trash2, X, Save } from "lucide-react";
import Swal from "sweetalert2";
import { useStudents, useUpdateStudent, useDeleteStudent } from "../../hooks/useStudents";
import "../../styles/StudentList.css";
import LoadingPage from "../../Components/LoadingPage";

const StudentList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // Use React Query hooks
  const { data, isLoading } = useStudents();
  const updateStudentMutation = useUpdateStudent();
  const deleteStudentMutation = useDeleteStudent();

  // State for Editing
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    father_name: "",
    grand_father_name: "",
    christian_name: "",
    id_number: "",
    email: "",
    password: "",
    gender: "",
    phone_number: "",
    department: "",
    year: "",
    dorm_block: "",
    room_number: "",
    is_verified: false,
    role: "",
  });

  // Get students list - use search results if available, otherwise use all students
  const students = searchResults !== null 
    ? searchResults 
    : (data?.success ? data.data : []);

  // Handle search - manually trigger searchstudents endpoint
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null); // Clear search results
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/search/${searchTerm}`, {
        credentials: "include",
      });
      const searchData = await response.json();
      
      if (searchData.success) {
        setSearchResults(searchData.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      Swal.fire("Error", "Search failed", "error");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Delete Logic
  const handleDelete = async (id) => {
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

    deleteStudentMutation.mutate(id, {
      onSuccess: () => {
        Swal.fire({
          title: "Deleted!",
          text: "The student has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      },
      onError: (error) => {
        console.error("Delete failed:", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete student.",
          icon: "error",
        });
      },
    });
  };

  // Edit Logic
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      first_name: student.first_name || "",
      father_name: student.father_name || "",
      grand_father_name: student.grand_father_name || "",
      christian_name: student.christian_name || "",
      id_number: student.id_number || "",
      email: student.email || "",
      password: "", // Always empty for security
      gender: student.gender || "",
      phone_number: student.phone_number || "",
      department: student.department || "",
      year: student.year || "",
      dorm_block: student.dorm_block || "",
      room_number: student.room_number || "",
      is_verified: student.is_verified || false,
      role: student.role || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: editForm.first_name,
      father_name: editForm.father_name,
      grand_father_name: editForm.grand_father_name,
      christian_name: editForm.christian_name,
      id_number: editForm.id_number,
      email: editForm.email,
      gender: editForm.gender,
      phone_number: editForm.phone_number,
      department: editForm.department,
      year: parseInt(editForm.year, 10),
      dorm_block: editForm.dorm_block,
      room_number: editForm.room_number,
      is_verified: editForm.is_verified,
      role: editForm.role,
    };

    // Only include password if it's been filled in
    if (editForm.password && editForm.password.trim() !== "") {
      payload.password = editForm.password;
    }

    updateStudentMutation.mutate(
      { id: editingStudent.id, data: payload },
      {
        onSuccess: () => {
          setEditingStudent(null);
          Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Student details updated successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        },
        onError: () => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to update student",
          });
        },
      }
    );
  };

  return (
    <>
      <div className="student-list-container">
        <div className="page-header">
          <h1>Student Management</h1>

          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search by name, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">
              <Search size={18} />
            </button>
          </form>
        </div>

        {isLoading || isSearching ? (
          <LoadingPage message={isSearching ? "Searching students..." : "Loading students..."} />
        ) : (
          <>
            {searchResults !== null && (
              <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px', borderRadius: '4px' }}>
                Found {students.length} student{students.length !== 1 ? 's' : ''} matching "{searchTerm}"
                <button 
                  onClick={() => { setSearchResults(null); setSearchTerm(''); }}
                  style={{ marginLeft: '10px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  Clear Search
                </button>
              </div>
            )}
          <div className="table-responsive">
            <table className="student-table">
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Full Name</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>BlockNumber/Room</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.id_number}</td>
                      <td>
                        {student.first_name} {student.father_name}{" "}
                        {student.grand_father_name}
                      </td>
                      <td>{student.department || "-"}</td>
                      <td>{student.year || "-"}</td>
                      <td>
                        {student.dorm_block ? `B${student.dorm_block}` : "-"} /{" "}
                        {student.room_number || "-"}
                      </td>
                      <td className="action-cell">
                        <button
                          className="btn-icon edit"
                          onClick={() => openEditModal(student)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(student.id)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card View for Mobile */}
          <div className="student-cards">
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="student-card">
                  <div className="card-header">
                    <div className="card-name">
                      {student.first_name} {student.father_name}{" "}
                      {student.grand_father_name}
                    </div>
                    <span
                      className={`status-badge ${student.is_verified ? "verified" : "pending"}`}
                    >
                      {student.is_verified ? "✓" : "⋯"}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="card-row">
                      <span className="card-label">ID:</span>
                      <span className="card-value">{student.id_number}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Department:</span>
                      <span className="card-value">
                        {student.department || "-"}
                      </span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Year:</span>
                      <span className="card-value">{student.year || "-"}</span>
                    </div>
                    <div className="card-row">
                      <span className="card-label">Dorm:</span>
                      <span className="card-value">
                        {student.dorm_block ? `Block ${student.dorm_block}` : "-"} / Room {student.room_number || "-"}
                      </span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-icon edit"
                      onClick={() => openEditModal(student)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(student.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No students found.</div>
            )}
          </div>
          </>
        )}



        {/* Edit Modal */}
        {editingStudent && (
          <div
            className="modal-overlay"
            onClick={() => setEditingStudent(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Student Details</h2>
                <button
                  className="close-btn"
                  onClick={() => setEditingStudent(null)}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Informational Header */}
              <div style={{ marginBottom: "20px", color: "#666" }}>
                Editing:{" "}
                <strong>
                  {editingStudent.first_name} {editingStudent.father_name}
                </strong>{" "}
                ({editingStudent.id_number})
              </div>

              <form onSubmit={submitUpdate} className="edit-form">
                {/* Personal Information */}
                <div className="form-section">
                  <h3 className="section-title">Personal Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        name="first_name"
                        value={editForm.first_name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Father Name *</label>
                      <input
                        name="father_name"
                        value={editForm.father_name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Grandfather Name *</label>
                      <input
                        name="grand_father_name"
                        value={editForm.grand_father_name}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Christian Name</label>
                      <input
                        name="christian_name"
                        value={editForm.christian_name}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>ID Number *</label>
                      <input
                        name="id_number"
                        value={editForm.id_number}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                  <h3 className="section-title">Contact Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={editForm.phone_number}
                        onChange={handleEditChange}
                        placeholder="9xxxxxxxx"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="form-section">
                  <h3 className="section-title">Academic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Department *</label>
                      <input
                        name="department"
                        value={editForm.department}
                        onChange={handleEditChange}
                        placeholder="e.g. Software Engineering"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Year *</label>
                      <input
                        name="year"
                        type="number"
                        value={editForm.year}
                        onChange={handleEditChange}
                        placeholder="e.g. 4"
                        required
                        min="1"
                        max="7"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role *</label>
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="is_verified"
                          checked={editForm.is_verified}
                          onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                        />
                        <span>Verified Student</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Housing Information */}
                <div className="form-section">
                  <h3 className="section-title">Housing Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Dorm Block</label>
                      <input
                        name="dorm_block"
                        value={editForm.dorm_block}
                        onChange={handleEditChange}
                        placeholder="e.g. A, B, C"
                      />
                    </div>
                    <div className="form-group">
                      <label>Room Number</label>
                      <input
                        name="room_number"
                        value={editForm.room_number}
                        onChange={handleEditChange}
                        placeholder="e.g. 101"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Security */}
                <div className="form-section">
                  <h3 className="section-title">Account Security</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={editForm.password}
                        onChange={handleEditChange}
                        placeholder="Leave empty to keep current password"
                      />
                      <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Only fill this if you want to change the password
                      </small>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setEditingStudent(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-save">
                    <Save size={18} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StudentList;
