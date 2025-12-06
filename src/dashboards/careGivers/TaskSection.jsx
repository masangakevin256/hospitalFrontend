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
  FaEdit,
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
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { format } from 'date-fns';

function TasksSection() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    patientId: "",
    priority: "medium",
    status: "pending",
    date: "",
  });

  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    date: "",
  });

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Configure axios defaults
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      const response = await axios.get("https://hospitalbackend-1-eail.onrender.com/tasks", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTasks(response.data);
      setFilteredTasks(response.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.response?.data?.message || "Failed to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  useEffect(() => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.patientName && task.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
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

  // Create new task
  const handleCreateTask = async () => {
    try {
      if (!newTask.title || !newTask.patientId || !newTask.date) {
        alert("Please fill all required fields: Title, Patient ID, and Date");
        return;
      }

      const token = getAuthToken();
      const response = await axios.post("https://hospitalbackend-1-eail.onrender.com/tasks", newTask, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccessMessage("Task created successfully!");
      
      // Reset form
      setNewTask({
        title: "",
        description: "",
        patientId: "",
        priority: "medium",
        status: "pending",
        date: "",
      });
      
      setShowCreateModal(false);
      
      // Refresh tasks
      fetchTasks();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error creating task:", err);
      alert(err.response?.data?.message || "Failed to create task. Please try again.");
    }
  };

  // Open edit modal
  const handleEditClick = (task) => {
    setSelectedTask(task);
    setEditTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      date: task.date ? format(new Date(task.date), "yyyy-MM-dd'T'HH:mm") : "",
    });
    setShowEditModal(true);
  };

  // Update task
  const handleUpdateTask = async () => {
    try {
      if (!selectedTask) return;

      const token = getAuthToken();
      const response = await axios.put(
        `https://hospitalbackend-1-eail.onrender.com/tasks/${selectedTask._id}`,
        editTask,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccessMessage("Task updated successfully!");
      setShowEditModal(false);
      fetchTasks();
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error updating task:", err);
      alert(err.response?.data?.message || "Failed to update task. Please try again.");
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const token = getAuthToken();
        await axios.delete(`https://hospitalbackend-1-eail.onrender.com/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setSuccessMessage("Task deleted successfully!");
        fetchTasks();
        
        setTimeout(() => setSuccessMessage(""), 3000);
        
      } catch (err) {
        console.error("Error deleting task:", err);
        alert(err.response?.data?.message || "Failed to delete task. Please try again.");
      }
    }
  };

  // Update task status
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = getAuthToken();
      await axios.patch(
        `https://hospitalbackend-1-eail.onrender.com/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccessMessage(`Task marked as ${newStatus}!`);
      fetchTasks();
      
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.response?.data?.message || "Failed to update status. Please try again.");
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (error) {
      return dateString;
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
                Caregiver Task Management
              </h2>
              <p className="text-muted mb-0">
                Manage and track your assigned caregiving tasks efficiently.
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FaPlus className="me-1" /> Add New Task
            </Button>
          </div>
        </Col>
      </Row>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert variant="success" onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">Total Tasks</h6>
              <h3 className="fw-bold text-primary mb-auto">{taskStats.total}</h3>
              <small className="text-muted">All assigned tasks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">Completed</h6>
              <h3 className="fw-bold text-success mb-auto">{taskStats.completed}</h3>
              <small className="text-muted">{completionPercentage}% of all tasks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">In Progress</h6>
              <h3 className="fw-bold text-warning mb-auto">{taskStats.inProgress}</h3>
              <small className="text-muted">Currently being worked on</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="d-flex flex-column">
              <h6 className="text-muted mb-2">High Priority</h6>
              <h3 className="fw-bold text-danger mb-auto">{taskStats.highPriority}</h3>
              <small className="text-muted">Requires immediate attention</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <div className="d-flex justify-content-between mb-2">
            <h6 className="mb-0">Task Completion Progress</h6>
            <span className="fw-bold text-primary">{completionPercentage}%</span>
          </div>
          <ProgressBar now={completionPercentage} variant="success" className="mb-2" />
          <div className="d-flex justify-content-between text-muted small">
            <span>{taskStats.pending} pending</span>
            <span>{taskStats.inProgress} in progress</span>
            <span>{taskStats.completed} completed</span>
          </div>
        </Card.Body>
      </Card>

      {/* Filters */}
      <Card className="shadow-sm mb-4 border-0">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-light">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search tasks by title, patient, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-light"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-light"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>
            <Col md={1}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("all");
                  setFilterStatus("all");
                }}
                title="Clear filters"
              >
                <FaFilter />
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tasks Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <div>
            <FaTasks className="me-2 text-primary" />
            <span className="fw-semibold">Tasks</span>
            <Badge bg="secondary" className="ms-2">{filteredTasks.length}</Badge>
          </div>
          {loading && <Spinner animation="border" size="sm" />}
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-5">
              <FaTasks size={40} className="text-muted mb-2" />
              <h6 className="text-muted">No tasks found</h6>
              <p className="text-muted small">Try adjusting your filters or add a new task</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '25%' }}>Task Details</th>
                    <th style={{ width: '15%' }}>Patient</th>
                    <th style={{ width: '10%' }}>Priority</th>
                    <th style={{ width: '15%' }}>Due Date</th>
                    <th style={{ width: '10%' }}>Status</th>
                    <th style={{ width: '15%' }}>Created</th>
                    <th style={{ width: '10%' }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <div className="d-flex flex-column">
                          <strong className="text-dark">{task.title}</strong>
                          <small className="text-muted text-truncate" style={{ maxWidth: '250px' }}>
                            {task.description}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaUserInjured className="me-2 text-primary" />
                          <div>
                            <div>{task.patientName || "N/A"}</div>
                            <small className="text-muted">{task.patientId}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(task.priority)} className="px-3 py-1">
                          {task.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-muted" />
                          <div>
                            {task.date ? formatDate(task.date) : "No date set"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          {getStatusIcon(task.status)}
                          <Badge 
                            bg={getStatusVariant(task.status)} 
                            className="ms-2 px-2 py-1"
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {task.createdAt ? formatDate(task.createdAt) : "N/A"}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditClick(task)}
                            title="Edit task"
                          >
                            <FaEdit />
                          </Button>
                          {task.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => handleStatusChange(task._id, "completed")}
                              title="Mark as completed"
                            >
                              <FaCheckCircle />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete task"
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

      {/* Create Task Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaPlus className="me-2" /> Create New Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Task Title *</Form.Label>
                  <Form.Control
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    placeholder="Enter task title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient ID *</Form.Label>
                  <Form.Control
                    value={newTask.patientId}
                    onChange={(e) =>
                      setNewTask({ ...newTask, patientId: e.target.value })
                    }
                    placeholder="Enter patient ID"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
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
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newTask.date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, date: e.target.value })
                    }
                    required
                  />
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
                placeholder="Describe the task details..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Form>
          <small className="text-muted">* Required fields</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateTask}>
            Create Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Task Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <FaEdit className="me-2" /> Edit Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Task Title</Form.Label>
                    <Form.Control
                      value={editTask.title}
                      onChange={(e) =>
                        setEditTask({ ...editTask, title: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Patient</Form.Label>
                    <Form.Control
                      value={selectedTask.patientName || selectedTask.patientId}
                      disabled
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={editTask.priority}
                      onChange={(e) =>
                        setEditTask({ ...editTask, priority: e.target.value })
                      }
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={editTask.status}
                      onChange={(e) =>
                        setEditTask({ ...editTask, status: e.target.value })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editTask.description}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Due Date & Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  value={editTask.date}
                  onChange={(e) =>
                    setEditTask({ ...editTask, date: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateTask}>
            Update Task
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TasksSection;