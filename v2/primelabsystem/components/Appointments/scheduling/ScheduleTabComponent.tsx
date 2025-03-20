import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Plus, Pencil } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Employee {
    employeeid: number
    username: string
}

interface Shift {
    id: number
    name: string
    starttime: string
    endtime: string
}

interface ScheduleTabProps {
    employees: Employee[]
    shifts: Shift[]
    selectedEmployee: string
    setSelectedEmployee: (value: string) => void
    selectedShift: string
    setSelectedShift: (value: string) => void
    selectedDate: string
    setSelectedDate: (value: string) => void
    error: string
    success: string
    isReadOnly: boolean
    setShowModal: (show: boolean) => void
    currentEditIndex: number | null
}

export default function ScheduleTab({
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
}: ScheduleTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <Select
                        disabled={isReadOnly}
                        value={selectedEmployee}
                        onValueChange={setSelectedEmployee}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Employee" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Employees</SelectLabel>
                                {employees.map((emp) => (
                                    <SelectItem 
                                        key={emp.employeeid} 
                                        value={emp.employeeid.toString()}
                                    >
                                        {emp.username}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select
                        disabled={isReadOnly}
                        value={selectedShift}
                        onValueChange={setSelectedShift}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Shift" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Shifts</SelectLabel>
                                {shifts.map((shift) => (
                                    <SelectItem 
                                        key={shift.id} 
                                        value={shift.id.toString()}
                                    >
                                        {shift.name} ({shift.starttime}-{shift.endtime})
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={isReadOnly}
                        className="w-full sm:w-auto"
                    />

                    <Button
                        onClick={() => setShowModal(true)}
                        disabled={isReadOnly}
                        className="w-full sm:w-auto"
                    >
                        {currentEditIndex !== null ? (
                            <>
                                <Pencil className="h-4 w-4 mr-2" />
                                Update
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}