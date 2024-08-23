import { useState } from 'react';
import { Table, Button, Form, Container, Row, Col } from 'react-bootstrap';

export default function Home() {
    const [attendees, setAttendees] = useState([]);
    const [name, setName] = useState('');
    const [time, setTime] = useState('');

    const handleAdd = () => {
        if (name && time) {
            setAttendees([...attendees, { name, time }]);
            setName('');
            setTime('');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h1 className="text-center mb-4">Attendance Time Table</h1>
                    <Form>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formTime">
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control
                                        type="time"
                                        placeholder="Enter time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button variant="primary" onClick={handleAdd} disabled={!name || !time}>
                            Add
                        </Button>
                    </Form>
                    {attendees.length > 0 && (
                        <Table striped bordered hover className="mt-4">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendees.map((attendee, index) => (
                                    <tr key={index}>
                                        <td>{attendee.name}</td>
                                        <td>{attendee.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Col>
            </Row>
        </Container>
    );
}
