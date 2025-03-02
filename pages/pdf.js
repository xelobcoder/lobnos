"use client"
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Nav } from 'react-bootstrap';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const TaskViewer = () => {
     const [tasks, setTasks] = useState([]);
     const [view, setView] = useState('list'); // 'list' or 'kanban'
     const [selectedTask, setSelectedTask] = useState(null);
     const [showTaskDetails, setShowTaskDetails] = useState(false);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);

     const statuses = ['Todo', 'In Progress', 'Done'];

     // Fetch tasks from the API
     useEffect(() => {
          const fetchTasks = async () => {
               try {
                    const response = await fetch('http://localhost:5000/api/v1/primelims/tasks');
                    if (!response.ok) {
                         throw new Error('Failed to fetch tasks');
                    }
                    const data = await response.json();
                    // Map API data to the required structure
                    const mappedTasks = data.map(task => ({
                         id: task.id,
                         title: task.name,
                         description: task.description,
                         status: task.completed ? 'Done' : 'Todo', // Map completed to status
                         priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1), // Capitalize priority
                         dueDate: new Date(task.endDate).toISOString().split('T')[0], // Format date
                         assignee: task.assignedTo || 'Unassigned', // Handle unassigned tasks
                    }));
                    setTasks(mappedTasks);
               } catch (err) {
                    setError(err.message);
               } finally {
                    setIsLoading(false);
               }
          };

          fetchTasks();
     }, []);

     // Get priority styling
     const getPriorityBadge = (priority) => {
          switch (priority.toLowerCase()) {
               case 'high': return 'danger';
               case 'medium': return 'warning';
               case 'low': return 'success';
               default: return 'secondary';
          }
     };

     const handleTaskClick = (task) => {
          setSelectedTask(task);
          setShowTaskDetails(true);
     };

     const handleClose = () => {
          setShowTaskDetails(false);
     };

     // Task Detail Modal
     const TaskDetailsModal = ({ task, show, onHide }) => {
          if (!task) return null;

          return (
               <Modal show={show} onHide={onHide} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>{task.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <div className="mb-4">
                              <h6 className="text-muted">Description</h6>
                              <p>{task.description}</p>
                         </div>

                         <Row className="mb-3">
                              <Col md={6}>
                                   <h6 className="text-muted">Status</h6>
                                   <p>{task.status}</p>
                              </Col>

                              <Col md={6}>
                                   <h6 className="text-muted">Priority</h6>
                                   <Badge bg={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                              </Col>
                         </Row>

                         <Row>
                              <Col md={6}>
                                   <h6 className="text-muted">Due Date</h6>
                                   <p>{task.dueDate}</p>
                              </Col>

                              <Col md={6}>
                                   <h6 className="text-muted">Assignee</h6>
                                   <p>{task.assignee}</p>
                              </Col>
                         </Row>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="primary" className="d-flex align-items-center">
                              <EditIcon fontSize="small" className="me-1" /> Edit Task
                         </Button>
                    </Modal.Footer>
               </Modal>
          );
     };

     // List View Component
     const ListView = ({ tasks, onTaskClick }) => {
          return (
               <Table hover responsive>
                    <thead>
                         <tr>
                              <th>Title</th>
                              <th>Status</th>
                              <th>Priority</th>
                              <th>Due Date</th>
                              <th>Assignee</th>
                         </tr>
                    </thead>
                    <tbody>
                         {tasks.map(task => (
                              <tr
                                   key={task.id}
                                   onClick={() => onTaskClick(task)}
                                   style={{ cursor: 'pointer' }}
                              >
                                   <td>{task.title}</td>
                                   <td><Badge bg="info">{task.status}</Badge></td>
                                   <td><Badge bg={getPriorityBadge(task.priority)}>{task.priority}</Badge></td>
                                   <td>{task.dueDate}</td>
                                   <td>{task.assignee}</td>
                              </tr>
                         ))}
                    </tbody>
               </Table>
          );
     };

     // Kanban View Component
     const KanbanView = ({ tasks, statuses, onTaskClick }) => {
          return (
               <Row className="flex-nowrap overflow-auto pb-3">
                    {statuses.map(status => (
                         <Col key={status} md={4} className="flex-shrink-0" style={{ minWidth: '300px' }}>
                              <Card className="h-100">
                                   <Card.Header className="bg-light">
                                        <h5 className="mb-0">{status}</h5>
                                   </Card.Header>
                                   <Card.Body className="bg-light">
                                        {tasks
                                             .filter(task => task.status === status)
                                             .map(task => (
                                                  <Card
                                                       key={task.id}
                                                       className="mb-2 cursor-pointer"
                                                       onClick={() => onTaskClick(task)}
                                                       style={{ cursor: 'pointer' }}
                                                  >
                                                       <Card.Body>
                                                            <Card.Title className="h6">{task.title}</Card.Title>
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                 <Badge bg={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                                                                 <small className="text-muted">{task.dueDate}</small>
                                                            </div>
                                                            <small className="text-muted">{task.assignee}</small>
                                                       </Card.Body>
                                                  </Card>
                                             ))
                                        }
                                        <Button variant="light" className="w-100 mt-2">
                                             <AddIcon fontSize="small" className="me-1" /> Add Task
                                        </Button>
                                   </Card.Body>
                              </Card>
                         </Col>
                    ))}
               </Row>
          );
     };

     if (isLoading) {
          return <Container fluid className="py-4">Loading...</Container>;
     }

     if (error) {
          return <Container fluid className="py-4">Error: {error}</Container>;
     }

     return (
          <Container fluid className="py-4">
               <Row className="mb-4">
                    <Col>
                         <h1>Task Manager</h1>

                         {/* View Controls */}
                         <div className="d-flex justify-content-between align-items-center mb-3">
                              <Nav variant="pills" className="bg-light p-1" style={{ borderRadius: '0.25rem' }}>
                                   <Nav.Item>
                                        <Nav.Link
                                             active={view === 'list'}
                                             onClick={() => setView('list')}
                                             className="d-flex align-items-center"
                                        >
                                             <ViewListIcon fontSize="small" className="me-1" /> List
                                        </Nav.Link>
                                   </Nav.Item>
                                   <Nav.Item>
                                        <Nav.Link
                                             active={view === 'kanban'}
                                             onClick={() => setView('kanban')}
                                             className="d-flex align-items-center"
                                        >
                                             <ViewColumnIcon fontSize="small" className="me-1" /> Kanban
                                        </Nav.Link>
                                   </Nav.Item>
                              </Nav>

                              <Button variant="primary" className="d-flex align-items-center">
                                   <AddIcon fontSize="small" className="me-1" /> New Task
                              </Button>
                         </div>
                    </Col>
               </Row>

               <Row>
                    <Col>
                         {view === 'list' ? (
                              <ListView tasks={tasks} onTaskClick={handleTaskClick} />
                         ) : (
                              <KanbanView tasks={tasks} statuses={statuses} onTaskClick={handleTaskClick} />
                         )}
                    </Col>
               </Row>

               {/* Task Details Modal */}
               <TaskDetailsModal
                    task={selectedTask}
                    show={showTaskDetails}
                    onHide={handleClose}
               />
          </Container>
     );
};

export default TaskViewer;