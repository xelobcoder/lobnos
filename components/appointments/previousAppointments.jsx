import React, { useState } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';

const dummyData = [
       {
         date: '2024-06-01',
         time: '10:00 AM',
         doctor: 'Dr. John Doe',
         notes: 'Follow-up for blood pressure management.',
         outcome: 'Blood pressure under control.',
         status: 'Resolved',
         location: 'Room 101',
         duration: '30 mins',
         inviteMethod: 'Email',
         preference: 'Video Call',
       },
       {
         date: '2024-05-15',
         time: '2:00 PM',
         doctor: 'Dr. Jane Smith',
         notes: 'Routine check-up and lab tests.',
         outcome: 'Lab results normal.',
         status: 'Cancelled',
         location: 'Room 202',
         duration: '45 mins',
         inviteMethod: 'Phone',
         preference: 'In-Person',
       },
       {
         date: '2024-04-20',
         time: '11:30 AM',
         doctor: 'Dr. Alice Johnson',
         notes: 'Consultation for knee pain.',
         outcome: 'Prescribed physical therapy.',
         status: 'Pending',
         location: 'Room 303',
         duration: '60 mins',
         inviteMethod: 'SMS',
         preference: 'In-Person',
       },
     ];

     
const PreviousAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState(dummyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Uncomment and implement API fetching logic when ready
  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     try {
  //       const response = await fetch(`/api/appointments?patientId=${patientId}`);
  //       const data = await response.json();
  //       setAppointments(data || dummyData);
  //     } catch (err) {
  //       setError('Failed to load appointments.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchAppointments();
  // }, [patientId]);

  if (loading) return <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved':
        return 'table-success';
      case 'Cancelled':
        return 'table-danger';
      case 'Pending':
        return 'table-warning';
      default:
        return '';
    }
  };

  return (
    <div>
      <h5>Previous Appointments for Patient ID: {patientId}</h5>
      <Table className='pointer' hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Notes</th>
            <th>Outcome</th>
            <th>Status</th>
            <th>Location</th>
            <th>Duration</th>
            <th>Invite Method</th>
            <th>Preference</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr key={index} className={getStatusClass(appointment.status)}>
              <td>{appointment.date}</td>
              <td>{appointment.time}</td>
              <td>{appointment.doctor}</td>
              <td>{appointment.notes}</td>
              <td>{appointment.outcome}</td>
              <td>{appointment.status}</td>
              <td>{appointment.location}</td>
              <td>{appointment.duration}</td>
              <td>{appointment.inviteMethod}</td>
              <td>{appointment.preference}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PreviousAppointments;
