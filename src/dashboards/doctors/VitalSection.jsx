import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaHeartbeat, FaThermometerHalf, FaTachometerAlt, 
  FaSearch, FaFilter, FaSync, FaPlus, FaEdit, 
  FaTrash, FaUserInjured, FaExclamationTriangle,
  FaClock, FaStethoscope, FaNotesMedical, FaEye
} from "react-icons/fa";

function VitalsSection() {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPatient, setFilterPatient] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVital, setSelectedVital] = useState(null);

  // Form state - MATCHING BACKEND EXPECTATIONS
  const [formData, setFormData] = useState({
    patientId: "",
    bloodPressure: "",
    glucoseLevel: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    respiratoryRate: "",
    weight: "",
    height: "",
    bmi: "",
    notes: ""
  });

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-pfva.onrender.com/vitals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVitals(res.data);
    } catch (err) {
      setError("Failed to fetch vitals.");
      console.error("Failed to fetch vitals", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      // Prepare data exactly as backend expects
      const vitalData = {
        patientId: formData.patientId.trim(),
        bloodPressure: formData.bloodPressure,
        glucoseLevel: formData.glucoseLevel,
        heartRate: formData.heartRate,
        temperature: formData.temperature || undefined,
        oxygenSaturation: formData.oxygenSaturation || undefined,
        respiratoryRate: formData.respiratoryRate || undefined,
        weight: formData.weight || undefined,
        height: formData.height || undefined,
        bmi: formData.bmi || undefined,
        notes: formData.notes || undefined
      };

      console.log("Sending vital data:", vitalData);

      const response = await axios.post("https://hospitalbackend-pfva.onrender.com/vitals", vitalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowAddModal(false);
      resetForm();
      fetchVitals();
      setSuccess("Vital signs recorded successfully!");
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add vital record.";
      setError(errorMsg);
      console.error("Add vital error:", err.response?.data || err);
    }
  };

  const handleEditVital = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      
      const vitalData = {
        patientId: formData.patientId.trim(),
        bloodPressure: formData.bloodPressure,
        glucoseLevel: formData.glucoseLevel,
        heartRate: formData.heartRate,
        temperature: formData.temperature || undefined,
        oxygenSaturation: formData.oxygenSaturation || undefined,
        respiratoryRate: formData.respiratoryRate || undefined,
        weight: formData.weight || undefined,
        height: formData.height || undefined,
        bmi: formData.bmi || undefined,
        notes: formData.notes || undefined
      };

      await axios.put(`https://hospitalbackend-pfva.onrender.com/vitals/${selectedVital._id}`, vitalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setShowEditModal(false);
      resetForm();
      fetchVitals();
      setSuccess("Vital signs updated successfully!");
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update vital record.";
      setError(errorMsg);
      console.error(err);
    }
  };

  const handleDeleteVital = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-pfva.onrender.com/vitals/${selectedVital._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      fetchVitals();
      setSuccess("Vital record deleted successfully!");
      setError("");
    } catch (err) {
      setError("Failed to delete vital record.");
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      bloodPressure: "",
      glucoseLevel: "",
      heartRate: "",
      temperature: "",
      oxygenSaturation: "",
      respiratoryRate: "",
      weight: "",
      height: "",
      bmi: "",
      notes: ""
    });
    setSelectedVital(null);
  };

  const openEditModal = (vital) => {
    setSelectedVital(vital);
    setFormData({
      patientId: vital.patientId || "",
      bloodPressure: vital.bloodPressure || "",
      glucoseLevel: vital.glucoseLevel || "",
      heartRate: vital.heartRate || "",
      temperature: vital.temperature || "",
      oxygenSaturation: vital.oxygenSaturation || "",
      respiratoryRate: vital.respiratoryRate || "",
      weight: vital.weight || "",
      height: vital.height || "",
      bmi: vital.bmi || "",
      notes: vital.notes || ""
    });
    setShowEditModal(true);
  };

  const openViewModal = (vital) => {
    setSelectedVital(vital);
    setShowViewModal(true);
  };

  const openDeleteModal = (vital) => {
    setSelectedVital(vital);
    setShowDeleteModal(true);
  };

  // Calculate BMI if weight and height are provided
  const calculateBMI = () => {
    if (formData.weight && formData.height) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  // Filter and search vitals
  const filteredVitals = vitals.filter(vital => {
    const matchesSearch = vital.patientId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPatient === "all" || vital.patientId === filterPatient;
    return matchesSearch && matchesFilter;
  });

  // Get unique patient IDs for filter
  const patientIds = [...new Set(vitals.map(vital => vital.patientId))];

  const getStatusColor = (type, value) => {
    if (value === undefined || value === null || value === "") return "secondary";

    const toNumber = v => {
      const n = Number(String(v).trim());
      return Number.isFinite(n) ? n : NaN;
    };

    switch (type) {
      case "heartRate": {
        const v = toNumber(value);
        if (Number.isNaN(v)) return "secondary";
        return v < 60 || v > 100 ? "danger" : "success";
      }

      case "temperature": {
        const v = toNumber(value);
        if (Number.isNaN(v)) return "secondary";
        return v < 36 || v > 37.5 ? "danger" : "success";
      }

      case "bloodPressure": {
        const str = String(value).trim();
        const m = str.match(/^(\d{2,3})/);
        const systolic = m ? Number(m[1]) : toNumber(str);

        if (Number.isNaN(systolic)) return "secondary";
        return systolic < 90 || systolic > 120 ? "warning" : "success";
      }

      case "oxygenSaturation": {
        const v = toNumber(value);
        if (Number.isNaN(v)) return "secondary";
        return v < 95 ? "danger" : "success";
      }

      case "glucoseLevel": {
        const v = toNumber(value);
        if (Number.isNaN(v)) return "secondary";
        return v > 7.8 ? "danger" : "success";
      }

      default:
        return "primary";
    }
  };

  const getCriticalCount = () => {
    return vitals.filter(vital => {
      const hr = parseInt(vital.heartRate);
      const temp = parseFloat(vital.temperature);
      const [systolic] = vital.bloodPressure?.split('/') || [];
      const oxygen = parseInt(vital.oxygenSaturation);
      const glucose = parseFloat(vital.glucoseLevel);
      
      return (hr && (hr < 60 || hr > 100)) ||
             (temp && (temp < 36 || temp > 37.5)) ||
             (systolic && (systolic < 90 || systolic > 120)) ||
             (oxygen && oxygen < 95) ||
             (glucose && glucose > 7.8);
    }).length;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading patient vitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaHeartbeat className="me-2 text-danger" />
            Patient Vitals Monitor
          </h2>
          <p className="text-muted mb-0">Track and manage patient vital signs</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Record Vitals
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <FaExclamationTriangle className="me-2" />
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <FaHeartbeat className="me-2" />
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{vitals.length}</h3>
                  <p className="card-text mb-0 opacity-75">Total Records</p>
                </div>
                <FaHeartbeat size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{getCriticalCount()}</h3>
                  <p className="card-text mb-0 opacity-75">Critical Readings</p>
                </div>
                <FaExclamationTriangle size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">{patientIds.length}</h3>
                  <p className="card-text mb-0 opacity-75">Patients Monitored</p>
                </div>
                <FaUserInjured size={32} className="opacity-75" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm bg-gradient-info text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <h3 className="card-title h2 fw-bold">
                    {vitals.filter(v => new Date(v.timestamp).toDateString() === new Date().toDateString()).length}
                  </h3>
                  <p className="card-text mb-0 opacity-75">Today's Records</p>
                </div>
                <FaClock size={32} className="opacity-75" />
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
              <label className="form-label fw-semibold">Search Vitals</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Filter by Patient</label>
              <select
                className="form-select"
                value={filterPatient}
                onChange={(e) => setFilterPatient(e.target.value)}
              >
                <option value="all">All Patients</option>
                {patientIds.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                onClick={fetchVitals}
              >
                <FaSync className="me-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 py-3">
          <h5 className="card-title mb-0 fw-bold text-dark">
            Vital Signs Records ({filteredVitals.length})
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Patient ID</th>
                  <th>Heart Rate</th>
                  <th>Temperature</th>
                  <th>Blood Pressure</th>
                  <th>Glucose Level</th>
                  <th>Oxygen</th>
                  <th>Recorded</th>
                  <th className="text-center pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVitals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <FaHeartbeat size={48} className="mb-3 opacity-25" />
                      <p className="mb-0">No vital records found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredVitals.map((vital) => (
                    <tr key={vital._id} className="align-middle">
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3">
                            <FaUserInjured className="text-primary" size={14} />
                          </div>
                          <div>
                            <div className="fw-semibold">{vital.patientId}</div>
                            <small className="text-muted">Patient ID</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor('heartRate', vital.heartRate)}`}>
                          <FaHeartbeat className="me-1" />
                          {vital.heartRate || "N/A"} bpm
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor('temperature', vital.temperature)}`}>
                          <FaThermometerHalf className="me-1" />
                          {vital.temperature || "N/A"}°C
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor('bloodPressure', vital.bloodPressure)}`}>
                          <FaTachometerAlt className="me-1" />
                          {vital.bloodPressure || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${getStatusColor('glucoseLevel', vital.glucoseLevel)}`}>
                          {vital.glucoseLevel || "N/A"} mmol/L
                        </span>
                      </td>
                      <td>
                        {vital.oxygenSaturation ? (
                          <span className={`badge bg-${getStatusColor('oxygenSaturation', vital.oxygenSaturation)}`}>
                            {vital.oxygenSaturation}%
                          </span>
                        ) : (
                          <span className="badge bg-secondary">N/A</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(vital.timestamp).toLocaleDateString()}
                          <br />
                          <FaClock className="me-1" size={10} />
                          {new Date(vital.timestamp).toLocaleTimeString()}
                        </small>
                      </td>
                      <td className="text-center pe-4">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openViewModal(vital)}
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => openEditModal(vital)}
                            title="Edit Vitals"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteModal(vital)}
                            title="Delete Record"
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

      {/* Add Vitals Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <FaPlus className="me-2" />
                  Record New Vital Signs
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
              <form onSubmit={handleAddVital}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Required Fields */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Patient ID *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        required
                        placeholder="e.g., PAT001"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Blood Pressure *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.bloodPressure}
                        onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                        required
                        placeholder="e.g., 120/80"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Glucose Level (mmol/L) *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.glucoseLevel}
                        onChange={(e) => setFormData({...formData, glucoseLevel: e.target.value})}
                        required
                        placeholder="e.g., 5.5"
                        min="2"
                        max="20"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Heart Rate (bpm) *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.heartRate}
                        onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                        required
                        placeholder="60-100"
                        min="40"
                        max="200"
                      />
                    </div>

                    {/* Optional Fields */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        <FaThermometerHalf className="me-2 text-warning" />
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        placeholder="36.0-37.5"
                        min="35"
                        max="42"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Oxygen Saturation (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.oxygenSaturation}
                        onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                        placeholder="95-100"
                        min="80"
                        max="100"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Respiratory Rate (rpm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.respiratoryRate}
                        onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                        placeholder="12-20"
                        min="8"
                        max="40"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        onBlur={calculateBMI}
                        placeholder="e.g., 70.5"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Height (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        onBlur={calculateBMI}
                        placeholder="e.g., 175"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">BMI</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.bmi}
                        readOnly
                        placeholder="Auto-calculated"
                        style={{backgroundColor: '#f8f9fa'}}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <FaNotesMedical className="me-2" />
                        Clinical Notes
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional observations or notes..."
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
                    Record Vitals
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vitals Modal */}
      {showEditModal && selectedVital && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <FaEdit className="me-2" />
                  Edit Vital Signs: {selectedVital.patientId}
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
              <form onSubmit={handleEditVital}>
                <div className="modal-body">
                  <div className="row g-3">
                    {/* Required Fields */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Patient ID *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Blood Pressure *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.bloodPressure}
                        onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                        required
                        placeholder="e.g., 120/80"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Glucose Level (mmol/L) *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.glucoseLevel}
                        onChange={(e) => setFormData({...formData, glucoseLevel: e.target.value})}
                        required
                        placeholder="e.g., 5.5"
                        min="2"
                        max="20"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Heart Rate (bpm) *
                        <small className="text-danger ms-1">Required</small>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.heartRate}
                        onChange={(e) => setFormData({...formData, heartRate: e.target.value})}
                        required
                        placeholder="60-100"
                        min="40"
                        max="200"
                      />
                    </div>

                    {/* Optional Fields */}
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">
                        <FaThermometerHalf className="me-2 text-warning" />
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        placeholder="36.0-37.5"
                        min="35"
                        max="42"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Oxygen Saturation (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.oxygenSaturation}
                        onChange={(e) => setFormData({...formData, oxygenSaturation: e.target.value})}
                        placeholder="95-100"
                        min="80"
                        max="100"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Respiratory Rate (rpm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.respiratoryRate}
                        onChange={(e) => setFormData({...formData, respiratoryRate: e.target.value})}
                        placeholder="12-20"
                        min="8"
                        max="40"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        onBlur={calculateBMI}
                        placeholder="e.g., 70.5"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Height (cm)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.height}
                        onChange={(e) => setFormData({...formData, height: e.target.value})}
                        onBlur={calculateBMI}
                        placeholder="e.g., 175"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">BMI</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.bmi}
                        readOnly
                        placeholder="Auto-calculated"
                        style={{backgroundColor: '#f8f9fa'}}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <FaNotesMedical className="me-2" />
                        Clinical Notes
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional observations or notes..."
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
                    Update Vitals
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Vitals Modal */}
      {showViewModal && selectedVital && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">
                  <FaEye className="me-2" />
                  Vital Signs Details: {selectedVital.patientId}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Patient Information */}
                  <div className="col-12">
                    <h6 className="fw-semibold text-primary mb-3">Patient Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Patient ID</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedVital.patientId}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Recorded Date</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {new Date(selectedVital.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vital Signs */}
                  <div className="col-12">
                    <h6 className="fw-semibold text-primary mb-3">Vital Signs</h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Heart Rate</label>
                        <div className={`form-control-plaintext border rounded px-3 py-2 bg-${getStatusColor('heartRate', selectedVital.heartRate)} bg-opacity-10`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{selectedVital.heartRate || "N/A"} bpm</span>
                            <FaHeartbeat className={`text-${getStatusColor('heartRate', selectedVital.heartRate)}`} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Blood Pressure</label>
                        <div className={`form-control-plaintext border rounded px-3 py-2 bg-${getStatusColor('bloodPressure', selectedVital.bloodPressure)} bg-opacity-10`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{selectedVital.bloodPressure || "N/A"}</span>
                            <FaTachometerAlt className={`text-${getStatusColor('bloodPressure', selectedVital.bloodPressure)}`} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Temperature</label>
                        <div className={`form-control-plaintext border rounded px-3 py-2 bg-${getStatusColor('temperature', selectedVital.temperature)} bg-opacity-10`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{selectedVital.temperature || "N/A"}°C</span>
                            <FaThermometerHalf className={`text-${getStatusColor('temperature', selectedVital.temperature)}`} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Glucose Level</label>
                        <div className={`form-control-plaintext border rounded px-3 py-2 bg-${getStatusColor('glucoseLevel', selectedVital.glucoseLevel)} bg-opacity-10`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{selectedVital.glucoseLevel || "N/A"} mmol/L</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Oxygen Saturation</label>
                        <div className={`form-control-plaintext border rounded px-3 py-2 bg-${getStatusColor('oxygenSaturation', selectedVital.oxygenSaturation)} bg-opacity-10`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{selectedVital.oxygenSaturation || "N/A"}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Respiratory Rate</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          <div className="d-flex justify-content-between align-items-center">
                            <span>{selectedVital.respiratoryRate || "N/A"} rpm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Measurements */}
                  <div className="col-12">
                    <h6 className="fw-semibold text-primary mb-3">Additional Measurements</h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Weight</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedVital.weight || "N/A"} kg
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Height</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedVital.height || "N/A"} cm
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">BMI</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedVital.bmi || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedVital.notes && (
                    <div className="col-12">
                      <h6 className="fw-semibold text-primary mb-3">Clinical Notes</h6>
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {selectedVital.notes}
                      </div>
                    </div>
                  )}

                  {/* Record Information */}
                  <div className="col-12">
                    <h6 className="fw-semibold text-primary mb-3">Record Information</h6>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Record ID</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          <small className="text-muted">{selectedVital._id}</small>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Last Updated</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                          {selectedVital.updatedAt ? 
                            new Date(selectedVital.updatedAt).toLocaleString() : 
                            new Date(selectedVital.timestamp).toLocaleString()
                          }
                        </div>
                      </div>
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
                    openEditModal(selectedVital);
                  }}
                >
                  <FaEdit className="me-2" />
                  Edit Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedVital && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <FaTrash className="me-2" />
                  Delete Vital Record
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <FaHeartbeat size={48} className="text-danger mb-3" />
                  <h6 className="fw-bold">Delete this vital record?</h6>
                  <p className="text-muted mb-0">
                    Are you sure you want to delete the vital record for <strong>{selectedVital.patientId}</strong> 
                    recorded on {new Date(selectedVital.timestamp).toLocaleDateString()}?
                  </p>
                </div>
                <div className="alert alert-warning">
                  <div className="d-flex">
                    <FaExclamationTriangle className="me-2 mt-1 flex-shrink-0" />
                    <div>
                      <strong>Warning:</strong> This action cannot be undone. The vital record will be permanently deleted.
                    </div>
                  </div>
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
                  onClick={handleDeleteVital}
                >
                  <FaTrash className="me-2" />
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VitalsSection;