import { Card, Button, Form, Alert } from "react-bootstrap";
import Select from "react-select";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface Employee {
    employeeid: number;
    username: string;
}

interface Shift {
    id: number;
    name: string;
    starttime: string, endtime: string
}

interface ScheduleTabProps {
    employees: Employee[];
    shifts: Shift[];
    selectedEmployee: string;
    setSelectedEmployee: (value: string) => void;
    selectedShift: string;
    setSelectedShift: (value: string) => void;
    selectedDate: string;
    setSelectedDate: (value: string) => void;
    error: string;
    success: string;
    isReadOnly: boolean;
    setShowModal: (show: boolean) => void;
    currentEditIndex: number | null;
}

const ScheduleTab: React.FC<ScheduleTabProps> = ({
    employees,
    shifts,
    selectedEmployee,
    setSelectedEmployee,
    selectedShift,
    setSelectedShift,
    selectedDate,
    setSelectedDate,
    error,
    success,
    isReadOnly,
    setShowModal,
    currentEditIndex,
}) => {
    const employeeOptions = employees.map(emp => ({
        value: emp.employeeid.toString(),
        label: emp.username,
    }));

    const shiftOptions = shifts.map(shift => ({
        value: shift.id.toString(),
        label: `${shift.name} (${shift.starttime}-${shift.endtime})`,
    }));

    return (
        <Card>
            <Card.Body>
                <Card.Title>Add Attendance</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <div className="d-flex gap-3 align-items-center">
                    <div className="col-4">
                        <Select
                            styles={reactSelectCustomStyles}
                            options={employeeOptions}
                            value={employeeOptions.find(opt => opt.value === selectedEmployee)}
                            onChange={(opt) => setSelectedEmployee(opt?.value || "")}
                            isDisabled={isReadOnly}
                            placeholder="Select Employee"
                        />

                    </div>
                    <div className="col-4">
                        <Select
                            styles={reactSelectCustomStyles}
                            options={shiftOptions}
                            value={shiftOptions.find(opt => opt.value === selectedShift)}
                            onChange={(opt) => setSelectedShift(opt?.value || "")}
                            isDisabled={isReadOnly}
                            placeholder="Select Shift"
                        />
                    </div>

                    <Form.Control
                        type="date"
                        className="custom-input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={isReadOnly}
                    />

                    <Button className="btn-sm" onClick={() => setShowModal(true)} disabled={isReadOnly}>
                        {currentEditIndex !== null ? "Update" : "Add"}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ScheduleTab;