import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserShield, FaEnvelope, FaPhone, FaIdCard, FaEdit,
  FaSave, FaTimes, FaUser, FaCalendarAlt, FaShieldAlt, 
  FaMapMarkerAlt, FaBuilding, FaUserTie, FaKey, FaDatabase,
  FaLock, FaEye, FaEyeSlash
} from "react-icons/fa";

function AdminProfileSection() {
  const [admin, setAdmin] = useState(null);
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
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmin(res.data);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to fetch admin profile:", err.message);
      setMessage({ type: "error", text: "Failed to load admin profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const id = formData._id || admin._id;
      if (!id) {
        setMessage({ type: "error", text: "Missing admin id — cannot update" });
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

  const { _id, adminId, createdAt, updatedAt, ...updatePayload } = payload;

    const res = await axios.put(
      `https://hospitalbackend-1-eail.onrender.com/admins/${id}`,
      updatePayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
``
      const updated = res.data && (res.data.updated || res.data || payload);
      setAdmin(updated);
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
    setFormData(admin);
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

  if (!admin) {
    return (
      <div className="alert alert-danger text-center">
        <FaUser className="me-2" />
        Failed to load admin profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Feedback Message */}
      {message.text && (
        <div className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show mb-4`}>
          <div className="d-flex align-items-center">
            <FaUserShield className="me-2" />
            {message.text}
          </div>
          <button type="button" className="btn-close" onClick={() => setMessage({ type: "", text: "" })}></button>
        </div>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaUserShield className="me-2 text-primary" />
            My Administrator Profile
          </h2>
          <p className="text-muted mb-0">Manage your personal information and security settings</p>
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
            <div className="card-header bg-dark text-white text-center py-4">
              <div className="avatar-placeholder mx-auto mb-3">
                <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                     style={{width: '80px', height: '80px'}}>
                  <FaUserShield size={32} />
                </div>
              </div>
              <h4 className="mb-1">{admin.username}</h4>
              <p className="mb-0 opacity-75">
                <span className="badge bg-success">System Administrator</span>
              </p>
            </div>
            
            <div className="card-body">
              {/* Admin Stats */}
              <div className="profile-stats mb-4">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <FaUserTie className="text-primary mb-2" size={20} />
                      <h5 className="fw-bold text-primary mb-1">{admin.managedUsers || "150+"}</h5>
                      <small className="text-muted">Users</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div>
                      <FaDatabase className="text-primary mb-2" size={20} />
                      <h5 className="fw-bold text-primary mb-1">{admin.tasksCompleted || "45"}</h5>
                      <small className="text-muted">Tasks</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Access Info */}
              <div className="system-access mb-4">
                <h6 className="fw-semibold text-muted mb-3">System Access</h6>
                <div className="d-flex align-items-center mb-3">
                  <FaKey className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Access Level</small>
                    <br />
                    <span className="badge bg-success">{admin.roles?.toUpperCase() || "ADMIN"}</span>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <FaIdCard className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Admin ID</small>
                    <br />
                    <small className="text-primary fw-semibold">{admin.adminId}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Last Active</small>
                    <br />
                    <small>{admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : "Today"}</small>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="quick-contact">
                <h6 className="fw-semibold text-muted mb-3">Quick Contact</h6>
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="text-muted me-2" size={14} />
                  <small>{admin.email}</small>
                </div>
                <div className="d-flex align-items-center">
                  <FaPhone className="text-muted me-2" size={14} />
                  <small>{admin.phoneNumber || "Not provided"}</small>
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
                <FaUserShield className="me-2" />
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
                        name="username"
                        value={formData.username || ""}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold">
                        {admin.username}
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
                        {admin.email}
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
                        {admin.phoneNumber || "Not provided"}
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
                        {admin.gender || "Not specified"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Administrative Information */}
                <div className="col-md-6">
                  <h6 className="fw-semibold text-muted mb-3 d-flex align-items-center">
                    <FaShieldAlt className="me-2 text-primary" />
                    Administrative Details
                  </h6>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Admin ID</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold text-primary">
                      {admin.adminId}
                      <small className="text-muted ms-2">(Cannot be changed)</small>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      <span className="badge bg-success">{admin.roles?.toUpperCase() || "ADMIN"}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Department</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="department"
                        value={formData.department || ""}
                        onChange={handleChange}
                        placeholder="Enter department"
                      />
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {admin.department || "Not specified"}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Position</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="position"
                        value={formData.position || ""}
                        onChange={handleChange}
                        placeholder="Enter position title"
                      />
                    ) : (
                      <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {admin.position || "Not specified"}
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
                        <label className="form-label fw-semibold">Office Location</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="officeLocation"
                            value={formData.officeLocation || ""}
                            onChange={handleChange}
                            placeholder="Building/Room number"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {admin.officeLocation || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Work Phone</label>
                        {editing ? (
                          <input
                            type="tel"
                            className="form-control"
                            name="workPhone"
                            value={formData.workPhone || ""}
                            onChange={handleChange}
                            placeholder="Extension number"
                          />
                        ) : (
                          <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {admin.workPhone || "Not specified"}
                          </div>
                        )}
                      </div>
                    </div>
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
                        {admin.address || "Not provided"}
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
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Not available"}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Member Since</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Not available"}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Registered By</label>
                    <div className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      {admin.registeredBy || "System"}
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

export default AdminProfileSection;