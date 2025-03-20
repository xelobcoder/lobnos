"use client"
import { use } from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Calendar, List, Users, Grid } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import AttendanceListTab from "@/components/Appointments/scheduling/AttendanceListTabComponent"
import CalendarTab from "@/components/Appointments/scheduling/CalendarTabComponent"
import ScheduleTab from "@/components/Appointments/scheduling/ScheduleTabComponent"
import { plsDecryption } from "@/lib/encryption"
import { customFetch, customPost } from "@/lib/customFetch"

interface Employee {
    employeeid: number;
    username: string;
    role: string;
    email: string;
    branch: number;
    branchname: string;
    emailAuthenticated: string;
    activation: number;
    preferredShifts: any[];
    unAvailableDays: {
        employeeid: number;
        dayofweek: string[];
    };
}

interface Shift {
    id: number;
    name: string;
    color: string;
    starttime: string;
    endtime: string;
}

interface CycleInfo {
    id: number;
    cyclestart: string;
    cycleend: string;
    description: string | null;
}

interface AttendanceRecord {
    employee: Employee;
    shift: Shift;
    date: string;
    day: string;
    month: string;
    cycleStart: string;
    cycleEnd: string;
    status: "pending" | "scheduled" | "completed" | "absent";
}

interface SummaryResponse {
    summary: Employee[];
    shifts: Shift[];
    cycleInfo: CycleInfo;
}

interface SavedAttendanceRecord {
    id: number;
    employeeid: number;
    shiftid: number;
    date: string;
    cycleid: number;
    employee_name: string;
    shift_name: string;
    starttime: string;
    endtime: string;
}

