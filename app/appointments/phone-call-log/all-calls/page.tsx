"use client";

import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { RiSearchLine, RiAddLine } from "@remixicon/react";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { customFetch } from "../../../../components/Auth/customFetch";
import { toast } from "react-toastify";

const columns = [
     {
          Header: "Patient ID (Ref ID)",
          accessor: "identifiers",
          Cell: ({ row }) => {
               const id = row.original.id;
               const patientid = row.original.patientid;
               const appointment_refid = row.original.appointment_refid;
               return (
                    <div style={{ minWidth: 120 }}>
                         {patientid}({appointment_refid})
                    </div>
               );
          }
     },
     {
          Header: "Direction",
          accessor: "call_direction",
     },
     {
          Header: "Purpose",
          accessor: "purpose",
          Cell: ({ value }) => <span title={value}>{value?.slice(0, 40)}{value?.length > 40 ? "..." : ""}</span>,
     },
     {
          Header: "Call Times",
          accessor: "call_times",
          Cell: ({ row }) => {
               const scheduled = row.original.scheduled_at ? new Date(row.original.scheduled_at).toLocaleString() : "-";
               const started = row.original.started_at ? new Date(row.original.started_at).toLocaleString() : "-";
               const ended = row.original.ended_at ? new Date(row.original.ended_at).toLocaleString() : "-";
               return (
                    <div style={{ minWidth: 180 }}>
                         <div><strong>Scheduled:</strong> {scheduled}</div>
                         <div><strong>Started:</strong> {started}</div>
                         <div><strong>Ended:</strong> {ended}</div>
                    </div>
               );
          }
     },
     {
          Header: "Outcome",
          accessor: "outcome",
     },
     {
          Header: "Status",
          accessor: "status",
     },
     {
          Header: "Duration",
          accessor: "duration_seconds",
          Cell: ({ value }) => {
               if (!value || isNaN(value)) return "-";
               if (value < 60) return `${value}s`;
               if (value < 3600) return `${Math.floor(value / 60)}m ${value % 60}s`;
               const hours = Math.floor(value / 3600);
               const mins = Math.floor((value % 3600) / 60);
               const secs = value % 60;
               return `${hours}h ${mins}m${secs ? ` ${secs}s` : ''}`;
          }
     },
     {
          Header: "Next Follow-up",
          accessor: "next_followup_at",
          Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-",
     },
     {
          Header: "Created By",
          accessor: "creator_name",
     },
     {
          Header: "Created At",
          accessor: "created_at",
          Cell: ({ value }) => value ? new Date(value).toLocaleString() : "-",
     },
     {
          Header: "Add Call",
          id: "add_call",
          Cell: ({ row }) => {
               const appointment_refid = row.original.appointment_refid;
               const patientid = row.original.patientid;
               const patientName = row.original.creator_name || '';
               const appointmentDate = row.original.appointment_date || '';
               const appointmentTime = row.original.appointment_time || '';
               const appointmentPurpose = row.original.appointment_purpose || '';
               const params = new URLSearchParams({
                    refid: appointment_refid || '',
                    patientid: patientid || '',
                    patientName,
                    appointmentDate,
                    appointmentTime,
                    appointmentPurpose
               }).toString();
               return (
                    <Button
                         variant="success"
                         size="sm"
                         className="d-flex align-items-center gap-1"
                         disabled={!appointment_refid || !patientid}
                         onClick={() => {
                              if (appointment_refid && patientid) {
                                   window.location.href = `/appointments/phone-call-log?${params}`;
                              }
                         }}
                    >
                         <RiAddLine size={16} /> Add Call
                    </Button>
               );
          }
     },
];

export default function AllPhoneCallsPage() {
     const [data, setData] = useState([]);
     const [isLoading, setIsLoading] = useState(false);
     const [appointmentId, setAppointmentId] = useState("");
     const [phoneCallLogs, setPhoneCallLogs] = useState<any[]>([]);
     const [showPhoneCallLogs, setShowPhoneCallLogs] = useState(false);

     const [pagination, setPagination] = useState({ page: 1, count: 10, total: 0, totalPages: 1 });

     const fetchData = async (page = 1, count = 10, appointment_refid = "") => {
          setIsLoading(true);
          let url = `appointments/phonecalls/paginated?page=${page}&count=${count}`;
          if (appointment_refid) url += `&appointment_refid=${appointment_refid}`;
          const resp = await customFetch(url);
          if (resp && resp.data) {
               setData(resp.data);
               setPagination(resp.pagination || { page, count, total: resp.data.length, totalPages: 1 });
          } else {
               setData([]);
          }
          setIsLoading(false);
     };


     useEffect(() => {
          fetchData();
     }, []);


     const handleSearch = (e) => {
          e.preventDefault();
          setShowPhoneCallLogs(false);
          fetchData(1, pagination.count, appointmentId);
     };

     const loadPhoneCallLogs = async () => {
          if (appointmentId) {
               try {
                    setIsLoading(true);
                    const response = await customFetch(`appointments/reminder/appointment/phonecalls/${appointmentId}`);
                    if (Array.isArray(response)) {
                         setPhoneCallLogs(response);
                    } else {
                         setPhoneCallLogs([]);
                    }
                    setShowPhoneCallLogs(true);
               } catch (error) {
                    console.error('Error loading phone call logs:', error);
                    setPhoneCallLogs([]);
                    setShowPhoneCallLogs(true);
                    toast.error('Failed to load phone call logs.');
               } finally {
                    setIsLoading(false);
               }
          } else {
               setIsLoading(false);
          }
     };


     const handleServerSide = async ({ page, count, sortby = 'DESC' }: { page: number, count: number, sortby: 'ASC' | 'DESC' }) => {
          await fetchData(page, count, appointmentId);
          return { result: data };
     };

     return (
          <div>
               <Card className="mb-4">
                    <Card.Body>
                         <Form onSubmit={handleSearch} className="d-flex align-items-end gap-2">
                              <Form.Group as={Col} md="4">
                                   <Form.Label>Filter by Appointment ID</Form.Label>
                                   <Form.Control
                                        type="number"
                                        value={appointmentId}
                                        onChange={e => setAppointmentId(e.target.value)}
                                        placeholder="Enter appointment ref id..."
                                   />
                              </Form.Group>
                              <Button type="submit" variant="primary" className="d-flex align-items-center gap-1">
                                   <RiSearchLine size={18} /> Search
                              </Button>
                         </Form>

                    </Card.Body>
               </Card>
               <div style={{ overflowX: 'auto' }}>
                    <PrimeTable
                         column={columns}
                         data={data}
                         filtering={false}
                         isExpoerted={true}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSide}
                         urlparams={{}}
                    />
               </div>
          </div>
     );
}
