import { useEffect, useState } from "react";
import axios from "axios";
import { 
  FaUser, FaEnvelope, FaPhone, FaStethoscope, 
  FaCalendarAlt, FaMapMarkerAlt, FaIdCard, 
  FaEdit, FaSave, FaTimes, FaUserMd, FaGraduationCap,
  FaHospital, FaAward, FaClock, FaShieldAlt,
  FaHeartbeat, FaBriefcaseMedical, FaUserCheck,
  FaLock, FaEye, FaEyeSlash
} from "react-icons/fa";

function DoctorProfileSection() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hospitalbackend-1-eail.onrender.com/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Assuming the response is an array, take the first doctor or find by current user
      const doctorData = Array.isArray(res.data) ? res.data[0] : res.data;
      setDoctor(doctorData);
      setFormData(doctorData);
    } catch (err) {
      console.error("Failed to fetch doctor profile", err.message);
      setMessage({ type: 'error', text: 'Failed to load doctor profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const id = formData._id || doctor._id;
      if (!id) {
        setMessage({ type: "error", text: "Missing doctor id — cannot update" });
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

    const { _id, doctorId, createdAt, updatedAt, ...updatePayload } = payload;

    const res = await axios.put(
      `https://hospitalbackend-1-eail.onrender.com/doctors/${id}`,
      updatePayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

      const updated = res.data && (res.data.updated || res.data || payload);
      setDoctor(updated);
      setFormData(updated);
      setEditing(false);
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error("Failed to update profile", err?.response?.data || err.message);
      const serverMsg = err?.response?.data?.message || "Failed to update profile";
      setMessage({ type: 'error', text: serverMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(doctor);
    setEditing(false);
    setMessage({ type: '', text: '' });
    // Reset password fields
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  if (!doctor) {
    return (
      <div className="alert alert-danger text-center">
        <FaUser className="me-2" />
        Failed to load doctor profile. Please try again later.
      </div>
    );
  }

  return (
    <div className="section-container container-fluid py-4">
      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">
            <FaUserMd className="me-2 text-primary" />
            My Doctor Profile
          </h2>
          <p className="text-muted mb-0">Manage your professional information and practice details</p>
        </div>
        {!editing ? (
          <button 
            className="btn btn-primary d-flex align-items-center"
            onClick={() => setEditing(true)}
          >
            <FaEdit className="me-2" />
            Edit Profile
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
            <button 
              className="btn btn-secondary d-flex align-items-center"
              onClick={handleCancel}
            >
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
              <div className="avatar-lg mx-auto mb-3">
                <div className="avatar bg-white text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto" 
                     style={{width: '80px', height: '80px'}}>
                  <FaUserMd size={32} />
                </div>
              </div>
              <h4 className="mb-1">Dr. {doctor.username}</h4>
              <p className="mb-0 opacity-75">{doctor.specialty || "Medical Doctor"}</p>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                <span className="badge bg-success fs-6">
                  <FaShieldAlt className="me-1" />
                  Verified Doctor
                </span>
              </div>
              
              {/* Professional Stats */}
              <div className="profile-stats">
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <div className="border-end">
                      <FaBriefcaseMedical className="text-primary mb-2" size={20} />
                      <h5 className="fw-bold text-primary mb-1">{doctor.experience || "5+"}</h5>
                      <small className="text-muted">Years Exp</small>
                    </div>
                  </div>
                  <div className="col-6 mb-3">
                    <div>
                      <FaUserCheck className="text-primary mb-2" size={20} />
                      <h5 className="fw-bold text-primary mb-1">{doctor.patientsCount || "250+"}</h5>
                      <small className="text-muted">Patients</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-4">
                <h6 className="fw-semibold text-muted mb-3">Contact Information</h6>
                <div className="d-flex align-items-center mb-3">
                  <FaEnvelope className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Email</small>
                    <br />
                    <small>{doctor.email}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <FaPhone className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Phone</small>
                    <br />
                    <small>{doctor.phoneNumber || "Not provided"}</small>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <FaIdCard className="text-muted me-3" size={16} />
                  <div>
                    <small className="fw-semibold">Doctor ID</small>
                    <br />
                    <small className="text-primary">{doctor.doctorId}</small>
                  </div>
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
                <FaIdCard className="me-2" />
                Professional Information
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
                      />
                    ) : (
                      <p className="form-control-plaintext fw-semibold border rounded px-3 py-2 bg-light">
                        Dr. {doctor.username}
                      </p>
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
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.email}
                      </p>
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
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.phoneNumber || "Not provided"}
                      </p>
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
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.gender || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="col-md-6">
                  <h6 className="fw-semibold text-muted mb-3 d-flex align-items-center">
                    <FaStethoscope className="me-2 text-primary" />
                    Professional Details
                  </h6>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Specialty</label>
                    {editing ? (
                      <select
                        className="form-select"
                        name="specialty"
                        value={formData.specialty || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Specialty</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="General Practice">General Practice</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Psychiatry">Psychiatry</option>
                      </select>
                    ) : (
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.specialty || "Not specified"}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Doctor ID</label>
                    <p className="form-control-plaintext border rounded px-3 py-2 bg-light fw-semibold text-primary">
                      {doctor.doctorId}
                      <small className="text-muted ms-2">(Cannot be changed)</small>
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Medical License</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="medicalLicense"
                        value={formData.medicalLicense || ""}
                        onChange={handleChange}
                        placeholder="License number"
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.medicalLicense || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Hospital/Clinic</label>
                    {editing ? (
                      <input
                        type="text"
                        className="form-control"
                        name="hospital"
                        value={formData.hospital || ""}
                        onChange={handleChange}
                        placeholder="Hospital name"
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.hospital || "Not specified"}
                      </p>
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
                    <FaAward className="me-2 text-primary" />
                    Additional Information
                  </h6>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Years of Experience</label>
                        {editing ? (
                          <input
                            type="number"
                            className="form-control"
                            name="experience"
                            value={formData.experience || ""}
                            onChange={handleChange}
                            min="0"
                            max="50"
                          />
                        ) : (
                          <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {doctor.experience || "Not specified"} years
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Consultation Hours</label>
                        {editing ? (
                          <input
                            type="text"
                            className="form-control"
                            name="consultationHours"
                            value={formData.consultationHours || ""}
                            onChange={handleChange}
                            placeholder="e.g., 9:00 AM - 5:00 PM"
                          />
                        ) : (
                          <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                            {doctor.consultationHours || "Not specified"}
                          </p>
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
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.address || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Professional Bio</label>
                    {editing ? (
                      <textarea
                        className="form-control"
                        rows="4"
                        name="bio"
                        value={formData.bio || ""}
                        onChange={handleChange}
                        placeholder="Tell us about your professional background and expertise..."
                      />
                    ) : (
                      <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                        {doctor.bio || "No bio provided. Add a professional description to help patients learn more about you."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-light border-0 py-3">
              <h5 className="card-title mb-0 fw-bold text-dark">
                <FaShieldAlt className="me-2" />
                Account Information
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Account Status</label>
                    <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      <span className="badge bg-success">Active</span>
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Member Since</label>
                    <p className="form-control-plaintext border rounded px-3 py-2 bg-light">
                      {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "Not available"}
                    </p>
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

export default DoctorProfileSection;