const AttendanceScheduler = ({ params }: { params: Promise<{ cycleid: string }> }) => {
    const { cycleid } = use(params)
    const decryptedCycleId = plsDecryption(cycleid.toString())

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [selectedShift, setSelectedShift] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [shiftCycleStart, setShiftCycleStart] = useState<string>("");
    const [shiftCycleEnd, setShiftCycleEnd] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [successMsg, setSuccessMsg] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<string>("schedule");
    const [bulkScheduleMode, setBulkScheduleMode] = useState<boolean>(false);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<Date[]>([]);
    const [calendarView, setCalendarView] = useState<{ [date: string]: AttendanceRecord[] }>({});
    const [filterEmployee, setFilterEmployee] = useState<string>("");
    const [filterShift, setFilterShift] = useState<string>("");
    const [filterDate, setFilterDate] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>("");
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await customFetch(`attendance/employees/summary/${decryptedCycleId}`);
                setEmployees((response as SummaryResponse).summary);
                setShifts((response as SummaryResponse).shifts);
                setCycleInfo((response as SummaryResponse).cycleInfo);
                if ((response as SummaryResponse).cycleInfo) {
                    setShiftCycleStart(new Date((response as SummaryResponse).cycleInfo.cyclestart).toISOString().split('T')[0]);
                    setShiftCycleEnd(new Date((response as SummaryResponse).cycleInfo.cycleend).toISOString().split('T')[0]);
                }
            } catch (err) {
                setError("Failed to fetch data");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [decryptedCycleId]);

    useEffect(() => {
        const fetchSavedAttendance = async () => {
            try {
                const response = await customFetch(`attendance/timetable/cycle/${decryptedCycleId}`);
                const savedAttendance: SavedAttendanceRecord[] = response as SavedAttendanceRecord[];
                const transformedAttendance = savedAttendance.map(record => {
                    const employee = employees.find(emp => emp.employeeid === record.employeeid);
                    const shift = shifts.find(s => s.id === record.shiftid);
                    if (!employee || !shift) {
                        throw new Error("Invalid employee or shift data");
                    }
                    return {
                        employee,
                        shift,
                        date: new Date(record.date).toISOString().split('T')[0],
                        day: new Date(record.date).toLocaleDateString("en-US", { weekday: "long" }),
                        month: new Date(record.date).toLocaleDateString("en-US", { month: "long" }),
                        cycleStart: shiftCycleStart,
                        cycleEnd: shiftCycleEnd,
                        status: "scheduled" as const,
                    };
                });
                setAttendance(transformedAttendance);
            } catch (err) {
                console.error("Failed to fetch saved attendance records:", err);
            }
        };

        if (employees.length > 0 && shifts.length > 0 && shiftCycleStart && shiftCycleEnd) {
            fetchSavedAttendance();
        }
    }, [decryptedCycleId, employees, shifts, shiftCycleStart, shiftCycleEnd]);

    useEffect(() => {
        if (shiftCycleStart && shiftCycleEnd) {
            generateDateRange();
            generateCalendarData();
            checkIfReadOnly();
        }
    }, [shiftCycleStart, shiftCycleEnd, attendance]);

    const generateDateRange = () => {
        const start = new Date(shiftCycleStart);
        const end = new Date(shiftCycleEnd);
        const newDateRange: Date[] = [];
        const currentDate = new Date(start);

        while (currentDate <= end) {
            newDateRange.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        setDateRange(newDateRange);
    };

    const generateCalendarData = () => {
        if (!shiftCycleStart || !shiftCycleEnd) return;

        const calData: { [date: string]: AttendanceRecord[] } = {};
        const start = new Date(shiftCycleStart);
        const end = new Date(shiftCycleEnd);
        const currentDate = new Date(start);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split("T")[0];
            calData[dateStr] = attendance.filter(entry => new Date(entry.date).toISOString().split("T")[0] === dateStr);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        setCalendarView(calData);
    };

    const validateScheduleEntry = (employeeId: string, date: string, shiftId: string) => {
        const employeeData = employees.find(emp => emp.employeeid === parseInt(employeeId));
        if (!employeeData) return { valid: false, message: "Invalid employee selection" };

        const dayOfWeek = new Date(date).getDay().toString();
        if (employeeData.unAvailableDays?.dayofweek.includes(dayOfWeek)) {
            return { valid: false, message: `${employeeData.username} is unavailable on this day` };
        }

        const isPreferredShift = employeeData.preferredShifts.some(ps => ps.id === parseInt(shiftId));
        if (!isPreferredShift) {
            return {
                valid: true,
                warning: `This shift is not in ${employeeData.username}'s preferences`
            };
        }

        const hasConflict = attendance.some((entry) =>
            entry.employee.employeeid === parseInt(employeeId) &&
            new Date(entry.date).toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0] &&
            entry.shift.id === parseInt(shiftId)
        );

        if (hasConflict) {
            return {
                valid: false,
                message: `${employeeData.username} is already scheduled for this shift on ${date}`
            };
        }

        return { valid: true };
    };

    const addAttendance = () => {
        if (!selectedEmployee || !selectedShift || !selectedDate || !shiftCycleStart || !shiftCycleEnd) {
            setErrorMsg("All fields are required");
            return;
        }

        const validation = validateScheduleEntry(selectedEmployee, selectedDate, selectedShift);
        if (!validation.valid) {
            setErrorMsg(validation.message as string);
            return;
        }

        if (validation.warning) {
            setSuccessMsg(validation.warning);
            setTimeout(() => setSuccessMsg(""), 3000);
        }

        const employeeData = employees.find(emp => emp.employeeid === parseInt(selectedEmployee));
        const shiftData = shifts.find(shift => shift.id === parseInt(selectedShift));

        if (!employeeData || !shiftData) return;

        const newEntry: AttendanceRecord = {
            employee: employeeData,
            shift: shiftData,
            date: selectedDate,
            day: new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" }),
            month: new Date(selectedDate).toLocaleDateString("en-US", { month: "long" }),
            cycleStart: shiftCycleStart,
            cycleEnd: shiftCycleEnd,
            status: "scheduled"
        };

        if (currentEditIndex !== null) {
            const updatedAttendance = [...attendance];
            updatedAttendance[currentEditIndex] = newEntry;
            setAttendance(updatedAttendance);
            setCurrentEditIndex(null);
            setShowModal(false);
            setSuccessMsg("Schedule updated successfully");
        } else {
            setAttendance([...attendance, newEntry]);
            setSuccessMsg("Attendance scheduled successfully");
        }

        resetForm();
    };

    const handleBulkSchedule = () => {
        if (selectedEmployees.length === 0) {
            setErrorMsg("Please select at least one employee");
            return;
        }

        if (!selectedShift) {
            setErrorMsg("Please select a shift");
            return;
        }

        if (dateRange.length === 0) {
            setErrorMsg("Invalid date range");
            return;
        }

        if (new Date(shiftCycleStart) > new Date(shiftCycleEnd)) {
            setErrorMsg("End date cannot be before start date");
            return;
        }

        const newEntries: AttendanceRecord[] = [];
        const conflicts: string[] = [];

        selectedEmployees.forEach(empId => {
            dateRange.forEach(date => {
                const dateStr = date.toISOString().split("T")[0];
                const validation = validateScheduleEntry(empId, dateStr, selectedShift);

                if (validation.valid) {
                    const employeeData = employees.find(emp => emp.employeeid === parseInt(empId));
                    const shiftData = shifts.find(shift => shift.id === parseInt(selectedShift));

                    if (!employeeData || !shiftData) return;

                    newEntries.push({
                        employee: employeeData,
                        shift: shiftData,
                        date: dateStr,
                        day: date.toLocaleDateString("en-US", { weekday: "long" }),
                        month: date.toLocaleDateString("en-US", { month: "long" }),
                        cycleStart: shiftCycleStart,
                        cycleEnd: shiftCycleEnd,
                        status: "scheduled"
                    });
                } else {
                    const employeeData = employees.find(emp => emp.employeeid === parseInt(empId));
                    if (employeeData) {
                        conflicts.push(`${employeeData.username} on ${date.toLocaleDateString()}: ${validation.message}`);
                    }
                }
            });
        });

        if (conflicts.length > 0) {
            setErrorMsg(`Created ${newEntries.length} schedules with ${conflicts.length} conflicts. See console for details.`);
        } else {
            setSuccessMsg(`Successfully scheduled ${newEntries.length} shifts`);
        }

        setAttendance([...attendance, ...newEntries]);
        resetBulkSchedule();
    };

    const handleSingleDaySchedule = () => {
        if (isReadOnly) return;

        if (selectedEmployees.length === 0) {
            setErrorMsg("Please select at least one employee");
            return;
        }

        if (!selectedShift) {
            setErrorMsg("Please select a shift");
            return;
        }

        if (!selectedCalendarDate) {
            setErrorMsg("No date selected");
            return;
        }

        const newEntries: AttendanceRecord[] = [];
        const conflicts: string[] = [];

        selectedEmployees.forEach(empId => {
            const validation = validateScheduleEntry(empId, selectedCalendarDate, selectedShift);

            if (validation.valid) {
                const employeeData = employees.find(emp => emp.employeeid === parseInt(empId));
                const shiftData = shifts.find(shift => shift.id === parseInt(selectedShift));

                if (!employeeData || !shiftData) return;

                newEntries.push({
                    employee: employeeData,
                    shift: shiftData,
                    date: selectedCalendarDate,
                    day: new Date(selectedCalendarDate).toLocaleDateString("en-US", { weekday: "long" }),
                    month: new Date(selectedCalendarDate).toLocaleDateString("en-US", { month: "long" }),
                    cycleStart: shiftCycleStart,
                    cycleEnd: shiftCycleEnd,
                    status: "scheduled"
                });
            } else {
                const employeeData = employees.find(emp => emp.employeeid === parseInt(empId));
                if (employeeData) {
                    conflicts.push(`${employeeData.username} on ${new Date(selectedCalendarDate).toLocaleDateString()}: ${validation.message}`);
                }
            }
        });

        if (conflicts.length > 0) {
            setErrorMsg(`Created ${newEntries.length} schedules with ${conflicts.length} conflicts. See console for details.`);
        } else {
            setSuccessMsg(`Successfully scheduled ${newEntries.length} shifts`);
        }

        setAttendance([...attendance, ...newEntries]);
        setShowModal(false);
        resetBulkSchedule();
    };

    const deleteAttendance = (index: number) => {
        if (isReadOnly) return;
        const updatedAttendance = [...attendance];
        updatedAttendance.splice(index, 1);
        setAttendance(updatedAttendance);
        setSuccessMsg("Schedule deleted successfully");
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const editAttendance = (index: number) => {
        if (isReadOnly) return;
        const entry = attendance[index];
        setSelectedEmployee(entry.employee.employeeid.toString());
        setSelectedShift(entry.shift.id.toString());
        setSelectedDate(entry.date);
        setCurrentEditIndex(index);
        setShowModal(true);
    };

    const updateStatus = (index: number, status: AttendanceRecord["status"]) => {
        if (isReadOnly) return;
        const updatedAttendance = [...attendance];
        updatedAttendance[index] = { ...updatedAttendance[index], status };
        setAttendance(updatedAttendance);
        setSuccessMsg(`Status updated to ${status}`);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const getFilteredAttendance = (): AttendanceRecord[] => {
        return attendance.filter(entry => {
            const matchEmployee = !filterEmployee || entry.employee.employeeid.toString() === filterEmployee;
            const matchShift = !filterShift || entry.shift.id.toString() === filterShift;
            const matchDate = !filterDate || entry.date === filterDate;
            return matchEmployee && matchShift && matchDate;
        });
    };

    // Remove the standalone Select components that were here
    
    const resetForm = () => {
        setSelectedEmployee("");
        setSelectedShift("");
        setSelectedDate("");
        setErrorMsg("");
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const resetBulkSchedule = () => {
        setBulkScheduleMode(false);
        setSelectedEmployees([]);
        setTimeout(() => {
            setSuccessMsg("");
            setErrorMsg("");
        }, 3000);
    };

    const checkIfReadOnly = () => {
        if (shiftCycleEnd) {
            const cycleEndDate = new Date(shiftCycleEnd);
            const currentDate = new Date();
            setIsReadOnly(currentDate > cycleEndDate);
        }
    };

    const transformAttendanceData = (attendance: AttendanceRecord[], cycleid: string) => {
        return attendance.map(entry => {
            return {
                employeeid: entry.employee.employeeid.toString(),
                shiftid: entry.shift.id.toString(),
                date: entry.date,
                cycleid: cycleid,
            }
        });
    };

    const saveAttendanceToBackend = async (attendanceData: any[]) => {
        try {
            const response = await customPost("attendance/timetable", "POST", attendanceData)
            console.log(response)
        } catch (err) {
            console.error("Error saving attendance data:", err);
            throw err;
        }
    };

    const handleSaveAttendance = async () => {
        if (attendance.length === 0) {
            setErrorMsg("No attendance records to save");
            return;
        }

        try {
            const transformedData = transformAttendanceData(attendance, decryptedCycleId);
            await saveAttendanceToBackend(transformedData);
            setSuccessMsg("Attendance data saved successfully!");
            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err) {
            setErrorMsg("Failed to save attendance data");
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    const filteredAttendance = getFilteredAttendance();

    const employeeOptions = employees.map(emp => ({
        value: emp.employeeid.toString(),
        label: emp.username,
    }));

    const shiftOptions = shifts.map(shift => ({
        value: shift.id.toString(),
        label: shift.name,
    }));

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Attendance Scheduler
            </h1>

            <Tabs defaultValue="schedule" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="list" className="flex items-center gap-2">
                        <List className="h-4 w-4" />
                        Attendance List
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex items-center gap-2">
                        <Grid className="h-4 w-4" />
                        Schedule
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Bulk Schedule
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendar
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <AttendanceListTab
                        filteredAttendance={filteredAttendance}
                        filterEmployee={filterEmployee}
                        setFilterEmployee={setFilterEmployee}
                        filterShift={filterShift}
                        setFilterShift={setFilterShift}
                        filterDate={filterDate}
                        setFilterDate={setFilterDate}
                        employees={employees}
                        shifts={shifts}
                        deleteAttendance={deleteAttendance}
                        editAttendance={editAttendance}
                        updateStatus={updateStatus}
                        isReadOnly={isReadOnly}
                    />
                </TabsContent>

                <TabsContent value="schedule">
                    <ScheduleTab
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                        selectedShift={selectedShift}
                        setSelectedShift={setSelectedShift}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        employees={employees}
                        shifts={shifts}
                        success={successMsg}
                        error={errorMsg}
                        isReadOnly={isReadOnly}
                        setShowModal={setShowModal}
                        currentEditIndex={currentEditIndex}
                    />
                </TabsContent>

                <TabsContent value="bulk">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Employees</label>
                                <Select
                                    value={selectedEmployees}
                                    onValueChange={setSelectedEmployees}
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Employees</SelectLabel>
                                            {employees.map((emp) => (
                                                <SelectItem key={emp.employeeid} value={emp.employeeid.toString()}>
                                                    {emp.username}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Shift</label>
                                <Select
                                    value={selectedShift}
                                    onValueChange={setSelectedShift}
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Shifts</SelectLabel>
                                            {shifts.map((shift) => (
                                                <SelectItem key={shift.id} value={shift.id.toString()}>
                                                    {shift.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date Range</label>
                                <div className="flex gap-4">
                                    <Input
                                        type="date"
                                        value={shiftCycleStart}
                                        onChange={(e) => setShiftCycleStart(e.target.value)}
                                        disabled={isReadOnly}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="date"
                                        value={shiftCycleEnd}
                                        onChange={(e) => setShiftCycleEnd(e.target.value)}
                                        disabled={isReadOnly}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={handleBulkSchedule} 
                                disabled={isReadOnly}
                                className="w-full sm:w-auto"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Bulk Schedule
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar">
                    <CalendarTab
                        dateRange={dateRange}
                        calendarView={calendarView}
                        shiftCycleStart={shiftCycleStart}
                        shiftCycleEnd={shiftCycleEnd}
                        setSelectedCalendarDate={setSelectedCalendarDate}
                        setShowModal={setShowModal}
                        isReadOnly={isReadOnly}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Schedule Employees for {selectedCalendarDate}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Employees</label>
                        
                            <Select
                                value={selectedEmployees}
                                onValueChange={setSelectedEmployees}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Employees</SelectLabel>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.employeeid} value={emp.employeeid.toString()}>
                                                {emp.username}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            
                            // Replace with:
                            <Select
                                multiple
                                value={selectedEmployees}
                                onValueChange={(value) => setSelectedEmployees(Array.isArray(value) ? value : [value])}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employees" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Employees</SelectLabel>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.employeeid} value={emp.employeeid.toString()}>
                                                {emp.username}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Select Shift</label>
                            <Select
                                value={selectedShift}
                                onValueChange={setSelectedShift}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Shift" />
                                </SelectTrigger>
                                <SelectContent>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift.id} value={shift.id.toString()}>
                                            {shift.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSingleDaySchedule} disabled={isReadOnly}>
                            Schedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {(errorMsg || successMsg) && (
                <Alert variant={errorMsg ? "destructive" : "default"}>
                    {errorMsg && <AlertCircle className="h-4 w-4" />}
                    {successMsg && <CheckCircle2 className="h-4 w-4" />}
                    <AlertDescription>
                        {errorMsg || successMsg}
                    </AlertDescription>
                </Alert>
            )}

            <Button 
                onClick={handleSaveAttendance} 
                disabled={isReadOnly || attendance.length === 0}
                className="mt-6"
            >
                Save Attendance
            </Button>
        </div>
    )
}

export default AttendanceScheduler