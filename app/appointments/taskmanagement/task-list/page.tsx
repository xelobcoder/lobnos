"use client"
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Badge, Button, Modal, ButtonGroup } from 'react-bootstrap';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useRouter, useSearchParams } from 'next/navigation';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../../components/Auth/customFetch';
import { loadTaskDefinition } from '../../../../components/serverActions/ActionFiltering';
import { motion } from 'framer-motion';

const TaskViewer = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const urlView = useSearchParams()?.get('taskview');
    const [view, setView] = useState(urlView || 'list');
    const router = useRouter();

    const statuses = ['Todo', 'In Progress', 'Done'];

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await customFetch('primelims/tasks?page=1&&count=20');
                if (Array.isArray(data) && data.length > 0) {
                    const mappedTasks = data.map(task => ({
                        id: task.id,
                        title: task.name,
                        description: task.description,
                        status: task.completed == 0 ? 'Todo' : task.completed == 1 ? 'In Progress' : 'Done',
                        priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
                        dueDate: new Date(task.endDate).toISOString().split('T')[0],
                        assignee: task.username || 'Unassigned',
                    }));
                    setTasks(mappedTasks as any);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

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

    const columns = [
        {
            Header: "Title",
            accessor: "title",
            Cell: ({ row }) => (
                <span
                    style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                    onClick={() => handleTaskClick(row.original)}
                >
                    {row.original.title}
                </span>
            ),
        },
        {
            Header: "Status",
            accessor: "status",
            Cell: ({ value }) => <Badge bg="info">{value}</Badge>,
        },
        {
            Header: "Priority",
            accessor: "priority",
            Cell: ({ value }) => <Badge bg={getPriorityBadge(value)}>{value}</Badge>,
        },
        {
            Header: "Due Date",
            accessor: "dueDate",
        },
        {
            Header: "Assignee",
            accessor: "assignee",
        },
    ];

    const TaskDetailsModal = ({ task, show, onHide }) => {
        if (!task) return null;

        return (
            <Modal show={show} onHide={onHide} backdrop='static'>
                <Modal.Header closeButton className="bg-secondary-subtle pls-label">
                    <h5>{task.title}</h5>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4 pls-color">
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
                    <Button
                        onClick={(ev) => {
                            router.push(`/appointments/taskmanagement/create-new-tasks?taskid=${task.id}`)
                        }}
                        variant="primary"
                        className="d-flex align-items-center btn-sm"
                    >
                        <EditIcon fontSize="small" className="me-1" /> Edit Task
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    const ListView = ({ tasks, onTaskClick }) => {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <PrimeTable
                    column={columns}
                    urlparams={{}}
                    data={tasks}
                    filtering={false}
                    serverSideFiltering={true}
                    handleSeverSideProcessing={loadTaskDefinition}
                />
            </motion.div>
        );
    };

    const KanbanView = ({ tasks, statuses, onTaskClick }) => {
        return (
            <Row className="flex-nowrap overflow-auto pb-3">
                {statuses.map(status => (
                    <Col key={status} md={4} className="flex-shrink-0" style={{ minWidth: '300px' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="h-100">
                                <Card.Header className="bg-light">
                                    <h5 className="mb-0">{status}</h5>
                                </Card.Header>
                                <Card.Body className="bg-light">
                                    {tasks
                                        .filter(task => task.status === status)
                                        .map((task, index) => (
                                            <motion.div
                                                key={task.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                                onClick={() => onTaskClick(task)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <Card className="mb-2">
                                                    <Card.Body>
                                                        <Card.Title className="h6">{task.title}</Card.Title>
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <Badge bg={getPriorityBadge(task.priority)}>{task.priority}</Badge>
                                                            <small className="text-muted">{task.dueDate}</small>
                                                        </div>
                                                        <small className="text-muted text-sm">
                                                            Assigned To: {task.assignee}
                                                        </small>
                                                    </Card.Body>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    <Button
                                        onClick={(ev) => {
                                            router.push(`/appointments/taskmanagement/create-new-tasks`)
                                        }}
                                        variant="light"
                                        className="w-100 mt-2"
                                    >
                                        <AddIcon fontSize="small" className="me-1" /> Add Task
                                    </Button>
                                </Card.Body>
                            </Card>
                        </motion.div>
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
        <div>
            <Row className="mb-4">
                <Col>
                    <h6>Task Manager</h6>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <ButtonGroup size="sm">
                            <Button
                                variant={view === "list" ? "primary" : "light"}
                                onClick={() => setView("list")}
                                className="d-flex align-items-center"
                            >
                                <ViewListIcon fontSize="small" className="me-1" /> List
                            </Button>
                            <Button
                                variant={view === "kanban" ? "primary" : "light"}
                                onClick={() => setView("kanban")}
                                className="d-flex align-items-center"
                            >
                                <ViewColumnIcon fontSize="small" className="me-1" /> Kanban
                            </Button>
                        </ButtonGroup>
                        <Button
                            onClick={(ev) => {
                                router.push(`/appointments/taskmanagement/create-new-tasks`)
                            }}
                            variant="primary"
                            size="sm"
                            className="d-flex align-items-center"
                        >
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

            <TaskDetailsModal
                task={selectedTask}
                show={showTaskDetails}
                onHide={handleClose}
            />
        </div>
    );
};

export default TaskViewer;
