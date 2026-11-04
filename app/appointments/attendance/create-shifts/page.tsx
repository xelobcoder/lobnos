"use client"
import { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import PrimeToast from "../../../../components/accessories/PrimeToast";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import styles from '../../../../styles/SmsTemplateList.module.css'

interface Shift {
    id: number;
    name: string;
    color: string;
    starttime: string;
    endtime: string;
}

const CreateShiftPage = () => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [fetchError, setFetchError] = useState('');
    const [editingShift, setEditingShift] = useState<Shift | null>(null);

    const loadShifts = async () => {
        try {
            const data = await customFetch("attendance/shifts");
            if (Array.isArray(data)) {
                setShifts(data);
            }
        } catch (err: any) {
            setFetchError(err.message);
        }
    };

    useEffect(() => {
        loadShifts();
    }, []);

    const resetForm = () => {
        setName('');
        setColor('');
        setStartTime('');
        setEndTime('');
        setEditingShift(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                name,
                color,
                starttime: startTime.length === 5 ? startTime + ':00' : startTime,
                endtime: endTime.length === 5 ? endTime + ':00' : endTime
            };
            if (editingShift) {
                // Update mode
                await customPost(`attendance/shifts/${editingShift.id}`, 'PUT', payload);
                toast.success('Shift updated successfully!');
            } else {
                // Create mode
                const result = await customPost('attendance/shifts', 'POST', payload);
                if (result.name && result.starttime) {
                    toast.success('Shift created successfully!');
                }
            }
            resetForm();
            loadShifts();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await customPost(`attendance/shifts/${id}`, "DELETE", {});
            toast.success("Shift deleted successfully!");
            loadShifts();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
        setName(shift.name);
        setColor(shift.color);
        setStartTime(shift.starttime.slice(0, 5));
        setEndTime(shift.endtime.slice(0, 5));
    };

    const columns = [
        { Header: "ID", accessor: "id" },
        { Header: "Shift Name", accessor: "name" },
        {
            Header: "Color",
            accessor: "color",
            Cell: ({ value }: {value: Shift["color"]}) => (
                <div style={{ backgroundColor: value, width: "30px", height: "20px" }} />
            )
        },
        { Header: "Start Time", accessor: "starttime" },
        { Header: "End Time", accessor: "endtime" },
        {
            Header: "Actions",
            accessor: "actions",
            Cell: ({ row }: {row: {original: Shift; index: number}}) => (
                <>
                    <Button variant="warning" size="sm" onClick={() => handleEdit(row.original)} className="me-2">
                        Update
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row.original.id)}>
                        Delete
                    </Button>
                </>
            )
        }
    ]


    const handleServerSideProcessing = async (pagination: { page: number, count: number, sortby: 'ASC' | 'DESC' }) => {
        try {
            const data = await customFetch(`attendance/shifts?page=${pagination.page}&count=${pagination.count}&sortby=${pagination.sortby || 'DESC'}`);
            if (data && Array.isArray(data) && data.length > 0) {
                return { result: data, error: false }
            } else {
                return { result: [], error: false }
            }
        } catch (error) {
            return { result: [], error: true }
        }
    }

    return (
        <div className="mt-4">
            <PrimeToast />
            <div className="card shadow-sm">
                <div className="card-body">
                    <h2 className="pls-label bg-secondary-subtle br-5 p-3">
                        {editingShift ? "Update Shift" : "Create Shift"}
                    </h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="grid-reg my-2" controlId="shiftName">
                            <Form.Label className="pls-label">Shift Name</Form.Label>
                            <Form.Control className="custom-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="grid-reg my-2" controlId="shiftColor">
                            <Form.Label className="pls-label">Color</Form.Label>
                            <Form.Control className="custom-input" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="grid-reg my-2" controlId="startTime">
                            <Form.Label className="pls-label">Start Time</Form.Label>
                            <Form.Control className="custom-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="grid-reg my-2" controlId="endTime">
                            <Form.Label className="pls-label">End Time</Form.Label>
                            <Form.Control className="custom-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                        </Form.Group>
                        <Button variant="primary" size="sm" type="submit" disabled={loading}>
                            {loading ? 'Saving...' : editingShift ? 'Update Shift' : 'Create Shift'}
                        </Button>
                        {editingShift && (
                            <Button variant="secondary" size="sm" className="ms-2" onClick={resetForm}>
                                Cancel
                            </Button>
                        )}
                    </Form>
                    <h3 className="mt-4 br-5 bg-secondary-subtle pls-label p-3">Existing Shifts</h3>
                    {fetchError && <Alert variant="danger">{fetchError}</Alert>}
                    {shifts.length > 0 ? (
                        <PrimeTable
                            column={columns}
                            data={shifts}
                            filtering={false}
                            serverSideFiltering={true}
                            handleSeverSideProcessing={handleServerSideProcessing}
                        />
                    ) : (
                        <p>No shifts available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateShiftPage;