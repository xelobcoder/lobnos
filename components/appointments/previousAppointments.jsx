import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert, ButtonGroup, Button } from "react-bootstrap";
import { prevAppointmentClient } from "../../lib/appointment";
import { RiMailLine, RiGoogleLine, RiUserLine, RiMessageLine, RiWhatsappLine } from '@remixicon/react';
import { useSearchParams } from "next/navigation";

const PreviousAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("table");
  const patientId = useSearchParams().get("patientid");

  useEffect(() => {
    if (patientId && !isNaN(patientId)) {
      setLoading(true);
      prevAppointmentClient(
        patientId,
        (data) => {
          setAppointments(data);
          setLoading(false);
        },
        (error) => {
          setError(error);
          setLoading(false);
        }
      );
    }
  }, [patientId]);

  if (loading)
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  const getStatusClass = (status) => {
    switch (status) {
      case "resolved": return "table-success";
      case "cancelled": return "table-danger";
      case "pending": return "table-warning";
      default: return "";
    }
  };

  const getStatusClassBtn = (status) => {
    switch (status) {
      case "resolved": return "btn-success";
      case "cancelled": return "btn-danger";
      case "pending": return "btn-warning";
      default: return "";
    }
  };

  const getMeetingIcons = (status) => {
    switch (status.toLowerCase().trim()) {
      case "google meet":
        return <RiGoogleLine className="text-warning" />;
      case "zoom":
        return (
          <svg height={20} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.26158 8.26022C5.8379 8.80266 4.00098 11.2081 4.00098 13.9355C4.00098 17.1958 6.64362 19.8387 9.90338 19.8387C12.7548 19.8387 15.1852 17.8007 15.7043 15.033C15.8238 14.3962 16.2442 13.8568 16.8326 13.5855C17.3154 13.3628 17.7433 13.1123 18.1174 12.8418C17.2537 12.2391 16.9306 10.9804 17.6467 10.0078C18.2274 9.21897 18.6973 8.34856 19.0382 7.35686C17.9545 7.86679 16.7372 8.29346 15.3703 8.62203C14.1085 8.92532 12.9778 7.98421 12.9039 6.80753C11.7237 7.38016 10.2337 7.81884 8.26158 8.26022ZM19.2572 11.1935C20.4234 11.1935 21.1735 10.7697 22.001 10.6071C21.6763 12.0553 20.5 14.0968 17.67 15.4017C16.9827 19.066 13.7668 21.8387 9.90338 21.8387C5.539 21.8387 2.00098 18.3003 2.00098 13.9355C2.00098 10.2901 4.46846 7.05968 7.82477 6.30851C11.746 5.4309 13.5286 4.74194 14.9016 2C15.5905 3.33333 15.591 4.89247 14.9029 6.67742C17.718 6.00736 19.9758 4.82457 21.6763 3.12903C21.6763 7.93116 19.8537 10.315 19.2572 11.1935ZM13.4176 15.1256C14.001 15.2715 14.001 15.9581 14.001 16.1466V17.1675C14.001 17.7294 13.6593 17.9405 13.1574 17.9405H7.7428C7.26775 17.8541 7.00863 17.595 7.00863 17.1631V16.2129C7.00863 15.7378 7.22456 15.3922 7.44049 15.1331L10.5931 11.7642H7.52686C7.22456 11.7642 7.00863 11.5483 7.00863 11.1595C6.96544 10.4253 7.095 9.25914 7.65642 9C7.7428 9 7.7428 9.12957 7.7428 9.17276C7.65642 9.34553 7.7428 9.4751 7.95873 9.4751H11.8455C12.7092 9.4751 13.2275 9.4751 13.5298 9.38872C13.6593 9.34553 13.7457 9.38872 13.7025 9.51829C13.6161 9.82063 13.6593 10.1662 13.6593 10.4685C13.6593 11.4619 13.6593 11.8506 12.882 12.628L10.2044 15.565L13.0531 15.5632C13.3696 15.5632 13.4176 15.4173 13.4176 15.1256Z"/>
          </svg>
        );
      case "in person":
        return <RiUserLine />;
      case "whatapp":
        return <RiWhatsappLine className="text-success" />;
      case "sms":
        return <RiMessageLine className="text-primary" />;
      case "email":
        return <RiMailLine className="text-primary" />;
      default:
        return null;
    }
  };

  const renderTable = () => (
    <Table className="pointer br-5 ui" hover>
      <thead>
        <tr>
          <th className="fw-bold text-sm">Date</th>
          <th className="fw-bold text-sm">Time</th>
          <th className="fw-bold text-sm">Consultant</th>
          <th className="fw-bold text-sm">Purpose</th>
          <th className="fw-bold text-sm">Location</th>
          <th className="fw-bold text-sm">Duration</th>
          <th className="fw-bold text-sm">Invite Method</th>
          <th className="fw-bold text-sm">Meeting mode</th>
          <th className="fw-bold text-sm">Status</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment, index) => (
          <tr key={index} className={getStatusClass(appointment.status)}>
            <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
            <td>{appointment.appointment_time}</td>
            <td className="fw-bold">{appointment.practioner}</td>
            <td>{appointment.purpose}</td>
            <td>{appointment.location}</td>
            <td>{appointment.duration} mins</td>
            <td>{getMeetingIcons(appointment.inviteMethod)}</td>
            <td>{getMeetingIcons(appointment.preference)}</td>
            <td>
              <span className={`${getStatusClassBtn(appointment.status)} btn btn-sm`}>{appointment.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const renderKanban = () => (
    <div className="kanban-board">
      <div className="kanban-column grid-4 grid pointer">
        {appointments
          .map((appointment, index) => (
            <div
              key={index}
              className={`kanban-card mx-2 ${appointment.status == "cancelled" && "border-danger border-2 border"} ${
                appointment.status == "resolved" && "border-success border-2 border"
              } ${appointment.status == "pending" && "border-warning border-2 border"}`}>
              <p className=" rounded  border-2  br-5">
                <span className="fw-bold border-2 border-primary br-5 border p-1 rounded">{appointment.title}</span>
              </p>
              <p className="fw-bold" title="appointment date">
                Date:{new Date(appointment.appointment_date).toLocaleDateString()}
              </p>
              <p className="fw-bold" title="appointment time">
                Time:{appointment.appointment_time}
              </p>
              <p className="fw-bold">Consultant:{appointment.practioner}</p>
              <p className="fw-bold">{appointment.purpose}</p>
              <p className="fw-bold">{appointment.location}</p>
              <p className="fw-bold">{appointment.duration}</p>
              <p className="fw-bold">Invite:{getMeetingIcons(appointment.inviteMethod)}</p>
              <p className="fw-bold">Mode:{getMeetingIcons(appointment.preference)}</p>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="d-flex justify-content-between my-2">
        <h5>Previous Appointments for Patient ID: {patientId}</h5>
        <ButtonGroup>
          <Button variant={view === "table" ? "primary" : "light"} onClick={() => setView("table")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM8 5V8H4V5H8ZM4 14V10H8V14H4ZM4 16H8V19H4V16ZM10 16H20V19H10V16ZM20 14H10V10H20V14ZM20 5V8H10V5H20Z"></path>
            </svg>
          </Button>
          <Button variant={view === "kanban" ? "primary" : "light"} onClick={() => setView("kanban")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM4 19V5H20V19H4ZM9 7H7V15H9V7ZM15 7H17V13H15V7ZM13 7H11V17H13V7Z"></path>
            </svg>
          </Button>
        </ButtonGroup>
      </div>

      {view === "table" ? (
        renderTable()
      ) : (
        <div>
            {renderKanban()}
        </div>
      )}
    </div>
  );
};

export default PreviousAppointments;
