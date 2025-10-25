import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "./footer";
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaPhone, 
  FaVenusMars, 
  FaIdCard, 
  FaShieldAlt,
  FaCheck,
  FaHeartbeat,
  FaUserMd,
  FaUserShield,
  FaHandsHelping,
  FaArrowLeft,
  FaInfoCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    gender: "",
    adminId: "",
    doctorId: "",
    secretReg: "",
    roles: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [agree, setAgree] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [activeRole, setActiveRole] = useState("");
  const navigate = useNavigate();

  // Clear messages after timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setError("");
      setMessage("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, message]);

  // Load saved username
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRemember(true);
    }
  }, []);

  // Save username if remember me is checked
  useEffect(() => {
    if (remember && formData.username.trim() !== "") {
      localStorage.setItem("username", formData.username);
    } else {
      localStorage.removeItem("username");
    }
  }, [remember, formData.username]);

  // Password strength calculator
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength("");
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/)) strength++;
    if (formData.password.match(/\d/)) strength++;
    if (formData.password.match(/[^a-zA-Z\d]/)) strength++;

    const strengths = ["Very Weak", "Weak", "Good", "Strong", "Very Strong"];
    setPasswordStrength(strengths[strength]);
  }, [formData.password]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "roles") {
      setActiveRole(value);
    }
  };

  const validateLogin = () => {
    const errors = [];
    
    if (!formData.username.trim()) {
      errors.push("Please enter your username!");
    } else if (formData.username.length < 3) {
      errors.push("Username must be at least 3 characters!");
    }
    
    if (!formData.password) {
      errors.push("Please enter your password!");
    } else if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters!");
    }
    
    if (!formData.roles) {
      errors.push("Please select your role!");
    }

    if (errors.length > 0) {
      setError(errors[0]);
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    const errors = [];
    
    if (!formData.email.trim()) {
      errors.push("Please enter your email!");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("Please enter a valid email address!");
    }
    
    if (!formData.username.trim()) {
      errors.push("Please enter your username!");
    } else if (formData.username.length < 3) {
      errors.push("Username must be at least 3 characters!");
    }
    
    if (!formData.phoneNumber) {
      errors.push("Phone number is required!");
    }
    
    if (!formData.gender) {
      errors.push("Please select your gender!");
    }
    
    if (!formData.password) {
      errors.push("Please enter your password!");
    } else if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters!");
    }
    
    if (!formData.roles) {
      errors.push("Please select your role!");
    }
    
    if (formData.roles === "doctor" && !formData.doctorId) {
      errors.push("Doctor ID is required!");
    }
    
    if (formData.roles === "admin" && !formData.adminId) {
      errors.push("Admin ID is required!");
    }
    
    if ((formData.roles === "doctor" || formData.roles === "admin") && !formData.secretReg) {
      errors.push("Registration code is required!");
    }
    
    if (!agree) {
      errors.push("Please agree to the terms and conditions!");
    }

    if (errors.length > 0) {
      setError(errors[0]);
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);
    try {
      const endpoint = `http://localhost:3500/login/${formData.roles}s`;
      const payload = formData.roles === "patient" || formData.roles === "careGiver" 
        ? { name: formData.username, password: formData.password }
        : { username: formData.username, password: formData.password };

      const res = await axios.post(endpoint, payload);

      if (res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        localStorage.setItem("userRole", formData.roles);
      }

      setMessage("Login successful! Redirecting...");
      
      setTimeout(() => {
        const routes = {
          admin: "/dashboards/admin-dashboard",
          doctor: "/dashboards/doctor-dashboard",
          patient: "/dashboards/patient-dashboard",
          careGiver: "/dashboards/careGiver-dashboard"
        };
        navigate(routes[formData.roles] || "/");
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || "Login failed! Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setLoading(true);
    try {
      let res;
      if (formData.roles === "doctor") {
        res = await axios.post("http://localhost:3500/register/doctors", {
          email: formData.email,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          password: formData.password,
          doctorId: formData.doctorId,
          secretReg: formData.secretReg
        });
      } else if (formData.roles === "admin") {
        res = await axios.post("http://localhost:3500/register/admins", {
          email: formData.email,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          password: formData.password,
          adminId: formData.adminId,
          secretReg: formData.secretReg
        });
      }

      setMessage("Registration successful!, check your email for more details .You can now sign in.");
      
      setTimeout(() => {
        setIsLogin(true);
        setFormData({
          username: "",
          password: "",
          email: "",
          phoneNumber: "",
          gender: "",
          adminId: "",
          doctorId: "",
          secretReg: "",
          roles: ""
        });
        setAgree(false);
        setActiveRole("");
      }, 3000);

    } catch (error) {
      setError(error.response?.data?.message || "Registration failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setMessage("");
    setActiveRole("");
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <FaUserShield className="role-icon" />,
      doctor: <FaUserMd className="role-icon" />,
      patient: <FaUser className="role-icon" />,
      careGiver: <FaHandsHelping className="role-icon" />
    };
    return icons[role] || <FaUser className="role-icon" />;
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "";
    switch (passwordStrength) {
      case "Very Weak": return "strength-very-weak";
      case "Weak": return "strength-weak";
      case "Good": return "strength-good";
      case "Strong": return "strength-strong";
      case "Very Strong": return "strength-very-strong";
      default: return "";
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-header">
          <div className="logo-container">
            <FaHeartbeat className="logo-icon" />
            <div className="logo-text">
              <h1>Medicare Hospital</h1>
              <p>Advanced Healthcare Management System</p>
            </div>
          </div>
        </div>

        <div className="form-wrapper">
          {isLogin ? (
            <div className="login-form-card">
              <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Sign in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="input-group">
                  <FaUserShield className="input-icon" />
                  <select
                    value={formData.roles}
                    onChange={(e) => handleInputChange("roles", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select your role</option>
                    <option value="admin">👨‍💼 Administrator</option>
                    <option value="doctor">👨‍⚕️ Medical Doctor</option>
                    <option value="patient">👤 Patient</option>
                    <option value="careGiver">🤝 Caregiver</option>
                  </select>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Remember me
                  </label>
                  
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>

                <button 
                  type="submit" 
                  className={`submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <FaLock className="btn-icon" />
                      Sign In
                    </>
                  )}
                </button>

                {error && (
                  <div className="message error">
                    <FaExclamationTriangle className="message-icon" />
                    {error}
                  </div>
                )}
                {message && (
                  <div className="message success">
                    <FaCheck className="message-icon" />
                    {message}
                  </div>
                )}

                <div className="form-divider">
                  <span>New to HealthSync?</span>
                </div>

                <button type="button" className="switch-btn" onClick={toggleForm}>
                  Create an account
                </button>
              </form>
            </div>
          ) : (
            <div className="signup-form-card">
              <div className="form-header">
                <button type="button" className="back-btn" onClick={toggleForm}>
                  <FaArrowLeft />
                </button>
                <h2>Create Account</h2>
                <p>Join our healthcare platform today</p>
              </div>

              <form onSubmit={handleSignUp} className="auth-form">
                <div className="input-row">
                  <div className="input-group">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                      type="text"
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <FaVenusMars className="input-icon" />
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="form-input"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <FaLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {formData.password && (
                  <div className={`password-strength ${getPasswordStrengthColor()}`}>
                    <span>Password Strength: {passwordStrength}</span>
                    <div className="strength-bar">
                      <div className="strength-fill"></div>
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <FaUserShield className="input-icon" />
                  <select
                    value={formData.roles}
                    onChange={(e) => handleInputChange("roles", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select account type</option>
                    <option value="admin">👨‍💼 Administrator</option>
                    <option value="doctor">👨‍⚕️ Medical Doctor</option>
                  </select>
                </div>

                {(formData.roles === "admin" || formData.roles === "doctor") && (
                  <div className="role-specific-fields">
                    <div className="role-header">
                      {getRoleIcon(formData.roles)}
                      <span>{formData.roles === "admin" ? "Administrator" : "Medical Doctor"} Registration</span>
                    </div>
                    
                    <div className="input-row">
                      <div className="input-group">
                        <FaIdCard className="input-icon" />
                        <input
                          type="text"
                          placeholder={formData.roles === "admin" ? "Admin ID (e.g., ADM001)" : "Doctor ID (e.g., DOC001)"}
                          value={formData.roles === "admin" ? formData.adminId : formData.doctorId}
                          onChange={(e) => handleInputChange(
                            formData.roles === "admin" ? "adminId" : "doctorId", 
                            e.target.value
                          )}
                          className="form-input"
                        />
                      </div>

                      <div className="input-group">
                        <FaShieldAlt className="input-icon" />
                        <input
                          type="text"
                          placeholder="Registration code"
                          value={formData.secretReg}
                          onChange={(e) => handleInputChange("secretReg", e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                    
                    <div className="role-info">
                      <FaInfoCircle className="info-icon" />
                      <small>
                        {formData.roles === "admin" 
                          ? "Administrator accounts require special registration codes for security."
                          : "Doctor accounts require valid medical registration codes."
                        }
                      </small>
                    </div>
                  </div>
                )}

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Show password
                  </label>
                </div>

                <label className="checkbox-label terms">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  I agree to the <a href="#">Terms and Conditions</a> and <a href="#">Privacy Policy</a>
                </label>

                <button 
                  type="submit" 
                  className={`submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <FaUser className="btn-icon" />
                      Create Account
                    </>
                  )}
                </button>

                {error && (
                  <div className="message error">
                    <FaExclamationTriangle className="message-icon" />
                    {error}
                  </div>
                )}
                {message && (
                  <div className="message success">
                    <FaCheck className="message-icon" />
                    {message}
                  </div>
                )}

                <div className="form-divider">
                  <span>Already have an account?</span>
                </div>

                <button type="button" className="switch-btn" onClick={toggleForm}>
                  Sign in to your account
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default Login;