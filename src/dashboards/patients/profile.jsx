import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserInjured, FaEnvelope, FaPhone, FaIdCard, FaEdit,
  FaSave, FaTimes, FaUser, FaCalendarAlt, FaHeartbeat, 
  FaMapMarkerAlt, FaNotesMedical, FaStethoscope, FaKey, 
  FaAllergies, FaProcedures, FaWeight, FaRulerVertical,
  FaBirthdayCake, FaTransgender, FaEye, FaEyeSlash, FaLock,
  FaHistory, FaUserMd, FaHandHoldingHeart
} from "react-icons/fa";

function PatientProfileSection({ patientData, onUpdate }) {
  const [patient, setPatient] = useState(patientData || null);
  const [loading, setLoading] = useState(!patientData);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (patientData) {
      setPatient(patientData);
      setFormData(patientData);
      setLoading(false);
    } else {
      fetchPatientProfile();
    }
  }, [patientData]);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPatient(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch patient profile:", err.message);
      setMessage({ type: "error", text: "Failed to load patient profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const id = formData._id || patient._id;
      if (!id) {
        setMessage({ type: "error", text: "Missing patient ID — cannot update" });
        setSaving(false);
        return;
      }

      // Check if password is being changed
      if (passwordData.newPassword) {
        if (!passwordData.currentPassword) {
          setMessage({ type: "error", text: "Current password is required to set a new password" });
          setSaving(false);
          return;
        }
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          setMessage({ type: "error", text: "New password and confirmation do not match" });
          setSaving(false);
          return;
        }
        
        if (passwordData.newPassword.length < 6) {
          setMessage({ type: "error", text: "Password must be at least 6 characters long" });
          setSaving(false);
          return;
        }
      }

      // Prepare payload according to backend expectations
      const payload = { 
        ...formData
      };

      // Add password fields if changing password (matching backend structure)
      if (passwordData.currentPassword && passwordData.newPassword) {
        payload.currentPassword = passwordData.currentPassword;
        payload.newPassword = passwordData.newPassword;
      }

      // Remove unnecessary fields
      const { _id, patientId, createdAt, updatedAt, __v, ...updatePayload } = payload;

      const res = await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/patients/${id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const updated = res.data || payload;
      setPatient(updated);
      setFormData(updated);
      setEditing(false);
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // Call update callback if provided
      if (onUpdate) {
        onUpdate(updated);
      }
      
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Failed to update profile", err?.response?.data || err.message);
      const serverMsg = err?.response?.data?.message || "Failed to update profile";
      setMessage({ type: "error", text: serverMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(patient);
    setEditing(false);
    setMessage({ type: "", text: "" });
    // Reset password fields
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "Very Weak", color: "danger" };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;

    const strengths = [
      { text: "Very Weak", color: "danger" },
      { text: "Weak", color: "warning" },
      { text: "Fair", color: "info" },
      { text: "Good", color: "primary" },
      { text: "Strong", color: "success" }
    ];

    return { ...strengths[strength], strength };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Get condition badge color
  const getConditionBadge = (condition) => {
    const conditions = {
      "stable": "success",
      "critical": "danger",
      "serious": "warning",
      "improving": "info",
      "recovering": "primary"
    };
    return conditions[condition?.toLowerCase()] || "secondary";
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="alert alert-danger text-center">
        <FaUserInjured className="me-2" />
        Failed to load patient profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Feedback Message */}
      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show mb-4`}>
          <div className="d-flex align-items-center">
            <FaUserInjured className="me-2" />
            {message.text}
          </div>
          <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaUserInjured className="me-2 text-primary" />
            My Patient Profile
          </h2>
          <p className="text-muted mb-0">Manage your personal and medical information</p>
        </div>

        {!editing ? (
          <button className="btn btn-primary d-flex align-items-center px-4" onClick={() => setEditing(true)}>
            <FaEdit className="me-2" /> Edit Profile
          </button>
        ) : (
          <div className="btn-group">
            <button
              className="btn btn-success d-flex align-items-center"
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave className="me-2" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn btn-outline-secondary d-flex align-items-center" onClick={handleCancel}>
              <FaTimes className="me-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="row">
        {/* Patient Overview Card */}
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white text-center py-4">
              <div className="avatar-placeholder mx-auto mb-3">
                <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                     style={{width: '80px', height: '80px'}}>
                  <FaUserInjured size={32} />
                </div>
              </div>
              <h4 className="mb-1">{patient.name || patient.username}</h4>
              <p className="mb-0 opacity-75">
                <span className="badge bg-light text-dark">Patient</span>
              </p>
              {patient.condition && (
                <div className="mt-2">
                  <span className={`badge bg-${getConditionBadge(patient.condition)}`}>
                    {patient.condition}
                  </span>
                </div>
              )}
            </div>
            
            <div className="card-body">
              {/* Health Stats */}
              <div className="health-stats mb-4">
                <h6 className="fw-semibold text-muted mb-3">Health Overview</h6>
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <FaHeartbeat className="text-danger mb-2" size={20} />
                      <h5 className="fw-bold text-dark mb-1">{patient.lastHeartRate || "72"}</h5>
                      <small className="text-muted">Heart Rate</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div>
                      <FaWeight className="text-info mb-2" size={20} />
                      <h5 className="fw-bold text-dark mb-1">{patient.weight || "68"} kg</h5>
                      <small className="text-muted">Weight</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Team Info */}
              <div className="medical-team mb-4">
                <h6 className="fw-semibold text-muted mb-3">Medical Team</h6>
                {patient.assignedDoctor && (
                  <div className="d-flex align-items-center mb-3">
                    <FaUserMd className="text-primary me-3" size={16} />
                    <div>
                      <small className="fw-semibold">Primary Doctor</small>
                      <br />
                      <small className="text-dark">Dr. {patient.assignedDoctor.name}</small>
                    </div>
                  </div>
                )}
                {patient.assignedCareGiver && (
                  <div className="d-flex align-items-center mb-3">
                    <FaHandHoldingHeart className="text-success me-3" size={16} />
                    <div>
                      <small className="fw-semibold">Caregiver</small>
                      <br />
                      <small className="text-dark">{patient.assignedCareGiver.name}</small>
                    </div>
                  </div>
                )}
                <div className="d-flex align-items-center">
                  <FaIdCard className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Patient ID</small>
                    <br />
                    <small className="text-primary fw-semibold">{patient.patientId}</small>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="quick-contact">
                <h6 className="fw-semibold text-muted mb-3">Quick Contact</h6>
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="text-muted me-2" size={14} />
                  <small>{patient.email}</small>
                </div>
                <div className="d-flex align-items-center">
                  <FaPhone className="text-muted me-2" size={14} />
                  <small>{patient.phone || patient.phoneNumber || "Not provided"}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="col-xl-8 col-lg-7">
          {/* Tab Navigation */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-0">
              <ul className="nav nav-pills nav-fill p-3" id="profileTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "personal" ? "active" : ""}`}
                    onClick={() => setActiveTab("personal")}
                  >
                    <FaUser className="me-2" />
                    Personal Info
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "medical" ? "active" : ""}`}
                    onClick={() => setActiveTab("medical")}
                  >
                    <FaHeartbeat className="me-2" />
                    Medical Info
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                  >
                    <FaLock className="me-2" />
                    Security
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold text-dark">
                    <FaUser className="me-2" />
                    Personal Information
                  </h5>
                </div>
                
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Full Name</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name || formData.username || ""}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.name || patient.username}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Email Address</label>
                        {editing ? (
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            placeholder="Enter email address"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.email}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Phone Number</label>
                        {editing ? (
                          <input
                            type="tel"
                            className="form-control"
                            name="phone"
                            value={formData.phone || formData.phoneNumber || ""}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.phone || patient.phoneNumber || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Date of Birth</label>
                        {editing ? (
                          <input
                            type="date"
                            className="form-control"
                            name="dateOfBirth"
                            value={formData.dateOfBirth || ""}
                            onChange={handleChange}
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not specified"}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Gender</label>
                        {editing ? (
                          <select
                            className="form-select"
                            name="gender"
                            value={formData.gender || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.gender || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Patient ID</label>
                        <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold text-primary">
                          {patient.patientId}
                          <small className="text-muted ms-2">(Auto-generated)</small>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Address</label>
                        {editing ? (
                          <textarea
                            className="form-control"
                            rows="3"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleChange}
                            placeholder="Enter your full address"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.address || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Emergency Contact</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="emergencyContact"
                            value={formData.emergencyContact || ""}
                            onChange={handleChange}
                            placeholder="Emergency contact name"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.emergencyContact || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Emergency Phone</label>
                        {editing ? (
                          <input
                            type="tel"
                            className="form-control"
                            name="emergencyPhone"
                            value={formData.emergencyPhone || ""}
                            onChange={handleChange}
                            placeholder="Emergency contact number"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.emergencyPhone || "Not provided"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Medical Information Tab */}
            {activeTab === "medical" && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold text-dark">
                    <FaHeartbeat className="me-2" />
                    Medical Information
                  </h5>
                </div>
                
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Blood Type</label>
                        {editing ? (
                          <select
                            className="form-select"
                            name="bloodType"
                            value={formData.bloodType || ""}
                            onChange={handleChange}
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
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.bloodType || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Height</label>
                        {editing ? (
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              name="height"
                              value={formData.height || ""}
                              onChange={handleChange}
                              placeholder="Height"
                            />
                            <span className="input-group-text">cm</span>
                          </div>
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.height ? `${patient.height} cm` : "Not specified"}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Weight</label>
                        {editing ? (
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              name="weight"
                              value={formData.weight || ""}
                              onChange={handleChange}
                              placeholder="Weight"
                            />
                            <span className="input-group-text">kg</span>
                          </div>
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.weight ? `${patient.weight} kg` : "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Primary Condition</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="primaryCondition"
                            value={formData.primaryCondition || ""}
                            onChange={handleChange}
                            placeholder="Main medical condition"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.primaryCondition || "Not specified"}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Allergies</label>
                        {editing ? (
                          <textarea
                            className="form-control"
                            rows="2"
                            name="allergies"
                            value={formData.allergies || ""}
                            onChange={handleChange}
                            placeholder="List any allergies"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.allergies || "No known allergies"}
                          </div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-semibold">Current Medications</label>
                        {editing ? (
                          <textarea
                            className="form-control"
                            rows="2"
                            name="currentMedications"
                            value={formData.currentMedications || ""}
                            onChange={handleChange}
                            placeholder="List current medications"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.currentMedications || "No current medications"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Medical History</label>
                        {editing ? (
                          <textarea
                            className="form-control"
                            rows="4"
                            name="medicalHistory"
                            value={formData.medicalHistory || ""}
                            onChange={handleChange}
                            placeholder="Relevant medical history, past surgeries, chronic conditions..."
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {patient.medicalHistory || "No significant medical history recorded"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light border-0 py-3">
                  <h5 className="card-title mb-0 fw-bold text-dark">
                    <FaLock className="me-2" />
                    Security Settings
                  </h5>
                </div>
                
                <div className="card-body">
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="fw-semibold text-muted mb-3">
                        Change Password
                        <small className="text-muted ms-2">(Leave blank to keep current password)</small>
                      </h6>
                      
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Current Password</label>
                            <div className="input-group">
                              <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            {editing && (
                              <small className="text-muted">Required when setting a new password</small>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">New Password</label>
                            <div className="input-group">
                              <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={togglePasswordVisibility}
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            {passwordData.newPassword && (
                              <div className="mt-2">
                                <small className={`text-${passwordStrength.color}`}>
                                  Password Strength: {passwordStrength.text}
                                </small>
                                <div className="progress mt-1" style={{height: '4px'}}>
                                  <div 
                                    className={`progress-bar bg-${passwordStrength.color}`}
                                    style={{width: `${(passwordStrength.strength / 4) * 100}%`}}
                                  ></div>
                                </div>
                              </div>
                            )}
                            <small className="text-muted">Password must be at least 6 characters long</small>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-semibold">Confirm New Password</label>
                            <div className="input-group">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={toggleConfirmPasswordVisibility}
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </button>
                            </div>
                            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                              <small className="text-danger">Passwords do not match</small>
                            )}
                            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                              <small className="text-success">Passwords match</small>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfileSection;