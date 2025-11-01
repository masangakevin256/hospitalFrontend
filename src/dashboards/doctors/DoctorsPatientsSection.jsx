import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaUserInjured, 
  FaFilter, FaSync, FaEye, FaStethoscope, FaEnvelope,
  FaLock, FaUserMd, FaHandsHelping, FaPhone, FaMapMarkerAlt,
  FaIdCard, FaHeartbeat, FaAllergies, FaPills, FaCalendar,
  FaExclamationTriangle, FaCheckCircle, FaTimes
} from "react-icons/fa";

function DoctorPatientsSection() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [filterCondition, setFilterCondition] = useState("all");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state
  const [formData, setFormData] = useState({
    patientId: "",
    name: "",
    age: "",
    gender: "",
    email: "",
    phoneNumber: "",
    address: "",
    password: "",
    sickness: "",
    regId: "",
    assignedDoctor: "",
    assignedCareGiver: "",
    condition: "Stable",
    emergencyContact: "",
    bloodType: "",
    allergies: "",
    currentMedications: ""
  });

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchCaregivers();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      setError("Failed to fetch patients.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const fetchCaregivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/caregivers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCaregivers(res.data);
    } catch (err) {
      console.error("Failed to fetch caregivers:", err);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Transform data for backend - send strings, not objects
      const selectedDoctor = doctors.find(d => d._id === formData.assignedDoctor);
      const selectedCaregiver = caregivers.find(c => c._id === formData.assignedCareGiver);
      
      const patientData = {
        ...formData,
        assignedDoctor: selectedDoctor?.username || "", // Send username string
        assignedCareGiver: selectedCaregiver?.name || "", // Send name string
        age: parseInt(formData.age) || 0
      };

      await axios.post("https://hospitalbackend-1-eail.onrender.com/patients", patientData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowAddModal(false);
      resetForm();
      fetchPatients();
      setSuccess("Patient added successfully!");
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add patient.";
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // For editing, send as objects to maintain the object structure
      const selectedDoctor = doctors.find(d => d._id === formData.assignedDoctor);
      const selectedCaregiver = caregivers.find(c => c._id === formData.assignedCareGiver);
      
      const patientData = {
        ...formData,
        assignedDoctor: {
          name: selectedDoctor?.username || "",
          phoneNumber: selectedDoctor?.phoneNumber || ""
        },
        assignedCareGiver: {
          name: selectedCaregiver?.name || "",
          phoneNumber: selectedCaregiver?.phoneNumber || ""
        },
        age: parseInt(formData.age) || 0
      };

      await axios.put(`https://hospitalbackend-1-eail.onrender.com/patients/${selectedPatient._id}`, patientData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowEditModal(false);
      resetForm();
      fetchPatients();
      setSuccess("Patient updated successfully!");
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update patient.";
      setError(errorMsg);
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
      fetchPatients();
      setSuccess("Patient deleted successfully!");
      setError("");
    } catch (err) {
      setError("Failed to delete patient.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      name: "",
      age: "",
      gender: "",
      email: "",
      phoneNumber: "",
      address: "",
      password: "",
      sickness: "",
      regId: "",
      assignedDoctor: "",
      assignedCareGiver: "",
      condition: "Stable",
      emergencyContact: "",
      bloodType: "",
      allergies: "",
      currentMedications: ""
    });
    setSelectedPatient(null);
    setShowPassword(false);
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    
    // Find the IDs based on the names
    const doctor = doctors.find(d => d.username === patient.assignedDoctor?.name);
    const caregiver = caregivers.find(c => c.name === patient.assignedCareGiver?.name);
    
    setFormData({
      patientId: patient.patientId || "",
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "",
      email: patient.email || "",
      phoneNumber: patient.phoneNumber || "",
      address: patient.address || "",
      password: "",
      sickness: patient.sickness || "",
      regId: patient.regId || "",
      assignedDoctor: doctor?._id || "",
      assignedCareGiver: caregiver?._id || "",
      condition: patient.condition || "Stable",
      emergencyContact: patient.emergencyContact || "",
      bloodType: patient.bloodType || "",
      allergies: patient.allergies || "",
      currentMedications: patient.currentMedications || ""
    });
    setShowEditModal(true);
  };

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  const openDeleteModal = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  // Filter and search patients
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCondition === "all" || patient.condition === filterCondition;
    return matchesSearch && matchesFilter;
  });

  const getConditionBadge = (condition) => {
    const conditions = {
      "Stable": "success",
      "Critical": "danger",
      "Improving": "info",
      "Observation": "warning",
      "Post-Op": "primary"
    };
    return conditions[condition] || "secondary";
  };

  const getConditionIcon = (condition) => {
    const icons = {
      "Stable": FaCheckCircle,
      "Critical": FaExclamationTriangle,
      "Improving": FaHeartbeat,
      "Observation": FaEye,
      "Post-Op": FaStethoscope
    };
    return icons[condition] || FaUserInjured;
  };

  // Stats calculations
  const stats = {
    total: patients.length,
    critical: patients.filter(p => p.condition === "Critical").length,
    stable: patients.filter(p => p.condition === "Stable").length,
    unassigned: patients.filter(p => !p.assignedDoctor).length,
    improving: patients.filter(p => p.condition === "Improving").length
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Patient Records...</h5>
          <p className="text-muted">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Notifications */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
          <FaExclamationTriangle className="me-2 flex-shrink-0" />
          <div className="flex-grow-1">{error}</div>
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4" role="alert">
          <FaCheckCircle className="me-2 flex-shrink-0" />
          <div className="flex-grow-1">{success}</div>
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {/* Header Section */}
      <div className="row align-items-center mb-4">
        <div className="col">
          <div className="d-flex align-items-center">
            <div className="avatar-lg bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
              <FaUserInjured className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="h3 fw-bold text-dark mb-1">Patient Management</h1>
              <p className="text-muted mb-0">Comprehensive patient care and monitoring system</p>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <button 
            className="btn btn-primary btn-lg d-flex align-items-center px-4 py-2"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" />
            Add New Patient
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="row g-4 mb-4">
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center p-3">
              <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaUserInjured className="text-primary" size={20} />
              </div>
              <h3 className="fw-bold text-primary mb-1">{stats.total}</h3>
              <p className="text-muted mb-0 small">Total Patients</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center p-3">
              <div className="avatar-sm bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaExclamationTriangle className="text-danger" size={20} />
              </div>
              <h3 className="fw-bold text-danger mb-1">{stats.critical}</h3>
              <p className="text-muted mb-0 small">Critical</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center p-3">
              <div className="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaCheckCircle className="text-success" size={20} />
              </div>
              <h3 className="fw-bold text-success mb-1">{stats.stable}</h3>
              <p className="text-muted mb-0 small">Stable</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center p-3">
              <div className="avatar-sm bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaHeartbeat className="text-info" size={20} />
              </div>
              <h3 className="fw-bold text-info mb-1">{stats.improving}</h3>
              <p className="text-muted mb-0 small">Improving</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center p-3">
              <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaUserMd className="text-warning" size={20} />
              </div>
              <h3 className="fw-bold text-warning mb-1">{stats.unassigned}</h3>
              <p className="text-muted mb-0 small">Unassigned</p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-2 col-md-4 col-sm-6">
          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <div className="card-body text-center p-3">
              <div className="avatar-sm bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <FaSync className="text-secondary" size={20} />
              </div>
              <h3 className="fw-bold text-secondary mb-1">{patients.length}</h3>
              <p className="text-muted mb-0 small">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search patients by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
              >
                <option value="all">All Conditions</option>
                <option value="Stable">Stable</option>
                <option value="Critical">Critical</option>
                <option value="Improving">Improving</option>
                <option value="Observation">Observation</option>
                <option value="Post-Op">Post-Op</option>
              </select>
            </div>
            <div className="col-md-3">
              <div className="form-text text-muted">
                Showing {filteredPatients.length} of {patients.length} patients
              </div>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                onClick={fetchPatients}
              >
                <FaSync className="me-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-bold text-dark">
              Patient Records
            </h5>
            <span className="badge bg-primary">{filteredPatients.length} patients</span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 fw-semibold text-muted">PATIENT</th>
                  <th className="fw-semibold text-muted">CONTACT</th>
                  <th className="fw-semibold text-muted">MEDICAL INFO</th>
                  <th className="fw-semibold text-muted">CONDITION</th>
                  <th className="fw-semibold text-muted">CARE TEAM</th>
                  <th className="text-center pe-4 fw-semibold text-muted">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <FaUserInjured size={48} className="mb-3 opacity-25" />
                        <h5 className="fw-semibold">No patients found</h5>
                        <p className="mb-3">
                          {searchTerm || filterCondition !== "all" 
                            ? "Try adjusting your search or filter criteria." 
                            : "Get started by adding your first patient."
                          }
                        </p>
                        {!searchTerm && filterCondition === "all" && (
                          <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                          >
                            <FaPlus className="me-2" />
                            Add First Patient
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const ConditionIcon = getConditionIcon(patient.condition);
                    return (
                      <tr key={patient._id} className="border-bottom">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <FaUserInjured className="text-primary" size={14} />
                            </div>
                            <div>
                              <div className="fw-semibold text-dark">{patient.name}</div>
                              <div className="d-flex align-items-center text-muted small">
                                <FaIdCard className="me-1" size={12} />
                                {patient.patientId}
                              </div>
                              {patient.regId && (
                                <small className="text-muted">Reg: {patient.regId}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            {patient.email && (
                              <div className="d-flex align-items-center mb-1">
                                <FaEnvelope className="me-2 text-muted" size={12} />
                                <span className="text-truncate">{patient.email}</span>
                              </div>
                            )}
                            {patient.phoneNumber && (
                              <div className="d-flex align-items-center">
                                <FaPhone className="me-2 text-muted" size={12} />
                                <span>{patient.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="small">
                            <div className="mb-1">
                              <span className="text-muted">Age:</span> {patient.age || "N/A"}
                            </div>
                            <div>
                              <span className="text-muted">Gender:</span> {patient.gender || "N/A"}
                            </div>
                            {patient.sickness && (
                              <div className="mt-1">
                                <span className="badge bg-info">{patient.sickness}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${getConditionBadge(patient.condition)} d-flex align-items-center w-fit`}>
                            <ConditionIcon className="me-1" size={12} />
                            {patient.condition || "N/A"}
                          </span>
                        </td>
                        <td>
                          <div className="small">
                            {patient.assignedDoctor?.name ? (
                              <div className="d-flex align-items-center mb-1">
                                <FaUserMd className="me-2 text-success" size={12} />
                                <span>Dr. {patient.assignedDoctor.name}</span>
                              </div>
                            ) : (
                              <div className="text-warning">No doctor assigned</div>
                            )}
                            {patient.assignedCareGiver?.name ? (
                              <div className="d-flex align-items-center">
                                <FaHandsHelping className="me-2 text-info" size={12} />
                                <span>{patient.assignedCareGiver.name}</span>
                                {patient.assignedCareGiver.phoneNumber && (
                                  <small className="text-muted ms-2">({patient.assignedCareGiver.phoneNumber})</small>
                                )}
                              </div>
                            ) : (
                              <div className="text-warning">No caregiver</div>
                            )}
                          </div>
                        </td>
                        <td className="text-center pe-4">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openViewModal(patient)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => openEditModal(patient)}
                              title="Edit Patient"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => openDeleteModal(patient)}
                              title="Delete Patient"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaPlus className="me-2" />
                  Add New Patient
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              
              <form onSubmit={handleAddPatient}>
                <div className="modal-body">
                  <div className="row g-4">
                    {/* Personal Information */}
                    <div className="col-12">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaUserInjured className="me-2" />
                        Personal Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        required
                        placeholder="PAT001"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Registration ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.regId}
                        onChange={(e) => setFormData({...formData, regId: e.target.value})}
                        required
                        placeholder="REG123"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        placeholder="patient@example.com"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Age *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        required
                        min="0"
                        max="120"
                        placeholder="25"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Gender *</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
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

                    {/* Contact Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaPhone className="me-2" />
                        Contact Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        required
                        placeholder="+1234567890"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Emergency Contact</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        placeholder="Emergency contact number"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Address *</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        placeholder="Full residential address"
                      />
                    </div>

                    {/* Medical Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaHeartbeat className="me-2" />
                        Medical Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sickness/Condition *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sickness}
                        onChange={(e) => setFormData({...formData, sickness: e.target.value})}
                        required
                        placeholder="Primary diagnosis"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Medical Condition *</label>
                      <select
                        className="form-select"
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                        required
                      >
                        <option value="Stable">Stable</option>
                        <option value="Critical">Critical</option>
                        <option value="Improving">Improving</option>
                        <option value="Observation">Observation</option>
                        <option value="Post-Op">Post-Op</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Allergies</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.allergies}
                        onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                        placeholder="List any allergies"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Current Medications</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.currentMedications}
                        onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
                        placeholder="List current medications"
                      />
                    </div>

                    {/* Care Team Assignment */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaUserMd className="me-2" />
                        Care Team Assignment
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Assign Doctor *</label>
                      <select
                        className="form-select"
                        value={formData.assignedDoctor}
                        onChange={(e) => setFormData({...formData, assignedDoctor: e.target.value})}
                        required
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.username} - {doctor.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Assign Care Giver *</label>
                      <select
                        className="form-select"
                        value={formData.assignedCareGiver}
                        onChange={(e) => setFormData({...formData, assignedCareGiver: e.target.value})}
                        required
                      >
                        <option value="">Select Care Giver</option>
                        {caregivers.map(caregiver => (
                          <option key={caregiver._id} value={caregiver._id}>
                            {caregiver.name} - {caregiver.phoneNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Account Security */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaLock className="me-2" />
                        Account Security
                      </h6>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Password *</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required
                          placeholder="Create secure password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEye /> : <FaEye />}
                        </button>
                      </div>
                      <small className="text-muted">Password must be at least 6 characters long</small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    <FaPlus className="me-2" />
                    Add Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {showViewModal && selectedPatient && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaEye className="me-2" />
                  Patient Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Personal Information */}
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-primary mb-3">Personal Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Patient ID</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.patientId}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.name}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <label className="form-label fw-semibold">Age</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.age || "N/A"}
                        </div>
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-semibold">Gender</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.gender || "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Blood Type</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.bloodType ? (
                          <span className="badge bg-danger">{selectedPatient.bloodType}</span>
                        ) : "Unknown"}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-primary mb-3">Contact Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.email ? (
                          <a href={`mailto:${selectedPatient.email}`} className="text-decoration-none">
                            {selectedPatient.email}
                          </a>
                        ) : "N/A"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.phoneNumber ? (
                          <a href={`tel:${selectedPatient.phoneNumber}`} className="text-decoration-none">
                            {selectedPatient.phoneNumber}
                          </a>
                        ) : "N/A"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Emergency Contact</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.emergencyContact || "N/A"}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Address</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPatient.address || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-semibold text-primary mb-3">Medical Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Sickness/Condition</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.sickness || "Not specified"}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Medical Condition</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          <span className={`badge bg-${getConditionBadge(selectedPatient.condition)}`}>
                            {selectedPatient.condition || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Allergies</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.allergies || "None reported"}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Current Medications</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.currentMedications || "None"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Care Team */}
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-semibold text-primary mb-3">Care Team</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Assigned Doctor</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.assignedDoctor?.name ? (
                            <div className="d-flex align-items-center">
                              <FaUserMd className="me-2 text-success" />
                              <span>Dr. {selectedPatient.assignedDoctor.name}</span>
                            </div>
                          ) : (
                            <span className="text-warning">Unassigned</span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Assigned Care Giver</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.assignedCareGiver?.name ? (
                            <div>
                              <div className="d-flex align-items-center">
                                <FaHandsHelping className="me-2 text-info" />
                                <span>{selectedPatient.assignedCareGiver.name}</span>
                              </div>
                              {selectedPatient.assignedCareGiver.phoneNumber && (
                                <div className="small text-muted mt-1">
                                  <FaPhone className="me-1" size={10} />
                                  {selectedPatient.assignedCareGiver.phoneNumber}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-warning">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-semibold text-primary mb-3">Additional Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Registration ID</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.regId || "N/A"}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Registered By</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedPatient.registeredBy || "System"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
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
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning text-dark border-0">
                <h5 className="modal-title fw-bold">
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
              <form onSubmit={handleEditPatient}>
                <div className="modal-body">
                  <div className="row g-4">
                    {/* Personal Information */}
                    <div className="col-12">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaUserInjured className="me-2" />
                        Personal Information
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Registration ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.regId}
                        onChange={(e) => setFormData({...formData, regId: e.target.value})}
                      />
                    </div>

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

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        min="0"
                        max="120"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Gender</label>
                      <select
                        className="form-select"
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
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

                    {/* Contact Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaPhone className="me-2" />
                        Contact Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
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

                    {/* Medical Information */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaHeartbeat className="me-2" />
                        Medical Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Sickness/Condition</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sickness}
                        onChange={(e) => setFormData({...formData, sickness: e.target.value})}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Medical Condition</label>
                      <select
                        className="form-select"
                        value={formData.condition}
                        onChange={(e) => setFormData({...formData, condition: e.target.value})}
                      >
                        <option value="Stable">Stable</option>
                        <option value="Critical">Critical</option>
                        <option value="Improving">Improving</option>
                        <option value="Observation">Observation</option>
                        <option value="Post-Op">Post-Op</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Allergies</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.allergies}
                        onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Current Medications</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.currentMedications}
                        onChange={(e) => setFormData({...formData, currentMedications: e.target.value})}
                      />
                    </div>

                    {/* Care Team Assignment */}
                    <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaUserMd className="me-2" />
                        Care Team Assignment
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Assign Doctor</label>
                      <select
                        className="form-select"
                        value={formData.assignedDoctor}
                        onChange={(e) => setFormData({...formData, assignedDoctor: e.target.value})}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map(doctor => (
                          <option key={doctor._id} value={doctor._id}>
                            Dr. {doctor.username} - {doctor.specialty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Assign Care Giver</label>
                      <select
                        className="form-select"
                        value={formData.assignedCareGiver}
                        onChange={(e) => setFormData({...formData, assignedCareGiver: e.target.value})}
                      >
                        <option value="">Select Care Giver</option>
                        {caregivers.map(caregiver => (
                          <option key={caregiver._id} value={caregiver._id}>
                            {caregiver.name} - {caregiver.phoneNumber}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Password Update */}
                    {/* <div className="col-12 mt-4">
                      <h6 className="fw-semibold text-primary mb-3 d-flex align-items-center">
                        <FaLock className="me-2" />
                        Password Update
                      </h6>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">New Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Leave blank to keep current password"
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEye /> : <FaEye />}
                        </button>
                      </div>
                      <small className="text-muted">Leave blank to keep current password</small>
                    </div> */}
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary px-4"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                  >
                    <FaTimes className="me-2" />
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning px-4">
                    <FaEdit className="me-2" />
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
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaTrash className="me-2" />
                  Delete Patient
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="avatar-lg bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    <FaExclamationTriangle className="text-danger" size={32} />
                  </div>
                  <h5 className="fw-bold text-danger">Confirm Deletion</h5>
                  <p className="text-muted mb-0">
                    Are you sure you want to delete patient <strong>"{selectedPatient.name}"</strong>? 
                    This action cannot be undone and all associated data will be permanently removed.
                  </p>
                </div>
                <div className="alert alert-warning">
                  <div className="d-flex">
                    <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Warning:</strong> This will remove all patient records, 
                      medical history, and associated data from the system.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4"
                  onClick={handleDeletePatient}
                >
                  <FaTrash className="me-2" />
                  Delete Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DoctorPatientsSection;