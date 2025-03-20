import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2 } from "lucide-react"

interface AttendanceListTabProps {
    filteredAttendance: any[]
    filterEmployee: string
    setFilterEmployee: (value: string) => void
    filterShift: string
    setFilterShift: (value: string) => void
    filterDate: string
    setFilterDate: (value: string) => void
    updateStatus: (index: number, status: "pending" | "scheduled" | "completed" | "absent") => void
    editAttendance: (index: number) => void
    deleteAttendance: (index: number) => void
    employees: any[]
    shifts: any[]
    isReadOnly: boolean
}

export default function AttendanceListTab({
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
}: AttendanceListTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 mb-6">
                    // In your AttendanceListTab component:
                    <Select
                        value={filterEmployee || "all"}
                        onValueChange={setFilterEmployee}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by employee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Employees</SelectItem>
                            {employees.map((emp) => (
                                <SelectItem 
                                    key={`filter-emp-${emp.employeeid}`} 
                                    value={emp.employeeid.toString()}
                                >
                                    {emp.username}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Select
                        value={filterShift || "all"}
                        onValueChange={setFilterShift}
                        disabled={isReadOnly}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by shift" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Shifts</SelectItem>
                            {shifts.map((shift) => (
                                <SelectItem 
                                    key={`filter-shift-${shift.id}`} 
                                    value={shift.id.toString()}
                                >
                                    {shift.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="min-w-[200px] flex-1"
                    />
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Shift</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Month</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttendance.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{entry.employee.username}</TableCell>
                                    <TableCell>
                                        <Badge style={{ backgroundColor: entry.shift.color }}>
                                            {entry.shift.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{entry.date}</TableCell>
                                    <TableCell>{entry.day}</TableCell>
                                    <TableCell>{entry.month}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={entry.status}
                                            onValueChange={(value) => updateStatus(index, value)}
                                            disabled={isReadOnly}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="absent">Absent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => editAttendance(index)}
                                                disabled={isReadOnly}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => deleteAttendance(index)}
                                                disabled={isReadOnly}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}