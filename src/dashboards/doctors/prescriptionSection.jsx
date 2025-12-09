import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaPills, FaSearch, FaFilter, FaSync, FaPrint,
  FaCalendarAlt, FaUserMd, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaEye,
  FaFileMedical, FaPrescription, FaCapsules,
  FaAllergies, FaClock, FaHistory, FaEdit,
  FaTrash, FaPlus, FaTimes, FaSave, FaFileAlt,
  FaHospital, FaSyringe, FaUserInjured, FaIdCard
} from "react-icons/fa";

function PrescriptionsSection({ doctorId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    patientId: "",
    medication: "",
    dosage: "",
    quantity: "",
    refills: "",
    expiryDate: "",
    status: "active",
    instructions: "",
    pharmacy: "",
    condition: "",
    lastFilled: "",
    nextRefill: ""
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, [doctorId]);

  useEffect(() => {
    filterPrescriptions();
  }, [searchTerm, filterStatus, prescriptions]);

  useEffect(() => {
    if (patientSearch) {
      const filtered = patients.filter(patient =>
        patient.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(patientSearch.toLowerCase()) ||
        patient.email?.toLowerCase().includes(patientSearch.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients.slice(0, 5)); // Show only 5 by default
    }
  }, [patientSearch, patients]);

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/prescriptions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(res.data);
      setFilteredPrescriptions(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching prescriptions:", error);
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    const token = localStorage.getItem("token");
    try {
      // Assuming you have an endpoint for doctor's patients
      const res = await axios.get(`https://hospitalbackend-1-eail.onrender.com/doctors/${doctorId}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (error) {
      console.log("Error fetching patients:", error);
      // Fallback: Get all patients if specific endpoint doesn't exist
      try {
        const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/patients", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(res.data);
      } catch (fallbackError) {
        console.log("Fallback error fetching patients:", fallbackError);
      }
    }
  };

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(prescription => prescription.status === filterStatus);
    }

    setFilteredPrescriptions(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "active": { color: "success", icon: FaCheckCircle, text: "Active" },
      "expired": { color: "danger", icon: FaTimesCircle, text: "Expired" },
      "completed": { color: "info", icon: FaCheckCircle, text: "Completed" },
      "cancelled": { color: "warning", icon: FaTimesCircle, text: "Cancelled" },
      "pending": { color: "secondary", icon: FaClock, text: "Pending" }
    };

    const config = statusConfig[status] || { color: "secondary", icon: FaClock, text: status };
    const IconComponent = config.icon;

    return (
      <span className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} border-opacity-25 d-flex align-items-center px-3 py-2`}>
        <IconComponent className="me-2" size={12} />
        {config.text}
      </span>
    );
  };

  const getRefillStatus = (prescription) => {
    if (prescription.status !== "active") return null;
    
    const today = new Date();
    const nextRefill = prescription.nextRefill ? new Date(prescription.nextRefill) : null;
    
    if (!nextRefill) return { type: "none", text: "No refill date", color: "secondary" };
    
    const daysUntilRefill = Math.ceil((nextRefill - today) / (1000 * 60 * 60 * 24));

    if (daysUntilRefill <= 0) {
      return { type: "ready", text: "Ready for Refill", color: "success" };
    } else if (daysUntilRefill <= 7) {
      return { type: "soon", text: `Refill in ${daysUntilRefill} days`, color: "warning" };
    } else {
      return { type: "later", text: `Refill in ${daysUntilRefill} days`, color: "info" };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient.patientId
    }));
    setPatientSearch(`${patient.name} (${patient.patientId})`);
    setFilteredPatients([]);
  };

  const openCreateModal = () => {
    setFormData({
      patientId: "",
      medication: "",
      dosage: "",
      quantity: "",
      refills: "0",
      expiryDate: "",
      status: "active",
      instructions: "",
      pharmacy: "",
      condition: "",
      lastFilled: "",
      nextRefill: ""
    });
    setSelectedPatient(null);
    setPatientSearch("");
    setShowCreateModal(true);
  };

  const openEditModal = (prescription) => {
    setSelectedPrescription(prescription);
    setFormData({
      patientId: prescription.patientId,
      medication: prescription.medication,
      dosage: prescription.dosage,
      quantity: prescription.quantity,
      refills: prescription.refills || "0",
      expiryDate: prescription.expiryDate ? new Date(prescription.expiryDate).toISOString().split('T')[0] : "",
      status: prescription.status,
      instructions: prescription.instructions,
      pharmacy: prescription.pharmacy,
      condition: prescription.condition,
      lastFilled: prescription.lastFilled ? new Date(prescription.lastFilled).toISOString().split('T')[0] : "",
      nextRefill: prescription.nextRefill ? new Date(prescription.nextRefill).toISOString().split('T')[0] : ""
    });
    setSelectedPatient({
      patientId: prescription.patientId,
      name: prescription.patientName
    });
    setPatientSearch(`${prescription.patientName} (${prescription.patientId})`);
    setShowEditModal(true);
  };

  const openDeleteModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      if (showCreateModal) {
        // Create new prescription
        await axios.post("https://hospitalbackend-1-eail.onrender.com/prescriptions", formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Prescription created successfully!");
      } else if (showEditModal) {
        // Update existing prescription
        await axios.put(`https://hospitalbackend-1-eail.onrender.com/prescriptions/${selectedPrescription._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("Prescription updated successfully!");
      }

      // Refresh data
      fetchPrescriptions();
      
      // Close modal and reset form
      setShowCreateModal(false);
      setShowEditModal(false);
      setFormData({
        patientId: "",
        medication: "",
        dosage: "",
        quantity: "",
        refills: "0",
        expiryDate: "",
        status: "active",
        instructions: "",
        pharmacy: "",
        condition: "",
        lastFilled: "",
        nextRefill: ""
      });
      setSelectedPatient(null);
      setPatientSearch("");
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert(error.response?.data?.message || "Failed to save prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPrescription) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`https://hospitalbackend-1-eail.onrender.com/prescriptions/${selectedPrescription._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Prescription deleted successfully!");
      fetchPrescriptions();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting prescription:", error);
      alert(error.response?.data?.message || "Failed to delete prescription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const printPrescription = (prescription) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${prescription.medication}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #666; }
            .value { margin-bottom: 10px; }
            .instructions { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDICAL PRESCRIPTION</h1>
            <p>${prescription.prescribingDoctor || 'Prescribing Doctor'}</p>
          </div>
          <div class="section">
            <div class="label">Patient:</div>
            <div class="value">${prescription.patientName || 'Unknown'} (${prescription.patientId || 'N/A'})</div>
          </div>
          <div class="section">
            <div class="label">Medication:</div>
            <div class="value"><strong>${prescription.medication || 'Not specified'}</strong></div>
          </div>
          <div class="section">
            <div class="label">Dosage:</div>
            <div class="value">${prescription.dosage || 'Not specified'}</div>
          </div>
          <div class="section">
            <div class="label">Instructions:</div>
            <div class="value instructions">${prescription.instructions || 'No instructions provided'}</div>
          </div>
          <div class="section">
            <div class="label">Quantity:</div>
            <div class="value">${prescription.quantity || 'N/A'} units with ${prescription.refills || 0} refill(s)</div>
          </div>
          <div class="section">
            <div class="label">Pharmacy:</div>
            <div class="value">${prescription.pharmacy || 'Not specified'}</div>
          </div>
          <div class="section">
            <div class="label">Condition:</div>
            <div class="value">${prescription.condition || 'Not specified'}</div>
          </div>
          <div class="footer">
            <p>Prescribed on ${prescription.prescribedDate ? new Date(prescription.prescribedDate).toLocaleDateString() : 'Unknown date'} | 
               Expiry: ${prescription.expiryDate ? new Date(prescription.expiryDate).toLocaleDateString() : 'No expiry date'}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getActivePrescriptions = () => {
    return prescriptions.filter(p => p.status === "active").length;
  };

  const getExpiringSoon = () => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return prescriptions.filter(p => {
      if (!p.expiryDate || p.status !== "active") return false;
      const expiryDate = new Date(p.expiryDate);
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
    }).length;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 section-container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaPills className="me-2 text-primary" />
            Prescriptions Management
          </h2>
          <p className="text-muted mb-0">Create, view, and manage patient prescriptions</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary d-flex align-items-center"
            onClick={fetchPrescriptions}
          >
            <FaSync className="me-2" />
            Refresh
          </button>
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={openCreateModal}
          >
            <FaPlus className="me-2" />
            New Prescription
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold text-primary">{prescriptions.length}</h3>
                  <p className="card-text text-muted mb-0">Total Prescriptions</p>
                </div>
                <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaFileMedical size={20} className="text-primary" />
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
                  <h3 className="card-title h2 fw-bold text-success">{getActivePrescriptions()}</h3>
                  <p className="card-text text-muted mb-0">Active Prescriptions</p>
                </div>
                <div className="avatar-sm bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaCapsules size={20} className="text-success" />
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
                  <h3 className="card-title h2 fw-bold text-warning">{getExpiringSoon()}</h3>
                  <p className="card-text text-muted mb-0">Expiring Soon</p>
                </div>
                <div className="avatar-sm bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaExclamationTriangle size={20} className="text-warning" />
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
                  <h3 className="card-title h2 fw-bold text-info">
                    {prescriptions.filter(p => p.refills > 0).length}
                  </h3>
                  <p className="card-text text-muted mb-0">With Refills</p>
                </div>
                <div className="avatar-sm bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center">
                  <FaSync size={20} className="text-info" />
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
              <label className="form-label fw-semibold">Search Prescriptions</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by patient, medication, or condition..."
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
              >
                <FaSync className="me-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0 fw-bold text-dark">
            Prescriptions List ({filteredPrescriptions.length})
          </h5>
          <span className="text-muted small">
            Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Patient</th>
                  <th>Medication</th>
                  <th>Condition</th>
                  <th>Dosage</th>
                  <th>Status</th>
                  <th>Refill Status</th>
                  <th>Prescribed Date</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <FaPills size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">No prescriptions found matching your criteria.</p>
                      <button 
                        className="btn btn-primary mt-3"
                        onClick={openCreateModal}
                      >
                        <FaPlus className="me-2" />
                        Create New Prescription
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((prescription) => {
                    const refillStatus = getRefillStatus(prescription);
                    
                    return (
                      <tr key={prescription._id} className="align-middle">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <FaUserInjured className="text-info" size={14} />
                            </div>
                            <div>
                              <div className="fw-semibold">{prescription.patientName}</div>
                              <small className="text-muted">
                                <FaIdCard className="me-1" size={10} />
                                ID: {prescription.patientId}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaCapsules className="me-2 text-primary" size={12} />
                            {prescription.medication}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{prescription.condition}</span>
                        </td>
                        <td>
                          <small className="text-muted">{prescription.dosage}</small>
                        </td>
                        <td>
                          {getStatusBadge(prescription.status)}
                        </td>
                        <td>
                          {refillStatus && (
                            <span className={`badge bg-${refillStatus.color} bg-opacity-10 text-${refillStatus.color}`}>
                              {refillStatus.text}
                            </span>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">
                            {prescription.prescribedDate ? new Date(prescription.prescribedDate).toLocaleDateString() : 'N/A'}
                          </small>
                        </td>
                        <td className="text-center pe-4">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => openDetailsModal(prescription)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-outline-warning"
                              onClick={() => openEditModal(prescription)}
                              title="Edit Prescription"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-outline-success"
                              onClick={() => printPrescription(prescription)}
                              title="Print Prescription"
                            >
                              <FaPrint />
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => openDeleteModal(prescription)}
                              title="Delete Prescription"
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

      {/* Create/Edit Prescription Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaFileMedical className="me-2" />
                  {showCreateModal ? "New Prescription" : "Edit Prescription"}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  disabled={isSubmitting}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Patient Selection */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold required">Patient</label>
                      <div className="position-relative">
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaUserInjured />
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search patient by name or ID..."
                            value={patientSearch}
                            onChange={(e) => setPatientSearch(e.target.value)}
                            required
                            disabled={showEditModal}
                          />
                        </div>
                        {!showEditModal && patientSearch && filteredPatients.length > 0 && (
                          <div className="position-absolute w-100 bg-white border rounded mt-1 shadow-lg z-3">
                            {filteredPatients.map(patient => (
                              <div
                                key={patient._id}
                                className="dropdown-item py-2 px-3 hover-bg-light cursor-pointer"
                                onClick={() => handlePatientSelect(patient)}
                              >
                                <div className="fw-semibold">{patient.name}</div>
                                <small className="text-muted">ID: {patient.patientId} • {patient.email}</small>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedPatient && (
                        <div className="alert alert-info mt-2 py-2">
                          <FaUserInjured className="me-2" />
                          Selected: <strong>{selectedPatient.name}</strong> (ID: {selectedPatient.patientId})
                        </div>
                      )}
                    </div>

                    {/* Medication */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold required">Medication Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="medication"
                        value={formData.medication}
                        onChange={handleInputChange}
                        placeholder="e.g., Amoxicillin 500mg"
                        required
                      />
                    </div>

                    {/* Dosage and Quantity */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold required">Dosage</label>
                      <input
                        type="text"
                        className="form-control"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleInputChange}
                        placeholder="e.g., 1 tablet twice daily"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold required">Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="e.g., 30"
                        required
                        min="1"
                      />
                    </div>

                    {/* Refills and Status */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Refills</label>
                      <input
                        type="number"
                        className="form-control"
                        name="refills"
                        value={formData.refills}
                        onChange={handleInputChange}
                        placeholder="Number of refills"
                        min="0"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold required">Status</label>
                      <select
                        className="form-select"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    {/* Condition and Pharmacy */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold required">Condition</label>
                      <input
                        type="text"
                        className="form-control"
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        placeholder="e.g., Upper Respiratory Infection"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Pharmacy</label>
                      <input
                        type="text"
                        className="form-control"
                        name="pharmacy"
                        value={formData.pharmacy}
                        onChange={handleInputChange}
                        placeholder="Preferred pharmacy"
                      />
                    </div>

                    {/* Dates */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Next Refill Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="nextRefill"
                        value={formData.nextRefill}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Last Filled Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="lastFilled"
                        value={formData.lastFilled}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* Instructions */}
                    <div className="col-12">
                      <label className="form-label fw-semibold required">Instructions</label>
                      <textarea
                        className="form-control"
                        name="instructions"
                        value={formData.instructions}
                        onChange={handleInputChange}
                        placeholder="Detailed instructions for the patient..."
                        rows="3"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        {showCreateModal ? "Create Prescription" : "Update Prescription"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPrescription && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaExclamationTriangle className="me-2" />
                  Confirm Deletion
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSubmitting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <FaTrash className="text-danger mb-3" size={48} />
                  <h5>Are you sure you want to delete this prescription?</h5>
                  <div className="alert alert-warning mt-3">
                    <strong>{selectedPrescription.medication}</strong>
                    <div className="small">
                      Patient: {selectedPrescription.patientName}<br />
                      Prescribed: {selectedPrescription.prescribedDate ? new Date(selectedPrescription.prescribedDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <p className="text-muted">This action cannot be undone.</p>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="me-2" />
                      Delete Prescription
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPrescription && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaFileMedical className="me-2" />
                  Prescription Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Patient Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Patient Name</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold">
                        {selectedPrescription.patientName}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Patient ID</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.patientId}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Medication Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Medication Name</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold">
                        {selectedPrescription.medication}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Dosage</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.dosage}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Prescription Details</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Condition</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.condition}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {getStatusBadge(selectedPrescription.status)}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Dispensing Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Quantity</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.quantity} units
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Refills Remaining</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.refills || 0}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Instructions</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.instructions}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Dates</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Prescribed Date</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.prescribedDate 
                          ? new Date(selectedPrescription.prescribedDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Expiry Date</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.expiryDate 
                          ? new Date(selectedPrescription.expiryDate).toLocaleDateString()
                          : 'No expiry date'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Additional Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Pharmacy</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.pharmacy || 'Not specified'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Prescribing Doctor</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.prescribingDoctor}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedPrescription);
                  }}
                >
                  <FaEdit className="me-2" />
                  Edit Prescription
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => printPrescription(selectedPrescription)}
                >
                  <FaPrint className="me-2" />
                  Print Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PrescriptionsSection;