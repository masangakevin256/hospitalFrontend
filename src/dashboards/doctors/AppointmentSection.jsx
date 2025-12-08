import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaCalendarAlt, FaClock, FaUserInjured, FaSearch, 
  FaFilter, FaSync, FaPlus, FaEdit, FaTrash,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaStethoscope, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaInfoCircle, FaSpinner, FaTimes, FaUserMd
} from "react-icons/fa";

function AppointmentsSection() {
  // Main data states
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Separate operation loading states
  const [operationLoading, setOperationLoading] = useState({
    add: false,
    edit: false,
    delete: false,
    status: false,
    fetch: false
  });
  
  // Separate error states for different operations
  const [fetchError, setFetchError] = useState(null);
  const [operationError, setOperationError] = useState({
    add: null,
    edit: null,
    delete: null,
    status: null
  });
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    patientName: "",
    date: "",
    time: "",
    patientId: "",
    reason: ""
  });
  
  // UI states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Success messages
  const [successMessage, setSuccessMessage] = useState("");

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

  // Clear all errors and success messages
  const clearAllMessages = () => {
    setFetchError(null);
    setOperationError({
      add: null,
      edit: null,
      delete: null,
      status: null
    });
    setFormErrors({
      patientName: "",
      date: "",
      time: "",
      patientId: "",
      reason: ""
    });
    setSuccessMessage("");
  };

  // Auto-clear messages after timeout
  useEffect(() => {
    if (successMessage || fetchError || Object.values(operationError).some(err => err)) {
      const timer = setTimeout(() => {
        clearAllMessages();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage, fetchError, operationError]);

  const fetchAppointments = async () => {
    try {
      setOperationLoading(prev => ({ ...prev, fetch: true }));
      setFetchError(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/appointments", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      
      setAppointments(res.data);
      setSuccessMessage("Appointments loaded successfully");
      
    } catch (err) {
      let errorMessage = "Failed to fetch appointments.";
      
      if (err.response) {
        const { status, data } = err.response;
        switch (status) {
          case 401:
            errorMessage = "Session expired. Please log in again.";
            localStorage.removeItem("token");
            window.location.href = "/";
            break;
          case 403:
            errorMessage = "You don't have permission to view appointments.";
            break;
          case 404:
            errorMessage = "Appointments endpoint not found.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || `Error ${status}: ${errorMessage}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please check your connection.";
      } else if (err.request) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }
      
      setFetchError(errorMessage);
      console.error("Fetch appointments error:", err);
      
    } finally {
      setOperationLoading(prev => ({ ...prev, fetch: false }));
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = (isEdit = false) => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Required fields
    if (!formData.patientName.trim()) {
      errors.patientName = "Patient name is required";
    } else if (formData.patientName.length < 2) {
      errors.patientName = "Patient name must be at least 2 characters";
    }
    
    if (!formData.date) {
      errors.date = "Date is required";
    } else if (formData.date < today && !isEdit) {
      errors.date = "Date cannot be in the past";
    }
    
    if (!formData.time) {
      errors.time = "Time is required";
    }
    
    if (formData.patientId && !/^[A-Za-z0-9-]+$/.test(formData.patientId)) {
      errors.patientId = "Patient ID can only contain letters, numbers, and hyphens";
    }
    
    if (formData.reason && formData.reason.length < 10) {
      errors.reason = "Reason should be at least 10 characters";
    }
    
    return errors;
  };

  // Check for appointment conflicts
  const checkAppointmentConflict = (appointmentId = null) => {
    return appointments.some(apt => 
      apt._id !== appointmentId && // Skip current appointment in edit mode
      apt.date === formData.date && 
      apt.time === formData.time &&
      !['cancelled', 'completed', 'no-show'].includes(apt.status)
    );
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setOperationError(prev => ({ ...prev, add: null }));
    setFormErrors({
      patientName: "",
      date: "",
      time: "",
      patientId: "",
      reason: ""
    });
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    
    // Check for conflicts
    if (checkAppointmentConflict()) {
      setOperationError(prev => ({ 
        ...prev, 
        add: "This time slot is already booked. Please choose a different time." 
      }));
      return;
    }
    
    try {
      setOperationLoading(prev => ({ ...prev, add: true }));
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.post(
        "https://hospitalbackend-1-eail.onrender.com/appointments", 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      // Success
      setShowAddModal(false);
      resetForm();
      fetchAppointments();
      setSuccessMessage("Appointment scheduled successfully!");
      
    } catch (err) {
      let errorMessage = "Failed to schedule appointment.";
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            if (data.errors) {
              // Handle backend validation errors
              const backendErrors = {};
              data.errors.forEach(error => {
                backendErrors[error.field] = error.message;
              });
              setFormErrors(prev => ({ ...prev, ...backendErrors }));
              errorMessage = "Please fix the errors in the form.";
            } else {
              errorMessage = data.message || "Invalid data. Please check the form.";
            }
            break;
          case 401:
            errorMessage = "Session expired. Please log in again.";
            localStorage.removeItem("token");
            window.location.href = "/";
            break;
          case 409:
            errorMessage = "Appointment conflict. This time slot is not available.";
            break;
          case 422:
            errorMessage = "Validation failed. Please check your input.";
            break;
          case 429:
            errorMessage = "Too many requests. Please try again in a moment.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || `Error ${status}: ${errorMessage}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }
      
      setOperationError(prev => ({ ...prev, add: errorMessage }));
      console.error("Add appointment error:", err);
      
    } finally {
      setOperationLoading(prev => ({ ...prev, add: false }));
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment) return;
    
    // Clear previous errors
    setOperationError(prev => ({ ...prev, edit: null }));
    setFormErrors({
      patientName: "",
      date: "",
      time: "",
      patientId: "",
      reason: ""
    });
    
    // Validate form
    const validationErrors = validateForm(true);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }
    
    // Check for conflicts (excluding current appointment)
    if (checkAppointmentConflict(selectedAppointment._id)) {
      setOperationError(prev => ({ 
        ...prev, 
        edit: "This time slot is already booked by another appointment." 
      }));
      return;
    }
    
    try {
      setOperationLoading(prev => ({ ...prev, edit: true }));
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication required");
      }

      await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/appointments/${selectedAppointment._id}`, 
        formData, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      // Success
      setShowEditModal(false);
      resetForm();
      fetchAppointments();
      setSuccessMessage("Appointment updated successfully!");
      
    } catch (err) {
      let errorMessage = "Failed to update appointment.";
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            errorMessage = data.message || "Invalid update data.";
            break;
          case 401:
            errorMessage = "Session expired. Please log in again.";
            localStorage.removeItem("token");
            window.location.href = "/";
            break;
          case 403:
            errorMessage = "You don't have permission to update this appointment.";
            break;
          case 404:
            errorMessage = "Appointment not found. It may have been deleted.";
            break;
          case 409:
            errorMessage = "Update conflict. Please refresh and try again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || `Error ${status}: ${errorMessage}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }
      
      setOperationError(prev => ({ ...prev, edit: errorMessage }));
      console.error("Edit appointment error:", err);
      
    } finally {
      setOperationLoading(prev => ({ ...prev, edit: false }));
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      setOperationLoading(prev => ({ ...prev, delete: true }));
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication required");
      }

      await axios.delete(
        `https://hospitalbackend-1-eail.onrender.com/appointments/${selectedAppointment._id}`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      // Success
      setShowDeleteModal(false);
      fetchAppointments();
      setSuccessMessage("Appointment deleted successfully!");
      
    } catch (err) {
      let errorMessage = "Failed to delete appointment.";
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 401:
            errorMessage = "Session expired. Please log in again.";
            localStorage.removeItem("token");
            window.location.href = "/";
            break;
          case 403:
            errorMessage = "You don't have permission to delete this appointment.";
            break;
          case 404:
            errorMessage = "Appointment not found. It may have already been deleted.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || `Error ${status}: ${errorMessage}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }
      
      setOperationError(prev => ({ ...prev, delete: errorMessage }));
      console.error("Delete appointment error:", err);
      
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
      setSelectedAppointment(null);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      setOperationLoading(prev => ({ ...prev, status: true }));
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication required");
      }

      await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/appointments/${appointmentId}`, 
        { status: newStatus },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      fetchAppointments();
      setSuccessMessage(`Appointment status updated to ${newStatus}!`);
      
    } catch (err) {
      let errorMessage = "Failed to update appointment status.";
      
      if (err.response) {
        const { status, data } = err.response;
        
        switch (status) {
          case 400:
            errorMessage = data.message || "Invalid status update.";
            break;
          case 401:
            errorMessage = "Session expired. Please log in again.";
            localStorage.removeItem("token");
            window.location.href = "/";
            break;
          case 403:
            errorMessage = "You don't have permission to update this appointment.";
            break;
          case 404:
            errorMessage = "Appointment not found.";
            break;
          case 409:
            errorMessage = "Cannot update status. The appointment may be locked.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = data?.message || `Error ${status}: ${errorMessage}`;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred.";
      }
      
      setOperationError(prev => ({ ...prev, status: errorMessage }));
      console.error("Update status error:", err);
      
    } finally {
      setOperationLoading(prev => ({ ...prev, status: false }));
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
    setFormErrors({
      patientName: "",
      date: "",
      time: "",
      patientId: "",
      reason: ""
    });
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
    setOperationError(prev => ({ ...prev, edit: null }));
    setShowEditModal(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setOperationError(prev => ({ ...prev, delete: null }));
    setShowDeleteModal(true);
  };

  // Close modal with cleanup
  const closeAddModal = () => {
    setShowAddModal(false);
    setOperationError(prev => ({ ...prev, add: null }));
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setOperationError(prev => ({ ...prev, edit: null }));
    resetForm();
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setOperationError(prev => ({ ...prev, delete: null }));
    setSelectedAppointment(null);
  };

  // Filter and search appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      "scheduled": { color: "primary", icon: FaClock, text: "Scheduled" },
      "confirmed": { color: "success", icon: FaCheckCircle, text: "Confirmed" },
      "completed": { color: "info", icon: FaCheckCircle, text: "Completed" },
      "cancelled": { color: "danger", icon: FaTimesCircle, text: "Cancelled" },
      "no-show": { color: "warning", icon: FaExclamationTriangle, text: "No Show" }
    };
    
    const config = statusConfig[status] || { color: "secondary", icon: FaClock, text: status };
    const IconComponent = config.icon;
    
    return (
      <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25 d-flex align-items-center`}>
        <IconComponent className="me-1" size={12} />
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const types = {
      "consultation": { color: "primary", text: "Consultation" },
      "follow-up": { color: "success", text: "Follow-up" },
      "check-up": { color: "info", text: "Check-up" },
      "emergency": { color: "danger", text: "Emergency" },
      "surgery": { color: "warning", text: "Surgery" }
    };
    
    const config = types[type] || { color: "secondary", text: type };
    
    return (
      <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25`}>
        {config.text}
      </span>
    );
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date >= today && apt.status === 'scheduled').length;
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today && ['scheduled', 'confirmed'].includes(apt.status)).length;
  };

  // Render field error message
  const renderFieldError = (fieldName) => {
    if (formErrors[fieldName]) {
      return (
        <div className="text-danger small mt-1 d-flex align-items-center">
          <FaExclamationTriangle className="me-1" size={10} />
          {formErrors[fieldName]}
        </div>
      );
    }
    return null;
  };

  // Render loading state
  if (loading && operationLoading.fetch) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center">
          <FaCheckCircle className="me-2" />
          <div className="flex-grow-1">{successMessage}</div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {/* Fetch Error Message */}
      {fetchError && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <div className="flex-grow-1">
            <strong>Error loading appointments:</strong> {fetchError}
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setFetchError(null)}
          ></button>
        </div>
      )}

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
          disabled={operationLoading.add}
        >
          {operationLoading.add ? (
            <>
              <FaSpinner className="me-2 fa-spin" />
              Processing...
            </>
          ) : (
            <>
              <FaPlus className="me-2" />
              New Appointment
            </>
          )}
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
                  placeholder="Search by patient name, ID, or reason..."
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
                disabled={operationLoading.fetch}
              >
                {operationLoading.fetch ? (
                  <FaSpinner className="fa-spin" />
                ) : (
                  <>
                    <FaSync className="me-2" />
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-bold text-dark">
            Appointment Schedule ({filteredAppointments.length})
          </h5>
          {operationLoading.fetch && (
            <small className="text-muted">
              <FaSpinner className="fa-spin me-1" />
              Updating...
            </small>
          )}
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
                      {searchTerm || filterStatus !== "all" ? (
                        <>
                          <FaSearch size={48} className="mb-3 opacity-25" />
                          <p className="mb-2">No appointments match your search criteria.</p>
                          <small className="text-muted">Try adjusting your search or filter.</small>
                        </>
                      ) : (
                        <>
                          <FaCalendarAlt size={48} className="mb-3 opacity-25" />
                          <p className="mb-2">No appointments scheduled yet.</p>
                          <button 
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => setShowAddModal(true)}
                          >
                            <FaPlus className="me-1" />
                            Schedule First Appointment
                          </button>
                        </>
                      )}
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
                            <div className="fw-semibold">{appointment.patientName || "Unnamed Patient"}</div>
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
                        {getTypeBadge(appointment.type)}
                      </td>
                      <td>
                        <span className="text-muted">{appointment.duration || 30} min</span>
                      </td>
                      <td>
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="text-center pe-4">
                        <div className="btn-group btn-group-sm" role="group">
                          {appointment.status === 'scheduled' && (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                              title="Confirm Appointment"
                              disabled={operationLoading.status}
                            >
                              {operationLoading.status ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaCheckCircle />
                              )}
                            </button>
                          )}
                          {appointment.status === 'scheduled' && (
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                              title="Cancel Appointment"
                              disabled={operationLoading.status}
                            >
                              {operationLoading.status ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaTimesCircle />
                              )}
                            </button>
                          )}
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => openEditModal(appointment)}
                            title="Edit Appointment"
                            disabled={operationLoading.edit}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => openDeleteModal(appointment)}
                            title="Delete Appointment"
                            disabled={operationLoading.delete}
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
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaPlus className="me-2" />
                  Schedule New Appointment
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={closeAddModal}
                  disabled={operationLoading.add}
                ></button>
              </div>
              <form onSubmit={handleAddAppointment}>
                <div className="modal-body">
                  {/* Operation Error */}
                  {operationError.add && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                      <FaExclamationTriangle className="me-2 flex-shrink-0" />
                      <div className="flex-grow-1">{operationError.add}</div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setOperationError(prev => ({ ...prev, add: null }))}
                      ></button>
                    </div>
                  )}
  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Patient Name 
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.patientName ? 'is-invalid' : ''}`}
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        placeholder="Enter patient's full name (optional)"
                        
                      />
                      {renderFieldError('patientName')}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.patientId ? 'is-invalid' : ''}`}
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        placeholder="Enter patient's id"
                        required
                      />
                      {renderFieldError('patientId')}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {renderFieldError('date')}
                      <small className="text-muted mt-1 d-block">Appointments cannot be scheduled for past dates</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className={`form-control ${formErrors.time ? 'is-invalid' : ''}`}
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                      {renderFieldError('time')}
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
                        className={`form-control ${formErrors.reason ? 'is-invalid' : ''}`}
                        rows="2"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Brief reason for the appointment..."
                      />
                      {renderFieldError('reason')}
                      <small className="text-muted mt-1 d-block">Please provide at least 10 characters for the reason</small>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes, symptoms, or special requirements..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeAddModal}
                    disabled={operationLoading.add}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={operationLoading.add}
                  >
                    {operationLoading.add ? (
                      <>
                        <FaSpinner className="me-2 fa-spin" />
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Appointment'
                    )}
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
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <FaEdit className="me-2" />
                  Edit Appointment: {selectedAppointment.patientName}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={closeEditModal}
                  disabled={operationLoading.edit}
                ></button>
              </div>
              <form onSubmit={handleEditAppointment}>
                <div className="modal-body">
                  {/* Operation Error */}
                  {operationError.edit && (
                    <div className="alert alert-danger d-flex align-items-center mb-4">
                      <FaExclamationTriangle className="me-2 flex-shrink-0" />
                      <div className="flex-grow-1">{operationError.edit}</div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setOperationError(prev => ({ ...prev, edit: null }))}
                      ></button>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Patient Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.patientName ? 'is-invalid' : ''}`}
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        required
                      />
                      {renderFieldError('patientName')}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Patient ID</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.patientId ? 'is-invalid' : ''}`}
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      />
                      {renderFieldError('patientId')}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                      />
                      {renderFieldError('date')}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Time <span className="text-danger">*</span>
                      </label>
                      <input
                        type="time"
                        className={`form-control ${formErrors.time ? 'is-invalid' : ''}`}
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                        required
                      />
                      {renderFieldError('time')}
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
                        className={`form-control ${formErrors.reason ? 'is-invalid' : ''}`}
                        rows="2"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      />
                      {renderFieldError('reason')}
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
                    onClick={closeEditModal}
                    disabled={operationLoading.edit}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning"
                    disabled={operationLoading.edit}
                  >
                    {operationLoading.edit ? (
                      <>
                        <FaSpinner className="me-2 fa-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Appointment'
                    )}
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
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <FaTrash className="me-2" />
                  Delete Appointment
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={closeDeleteModal}
                  disabled={operationLoading.delete}
                ></button>
              </div>
              <div className="modal-body">
                {/* Operation Error */}
                {operationError.delete && (
                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <FaExclamationTriangle className="me-2 flex-shrink-0" />
                    <div className="flex-grow-1">{operationError.delete}</div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setOperationError(prev => ({ ...prev, delete: null }))}
                    ></button>
                  </div>
                )}

                <div className="text-center mb-3">
                  <FaCalendarAlt size={48} className="text-danger mb-3" />
                  <h6 className="fw-bold">Delete this appointment?</h6>
                  <p className="text-muted mb-0">
                    Are you sure you want to delete the appointment for <strong>{selectedAppointment.patientName}</strong> on {selectedAppointment.date} at {selectedAppointment.time}?
                  </p>
                  <div className="alert alert-warning mt-3">
                    <FaExclamationTriangle className="me-2" />
                    This action cannot be undone. All appointment data will be permanently deleted.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={closeDeleteModal}
                  disabled={operationLoading.delete}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDeleteAppointment}
                  disabled={operationLoading.delete}
                >
                  {operationLoading.delete ? (
                    <>
                      <FaSpinner className="me-2 fa-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Appointment'
                  )}
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