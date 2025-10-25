import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaPlus,
  FaTrash,
  FaUserInjured,
  FaCalendarAlt,
  FaSync,
} from "react-icons/fa";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
  Modal,
  Badge,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";

function TasksSection() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    patientName: "",
    patientId: "",
    priority: "medium",
    dueDate: "",
    category: "medication",
  });

  // sample data (can be replaced with backend)
  const sampleTasks = [
    {
      id: 1,
      title: "Morning Medication Round",
      description: "Administer prescribed medications to patients in Ward A",
      patientName: "Omondi Clinton",
      patientId: "PAT002",
      priority: "high",
      status: "pending",
      dueDate: "2025-10-25T09:00:00",
      category: "medication",
      assignedBy: "Dr. Smith",
      createdAt: "2025-10-24T08:00:00",
      completedAt: null,
    },
    {
      id: 2,
      title: "Vital Signs Check",
      description: "Check and record vital signs for patients in Ward B",
      patientName: "Jane Doe",
      patientId: "PAT005",
      priority: "medium",
      status: "in-progress",
      dueDate: "2025-10-25T11:00:00",
      category: "vitals",
      assignedBy: "Dr. Johnson",
      createdAt: "2025-10-24T10:00:00",
      completedAt: null,
    },
  ];

  useEffect(() => {
    setTasks(sampleTasks);
    setFilteredTasks(sampleTasks);
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    setFilteredTasks(filtered);
  }, [searchTerm, filterPriority, filterStatus, tasks]);

  // Update status
  const handleStatusChange = (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
            completedAt:
              newStatus === "completed" ? new Date().toISOString() : null,
          }
        : task
    );
    setTasks(updatedTasks);
  };

  // Delete
  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  // Create
  const handleCreateTask = () => {
    if (!newTask.title || !newTask.patientId) {
      alert("Please fill all required fields");
      return;
    }

    const newTaskObj = {
      id: tasks.length + 1,
      ...newTask,
      status: "pending",
      assignedBy: "Self",
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTasks([...tasks, newTaskObj]);
    setNewTask({
      title: "",
      description: "",
      patientName: "",
      patientId: "",
      priority: "medium",
      dueDate: "",
      category: "medication",
    });
    setShowCreateModal(false);
  };

  // Helpers
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "secondary";
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "in-progress":
        return "primary";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-success" />;
      case "in-progress":
        return <FaSync className="text-primary" />;
      case "pending":
        return <FaClock className="text-warning" />;
      default:
        return <FaClock className="text-secondary" />;
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    highPriority: tasks.filter((t) => t.priority === "high").length,
  };

  const completionPercentage =
    taskStats.total > 0
      ? Math.round((taskStats.completed / taskStats.total) * 100)
      : 0;

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold text-dark mb-1">
                <FaTasks className="me-2 text-primary" />
                Caregiver Dashboard
              </h2>
              <p className="text-muted mb-0">
                Manage and track your assigned caregiving tasks efficiently.
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FaPlus className="me-1" /> Add Task
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted mb-1">Total Tasks</h6>
              <h3 className="fw-bold text-primary">{taskStats.total}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted mb-1">Completed</h6>
              <h3 className="fw-bold text-success">{taskStats.completed}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted mb-1">In Progress</h6>
              <h3 className="fw-bold text-warning">{taskStats.inProgress}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6 className="text-muted mb-1">High Priority</h6>
              <h3 className="fw-bold text-danger">{taskStats.highPriority}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <div className="d-flex justify-content-between mb-2">
            <h6 className="mb-0">Overall Task Completion</h6>
            <span className="fw-bold text-primary">
              {completionPercentage}%
            </span>
          </div>
          <ProgressBar now={completionPercentage} variant="success" />
        </Card.Body>
      </Card>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by task or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            className="w-100"
            onClick={() => {
              setSearchTerm("");
              setFilterPriority("all");
              setFilterStatus("all");
            }}
          >
            <FaFilter className="me-1" /> Clear
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light fw-semibold">
          <FaTasks className="me-2 text-primary" />
          Tasks ({filteredTasks.length})
        </Card.Header>
        <Card.Body className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaTasks size={40} className="text-muted mb-2" />
              <h6 className="text-muted">No tasks found</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead className="table-light">
                  <tr>
                    <th>Task</th>
                    <th>Patient</th>
                    <th>Priority</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th>Assigned By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <strong>{task.title}</strong>
                        <br />
                        <small className="text-muted">{task.description}</small>
                      </td>
                      <td>
                        <FaUserInjured className="me-1 text-primary" />
                        {task.patientName} <br />
                        <small className="text-muted">{task.patientId}</small>
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td>
                        <FaCalendarAlt className="me-1 text-muted" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td>
                        {getStatusIcon(task.status)}{" "}
                        <Badge bg={getStatusVariant(task.status)} className="ms-1">
                          {task.status}
                        </Badge>
                      </td>
                      <td>{task.assignedBy}</td>
                      <td>
                        <div className="d-flex gap-1">
                          {task.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() =>
                                handleStatusChange(task.id, "completed")
                              }
                            >
                              <FaCheckCircle />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteTask(task.id)}
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
        </Card.Body>
      </Card>

      {/* Modal for New Task */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaPlus className="me-2" /> Add New Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title</Form.Label>
                  <Form.Control
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient Name</Form.Label>
                  <Form.Control
                    value={newTask.patientName}
                    onChange={(e) =>
                      setNewTask({ ...newTask, patientName: e.target.value })
                    }
                    placeholder="Enter patient name"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient ID</Form.Label>
                  <Form.Control
                    value={newTask.patientId}
                    onChange={(e) =>
                      setNewTask({ ...newTask, patientId: e.target.value })
                    }
                    placeholder="Enter patient ID"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Describe the task"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Due Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateTask}>
            Add Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TasksSection;
