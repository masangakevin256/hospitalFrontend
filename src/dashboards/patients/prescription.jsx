import { useState, useEffect } from "react";
import {
  FaPills, FaSearch, FaFilter, FaSync, FaPrint,
  FaCalendarAlt, FaUserMd, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle, FaEye,
  FaFileMedical, FaPrescription, FaCapsules,
  FaAllergies, FaClock, FaHistory
} from "react-icons/fa";

function PrescriptionsSection() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Sample prescription data
  const samplePrescriptions = [
    {
      id: "RX-001",
      patientId: "PAT-789123",
      patientName: "John Smith",
      medication: "Lisinopril 10mg",
      dosage: "10mg once daily",
      quantity: 30,
      refills: 3,
      prescribedDate: "2024-01-15",
      expiryDate: "2024-07-15",
      prescribingDoctor: "Dr. Sarah Wilson",
      status: "active",
      instructions: "Take one tablet daily in the morning. May cause dizziness.",
      pharmacy: "City Center Pharmacy",
      condition: "Hypertension",
      lastFilled: "2024-01-15",
      nextRefill: "2024-02-15"
    },
    {
      id: "RX-002",
      patientId: "PAT-789123",
      patientName: "John Smith",
      medication: "Metformin 500mg",
      dosage: "500mg twice daily",
      quantity: 60,
      refills: 5,
      prescribedDate: "2024-01-10",
      expiryDate: "2024-07-10",
      prescribingDoctor: "Dr. Michael Chen",
      status: "active",
      instructions: "Take with meals. Monitor blood sugar levels regularly.",
      pharmacy: "Wellness Pharmacy",
      condition: "Type 2 Diabetes",
      lastFilled: "2024-01-10",
      nextRefill: "2024-02-10"
    },
    {
      id: "RX-003",
      patientId: "PAT-789123",
      patientName: "John Smith",
      medication: "Atorvastatin 20mg",
      dosage: "20mg once daily at bedtime",
      quantity: 30,
      refills: 2,
      prescribedDate: "2023-12-20",
      expiryDate: "2024-06-20",
      prescribingDoctor: "Dr. Sarah Wilson",
      status: "expired",
      instructions: "Take at bedtime. Report any muscle pain immediately.",
      pharmacy: "City Center Pharmacy",
      condition: "High Cholesterol",
      lastFilled: "2023-12-20",
      nextRefill: "Expired"
    },
    {
      id: "RX-004",
      patientId: "PAT-789123",
      patientName: "John Smith",
      medication: "Amoxicillin 500mg",
      dosage: "500mg three times daily",
      quantity: 21,
      refills: 0,
      prescribedDate: "2024-01-18",
      expiryDate: "2024-02-18",
      prescribingDoctor: "Dr. Emily Rodriguez",
      status: "completed",
      instructions: "Take until finished. Complete full course even if feeling better.",
      pharmacy: "QuickCare Pharmacy",
      condition: "Sinus Infection",
      lastFilled: "2024-01-18",
      nextRefill: "Not applicable"
    },
    {
      id: "RX-005",
      patientId: "PAT-789123",
      patientName: "John Smith",
      medication: "Albuterol Inhaler",
      dosage: "2 puffs every 4-6 hours as needed",
      quantity: 1,
      refills: 1,
      prescribedDate: "2024-01-05",
      expiryDate: "2024-07-05",
      prescribingDoctor: "Dr. Michael Chen",
      status: "active",
      instructions: "Use before physical activity. Shake well before use.",
      pharmacy: "Wellness Pharmacy",
      condition: "Asthma",
      lastFilled: "2024-01-05",
      nextRefill: "2024-02-05"
    },
    {
      id: "RX-006",
      patientId: "PAT-789123",
      patientName: "John Smith",
      medication: "Ibuprofen 400mg",
      dosage: "400mg every 6 hours as needed",
      quantity: 90,
      refills: 0,
      prescribedDate: "2024-01-12",
      expiryDate: "2024-07-12",
      prescribingDoctor: "Dr. Sarah Wilson",
      status: "active",
      instructions: "Take with food. Do not exceed 1200mg in 24 hours.",
      pharmacy: "City Center Pharmacy",
      condition: "Arthritis Pain",
      lastFilled: "2024-01-12",
      nextRefill: "Not applicable"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPrescriptions(samplePrescriptions);
      setFilteredPrescriptions(samplePrescriptions);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [searchTerm, filterStatus, prescriptions]);

  const filterPrescriptions = () => {
    let filtered = prescriptions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescribingDoctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.condition.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
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
    const nextRefill = new Date(prescription.nextRefill);
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

  const printPrescription = (prescription) => {
    // Simulate print functionality
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEDICAL PRESCRIPTION</h1>
            <p>${prescription.prescribingDoctor}</p>
          </div>
          <div class="section">
            <div class="label">Patient:</div>
            <div class="value">${prescription.patientName} (${prescription.patientId})</div>
          </div>
          <div class="section">
            <div class="label">Medication:</div>
            <div class="value"><strong>${prescription.medication}</strong></div>
          </div>
          <div class="section">
            <div class="label">Dosage:</div>
            <div class="value">${prescription.dosage}</div>
          </div>
          <div class="section">
            <div class="label">Instructions:</div>
            <div class="value instructions">${prescription.instructions}</div>
          </div>
          <div class="section">
            <div class="label">Quantity:</div>
            <div class="value">${prescription.quantity} with ${prescription.refills} refill(s)</div>
          </div>
          <div class="section">
            <div class="label">Pharmacy:</div>
            <div class="value">${prescription.pharmacy}</div>
          </div>
          <div class="footer">
            <p>Prescribed on ${new Date(prescription.prescribedDate).toLocaleDateString()} | Valid until ${new Date(prescription.expiryDate).toLocaleDateString()}</p>
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
      const expiryDate = new Date(p.expiryDate);
      return p.status === "active" && expiryDate <= thirtyDaysFromNow && expiryDate >= today;
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
          <p className="text-muted mb-0">Manage and track your medications</p>
        </div>
        <button 
          className="btn btn-outline-primary d-flex align-items-center"
          onClick={() => window.print()}
        >
          <FaPrint className="me-2" />
          Print All
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
                  <th>Dosage</th>
                  <th>Status</th>
                  <th>Refill</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <FaPills size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">No prescriptions found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPrescriptions.map((prescription) => {
                    const refillStatus = getRefillStatus(prescription);
                    
                    return (
                      <tr key={prescription.id} className="align-middle">
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                              <FaCapsules className="text-primary" size={14} />
                            </div>
                            <div>
                              <div className="fw-semibold">{prescription.medication}</div>
                              <small className="text-muted">RX: {prescription.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaUserMd className="me-2 text-muted" size={12} />
                            {prescription.prescribingDoctor}
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
                          {!refillStatus && prescription.status === "active" && (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary">
                              No refills
                            </span>
                          )}
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
                              className="btn btn-outline-success"
                              onClick={() => printPrescription(prescription)}
                              title="Print Prescription"
                            >
                              <FaPrint />
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
                        {selectedPrescription.medication}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Dosage</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.dosage}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Condition</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.condition}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Prescription Details</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Prescribing Doctor</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedPrescription.prescribingDoctor}
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
                        {selectedPrescription.pharmacy}
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
                        {selectedPrescription.refills}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-semibold text-muted mb-3">Dates</h6>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Prescribed Date</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {new Date(selectedPrescription.prescribedDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Expiry Date</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Last Filled</label>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {new Date(selectedPrescription.lastFilled).toLocaleDateString()}
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