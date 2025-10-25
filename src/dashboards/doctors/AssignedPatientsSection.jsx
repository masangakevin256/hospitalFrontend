import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUserInjured, FaStethoscope, FaHeartbeat, FaPhone, 
  FaEnvelope, FaMapMarkerAlt, FaExclamationTriangle, 
  FaEdit, FaTrash, FaEye, FaCalendarAlt, FaNotesMedical,
  FaAllergies, FaPills, FaTint, FaIdCard
} from "react-icons/fa";

function AssignedPatientsSection() {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    condition: "",
    contact: "",
    email: "",
    address: "",
    emergencyContact: "",
    bloodType: "",
    allergies: "",
    currentMedications: "",
    notes: "",
    lastVisit: ""
  });

  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  const fetchAssignedPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/patients/assignedDoctor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssigned(res.data);
    } catch (err) {
      setError("Failed to fetch assigned patients.");
      console.error("Error fetching assigned patients", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://hospitalbackend-1-eail.onrender.com/patients/${selectedPatient._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      resetForm();
      fetchAssignedPatients();
    } catch (err) {
      setError("Failed to update patient.");
      console.error(err);
    }
  };

  const handleDeletePatient = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-1-eail.onrender.com/patients/${selectedPatient._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      fetchAssignedPatients();
    } catch (err) {
      setError("Failed to delete patient.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      condition: "",
      contact: "",
      email: "",
      address: "",
      emergencyContact: "",
      bloodType: "",
      allergies: "",
      currentMedications: "",
      notes: "",
      lastVisit: ""
    });
    setSelectedPatient(null);
  };

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "",
      condition: patient.condition || "",
      contact: patient.contact || "",
      email: patient.email || "",
      address: patient.address || "",
      emergencyContact: patient.emergencyContact || "",
      bloodType: patient.bloodType || "",
      allergies: patient.allergies || "",
      currentMedications: patient.currentMedications || "",
      notes: patient.notes || "",
      lastVisit: patient.lastVisit || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Filter and search patients
  const filteredPatients = assigned.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCondition === "all" || patient.condition === filterCondition;
    return matchesSearch && matchesFilter;
  });

  const getConditionBadge = (condition) => {
    const conditions = {
      "Stable": "success",
      "Critical": "danger",
      "Improving": "info",
      "Observation": "warning",
      "Post-Op": "primary",
      "Healthy": "success"
    };
    return conditions[condition] || "secondary";
  };

  const getPriorityLevel = (condition) => {
    const priorities = {
      "Critical": 1,
      "Observation": 2,
      "Post-Op": 3,
      "Improving": 4,
      "Stable": 5,
      "Healthy": 6
    };
    return priorities[condition] || 7;
  };

  // Sort patients by priority (critical first)
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    return getPriorityLevel(a.condition) - getPriorityLevel(b.condition);
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <FaExclamationTriangle className="me-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="section-container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaStethoscope className="me-2 text-primary" />
            My Patients
          </h2>
          <p className="text-muted mb-0">
            Manage {assigned.length} patient{assigned.length !== 1 ? 's' : ''} under your care
          </p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">
            <FaUserInjured className="me-1" />
            {assigned.length} Total
          </span>
          <span className="badge bg-danger fs-6">
            <FaHeartbeat className="me-1" />
            {assigned.filter(p => p.condition === "Critical").length} Critical
          </span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Search Patients</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaUserInjured className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Condition</label>
              <select
                className="form-select"
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
              >
                <option value="all">All Conditions</option>
                <option value="Critical">Critical</option>
                <option value="Observation">Observation</option>
                <option value="Post-Op">Post-Op</option>
                <option value="Improving">Improving</option>
                <option value="Stable">Stable</option>
                <option value="Healthy">Healthy</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-primary w-100"
                onClick={fetchAssignedPatients}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {sortedPatients.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaUserInjured size={64} className="text-muted mb-3 opacity-25" />
            <h5 className="text-muted">No patients found</h5>
            <p className="text-muted mb-0">
              {assigned.length === 0 
                ? "You don't have any patients assigned to you yet." 
                : "No patients match your search criteria."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {sortedPatients.map((patient) => (
            <div key={patient._id} className="col-xl-4 col-lg-6 col-md-6">
              <div className="card border-0 shadow-sm h-100 patient-card">
                <div className={`card-header border-0 py-3 ${
                  patient.condition === "Critical" ? "bg-danger text-white" :
                  patient.condition === "Observation" ? "bg-warning text-dark" :
                  "bg-light"
                }`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">
                      <FaUserInjured className="me-2" />
                      {patient.name}
                    </h6>
                    <span className={`badge bg-${
                      patient.condition === "Critical" ? "light text-danger" :
                      patient.condition === "Observation" ? "dark" : 
                      getConditionBadge(patient.condition)
                    }`}>
                      {patient.condition || "Healthy"}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  {/* Patient Basic Info */}
                  <div className="mb-3">
                    <div className="row g-2 small">
                      <div className="col-6">
                        <strong>Age:</strong> {patient.age || "N/A"}
                      </div>
                      <div className="col-6">
                        <strong>Gender:</strong> {patient.gender || "N/A"}
                      </div>
                      <div className="col-12">
                        <strong>Blood Type:</strong> 
                        <span className={`badge bg-${
                          patient.bloodType ? 'danger' : 'secondary'
                        } ms-2`}>
                          {patient.bloodType || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Contact</h6>
                    <div className="small">
                      {patient.phoneNumber && (
                        <div className="d-flex align-items-center mb-1">
                          <FaPhone className="me-2 text-muted" size={12} />
                          <a href={`tel:${patient.phoneNumber}`} className="text-decoration-none">
                            {patient.phoneNumber}
                          </a>
                        </div>
                      )}
                      {patient.emergencyContact && (
                        <div className="d-flex align-items-center mb-1">
                          <FaExclamationTriangle className="me-2 text-danger" size={12} />
                          <span className="text-danger">Emergency: {patient.emergencyContact}</span>
                        </div>
                      )}
                      {patient.address && (
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-muted" size={12} />
                          <span className="text-truncate">{patient.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="mb-3">
                    <h6 className="fw-semibold text-muted mb-2">Medical Info</h6>
                    <div className="small">
                      {patient.allergies && (
                        <div className="d-flex align-items-center mb-1">
                          <FaAllergies className="me-2 text-warning" size={12} />
                          <span>Allergies: {patient.allergies}</span>
                        </div>
                      )}
                      {patient.currentMedications && (
                        <div className="d-flex align-items-center">
                          <FaPills className="me-2 text-info" size={12} />
                          <span>Meds: {patient.currentMedications}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="card-footer bg-transparent border-0 pt-0">
                  <div className="btn-group w-100" role="group">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openViewModal(patient)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => openEditModal(patient)}
                      title="Edit Patient"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => openDeleteModal(patient)}
                      title="Remove Patient"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Patient Modal */}
      {showViewModal && selectedPatient && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaIdCard className="me-2" />
                  Patient Details: {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Personal Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <p className="form-control-static">{selectedPatient.name}</p>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold">Age</label>
                        <p className="form-control-static">{selectedPatient.age || "N/A"}</p>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">Gender</label>
                        <p className="form-control-static">{selectedPatient.gender || "N/A"}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Blood Type</label>
                      <p className="form-control-static">
                        {selectedPatient.bloodType ? (
                          <span className="badge bg-danger">{selectedPatient.bloodType}</span>
                        ) : "Unknown"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Contact Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaPhone className="me-2" />
                        Contact Number
                      </label>
                      <p className="form-control-static">
                        {selectedPatient.phoneNumber ? (
                          <a href={`tel:${selectedPatient.phoneNumber}`} className="text-decoration-none">
                            {selectedPatient.phoneNumber}
                          </a>
                        ) : "N/A"}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaExclamationTriangle className="me-2 text-danger" />
                        Emergency Contact
                      </label>
                      <p className="form-control-static">
                        {selectedPatient.emergencyContact || "N/A"}
                      </p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaMapMarkerAlt className="me-2" />
                        Address
                      </label>
                      <p className="form-control-static">{selectedPatient.address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <hr />

                <div className="row">
                  <div className="col-12">
                    <h6 className="fw-semibold text-muted mb-3">Medical Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Medical Condition</label>
                        <p className="form-control-static">
                          <span className={`badge bg-${getConditionBadge(selectedPatient.condition)}`}>
                            {selectedPatient.condition || "Healthy"}
                          </span>
                        </p>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Last Visit</label>
                        <p className="form-control-static">
                          {selectedPatient.lastVisit || "No record"}
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaAllergies className="me-2 text-warning" />
                        Allergies
                      </label>
                      <p className="form-control-static">{selectedPatient.allergies || "None reported"}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaPills className="me-2 text-info" />
                        Current Medications
                      </label>
                      <p className="form-control-static">{selectedPatient.currentMedications || "None"}</p>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        <FaNotesMedical className="me-2" />
                        Additional Notes
                      </label>
                      <p className="form-control-static">{selectedPatient.notes || "No additional notes"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedPatient);
                  }}
                >
                  <FaEdit className="me-2" />
                  Edit Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && selectedPatient && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <FaEdit className="me-2" />
                  Edit Patient: {selectedPatient.name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleUpdatePatient}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Medical Condition</label>
                      <select
                        className="form-select"
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      >
                        <option value="">Select Condition</option>
                        <option value="Critical">Critical</option>
                        <option value="Observation">Observation</option>
                        <option value="Post-Op">Post-Op</option>
                        <option value="Improving">Improving</option>
                        <option value="Stable">Stable</option>
                        <option value="Healthy">Healthy</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Blood Type</label>
                      <select
                        className="form-select"
                        value={formData.bloodType}
                        onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Contact Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Emergency Contact</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Allergies</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.allergies}
                        onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                        placeholder="List any allergies..."
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Last Visit</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.lastVisit}
                        onChange={(e) => setFormData({...formData, lastVisit: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Current Medications</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.currentMedications}
                        onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
                        placeholder="List current medications..."
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Medical Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Add medical notes or observations..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning">
                    Update Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPatient && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <FaTrash className="me-2" />
                  Remove Patient
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <FaUserInjured size={48} className="text-danger mb-3" />
                  <h6 className="fw-bold">Remove {selectedPatient.name} from your care?</h6>
                  <p className="text-muted mb-0">
                    This patient will no longer be assigned to you. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeletePatient}
                >
                  Remove Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignedPatientsSection;