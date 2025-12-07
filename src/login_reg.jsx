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
  FaExclamationTriangle,
  FaHospital,
  FaStethoscope,
  FaUserInjured,
  FaHandHoldingHeart,
  FaHospitalUser
} from "react-icons/fa";
import "./Login.css";


function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phoneNumber: "",
    gender: "",
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
    } else if (formData.password.length < 6) {
      errors.push("Password must be at least 6 characters!");
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
      const endpoint = `https://hospitalbackend-1-eail.onrender.com/login/${formData.roles}s`;
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
      setError("Login failed! Please check your credentials.");
      console.log(error);
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
        res = await axios.post("https://hospitalbackend-1-eail.onrender.com/register/doctors", {
          email: formData.email,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          password: formData.password,
          secretReg: formData.secretReg
        });
      } else if (formData.roles === "admin") {
        res = await axios.post("https://hospitalbackend-1-eail.onrender.com/register/admins", {
          email: formData.email,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          password: formData.password,
          secretReg: formData.secretReg
        });
      }

      setMessage("Registration successful! Check your email for more details.");
      
      setTimeout(() => {
        setIsLogin(true);
        setFormData({
          username: "",
          password: "",
          email: "",
          phoneNumber: "",
          gender: "",
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
      patient: <FaUserInjured className="role-icon" />,
      careGiver: <FaHandHoldingHeart className="role-icon" />
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
      {/* Background Pattern */}
      <div className="hospital-background">
        <div className="background-pattern"></div>
        <div className="medical-icons">
          <FaHospital className="medical-icon icon-1" />
          <FaStethoscope className="medical-icon icon-2" />
          <FaHeartbeat className="medical-icon icon-3" />
          <FaHospitalUser className="medical-icon icon-4" />
        </div>
      </div>

      <div className="container-fluid min-vh-100 d-flex flex-column">
        {/* Header */}
        <header className="hospital-header py-4">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 text-center">
                <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                  <FaHospital className="hospital-main-icon" />
                  <div className="text-start">
                    <h1 className="hospital-title mb-0">MediCare Hospital</h1>
                    <p className="hospital-subtitle mb-0">Advanced Healthcare Management System</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow-1 d-flex align-items-center justify-content-center py-4">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6 col-xl-5">
                {isLogin ? (
                  <div className="card hospital-card login-card shadow-lg border-0">
                    <div className="card-body p-4 p-md-5">
                      <div className="text-center mb-4">
                        <h2 className="card-title h3 mb-2">Welcome Back</h2>
                        <p className="text-muted">Sign in to access your healthcare dashboard</p>
                      </div>

                      <form onSubmit={handleLogin}>
                        <div className="mb-3">
                          <label className="form-label">Username</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FaUser className="text-primary" />
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              placeholder="Enter your username"
                              value={formData.username}
                              onChange={(e) => handleInputChange("username", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Password</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FaLock className="text-primary" />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control border-start-0"
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary border-start-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Role</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0">
                              <FaUserShield className="text-primary" />
                            </span>
                            <select
                              className="form-select"
                              value={formData.roles}
                              onChange={(e) => handleInputChange("roles", e.target.value)}
                            >
                              <option value="">Select your role</option>
                              <option value="admin">Administrator</option>
                              <option value="doctor">Medical Doctor</option>
                              <option value="patient">Patient</option>
                              <option value="careGiver">Caregiver</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-3 d-flex justify-content-between align-items-center">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="rememberMe"
                              checked={remember}
                              onChange={(e) => setRemember(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="rememberMe">
                              Remember me
                            </label>
                          </div>
                          <a href="#" className="text-decoration-none text-primary">Forgot password?</a>
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg w-100 mb-3"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Signing in...
                            </>
                          ) : (
                            <>
                              <FaLock className="me-2" />
                              Sign In
                            </>
                          )}
                        </button>

                        {error && (
                          <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                            <FaExclamationTriangle className="me-2" />
                            <div>{error}</div>
                          </div>
                        )}

                        {message && (
                          <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                            <FaCheck className="me-2" />
                            <div>{message}</div>
                          </div>
                        )}

                        <div className="text-center mt-4">
                          <p className="text-muted">New to MediCare Hospital?</p>
                          <button 
                            type="button" 
                            className="btn btn-outline-primary"
                            onClick={toggleForm}
                          >
                            Create an account
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="card hospital-card signup-card shadow-lg border-0">
                    <div className="card-body p-4 p-md-5">
                      <div className="d-flex align-items-center mb-4">
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary me-3"
                          onClick={toggleForm}
                        >
                          <FaArrowLeft />
                        </button>
                        <div>
                          <h2 className="card-title h4 mb-1">Create Account</h2>
                          <p className="text-muted mb-0">Join our healthcare platform today</p>
                        </div>
                      </div>

                      <form onSubmit={handleSignUp}>
                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Email Address</label>
                            <div className="input-group">
                              <span className="input-group-text bg-light">
                                <FaEnvelope className="text-primary" />
                              </span>
                              <input
                                type="email"
                                className="form-control"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Username</label>
                            <div className="input-group">
                              <span className="input-group-text bg-light">
                                <FaUser className="text-primary" />
                              </span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Username"
                                value={formData.username}
                                onChange={(e) => handleInputChange("username", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
                            <label className="form-label">Phone Number</label>
                            <div className="input-group">
                              <span className="input-group-text bg-light">
                                <FaPhone className="text-primary" />
                              </span>
                              <input
                                type="tel"
                                className="form-control"
                                placeholder="Phone number"
                                value={formData.phoneNumber}
                                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Gender</label>
                            <div className="input-group">
                              <span className="input-group-text bg-light">
                                <FaVenusMars className="text-primary" />
                              </span>
                              <select
                                className="form-select"
                                value={formData.gender}
                                onChange={(e) => handleInputChange("gender", e.target.value)}
                              >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Password</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaLock className="text-primary" />
                            </span>
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control"
                              placeholder="Create password"
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                          
                          {formData.password && (
                            <div className={`password-strength mt-2 ${getPasswordStrengthColor()}`}>
                              <div className="d-flex justify-content-between mb-1">
                                <small>Password Strength:</small>
                                <small className="fw-bold">{passwordStrength}</small>
                              </div>
                              <div className="progress" style={{height: "5px"}}>
                                <div 
                                  className="progress-bar" 
                                  role="progressbar" 
                                  style={{width: `${passwordStrength === "Very Weak" ? "20%" : 
                                          passwordStrength === "Weak" ? "40%" : 
                                          passwordStrength === "Good" ? "60%" : 
                                          passwordStrength === "Strong" ? "80%" : "100%"}`}}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Account Type</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light">
                              <FaUserShield className="text-primary" />
                            </span>
                            <select
                              className="form-select"
                              value={formData.roles}
                              onChange={(e) => handleInputChange("roles", e.target.value)}
                            >
                              <option value="">Select account type</option>
                              <option value="admin">Administrator</option>
                              <option value="doctor">Medical Doctor</option>
                            </select>
                          </div>
                        </div>

                        {(formData.roles === "admin" || formData.roles === "doctor") && (
                          <div className="card border-primary mb-4">
                            <div className="card-header bg-primary bg-opacity-10 border-primary">
                              <div className="d-flex align-items-center">
                                {getRoleIcon(formData.roles)}
                                <span className="ms-2 fw-semibold">
                                  {formData.roles === "admin" ? "Administrator" : "Medical Doctor"} Registration
                                </span>
                              </div>
                            </div>
                            <div className="card-body">
                              <div className="mb-3">
                                <label className="form-label">Registration Code</label>
                                <div className="input-group">
                                  <span className="input-group-text bg-light">
                                    <FaShieldAlt className="text-primary" />
                                  </span>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Registration code"
                                    value={formData.secretReg}
                                    onChange={(e) => handleInputChange("secretReg", e.target.value)}
                                  />
                                </div>
                              </div>
                              <div className="alert alert-info d-flex align-items-start mb-0" role="alert">
                                <FaInfoCircle className="me-2 mt-1" />
                                <div>
                                  <small>
                                    {formData.roles === "admin" 
                                      ? "Administrator accounts require special registration codes for security."
                                      : "Doctor accounts require valid medical registration codes."
                                    }
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="showPassword">
                            Show password
                          </label>
                        </div>

                        <div className="form-check mb-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="agreeTerms"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="agreeTerms">
                            I agree to the <a href="#" className="text-decoration-none">Terms and Conditions</a> and <a href="#" className="text-decoration-none">Privacy Policy</a>
                          </label>
                        </div>

                        <button 
                          type="submit" 
                          className="btn btn-primary btn-lg w-100 mb-3"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <FaUser className="me-2" />
                              Create Account
                            </>
                          )}
                        </button>

                        {error && (
                          <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                            <FaExclamationTriangle className="me-2" />
                            <div>{error}</div>
                          </div>
                        )}

                        {message && (
                          <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                            <FaCheck className="me-2" />
                            <div>{message}</div>
                          </div>
                        )}

                        <div className="text-center mt-4">
                          <p className="text-muted">Already have an account?</p>
                          <button 
                            type="button" 
                            className="btn btn-outline-primary"
                            onClick={toggleForm}
                          >
                            Sign in to your account
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default Login;