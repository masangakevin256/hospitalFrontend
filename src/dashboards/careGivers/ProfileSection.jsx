import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUser, FaEnvelope, FaPhone, FaIdCard, FaEdit,
  FaSave, FaTimes, FaCalendarAlt, FaShieldAlt, 
  FaMapMarkerAlt, FaBuilding, FaUserTie, FaKey, FaDatabase,
  FaLock, FaEye, FaEyeSlash, FaHandsHelping, FaHeartbeat,
  FaUsers, FaBriefcaseMedical, FaMoneyBillWave, FaStar
} from "react-icons/fa";

function CaregiverProfileSection() {
  const [caregiver, setCaregiver] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchCaregiverProfile();
  }, []);

  const fetchCaregiverProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("https://hospitalbackend-pfva.onrender.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCaregiver(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch caregiver profile:", err.message);
      setMessage({ type: "error", text: "Failed to load caregiver profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const id = formData._id || caregiver._id;
      if (!id) {
        setMessage({ type: "error", text: "Missing caregiver id — cannot update" });
        setSaving(false);
        return;
      }

      // Check if password is being changed
      if (passwordData.newPassword) {
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

      const payload = { 
        ...formData,
        ...(passwordData.newPassword && {
          currentPassword: passwordData.currentPassword,
          password: passwordData.newPassword
        })
      };

      // Remove empty password fields if not changing password
      if (!passwordData.newPassword) {
        delete payload.currentPassword;
        delete payload.password;
      }

      const { _id, careGiverId, createdAt, updatedAt, ...updatePayload } = payload;

      const res = await axios.put(
        `https://hospitalbackend-pfva.onrender.com/caregivers/${id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const updated = res.data && (res.data.updated || res.data || payload);
      setCaregiver(updated);
      setFormData(updated);
      setEditing(false);
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
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
    setFormData(caregiver);
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
    if (!password) return { strength: 0, text: "", color: "" };
    
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

    return strengths[strength] || strengths[0];
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

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

  if (!caregiver) {
    return (
      <div className="alert alert-danger text-center">
        <FaUser className="me-2" />
        Failed to load caregiver profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Feedback Message */}
      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show mb-4`}>
          <div className="d-flex align-items-center">
            <FaHandsHelping className="me-2" />
            {message.text}
          </div>
          <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaHandsHelping className="me-2 text-primary" />
            My Caregiver Profile
          </h2>
          <p className="text-muted mb-0">Manage your personal information and caregiving details</p>
        </div>

        {!editing ? (
          <button className="btn btn-primary d-flex align-items-center" onClick={() => setEditing(true)}>
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
            <button className="btn btn-secondary d-flex align-items-center" onClick={handleCancel}>
              <FaTimes className="me-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="row">
        {/* Profile Overview Card */}
        <div className="col-xl-4 col-lg-5 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-primary text-white text-center py-4">
              <div className="avatar-placeholder mx-auto mb-3">
                <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                     style={{width: '80px', height: '80px'}}>
                  <FaHandsHelping size={32} />
                </div>
              </div>
              <h4 className="mb-1">{caregiver.name}</h4>
              <p className="mb-0 opacity-75">
                <span className="badge bg-success">Professional Caregiver</span>
              </p>
            </div>
            
            <div className="card-body">
              {/* Caregiver Stats */}
              <div className="profile-stats mb-4">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <FaUsers className="text-primary mb-2" size={20} />
                      <h5 className="fw-bold text-primary mb-1">{caregiver.currentPatients || "8"}</h5>
                      <small className="text-muted">Patients</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div>
                      <FaBriefcaseMedical className="text-primary mb-2" size={20} />
                      <h5 className="fw-bold text-primary mb-1">{caregiver.tasksCompleted || "45"}</h5>
                      <small className="text-muted">Tasks</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <FaStar className="text-warning mb-2" size={20} />
                      <h5 className="fw-bold text-warning mb-1">{caregiver.rating || "4.8"}</h5>
                      <small className="text-muted">Rating</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div>
                      <FaMoneyBillWave className="text-success mb-2" size={20} />
                      <h5 className="fw-bold text-success mb-1">${caregiver.amountPaid || "10000"}</h5>
                      <small className="text-muted">Earnings</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caregiver Details */}
              <div className="caregiver-details mb-4">
                <h6 className="fw-semibold text-muted mb-3">Caregiver Details</h6>
                <div className="d-flex align-items-center mb-3">
                  <FaIdCard className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Caregiver ID</small>
                    <br />
                    <small className="text-primary fw-semibold">{caregiver.careGiverId}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <FaShieldAlt className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Role</small>
                    <br />
                    <span className="badge bg-info">{caregiver.roles?.toUpperCase() || "CAREGIVER"}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Last Active</small>
                    <br />
                    <small>{caregiver.lastLogin ? new Date(caregiver.lastLogin).toLocaleDateString() : "Today"}</small>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="quick-contact">
                <h6 className="fw-semibold text-muted mb-3">Quick Contact</h6>
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="text-muted me-2" size={14} />
                  <small>{caregiver.email}</small>
                </div>
                <div className="d-flex align-items-center">
                  <FaPhone className="text-muted me-2" size={14} />
                  <small>{caregiver.phoneNumber || "Not provided"}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details Card */}
        <div className="col-xl-8 col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-0 py-3">
              <h5 className="card-title mb-0 fw-bold text-dark">
                <FaHandsHelping className="me-2" />
                Profile Information
              </h5>
            </div>
            
            <div className="card-body">
              <div className="row g-4">
                {/* Personal Information */}
                <div className="col-md-6">
                  <h6 className="fw-semibold text-muted mb-3 d-flex align-items-center">
                    <FaUser className="me-2 text-primary" />
                    Personal Information
                  </h6>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold">
                        {caregiver.name}
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
                        {caregiver.email}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {caregiver.phoneNumber || "Not provided"}
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
                      </select>
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {caregiver.gender || "Not specified"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="col-md-6">
                  <h6 className="fw-semibold text-muted mb-3 d-flex align-items-center">
                    <FaBriefcaseMedical className="me-2 text-primary" />
                    Professional Details
                  </h6>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Caregiver ID</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold text-primary">
                      {caregiver.careGiverId}
                      <small className="text-muted ms-2">(Cannot be changed)</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      <span className="badge bg-info">{caregiver.roles?.toUpperCase() || "CAREGIVER"}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Specialization</label>
                    {editing ? (
                      <select
                        className="form-select"
                        name="specialization"
                        value={formData.specialization || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Specialization</option>
                        <option value="Elderly Care">Elderly Care</option>
                        <option value="Post-Surgery Care">Post-Surgery Care</option>
                        <option value="Chronic Illness">Chronic Illness</option>
                        <option value="Disability Care">Disability Care</option>
                        <option value="Palliative Care">Palliative Care</option>
                        <option value="General Care">General Care</option>
                      </select>
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {caregiver.specialization || "Not specified"}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Experience Level</label>
                    {editing ? (
                      <select
                        className="form-select"
                        name="experienceLevel"
                        value={formData.experienceLevel || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Experience</option>
                        <option value="Beginner (0-1 years)">Beginner (0-1 years)</option>
                        <option value="Intermediate (1-3 years)">Intermediate (1-3 years)</option>
                        <option value="Experienced (3-5 years)">Experienced (3-5 years)</option>
                        <option value="Senior (5+ years)">Senior (5+ years)</option>
                      </select>
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {caregiver.experienceLevel || "Not specified"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Change Section - Only show when editing */}
                {editing && (
                  <div className="col-12">
                    <hr />
                    <h6 className="fw-semibold text-muted mb-3 d-flex align-items-center">
                      <FaLock className="me-2 text-primary" />
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
                )}

                {/* Additional Information */}
                <div className="col-12">
                  <hr />
                  <h6 className="fw-semibold text-muted mb-3 d-flex align-items-center">
                    <FaBuilding className="me-2 text-primary" />
                    Additional Information
                  </h6>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Hourly Rate ($)</label>
                        {editing ? (
                          <input
                            type="number"
                            className="form-control"
                            name="hourlyRate"
                            value={formData.hourlyRate || ""}
                            onChange={handleChange}
                            placeholder="Enter hourly rate"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            ${caregiver.hourlyRate || "15"} / hour
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Availability</label>
                        {editing ? (
                          <select
                            className="form-select"
                            name="availability"
                            value={formData.availability || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select Availability</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="On Call">On Call</option>
                            <option value="Weekends Only">Weekends Only</option>
                          </select>
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {caregiver.availability || "Full Time"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Certifications</label>
                    {editing ? (
                      <textarea
                        className="form-control"
                        rows="3"
                        name="certifications"
                        value={formData.certifications || ""}
                        onChange={handleChange}
                        placeholder="List your certifications (CPR, First Aid, etc.)"
                      />
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {caregiver.certifications || "No certifications listed"}
                      </div>
                    )}
                  </div>

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
                        {caregiver.address || "Not provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Information Card */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-light border-0 py-3">
              <h5 className="card-title mb-0 fw-bold text-dark">
                <FaDatabase className="me-2" />
                System Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Account Status</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      <span className="badge bg-success">Active</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Last Login</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      {caregiver.lastLogin ? new Date(caregiver.lastLogin).toLocaleString() : "Not available"}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Member Since</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      {caregiver.createdAt ? new Date(caregiver.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Not available"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Registered By</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      {caregiver.registeredBy || "System"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaregiverProfileSection;