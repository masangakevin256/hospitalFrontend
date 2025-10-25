import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { 
  FaCalendarAlt, FaClock, FaUserInjured, FaSearch, 
  FaFilter, FaSync, FaPlus, FaEdit, FaTrash,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaStethoscope, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaUserMd, FaNotesMedical, FaCalendarCheck
} from "react-icons/fa";

function AppointmentsSection({ patientData }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    date: "",
    time: "",
    duration: "30",
    type: "consultation",
    reason: "",
    notes: "",
    status: "scheduled"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const patientName = decoded.userInfo?.name || decoded.userInfo?.username || "Patient";
        setFormData(prev => ({ ...prev, patientName }));
      } catch (error) {
        console.error("Token decode error:", error);
      }
    }
    
    if (patientData) {
      const patientId = patientData.patientId || patientData._id;
      setCurrentPatientId(patientId);
      setFormData(prev => ({ ...prev, patientId }));
    }
    
    fetchAppointments();
  }, [patientData]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3500/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Filter appointments for current patient only
      if (currentPatientId) {
        const patientAppointments = res.data.filter(apt => 
          apt.patientId === currentPatientId || 
          apt.patientName === formData.patientName
        );
        setAppointments(patientAppointments);
      } else {
        setAppointments(res.data);
      }
    } catch (err) {
      setError("Failed to fetch appointments.");
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3500/appointments", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAddModal(false);
      resetForm();
      fetchAppointments();
    } catch (err) {
      setError("Failed to add appointment.");
      console.log(err);
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3500/appointments/${selectedAppointment._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      resetForm();
      fetchAppointments();
    } catch (err) {
      setError("Failed to update appointment.");
      console.error(err);
    }
  };

  const handleDeleteAppointment = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3500/appointments/${selectedAppointment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      fetchAppointments();
    } catch (err) {
      setError("Failed to delete appointment.");
      console.error(err);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3500/appointments/${appointmentId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      setError("Failed to update appointment status.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: formData.patientName, // Keep patient name
      patientId: currentPatientId, // Keep current patient ID
      date: "",
      time: "",
      duration: "30",
      type: "consultation",
      reason: "",
      notes: "",
      status: "scheduled"
    });
    setSelectedAppointment(null);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientName: appointment.patientName || formData.patientName,
      patientId: appointment.patientId || currentPatientId,
      date: appointment.date || "",
      time: appointment.time || "",
      duration: appointment.duration || "30",
      type: appointment.type || "consultation",
      reason: appointment.reason || "",
      notes: appointment.notes || "",
      status: appointment.status || "scheduled"
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  // Filter and search appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      "scheduled": { color: "primary", icon: FaClock, label: "Scheduled" },
      "confirmed": { color: "success", icon: FaCheckCircle, label: "Confirmed" },
      "completed": { color: "info", icon: FaCalendarCheck, label: "Completed" },
      "cancelled": { color: "danger", icon: FaTimesCircle, label: "Cancelled" },
      "no-show": { color: "warning", icon: FaExclamationTriangle, label: "No Show" }
    };
    
    const config = statusConfig[status] || { color: "secondary", icon: FaClock, label: status };
    const IconComponent = config.icon;
    
    return (
      <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25 d-flex align-items-center px-3 py-2`}>
        <IconComponent className="me-2" size={12} />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      "consultation": { color: "primary", icon: FaUserMd },
      "follow-up": { color: "success", icon: FaCalendarCheck },
      "check-up": { color: "info", icon: FaNotesMedical },
      "emergency": { color: "danger", icon: FaExclamationTriangle },
      "surgery": { color: "warning", icon: FaStethoscope }
    };
    
    const config = types[type] || { color: "secondary", icon: FaCalendarAlt };
    const IconComponent = config.icon;
    
    return (
      <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25 d-flex align-items-center px-3 py-2`}>
        <IconComponent className="me-2" size={12} />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date >= today && (apt.status === 'scheduled' || apt.status === 'confirmed')).length;
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today && (apt.status === 'scheduled' || apt.status === 'confirmed')).length;
  };

  const getNextAppointment = () => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments
      .filter(apt => apt.date >= today && (apt.status === 'scheduled' || apt.status === 'confirmed'))
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
    return upcoming;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your appointments...</p>
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

  const nextAppointment = getNextAppointment();

  return (
    <div className="section-container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaCalendarAlt className="me-2 text-primary" />
            My Appointments
          </h2>
          <p className="text-muted mb-0">Manage and schedule your medical appointments</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center px-4 py-2 rounded-pill shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Book Appointment
        </button>
      </div>

      {/* Next Appointment Banner */}
      {nextAppointment && (
        <div className="card border-0 bg-gradient-primary text-white shadow-sm mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="fw-bold mb-2">Your Next Appointment</h5>
                <div className="d-flex flex-wrap align-items-center gap-4">
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 opacity-75" />
                    <span>{new Date(nextAppointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaClock className="me-2 opacity-75" />
                    <span>{nextAppointment.time}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaUserMd className="me-2 opacity-75" />
                    <span>{nextAppointment.type || 'Consultation'}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-end">
                {getStatusBadge(nextAppointment.status)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold text-primary">{appointments.length}</h3>
                  <p className="card-text text-muted mb-0">Total Appointments</p>
                </div>
                <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaCalendarAlt size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold text-success">{getUpcomingAppointments()}</h3>
                  <p className="card-text text-muted mb-0">Upcoming</p>
                </div>
                <div className="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaClock size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold text-info">{getTodayAppointments()}</h3>
                  <p className="card-text text-muted mb-0">Today's</p>
                </div>
                <div className="avatar-sm bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaUserInjured size={20} className="text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold text-warning">
                    {appointments.filter(a => a.status === 'cancelled' || a.status === 'no-show').length}
                  </h3>
                  <p className="card-text text-muted mb-0">Cancelled/No Show</p>
                </div>
                <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaTimesCircle size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Search Appointments</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by date, type, or reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Status</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                onClick={fetchAppointments}
              >
                <FaSync className="me-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3">
          <h5 className="card-title mb-0 fw-bold text-dark">
            Appointment History ({filteredAppointments.length})
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Date & Time</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <FaCalendarAlt size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">No appointments found matching your criteria.</p>
                      <button 
                        className="btn btn-primary mt-3"
                        onClick={() => setShowAddModal(true)}
                      >
                        <FaPlus className="me-2" />
                        Book Your First Appointment
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="align-middle">
                      <td className="ps-4">
                        <div>
                          <div className="fw-semibold">
                            <FaCalendarAlt className="me-2 text-muted" size={12} />
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <small className="text-muted">
                            <FaClock className="me-1" size={10} />
                            {appointment.time}
                          </small>
                        </div>
                      </td>
                      <td>
                        {getTypeBadge(appointment.type)}
                      </td>
                      <td>
                        <span className="text-muted">{appointment.duration || 30} min</span>
                      </td>
                      <td>
                        <span className="text-muted">{appointment.reason || "General Consultation"}</span>
                      </td>
                      <td>
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="text-center pe-4">
                        <div className="btn-group btn-group-sm" role="group">
                          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                            <>
                              <button
                                className="btn btn-outline-success"
                                onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                                title="Confirm Appointment"
                                disabled={appointment.status === 'confirmed'}
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                                title="Cancel Appointment"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openEditModal(appointment)}
                            title="Edit Appointment"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => openDeleteModal(appointment)}
                            title="Delete Appointment"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaPlus className="me-2" />
                  Book New Appointment
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
              <form onSubmit={handleAddAppointment}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={currentPatientId}
                        readOnly
                        placeholder="Auto-filled with your patient ID"
                      />
                      <small className="text-muted">Your patient ID is automatically included</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Duration</label>
                      <select
                        className="form-select"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Appointment Type</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="consultation">General Consultation</option>
                        <option value="follow-up">Follow-up Visit</option>
                        <option value="check-up">Routine Check-up</option>
                        <option value="emergency">Emergency Visit</option>
                        <option value="surgery">Surgery Consultation</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Reason for Visit *</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Please describe the reason for your appointment in detail..."
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Additional Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Any additional information you'd like to share with your doctor..."
                      />
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning text-dark border-0">
                <h5 className="modal-title fw-bold">
                  <FaEdit className="me-2" />
                  Edit Appointment
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
              <form onSubmit={handleEditAppointment}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID</label>
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={currentPatientId}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Time *</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Duration</label>
                      <select
                        className="form-select"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Reason for Visit</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
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
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning px-4">
                    Update Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaTrash className="me-2" />
                  Cancel Appointment
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <div className="avatar-lg bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                    <FaCalendarAlt size={32} className="text-danger" />
                  </div>
                  <h6 className="fw-bold">Cancel this appointment?</h6>
                  <p className="text-muted mb-0">
                    Are you sure you want to cancel your appointment scheduled for <strong>{new Date(selectedAppointment.date).toLocaleDateString()}</strong> at <strong>{selectedAppointment.time}</strong>?
                  </p>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary px-4"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Keep Appointment
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger px-4"
                  onClick={handleDeleteAppointment}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsSection;