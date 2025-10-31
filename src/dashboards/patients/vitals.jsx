import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Alert, Badge, Card } from "react-bootstrap";
import { FaEye, FaTrash, FaPlus, FaHeartbeat, FaTint, FaHeart } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

function VitalsSection() {
  const [vitals, setVitals] = useState([]);
  const [selectedVital, setSelectedVital] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newVital, setNewVital] = useState({
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
    notes: "",
  });
  const [patientId, setPatientId] = useState("");

  // Fetch vitals
  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://hospitalbackend-1-eail.onrender.com/vitals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVitals(response.data);
      } catch (error) {
        console.error("Error fetching vitals:", error.response?.data || error.message);
        setError("Failed to fetch vitals data");
      } finally {
        setLoading(false);
      }
    };
    fetchVitals();
  }, []);

  // Decode and store patientId from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const currentPatientId = decoded.userInfo?.patientId;
      if (currentPatientId) setPatientId(currentPatientId);
    }
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Add new vital
  const handleAddVital = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://hospitalbackend-1-eail.onrender.com/vitals",
        newVital,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVitals([...vitals, response.data]);
      setSuccess("Vital record added successfully!");
      setNewVital({
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
        notes: "",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding vital:", error.response?.data || error.message);
      setError("Failed to add vital record");
    }
  };

  // Delete vital
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vital record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-1-eail.onrender.com/vitals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVitals(vitals.filter((vital) => vital._id !== id));
      setSuccess("Vital record deleted successfully!");
    } catch (error) {
      console.error("Error deleting vital:", error.response?.data || error.message);
      setError("Failed to delete vital record");
    }
  };

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "";
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Auto-calculate BMI
  useEffect(() => {
    if (newVital.weight && newVital.height) {
      const bmi = calculateBMI(newVital.weight, newVital.height);
      setNewVital((prev) => ({ ...prev, bmi }));
    }
  }, [newVital.weight, newVital.height]);

  // Reset form when modal closes
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewVital({
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
      notes: "",
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);

  // If timestamp lacks 'Z', assume UTC and adjust to Kenya time (UTC+3)
  if (!timestamp.endsWith("Z")) {
    date.setHours(date.getHours() + 3);
  }

  return date.toLocaleString("en-KE", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
  // Get status color
  const getVitalStatus = (type, value) => {
    if (!value) return "secondary";
    const numValue = parseFloat(value);

    if (type === "bloodPressure") {
      const bpValues = value.split("/");
      if (bpValues.length >= 1) {
        const systolic = parseFloat(bpValues[0]);
        if (isNaN(systolic)) return "secondary";
        if (systolic < 90) return "warning";
        if (systolic > 140) return "danger";
        return "success";
      }
      return "secondary";
    }

    if (type === "heartRate") {
      if (isNaN(numValue)) return "secondary";
      if (numValue < 60) return "warning";
      if (numValue > 100) return "danger";
      return "success";
    }

    if (type === "glucoseLevel") {
      if (isNaN(numValue)) return "secondary";
      if (numValue < 70) return "warning";
      if (numValue > 140) return "danger";
      return "success";
    }

    if (type === "temperature") {
      if (isNaN(numValue)) return "secondary";
      if (numValue < 36.1) return "warning";
      if (numValue > 37.2) return "danger";
      return "success";
    }

    if (type === "oxygenSaturation") {
      if (isNaN(numValue)) return "secondary";
      if (numValue < 95) return "danger";
      if (numValue < 97) return "warning";
      return "success";
    }

    return "secondary";
  };

  // Filter vitals
  const filteredVitals = vitals.filter((vital) =>
    vital.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid mt-4">
      {/* Alerts */}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="fw-bold text-primary mb-0">
          <FaHeartbeat className="me-2" />
          Patient Vitals
        </h4>
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "500px" }}>
          <Form.Control
            type="text"
            placeholder="Search by patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="success"
            onClick={() => {
              setNewVital({
                patientId: patientId,
                bloodPressure: "",
                glucoseLevel: "",
                heartRate: "",
                temperature: "",
                oxygenSaturation: "",
                respiratoryRate: "",
                weight: "",
                height: "",
                bmi: "",
                notes: "",
              });
              setShowAddModal(true);
            }}
            className="d-flex align-items-center"
          >
            <FaPlus className="me-2" /> Add Vitals
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="row mb-4">
        <div className="col-md-3">
          <Card className="bg-primary text-white text-center">
            <Card.Body>
              <FaHeart className="mb-2" size={24} />
              <h6>Total Records</h6>
              <h4>{vitals.length}</h4>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="bg-success text-white text-center">
            <Card.Body>
              <FaTint className="mb-2" size={24} />
              <h6>Normal BP</h6>
              <h4>{vitals.filter(v => getVitalStatus("bloodPressure", v.bloodPressure) === "success").length}</h4>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="bg-warning text-dark text-center">
            <Card.Body>
              <FaHeartbeat className="mb-2" size={24} />
              <h6>Abnormal HR</h6>
              <h4>{vitals.filter(v => getVitalStatus("heartRate", v.heartRate) !== "success").length}</h4>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card className="bg-info text-white text-center">
            <Card.Body>
              <FaTint className="mb-2" size={24} />
              <h6>High Glucose</h6>
              <h4>{vitals.filter(v => getVitalStatus("glucoseLevel", v.glucoseLevel) === "danger").length}</h4>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading vitals data...</p>
        </div>
      ) : filteredVitals.length === 0 ? (
        <div className="text-center my-5 text-muted">
          {searchTerm ? "No vital records match your search." : "No vital records found."}
        </div>
      ) : (
        <div className="table-responsive">
          <Table bordered hover className="shadow-sm">
            <thead className="table-primary">
              <tr>
                <th>Patient ID</th>
                <th>Blood Pressure</th>
                <th>Heart Rate</th>
                <th>Glucose Level</th>
                <th>Temperature</th>
                <th>Oxygen Sat</th>
                <th>BMI</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVitals.map((vital) => (
                <tr key={vital._id}>
                  <td className="fw-semibold">{vital.patientId}</td>
                  <td>
                    {vital.bloodPressure ? (
                      <Badge bg={getVitalStatus("bloodPressure", vital.bloodPressure)}>
                        {vital.bloodPressure} mmHg
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {vital.heartRate ? (
                      <Badge bg={getVitalStatus("heartRate", vital.heartRate)}>
                        {vital.heartRate} bpm
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {vital.glucoseLevel ? (
                      <Badge bg={getVitalStatus("glucoseLevel", vital.glucoseLevel)}>
                        {vital.glucoseLevel} mg/dL
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {vital.temperature ? (
                      <Badge bg={getVitalStatus("temperature", vital.temperature)}>
                        {vital.temperature}°C
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {vital.oxygenSaturation ? (
                      <Badge bg={getVitalStatus("oxygenSaturation", vital.oxygenSaturation)}>
                        {vital.oxygenSaturation}%
                      </Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    {vital.bmi ? (
                      <span
                        className={`fw-bold ${
                          parseFloat(vital.bmi) < 18.5
                            ? "text-warning"
                            : parseFloat(vital.bmi) > 25
                            ? "text-danger"
                            : "text-success"
                        }`}
                      >
                        {vital.bmi}
                      </span>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>{formatTimestamp(vital.timestamp)}</td>
                  <td>
                    <div className="d-flex gap-1 justify-content-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedVital(vital);
                          setShowModal(true);
                        }}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(vital._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* View Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Vital Signs Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVital && (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold text-primary mb-3">Basic Information</h6>
                <p><strong>Patient ID:</strong> {selectedVital.patientId}</p>
                <p><strong>Recorded At:</strong> {formatTimestamp(selectedVital.timestamp)}</p>

                <h6 className="fw-bold text-primary mt-4 mb-3">Cardiovascular</h6>
                <p><strong>Blood Pressure:</strong> {selectedVital.bloodPressure || "N/A"}</p>
                <p><strong>Heart Rate:</strong> {selectedVital.heartRate || "N/A"}</p>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold text-primary mb-3">Metabolic & Respiratory</h6>
                <p><strong>Glucose Level:</strong> {selectedVital.glucoseLevel || "N/A"}</p>
                <p><strong>Temperature:</strong> {selectedVital.temperature || "N/A"}</p>
                <p><strong>Oxygen Saturation:</strong> {selectedVital.oxygenSaturation || "N/A"}</p>
                <p><strong>Respiratory Rate:</strong> {selectedVital.respiratoryRate || "N/A"}</p>
                <p><strong>BMI:</strong> {selectedVital.bmi || "N/A"}</p>
              </div>
              {selectedVital.notes && (
                <div className="col-12 mt-3">
                  <h6 className="fw-bold text-primary mb-2">Additional Notes</h6>
                  <p className="p-2 bg-light rounded">{selectedVital.notes}</p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Add New Vital Record</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddVital}>
          <Modal.Body>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Patient ID <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newVital.patientId}
                  readOnly
                  className="bg-light"
                  placeholder="Patient ID (auto-filled)"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Blood Pressure</Form.Label>
                <Form.Control
                  type="text"
                  value={newVital.bloodPressure}
                  onChange={(e) => setNewVital({ ...newVital, bloodPressure: e.target.value })}
                  placeholder="e.g., 120/80"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Heart Rate (bpm)</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.heartRate}
                  onChange={(e) => setNewVital({ ...newVital, heartRate: e.target.value })}
                  placeholder="Enter heart rate"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Glucose Level (mg/dL)</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.glucoseLevel}
                  onChange={(e) => setNewVital({ ...newVital, glucoseLevel: e.target.value })}
                  placeholder="Enter glucose level"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Temperature (°C)</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.temperature}
                  onChange={(e) => setNewVital({ ...newVital, temperature: e.target.value })}
                  placeholder="Enter temperature"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Oxygen Saturation (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.oxygenSaturation}
                  onChange={(e) => setNewVital({ ...newVital, oxygenSaturation: e.target.value })}
                  placeholder="Enter oxygen level"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Respiratory Rate</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.respiratoryRate}
                  onChange={(e) => setNewVital({ ...newVital, respiratoryRate: e.target.value })}
                  placeholder="Enter respiratory rate"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Weight (kg)</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.weight}
                  onChange={(e) => setNewVital({ ...newVital, weight: e.target.value })}
                  placeholder="Enter weight"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                  type="number"
                  value={newVital.height}
                  onChange={(e) => setNewVital({ ...newVital, height: e.target.value })}
                  placeholder="Enter height"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>BMI</Form.Label>
                <Form.Control
                  type="text"
                  value={newVital.bmi}
                  readOnly
                  className="bg-light"
                  placeholder="Auto-calculated"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-12">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={newVital.notes}
                  onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </Form.Group>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Save Vital
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default VitalsSection;
