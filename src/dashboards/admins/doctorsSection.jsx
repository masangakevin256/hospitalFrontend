import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Table, Form, Spinner, Alert, Badge, Card, Row, Col } from "react-bootstrap";
import { FaEye, FaTrash, FaUserPlus, FaUserShield, FaPhone, FaEnvelope, FaIdCard, FaEdit } from "react-icons/fa";

function DoctorsSection() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalError, setModalError] = useState(""); // Error for modal

  const [newDoctor, setNewDoctor] = useState({
    email: "",
    username: "",
    password: "",
    doctorId: "",
    phoneNumber: "",
    gender: "",
    specialty: "",
    secretReg: ""
  });

  const [editDoctor, setEditDoctor] = useState({
    email: "",
    username: "",
    doctorId: "",
    phoneNumber: "",
    gender: "",
    specialty: ""
  });

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("https://hospitalbackend-pfva.onrender.com/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error.response?.data || error.message);
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Add new doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setModalError(""); // Clear modal error
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://hospitalbackend-pfva.onrender.com/register/doctors",
        newDoctor,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoctors([...doctors, response.data]);
      setSuccess("Doctor added successfully!");
      setNewDoctor({
        email: "",
        username: "",
        password: "",
        doctorId: "",
        phoneNumber: "",
        gender: "",
        specialty: "",
        secretReg: ""
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding doctor:", error);
      setModalError(error.response?.data?.message || "Failed to add doctor");
    }
  };

  // Edit doctor
  const handleEditDoctor = async (e) => {
    e.preventDefault();
    setModalError(""); // Clear modal error
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://hospitalbackend-pfva.onrender.com/doctors/${selectedDoctor._id}`,
        editDoctor,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDoctors(doctors.map(doctor => 
        doctor._id === selectedDoctor._id ? response.data : doctor
      ));
      setSuccess("Doctor updated successfully!");
      setShowEditModal(false);
      setSelectedDoctor(null);
    } catch (error) {
      console.error("Error updating doctor:", error);
      setModalError(error.response?.data?.message || "Failed to update doctor");
    }
  };

  // Delete doctor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://hospitalbackend-pfva.onrender.com/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(doctors.filter((doctor) => doctor._id !== id));
      setSuccess("Doctor deleted successfully!");
    } catch (error) {
      console.error("Error deleting doctor:", error);
      setError("Failed to delete doctor");
    }
  };

  // Open edit modal
  const handleOpenEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setEditDoctor({
      email: doctor.email,
      username: doctor.username,
      doctorId: doctor.doctorId,
      phoneNumber: doctor.phoneNumber,
      gender: doctor.gender,
      specialty: doctor.specialty
    });
    setShowEditModal(true);
    setModalError(""); // Clear any previous modal errors
  };

  // Reset forms
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewDoctor({
      email: "",
      username: "",
      password: "",
      doctorId: "",
      phoneNumber: "",
      gender: "",
      specialty: "",
      secretReg: ""
    });
    setModalError(""); // Clear modal error
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDoctor(null);
    setModalError(""); // Clear modal error
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter doctors
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.doctorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get gender badge variant
  const getGenderVariant = (gender) => {
    switch (gender) {
      case 'Male': return 'primary';
      case 'Female': return 'pink';
      default: return 'secondary';
    }
  };

  // Get specialty badge variant
  const getSpecialtyVariant = (specialty) => {
    const specialties = {
      'Cardiology': 'danger',
      'Neurology': 'info',
      'Pediatrics': 'success',
      'Surgery': 'warning',
      'Dermatology': 'dark',
      'General': 'secondary'
    };
    return specialties[specialty] || 'secondary';
  };

  return (
    <div className="container-fluid mt-4">
      {/* Alert Messages */}
      {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess("")} dismissible>{success}</Alert>}

      {/* Header + Search + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <h4 className="fw-bold text-primary mb-0">
          <FaUserShield className="me-2" />
          Medical Doctors
        </h4>
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "500px" }}>
          <Form.Control
            type="text"
            placeholder="Search by name, ID, specialty, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="success" onClick={() => setShowAddModal(true)} className="d-flex align-items-center">
            <FaUserPlus className="me-2" /> Add Doctor
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-primary text-white">
            <Card.Body className="text-center">
              <FaUserShield className="mb-2" size={24} />
              <h6 className="card-title">Total Doctors</h6>
              <h4 className="mb-0">{doctors.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-success text-white">
            <Card.Body className="text-center">
              <FaIdCard className="mb-2" size={24} />
              <h6 className="card-title">Specialties</h6>
              <h4 className="mb-0">{new Set(doctors.map(d => d.specialty)).size}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-info text-white">
            <Card.Body className="text-center">
              <FaEnvelope className="mb-2" size={24} />
              <h6 className="card-title">Active</h6>
              <h4 className="mb-0">{doctors.length}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-warning text-dark">
            <Card.Body className="text-center">
              <FaPhone className="mb-2" size={24} />
              <h6 className="card-title">Available</h6>
              <h4 className="mb-0">{doctors.length}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Doctors Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading doctors...</p>
        </div>
      ) : (
        <>
          {filteredDoctors.length === 0 ? (
            <div className="text-center my-5">
              <p className="text-muted">
                {searchTerm ? "No doctors match your search." : "No doctors found."}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table bordered hover className="shadow-sm">
                <thead className="table-primary">
                  <tr>
                    <th>Doctor ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Specialty</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td className="fw-semibold">
                        <FaIdCard className="me-1 text-muted" />
                        {doctor.doctorId || "N/A"}
                      </td>
                      <td>{doctor.username}</td>
                      <td>
                        <FaEnvelope className="me-1 text-muted" />
                        {doctor.email}
                      </td>
                      <td>
                        <FaPhone className="me-1 text-muted" />
                        {doctor.phoneNumber}
                      </td>
                      <td>
                        <Badge bg={getGenderVariant(doctor.gender)}>
                          {doctor.gender}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getSpecialtyVariant(doctor.specialty)}>
                          {doctor.specialty || "General"}
                        </Badge>
                      </td>
                      <td>{formatDate(doctor.createdAt)}</td>
                      <td>
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => {
                              setSelectedDoctor(doctor);
                              setShowModal(true);
                            }}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleOpenEditModal(doctor)}
                            title="Edit Doctor"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(doctor._id)}
                            title="Delete Doctor"
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
        </>
      )}

      {/* Doctor Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaUserShield className="me-2" />
            Doctor Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDoctor && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Doctor ID:</strong>
                  <p className="fw-semibold text-primary">{selectedDoctor.doctorId}</p>
                </div>
                <div className="mb-3">
                  <strong>Full Name:</strong>
                  <p>{selectedDoctor.username}</p>
                </div>
                <div className="mb-3">
                  <strong>Email:</strong>
                  <p>
                    <FaEnvelope className="me-1 text-muted" />
                    {selectedDoctor.email}
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Phone Number:</strong>
                  <p>
                    <FaPhone className="me-1 text-muted" />
                    {selectedDoctor.phoneNumber}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Gender:</strong>
                  <p>
                    <Badge bg={getGenderVariant(selectedDoctor.gender)}>
                      {selectedDoctor.gender}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Specialty:</strong>
                  <p>
                    <Badge bg={getSpecialtyVariant(selectedDoctor.specialty)}>
                      {selectedDoctor.specialty || "General"}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Salary:</strong>
                  <p className="fw-semibold text-primary">
                    <Badge bg={getSpecialtyVariant(selectedDoctor.amountPaid)}>
                      {selectedDoctor.amountPaid}
                    </Badge>
                  </p>
                </div>
                <div className="mb-3">
                  <strong>Registration Date:</strong>
                  <p>{formatDate(selectedDoctor.createdAt)}</p>
                </div>
                {selectedDoctor.registeredBy && (
                  <div className="mb-3">
                    <strong>Registered By:</strong>
                    <p className="text-muted">Admin: {selectedDoctor.registeredBy || "Super Admin"}</p>
                  </div>
                )}
                <div className="mb-3">
                  <strong>Assigned Patients:</strong>
                  {selectedDoctor.assignedPatients && selectedDoctor.assignedPatients.length > 0 ? (
                    <div className="mt-1">
                      {selectedDoctor.assignedPatients.map((patientId, index) => (
                        <Badge key={index} bg="secondary" className="me-1 mb-1">
                          {patientId}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No assigned patients</p>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Doctor Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} centered size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaUserPlus className="me-2" />
            Add New Doctor
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddDoctor}>
          <Modal.Body>
            {/* Modal Error Alert */}
            {modalError && <Alert variant="danger" dismissible onClose={() => setModalError("")}>{modalError}</Alert>}
            
            <Row>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newDoctor.username}
                  onChange={(e) => setNewDoctor({ ...newDoctor, username: e.target.value })}
                  required
                  placeholder="Enter doctor's full name"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Doctor ID <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newDoctor.doctorId}
                  onChange={(e) => setNewDoctor({ ...newDoctor, doctorId: e.target.value })}
                  required
                  placeholder="e.g., DOC001"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  value={newDoctor.phoneNumber}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })}
                  required
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={newDoctor.gender}
                  onChange={(e) => setNewDoctor({ ...newDoctor, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Specialty <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                  required
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                  required
                  placeholder="Enter password"
                  minLength={6}
                />
                <Form.Text className="text-muted">
                  Password must be at least 6 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Secret Registration Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newDoctor.secretReg}
                  onChange={(e) => setNewDoctor({ ...newDoctor, secretReg: e.target.value })}
                  required
                  placeholder="Enter secret code"
                />
                <Form.Text className="text-muted">
                  Required for doctor verification
                </Form.Text>
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success" className="px-4">
              Add Doctor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Doctor
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditDoctor}>
          <Modal.Body>
            {/* Modal Error Alert */}
            {modalError && <Alert variant="danger" dismissible onClose={() => setModalError("")}>{modalError}</Alert>}
            
            <Row>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={editDoctor.username}
                  onChange={(e) => setEditDoctor({ ...editDoctor, username: e.target.value })}
                  required
                  placeholder="Enter doctor's full name"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Email Address <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="email"
                  value={editDoctor.email}
                  onChange={(e) => setEditDoctor({ ...editDoctor, email: e.target.value })}
                  required
                  placeholder="Enter email address"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Doctor ID <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={editDoctor.doctorId}
                  onChange={(e) => setEditDoctor({ ...editDoctor, doctorId: e.target.value })}
                  required
                  placeholder="e.g., DOC001"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Phone Number <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="tel"
                  value={editDoctor.phoneNumber}
                  onChange={(e) => setEditDoctor({ ...editDoctor, phoneNumber: e.target.value })}
                  required
                  placeholder="Enter phone number"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Gender <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={editDoctor.gender}
                  onChange={(e) => setEditDoctor({ ...editDoctor, gender: e.target.value })}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Specialty <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={editDoctor.specialty}
                  onChange={(e) => setEditDoctor({ ...editDoctor, specialty: e.target.value })}
                  required
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </Form.Group>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseEditModal}>
              Cancel
            </Button>
            <Button type="submit" variant="warning" className="px-4">
              Update Doctor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default DoctorsSection;