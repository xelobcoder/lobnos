"use client"
import { useState, useEffect } from "react"
import ShiftCyclePicker from "@/components/Appointments/scheduling/ShiftCyclePicker"
import { customFetch, customPost } from "@/lib/customFetch"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { plsEncryption } from "@/lib/encryption"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Calendar, Trash2, Eye } from "lucide-react"
import { PrimeToast } from "@/components/accessories/PrimeToast"

interface Cycle {
    id: number
    cyclestart: string
    cycleend: string
    description: string | null
}

export default function ScheduleGenerator() {
    const [shiftCycleStart, setShiftCycleStart] = useState<string>("")
    const [shiftCycleEnd, setShiftCycleEnd] = useState<string>("")
    const [cycles, setCycles] = useState<Cycle[]>([])
    const [loadingCycles, setLoadingCycles] = useState<boolean>(false)
    const router = useRouter()

    const loadCycles = async () => {
        setLoadingCycles(true)
        try {
            const response = await customFetch("attendance/cycles")
            if ('success' in response && response.success) {
                if( 'data' in response)
                {
                    setCycles(response.data)
                }
            } else {
                toast.error("Failed to load cycles.")
            }
        } catch (error: any) {
            toast.error(`Failed to load cycles: ${error.message}`)
        } finally {
            setLoadingCycles(false)
        }
    }

    useEffect(() => {
        loadCycles()
    }, [])

    const handleCreateAttendance = async () => {
        if (shiftCycleEnd && shiftCycleStart) {
            const data = { cyclestart: shiftCycleStart, cycleend: shiftCycleEnd }
            try {
                const createResponse = await customPost(`attendance/cycles`, "POST", data)
                if ('success' in createResponse && createResponse.success) {
                    toast.success((createResponse as any).data?.message || "Cycle created successfully")
                    loadCycles()
                } else {
                    toast.error("Failed to create cycle.")
                }
            } catch (error: any) {
                toast.error(`Error creating cycle: ${error.message}`)
            }
        }
    }

    const handleDeleteCycle = async (cycleId: number) => {
        try {
            const deleteResponse = await customPost(`attendance/cycles/${cycleId}`, "DELETE", {})
            if ('success' in deleteResponse && deleteResponse.success) {
                toast.success("Cycle deleted successfully")
                loadCycles()
            } else {
                toast.error("Failed to delete cycle.")
            }
        } catch (error: any) {
            toast.error(`Error deleting cycle: ${error.message}`)
        }
    }

    const handleViewAttendance = (item: Cycle) => {
        router.push(`/appointments/attendance/create-attendance/${plsEncryption(item.id.toString())}`)
    }

    return (
        <div className="container mx-auto p-4 space-y-8">
            <PrimeToast />
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Shift Cycle Picker
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ShiftCyclePicker
                        shiftCycleStart={shiftCycleStart}
                        shiftCycleEnd={shiftCycleEnd}
                        onCycleStartChange={setShiftCycleStart}
                        onCycleEndChange={setShiftCycleEnd}
                        onGenerate={handleCreateAttendance}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Existing Cycles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingCycles ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Cycle Start</TableHead>
                                        <TableHead>Cycle End</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cycles.map((cycle) => (
                                        <TableRow key={cycle.id}>
                                            <TableCell>{cycle.id}</TableCell>
                                            <TableCell>
                                                {new Date(cycle.cyclestart).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(cycle.cycleend).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{cycle.description || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleViewAttendance(cycle)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteCycle(cycle.id)}
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
