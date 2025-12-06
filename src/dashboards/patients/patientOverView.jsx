import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  ProgressBar,
  Alert
} from "react-bootstrap";
import {
  FaHeartbeat,
  FaCalendarCheck,
  FaPills,
  FaUserMd,
  FaHandsHelping,
  FaExclamationTriangle,
  FaChartLine,
  FaStethoscope,
  FaUserInjured,
  FaClock
} from "react-icons/fa";

function PatientOverview({ patientData, appointments, vitals }) {
  if (!patientData) {
    return (
      <Container fluid>
        <Alert variant="warning" className="text-center">
          <FaUserInjured className="me-2" />
          Unable to load patient data. Please try again.
        </Alert>
      </Container>
    );
  }

  // Calculate statistics
  const stats = {
    upcomingAppointments: appointments?.filter(apt => 
      apt.status !== 'cancelled' && new Date(apt.date) >= new Date()
    ).length || 0,
    recentVitals: vitals?.length || 0,
    activePrescriptions: patientData.currentMedications ? 1 : 0,
    criticalAlerts: patientData.alerts?.filter(alert => 
      alert.type === 'critical'
    ).length || 0
  };

  // Get latest vital signs
  const latestVitals = vitals?.length > 0 ? vitals[vitals.length - 1] : null;

  // Get upcoming appointments
  const upcomingAppointments = appointments
    ?.filter(apt => apt.status !== 'cancelled' && new Date(apt.date) >= new Date())
    ?.sort((a, b) => new Date(a.date) - new Date(b.date))
    ?.slice(0, 3) || [];

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'confirmed': return 'primary';
      default: return 'secondary';
    }
  };

  // Get condition variant
  const getConditionVariant = (condition) => {
    if (!condition) return 'secondary';
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('critical') || conditionLower.includes('severe')) return 'danger';
    if (conditionLower.includes('stable') || conditionLower.includes('good')) return 'success';
    if (conditionLower.includes('monitor') || conditionLower.includes('observation')) return 'warning';
    return 'info';
  };

  return (
    <Container fluid>
      {/* Welcome Header */}
      <Row className="mb-4">
        <Col>
          <div className="welcome-header">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="display-6 fw-bold text-dark mb-2">
                  Hello, {patientData.name}! 
                </h1>
                <p className="text-muted mb-0">
                  Here's your health overview for today
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="date-display">
                  <span className="badge bg-light text-dark fs-6">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        <Col xl={3} lg={6}>
          <Card className="stat-card border-0 shadow-sm bg-gradient-primary">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <FaCalendarCheck className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="stat-number text-white mb-0">{stats.upcomingAppointments}</h3>
                  <p className="stat-label text-white-50 mb-0">Upcoming Appointments</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="stat-card border-0 shadow-sm bg-gradient-success">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <FaHeartbeat className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="stat-number text-white mb-0">{stats.recentVitals}</h3>
                  <p className="stat-label text-white-50 mb-0">Vital Records</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="stat-card border-0 shadow-sm bg-gradient-warning">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <FaPills className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="stat-number text-white mb-0">{stats.activePrescriptions}</h3>
                  <p className="stat-label text-white-50 mb-0">Active Medications</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6}>
          <Card className="stat-card border-0 shadow-sm bg-gradient-danger">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="stat-icon me-3">
                  <FaExclamationTriangle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="stat-number text-white mb-0">{stats.criticalAlerts}</h3>
                  <p className="stat-label text-white-50 mb-0">Important Alerts</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Health Summary */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaHeartbeat className="me-2" />
                Health Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="health-summary">
                <div className="row mb-4">
                  <div className="col-6">
                    <div className="text-center p-3 border rounded">
                      <h6 className="text-muted mb-2">Current Condition</h6>
                      <Badge bg={getConditionVariant(patientData.condition)} className="fs-6">
                        {patientData.condition || "Not Specified"}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 border rounded">
                      <h6 className="text-muted mb-2">Blood Type</h6>
                      <h5 className="fw-bold text-primary mb-0">
                        {patientData.bloodType || "Unknown"}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-3">Medical Information</h6>
                  <div className="medical-info">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Allergies:</span>
                      <strong className={patientData.allergies ? "text-danger" : "text-success"}>
                        {patientData.allergies || "None reported"}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Current Medications:</span>
                      <strong className={patientData.currentMedications ? "text-warning" : "text-success"}>
                        {patientData.currentMedications || "None"}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Last Visit:</span>
                      <strong>
                        {patientData.lastVisit ? formatDate(patientData.lastVisit) : "No record"}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Emergency Contact:</span>
                      <strong className={patientData.emergencyContact ? "text-info" : "text-muted"}>
                        {patientData.emergencyContact || "Not set"}
                      </strong>
                    </div>
                  </div>
                </div>

                {latestVitals && (
                  <div className="mt-4">
                    <h6 className="text-muted mb-3">Latest Vital Signs</h6>
                    <div className="vitals-preview">
                      <div className="row text-center">
                        {latestVitals.bloodPressure && (
                          <div className="col-4 mb-3">
                            <small className="text-muted d-block">Blood Pressure</small>
                            <strong className="text-primary">{latestVitals.bloodPressure}</strong>
                          </div>
                        )}
                        {latestVitals.heartRate && (
                          <div className="col-4 mb-3">
                            <small className="text-muted d-block">Heart Rate</small>
                            <strong className="text-danger">{latestVitals.heartRate} BPM</strong>
                          </div>
                        )}
                        {latestVitals.temperature && (
                          <div className="col-4 mb-3">
                            <small className="text-muted d-block">Temperature</small>
                            <strong className="text-warning">{latestVitals.temperature}°C</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Upcoming Appointments */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-success text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center justify-content-between">
                <span>
                  <FaCalendarCheck className="me-2" />
                  Upcoming Appointments
                </span>
                <Badge bg="light" text="dark">
                  {upcomingAppointments.length}
                </Badge>
              </h5>
            </Card.Header>
            <Card.Body>
              {upcomingAppointments.length > 0 ? (
                <div className="appointments-list">
                  {upcomingAppointments.map((appointment, index) => (
                    <div 
                      key={appointment._id || index}
                      className="appointment-item d-flex align-items-center p-3 border-bottom"
                    >
                      <div className="appointment-icon me-3">
                        <FaUserMd className="text-primary" size={20} />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{appointment.reason || "Consultation"}</h6>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {formatDate(appointment.date)} at {appointment.time}
                          </small>
                          <Badge bg={getStatusVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.assignedDoctor && (
                          <small className="text-muted">
                            With Dr. {appointment.assignedDoctor}
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaCalendarCheck size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No upcoming appointments</h6>
                  <p className="text-muted small">
                    You don't have any scheduled appointments at the moment.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Care Team & Recent Activity */}
      <Row className="g-4 mt-4">
        {/* Care Team */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-info text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaUserMd className="me-2" />
                Your Care Team
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="care-team">
                {patientData.assignedDoctor ? (
                  <div className="care-team-member d-flex align-items-center p-3 border rounded mb-3">
                    <div className="member-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{width: '50px', height: '50px'}}>
                      <FaStethoscope size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">Dr. {patientData.assignedDoctor.name}</h6>
                      <p className="text-muted mb-1">Primary Physician</p>
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        Phone: {patientData.assignedDoctor.phoneNumber}
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 border rounded mb-3">
                    <FaUserMd className="text-muted mb-2" size={24} />
                    <p className="text-muted mb-0">No doctor assigned</p>
                  </div>
                )}

                {patientData.assignedCareGiver ? (
                  <div className="care-team-member d-flex align-items-center p-3 border rounded">
                    <div className="member-avatar bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{width: '50px', height: '50px'}}>
                      <FaHandsHelping size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{patientData.assignedCareGiver.name}</h6>
                      <p className="text-muted mb-1">Caregiver</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <FaClock className="me-1" />
                          Phone: {patientData.assignedCareGiver.phoneNumber}
                        </small>
                        {patientData.assignedCareGiver.sickness && (
                          <Badge bg="secondary" className="text-capitalize">
                            {patientData.assignedCareGiver.sickness}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 border rounded">
                    <FaHandsHelping className="text-muted mb-2" size={24} />
                    <p className="text-muted mb-0">No caregiver assigned</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-warning text-white py-3">
              <h5 className="card-title mb-0 d-flex align-items-center">
                <FaChartLine className="me-2" />
                Recent Health Activity
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="recent-activity">
                {vitals && vitals.length > 0 ? (
                  <div className="activity-list">
                    {vitals.slice(-5).reverse().map((vital, index) => (
                      <div key={vital._id || index} className="activity-item d-flex align-items-center p-2 border-bottom">
                        <div className="activity-icon me-3">
                          <FaHeartbeat className="text-success" />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small">Vital signs recorded</p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {vital.bloodPressure && `BP: ${vital.bloodPressure}`}
                              {vital.heartRate && ` | HR: ${vital.heartRate}`}
                              {vital.temperature && ` | Temp: ${vital.temperature}°C`}
                            </small>
                            <small className="text-muted">
                              {vital.createdAt ? formatDate(vital.createdAt) : 'Recent'}
                            </small>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaChartLine size={48} className="text-muted mb-3" />
                    <h6 className="text-muted">No recent activity</h6>
                    <p className="text-muted small">
                      Your health activity will appear here.
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light py-3">
              <h5 className="card-title mb-0 fw-bold">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="row g-3">
                <div className="col-lg-3 col-md-6">
                  <div className="quick-action-card text-center p-4 border rounded">
                    <FaCalendarCheck className="text-primary mb-3" size={32} />
                    <h6>Schedule Appointment</h6>
                    <p className="text-muted small mb-0">Book a new consultation</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="quick-action-card text-center p-4 border rounded">
                    <FaPills className="text-success mb-3" size={32} />
                    <h6>View Prescriptions</h6>
                    <p className="text-muted small mb-0">Check your medications</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="quick-action-card text-center p-4 border rounded">
                    <FaHeartbeat className="text-danger mb-3" size={32} />
                    <h6>Vital Signs</h6>
                    <p className="text-muted small mb-0">Track your health metrics</p>
                  </div>
                </div>
                <div className="col-lg-3 col-md-6">
                  <div className="quick-action-card text-center p-4 border rounded">
                    <FaUserMd className="text-info mb-3" size={32} />
                    <h6>Contact Doctor</h6>
                    <p className="text-muted small mb-0">Send a message</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PatientOverview;