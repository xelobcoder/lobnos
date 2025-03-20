import React, { useEffect, useState } from "react";
import { prevAppointmentClient } from "../../lib/appointment";
import { useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Mail, MessageSquare, Video, VideoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
    
  if (error) return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  const getStatusVariant = (status) => {
    switch (status) {
      case "resolved":
        return "success";
      case "cancelled":
        return "destructive";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getMeetingIcons = (status) => {
    switch (status?.toLowerCase()?.trim()) {
      case "google meet":
        return (
          <span className="flex items-center gap-1">
            <Video className="h-4 w-4 text-amber-500" /> Google Meet
          </span>
        );
      case "zoom":
        return (
          <span className="flex items-center gap-1">
            <VideoIcon className="h-4 w-4 text-blue-500" /> Zoom
          </span>
        );
      case "in person":
        return (
          <span className="flex items-center gap-1" title="in person">
            <User className="h-4 w-4" /> In person
          </span>
        );
      case "whatapp":
        return (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-green-500" /> WhatsApp
          </span>
        );
      case "sms":
        return (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-blue-500" /> SMS
          </span>
        );
      case "email":
        return (
          <span className="flex items-center gap-1">
            <Mail className="h-4 w-4 text-blue-500" /> Email
          </span>
        );
      default:
        return null;
    }
  };

  const renderTable = () => (
    <Table className="rounded-md border">
      <TableHeader>
        <TableRow>
          <TableHead className="font-medium text-sm">Date</TableHead>
          <TableHead className="font-medium text-sm">Time</TableHead>
          <TableHead className="font-medium text-sm">Consultant</TableHead>
          <TableHead className="font-medium text-sm">Purpose</TableHead>
          <TableHead className="font-medium text-sm">Location</TableHead>
          <TableHead className="font-medium text-sm">Duration</TableHead>
          <TableHead className="font-medium text-sm">Invite Method</TableHead>
          <TableHead className="font-medium text-sm">Meeting mode</TableHead>
          <TableHead className="font-medium text-sm">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment, index) => (
          <TableRow key={index} className={appointment.status === "resolved" ? "bg-green-50 dark:bg-green-900/20" : 
                                          appointment.status === "cancelled" ? "bg-red-50 dark:bg-red-900/20" : 
                                          appointment.status === "pending" ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}>
            <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
            <TableCell>{appointment.appointment_time}</TableCell>
            <TableCell className="font-medium">{appointment.practioner}</TableCell>
            <TableCell>{appointment.purpose}</TableCell>
            <TableCell>{appointment.location}</TableCell>
            <TableCell>{appointment.duration} mins</TableCell>
            <TableCell>{getMeetingIcons(appointment.inviteMethod)}</TableCell>
            <TableCell>{getMeetingIcons(appointment.preference)}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderKanban = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {appointments.map((appointment, index) => (
        <Card key={index} className={`
          ${appointment.status === "cancelled" ? "border-red-500" : 
            appointment.status === "resolved" ? "border-green-500" : 
            appointment.status === "pending" ? "border-yellow-500" : ""}
          border-2
        `}>
          <CardContent className="p-4">
            <div className="mb-2">
              <Badge className="font-medium rounded-md">{appointment.title}</Badge>
            </div>
            <p className="font-medium text-sm mb-1" title="appointment date">
              Date: {new Date(appointment.appointment_date).toLocaleDateString()}
            </p>
            <p className="font-medium text-sm mb-1" title="appointment time">
              Time: {appointment.appointment_time}
            </p>
            <p className="font-medium text-sm mb-1">Consultant: {appointment.practioner}</p>
            <p className="font-medium text-sm mb-1">{appointment.purpose}</p>
            <p className="font-medium text-sm mb-1">{appointment.location}</p>
            <p className="font-medium text-sm mb-1">{appointment.duration} mins</p>
            <p className="font-medium text-sm mb-1 flex items-center gap-1">
              Invite: {getMeetingIcons(appointment.inviteMethod)}
            </p>
            <p className="font-medium text-sm mb-1 flex items-center gap-1">
              Mode: {getMeetingIcons(appointment.preference)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Previous Appointments for Patient ID: {patientId}</h3>
        <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value)}>
          <ToggleGroupItem value="table" aria-label="Table view">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM8 5V8H4V5H8ZM4 14V10H8V14H4ZM4 16H8V19H4V16ZM10 16H20V19H10V16ZM20 14H10V10H20V14ZM20 5V8H10V5H20Z"></path>
            </svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM4 19V5H20V19H4ZM9 7H7V15H9V7ZM15 7H17V13H15V7ZM13 7H11V17H13V7Z"></path>
            </svg>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "table" ? renderTable() : renderKanban()}
    </div>
  );
};

export default PreviousAppointments;
