import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Spinner,
  Alert,
  InputGroup
} from "react-bootstrap";
import {
  FaEye,
  FaEdit,
  FaSearch,
  FaSync,
  FaUserInjured,
  FaPhone,
  FaMapMarkerAlt,
  FaStethoscope,
  FaHandsHelping,
  FaExclamationTriangle
} from "react-icons/fa";

function AssignedPatientsSection() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Fetch patients data
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("https://hospitalbackend-1-eail.onrender.com/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to fetch patients data");
    } finally {
      setLoading(false);
    }
  };

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber?.includes(searchTerm) ||
        patient.assignedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.assignedCareGiver?.sickness?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle view patient
  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  // Handle edit patient
  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      allergies: patient.allergies || "",
      bloodType: patient.bloodType || "",
      condition: patient.condition || "",
      currentMedications: patient.currentMedications || "",
      emergencyContact: patient.emergencyContact || "",
      notes: patient.notes || ""
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/patients/${selectedPatient._id}`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update local state
      const updatedPatients = patients.map(patient =>
        patient._id === selectedPatient._id
          ? { ...patient, ...editFormData }
          : patient
      );
      
      setPatients(updatedPatients);
      setFilteredPatients(updatedPatients);
      setShowEditModal(false);
      setSelectedPatient(null);
      
      // Show success message
      alert("Patient information updated successfully!");
    } catch (err) {
      console.error("Error updating patient:", err);
      alert("Failed to update patient information");
    }
  };

  // Get condition badge variant
  const getConditionVariant = (condition) => {
    if (!condition) return "secondary";
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes("critical") || conditionLower.includes("severe")) return "danger";
    if (conditionLower.includes("stable") || conditionLower.includes("good")) return "success";
    if (conditionLower.includes("monitor") || conditionLower.includes("observation")) return "warning";
    return "info";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading patients data...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger" className="text-center">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                <FaUserInjured className="me-2 text-primary" />
                Patient Management
              </h2>
              <p className="text-muted mb-0">
                Manage and monitor all patient records
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={fetchPatients}
                disabled={loading}
              >
                <FaSync className={`me-1 ${loading ? "spinner-border spinner-border-sm" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Search and Stats Section */}
      <Row className="mb-4">
        <Col lg={8}>
          <InputGroup className="search-box">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search patients by name, ID, phone, condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col lg={4}>
          <Card className="border-0 bg-light">
            <Card.Body className="py-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Total Patients:</span>
                <Badge bg="primary" className="fs-6">
                  {filteredPatients.length}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Patients Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
              <h5 className="mb-0">
                <FaUserInjured className="me-2" />
                Patients List
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Patient ID</th>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Condition</th>
                      <th>Doctor</th>
                      <th>Caregiver</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          <div className="text-muted">
                            <FaUserInjured size={48} className="mb-2 opacity-25" />
                            <p>No patients found</p>
                            {searchTerm && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setSearchTerm("")}
                              >
                                Clear Search
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr key={patient._id}>
                          <td>
                            <Badge bg="secondary" className="fw-normal">
                              {patient.patientId}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="avatar-sm bg-primary rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold">
                                {patient.name?.charAt(0) || "P"}
                              </div>
                              <div>
                                <div className="fw-semibold">{patient.name}</div>
                                <small className="text-muted">
                                  <FaPhone className="me-1" size={10} />
                                  {patient.phoneNumber}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="fw-semibold">{patient.age || "N/A"}</span>
                          </td>
                          <td>
                            <Badge
                              bg={patient.gender?.toLowerCase() === "female" ? "info" : "primary"}
                              className="text-capitalize"
                            >
                              {patient.gender}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={getConditionVariant(patient.condition)}>
                              {patient.condition || "Not Specified"}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaStethoscope className="me-1 text-success" size={12} />
                              <small>{patient.assignedDoctor?.name || "Unassigned"}</small>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaHandsHelping className="me-1 text-warning" size={12} />
                              <small>{patient.assignedCareGiver?.name || "Unassigned"}</small>
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {formatDate(patient.createdAt)}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewPatient(patient)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleEditPatient(patient)}
                                title="Edit Patient"
                              >
                                <FaEdit />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View Patient Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaUserInjured className="me-2" />
            Patient Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted mb-3">Personal Information</h6>
                <div className="mb-3">
                  <strong>Name:</strong>
                  <div className="text-dark">{selectedPatient.name}</div>
                </div>
                <div className="mb-3">
                  <strong>Patient ID:</strong>
                  <div className="text-dark">
                    <Badge bg="secondary">{selectedPatient.patientId}</Badge>
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Age:</strong>
                  <div className="text-dark">{selectedPatient.age || "N/A"}</div>
                </div>
                <div className="mb-3">
                  <strong>Gender:</strong>
                  <div className="text-dark text-capitalize">{selectedPatient.gender}</div>
                </div>
                <div className="mb-3">
                  <strong>Phone:</strong>
                  <div className="text-dark">
                    <FaPhone className="me-1" size={12} />
                    {selectedPatient.phoneNumber}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Address:</strong>
                  <div className="text-dark">
                    <FaMapMarkerAlt className="me-1" size={12} />
                    {selectedPatient.address || "N/A"}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <h6 className="text-muted mb-3">Medical Information</h6>
                <div className="mb-3">
                  <strong>Condition:</strong>
                  <div>
                    <Badge bg={getConditionVariant(selectedPatient.condition)}>
                      {selectedPatient.condition || "Not Specified"}
                    </Badge>
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Blood Type:</strong>
                  <div className="text-dark">{selectedPatient.bloodType || "N/A"}</div>
                </div>
                <div className="mb-3">
                  <strong>Allergies:</strong>
                  <div className="text-dark">{selectedPatient.allergies || "None reported"}</div>
                </div>
                <div className="mb-3">
                  <strong>Current Medications:</strong>
                  <div className="text-dark">{selectedPatient.currentMedications || "None"}</div>
                </div>
                <div className="mb-3">
                  <strong>Emergency Contact:</strong>
                  <div className="text-dark">{selectedPatient.emergencyContact || "N/A"}</div>
                </div>
                
                <h6 className="text-muted mb-3 mt-4">Care Team</h6>
                <div className="mb-2">
                  <strong>Assigned Doctor:</strong>
                  <div className="text-dark">
                    <FaStethoscope className="me-1 text-success" />
                    {selectedPatient.assignedDoctor?.name || "Unassigned"}
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Assigned Caregiver:</strong>
                  <div className="text-dark">
                    <FaHandsHelping className="me-1 text-warning" />
                    {selectedPatient.assignedCareGiver?.name || "Unassigned"}
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Sickness/Condition:</strong>
                  <div className="text-dark">{selectedPatient.assignedCareGiver?.sickness || "N/A"}</div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => {
              setShowViewModal(false);
              handleEditPatient(selectedPatient);
            }}
          >
            <FaEdit className="me-1" />
            Edit Information
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Patient Information
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {selectedPatient && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Allergies</strong>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="allergies"
                      value={editFormData.allergies}
                      onChange={handleInputChange}
                      placeholder="List any allergies..."
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Blood Type</strong>
                    </Form.Label>
                    <Form.Select
                      name="bloodType"
                      value={editFormData.bloodType}
                      onChange={handleInputChange}
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
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Current Condition</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="condition"
                      value={editFormData.condition}
                      onChange={handleInputChange}
                      placeholder="e.g., Stable, Critical, Recovering..."
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Current Medications</strong>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="currentMedications"
                      value={editFormData.currentMedications}
                      onChange={handleInputChange}
                      placeholder="List current medications..."
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Emergency Contact</strong>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="emergencyContact"
                      value={editFormData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Emergency contact number..."
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <strong>Additional Notes</strong>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={editFormData.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional notes or observations..."
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              <FaEdit className="me-1" />
              Update Information
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AssignedPatientsSection;