import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, FaClock, FaUserInjured, FaSearch, 
  FaFilter, FaSync, FaPlus, FaEdit, FaTrash,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaStethoscope, FaPhone, FaEnvelope, FaMapMarkerAlt
} from "react-icons/fa";

function AppointmentsSection() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-pfva.onrender.com/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
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
      await axios.post("https://hospitalbackend-pfva.onrender.com/appointments", formData, {
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
      await axios.put(`https://hospitalbackend-pfva.onrender.com/appointments/${selectedAppointment._id}`, formData, {
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
      await axios.delete(`https://hospitalbackend-pfva.onrender.com/appointments/${selectedAppointment._id}`, {
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
      await axios.put(`https://hospitalbackend-pfva.onrender.com/appointments/${appointmentId}`, 
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
    setSelectedAppointment(null);
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientName: appointment.patientName || "",
      patientId: appointment.patientId || "",
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
      "scheduled": { color: "primary", icon: FaClock },
      "confirmed": { color: "success", icon: FaCheckCircle },
      "completed": { color: "info", icon: FaCheckCircle },
      "cancelled": { color: "danger", icon: FaTimesCircle },
      "no-show": { color: "warning", icon: FaExclamationTriangle }
    };
    
    const config = statusConfig[status] || { color: "secondary", icon: FaClock };
    const IconComponent = config.icon;
    
    return (
      <span className={`badge bg-${config.color} d-flex align-items-center`}>
        <IconComponent className="me-1" size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      "consultation": "primary",
      "follow-up": "success",
      "check-up": "info",
      "emergency": "danger",
      "surgery": "warning"
    };
    return types[type] || "secondary";
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date >= today && apt.status === 'scheduled').length;
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today).length;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading appointments...</p>
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
            <FaCalendarAlt className="me-2 text-primary" />
            Appointment Management
          </h2>
          <p className="text-muted mb-0">Schedule and manage patient appointments</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          New Appointment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{appointments.length}</h3>
                  <p className="card-text mb-0 opacity-75">Total Appointments</p>
                </div>
                <FaCalendarAlt size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{getUpcomingAppointments()}</h3>
                  <p className="card-text mb-0 opacity-75">Upcoming</p>
                </div>
                <FaClock size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{getTodayAppointments()}</h3>
                  <p className="card-text mb-0 opacity-75">Today's</p>
                </div>
                <FaUserInjured size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">
                    {appointments.filter(a => a.status === 'cancelled').length}
                  </h3>
                  <p className="card-text mb-0 opacity-75">Cancelled</p>
                </div>
                <FaTimesCircle size={32} className="opacity-75" />
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
                  placeholder="Search by patient name or ID..."
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
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
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
            Appointment Schedule ({filteredAppointments.length})
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Patient</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Duration</th>
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
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="align-middle">
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                            <FaUserInjured className="text-primary" size={14} />
                          </div>
                          <div>
                            <div className="fw-semibold">{appointment.patientName}</div>
                            {appointment.patientId && (
                              <small className="text-muted">ID: {appointment.patientId}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
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
                        <span className={`badge bg-${getTypeBadge(appointment.type)}`}>
                          {appointment.type || "Consultation"}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">{appointment.duration || 30} min</span>
                      </td>
                      <td>
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="text-center pe-4">
                        <div className="btn-group" role="group">
                          {appointment.status === 'scheduled' && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                              title="Confirm Appointment"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          {appointment.status === 'scheduled' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                              title="Cancel Appointment"
                            >
                              <FaTimesCircle />
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openEditModal(appointment)}
                            title="Edit Appointment"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
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
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaPlus className="me-2" />
                  Schedule New Appointment
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
                      <label className="form-label fw-semibold">Patient Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        placeholder="optional"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        placeholder=""
                        required
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
                        <option value="consultation">Consultation</option>
                        <option value="follow-up">Follow-up</option>
                        <option value="check-up">Check-up</option>
                        <option value="emergency">Emergency</option>
                        <option value="surgery">Surgery</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Reason for Visit</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Brief reason for the appointment..."
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Schedule Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <FaEdit className="me-2" />
                  Edit Appointment: {selectedAppointment.patientName}
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
                        className="form-control"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
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
                        rows="2"
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
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <FaTrash className="me-2" />
                  Delete Appointment
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <FaCalendarAlt size={48} className="text-danger mb-3" />
                  <h6 className="fw-bold">Delete this appointment?</h6>
                  <p className="text-muted mb-0">
                    Are you sure you want to delete the appointment for <strong>{selectedAppointment.patientName}</strong> on {selectedAppointment.date}?
                    This action cannot be undone.
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
                  onClick={handleDeleteAppointment}
                >
                  Delete Appointment
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