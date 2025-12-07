import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaPills, FaSearch, FaFilter, FaSync, FaPrint,
  FaCalendarAlt, FaUserMd, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaEye,
  FaFileMedical, FaPrescription, FaCapsules,
  FaAllergies, FaClock, FaHistory, FaEdit, FaSave, FaTimes, FaInfoCircle
} from "react-icons/fa";

function PrescriptionsSection() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [userRole, setUserRole] = useState("patient");

  useEffect(() => {
    // Get user role from token or localStorage
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.roles || "patient");
    }
    
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/prescriptions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => {
        setPrescriptions(res.data);
        setFilteredPrescriptions(res.data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    filterPrescriptions();
  }, [searchTerm, filterStatus, prescriptions]);

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescribingDoctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.condition?.toLowerCase().includes(searchTerm.toLowerCase())
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
      "cancelled": { color: "warning", icon: FaTimesCircle, text: "Cancelled" }
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

  const openDetailsModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailsModal(true);
  };

  const startEditing = (prescription) => {
    setEditingId(prescription._id);
    setEditForm({
      instructions: prescription.instructions || "",
      pharmacy: prescription.pharmacy || "",
      status: prescription.status || "active",
      lastFilled: prescription.lastFilled ? new Date(prescription.lastFilled).toISOString().split('T')[0] : "",
      nextRefill: prescription.nextRefill ? new Date(prescription.nextRefill).toISOString().split('T')[0] : ""
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEdit = async (prescriptionId) => {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    
    try {
      // Remove empty fields
      const updates = Object.fromEntries(
        Object.entries(editForm).filter(([_, v]) => v !== "")
      );

      await axios.patch(
        `https://hospitalbackend-1-eail.onrender.com/prescriptions/${prescriptionId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setPrescriptions(prev => prev.map(p =>
        p._id === prescriptionId ? { ...p, ...updates } : p
      ));

      setEditingId(null);
      setEditForm({});
      
      // Show success message
      alert("Prescription updated successfully!");
    } catch (error) {
      console.error("Error updating prescription:", error);
      alert("Failed to update prescription. Please try again.");
    } finally {
      setIsSaving(false);
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
            <p>${prescription.prescribingDoctor || 'Not specified'}</p>
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
          <p className="mt-2 text-muted">Loading your prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaPills className="me-2 text-primary" />
            My Prescriptions
          </h2>
          <p className="text-muted mb-0">View and manage your medications</p>
        </div>
        <button 
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={fetchPrescriptions}
          disabled={loading}
        >
          <FaSync className={`me-2 ${loading ? 'fa-spin' : ''}`} />
          Refresh
        </button>
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
                  <p className="card-text text-muted mb-0">Active Medications</p>
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
                  placeholder="Search by medication, doctor, or condition..."
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

      {/* Permissions Notice */}
      <div className="alert alert-info mb-4">
        <FaInfoCircle className="me-2" />
        <strong>Note:</strong> As a patient, you can view all your prescriptions and update certain information like pharmacy preferences and refill dates.
      </div>

      {/* Prescriptions List */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3">
          <h5 className="card-title mb-0 fw-bold text-dark">
            Prescription History ({filteredPrescriptions.length})
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Medication</th>
                  <th>Prescribing Doctor</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th>Last Filled</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <FaPills size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">No prescriptions found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((prescription) => {
                    const isEditing = editingId === prescription._id;
                    const refillStatus = getRefillStatus(prescription);
                    
                    return (
                      <tr key={prescription._id} className="align-middle">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <FaCapsules className="text-primary" size={14} />
                            </div>
                            <div>
                              <div className="fw-semibold">{prescription.medication || 'Unknown medication'}</div>
                              <small className="text-muted">Dosage: {prescription.dosage || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUserMd className="me-2 text-muted" size={12} />
                            {prescription.prescribingDoctor || 'Unknown doctor'}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">{prescription.condition || 'Not specified'}</span>
                        </td>
                        <td>
                          {isEditing ? (
                            <select
                              name="status"
                              className="form-select form-select-sm"
                              value={editForm.status}
                              onChange={handleEditChange}
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            getStatusBadge(prescription.status)
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input
                              type="date"
                              name="lastFilled"
                              className="form-control form-control-sm"
                              value={editForm.lastFilled}
                              onChange={handleEditChange}
                            />
                          ) : (
                            <span className="text-muted">
                              {prescription.lastFilled 
                                ? new Date(prescription.lastFilled).toLocaleDateString()
                                : 'Not filled yet'}
                            </span>
                          )}
                        </td>
                        <td className="text-center pe-4">
                          <div className="btn-group btn-group-sm" role="group">
                            {isEditing ? (
                              <>
                                <button
                                  className="btn btn-success"
                                  onClick={() => saveEdit(prescription._id)}
                                  disabled={isSaving}
                                >
                                  <FaSave className={isSaving ? 'fa-spin' : ''} />
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  onClick={cancelEditing}
                                  disabled={isSaving}
                                >
                                  <FaTimes />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => openDetailsModal(prescription)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => startEditing(prescription)}
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
                              </>
                            )}
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

      {/* Prescription Details Modal */}
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
                    <h6 className="fw-semibold text-muted mb-3">Medication Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Medication Name</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold">
                        {selectedPrescription.medication || 'Not specified'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Dosage</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.dosage || 'Not specified'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Condition</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.condition || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Prescription Details</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Prescribing Doctor</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.prescribingDoctor || 'Not specified'}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Status</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {getStatusBadge(selectedPrescription.status)}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Pharmacy</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.pharmacy || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Instructions</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.instructions || 'No instructions provided'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Dispensing Information</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Quantity</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.quantity || 'N/A'} units
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Refills Remaining</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.refills || 0}
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
                          : 'Unknown date'}
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
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Last Filled</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.lastFilled 
                          ? new Date(selectedPrescription.lastFilled).toLocaleDateString()
                          : 'Not filled yet'}
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