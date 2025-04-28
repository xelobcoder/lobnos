import { Card, Table, Form, Badge, Button } from "react-bootstrap";
import { EditIcon } from "../../Billing/BillingContextComponents/Lib/Icons";
import { RiDeleteBack2Fill } from "@remixicon/react";

interface AttendanceListTabProps {
    filteredAttendance: any[];
    filterEmployee: string;
    setFilterEmployee: (value: string) => void;
    filterShift: string;
    setFilterShift: (value: string) => void;
    filterDate: string;
    setFilterDate: (value: string) => void;
    updateStatus: (index: number, status: string) => void;
    editAttendance: (index: number) => void;
    deleteAttendance: (index: number) => void;
    employees: any[];
    shifts: any[];
    isReadOnly: boolean;
}

const AttendanceListTab: React.FC<AttendanceListTabProps> = ({
    filteredAttendance,
    filterEmployee,
    setFilterEmployee,
    filterShift,
    setFilterShift,
    filterDate,
    setFilterDate,
    updateStatus,
    editAttendance,
    deleteAttendance,
    employees,
    shifts,
    isReadOnly,
}) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>Attendance Records</Card.Title>

                <div className="mb-3 d-flex gap-2">
                    <Form.Control
                        className="custom-input"
                        as="select"
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                    >
                        <option value="">All Employees</option>
                        {employees.map((emp) => (
                            <option key={emp.employeeid} value={emp.employeeid}>
                                {emp.username}
                            </option>
                        ))}
                    </Form.Control>
                    <Form.Control
                        className="custom-input"
                        as="select"
                        value={filterShift}
                        onChange={(e) => setFilterShift(e.target.value)}
                    >
                        <option value="">All Shifts</option>
                        {shifts.map((shift) => (
                            <option key={shift.id} value={shift.id}>
                                {shift.name}
                            </option>
                        ))}
                    </Form.Control>
                    <Form.Control
                        className="custom-input"
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>

                <Table striped bordered hover className="ttable">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Shift</th>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Month</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAttendance.map((entry, index) => (
                            <tr key={index}>
                                <td>{entry.employee.username}</td>
                                <td>
                                    <Badge bg="secondary" style={{ backgroundColor: entry.shift.color }}>
                                        {entry.shift.name}
                                    </Badge>
                                </td>
                                <td>{entry.date}</td>
                                <td>{entry.day}</td>
                                <td>{entry.month}</td>
                                <td>
                                    <Form.Select
                                        value={entry.status}
                                        onChange={(e) => updateStatus(index, e.target.value)}
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="absent">Absent</option>
                                    </Form.Select>
                                </td>
                                <td>
                                    <Button variant="primary" size="sm" onClick={() => editAttendance(index)}>
                                        <EditIcon />
                                    </Button>{" "}
                                    <Button variant="danger" size="sm" onClick={() => deleteAttendance(index)}>
                                        <RiDeleteBack2Fill/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default AttendanceListTab;