"use client"
import { useEffect, useState } from "react"
import { customFetch, customPost } from "@/lib/customFetch"
import { toast } from "react-toastify"
import {PrimeToast} from "@/components/accessories/PrimeToast"
import { plsDecryption } from "@/lib/encryption"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Clock } from "lucide-react"
import { use } from "react"

interface Shift {
    id: number
    name: string
    color: string
    starttime: string
    endtime: string
}

interface EmployeePreferencesShiftPageProps {
    params: Promise<{ employeeid: number|string }>
}

export default function EmployeePreferencesShiftPage({ params }: EmployeePreferencesShiftPageProps) {
    const { employeeid: encryptedId } = use(params)
    const employeeid = parseInt(plsDecryption(encryptedId.toString()))
    const [shifts, setShifts] = useState<Shift[]>([])
    const [selectedPreferences, setSelectedPreferences] = useState<number[]>([])
    const [unavailableDays, setUnavailableDays] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingUnavailableDays, setSavingUnavailableDays] = useState(false)

    const daysOfWeek = [
        { id: "1", name: "Monday" },
        { id: "2", name: "Tuesday" },
        { id: "3", name: "Wednesday" },
        { id: "4", name: "Thursday" },
        { id: "5", name: "Friday" },
        { id: "6", name: "Saturday" },
        { id: "7", name: "Sunday" },
    ]

    const loadShifts = async () => {
        setLoading(true);
        try {
            const shiftsData = await customFetch("attendance/shifts");
            setShifts(Array.isArray(shiftsData) ? shiftsData.map(shift => ({
                id: shift.id,
                name: shift.name,
                color: shift.color,
                starttime: shift.starttime,
                endtime: shift.endtime
            })) : []);
            const preferredShifts = await customFetch(`attendance/preferred-shifts/${employeeid}`);
            const preferredShiftIds = Array.isArray(preferredShifts) ? preferredShifts.map((shift: { shiftid: number }) => shift.shiftid) : [];
            setSelectedPreferences(preferredShiftIds);
        } catch (err: any) {
            toast.error(`Failed to load shifts: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadUnavailableDays = async () => {
        try {
            const data = await customFetch(`employee/unavailable-days/${employeeid}`);
            setUnavailableDays(Array.isArray((data as any)?.dayofweek) ? (data as any).dayofweek : []);
        } catch (err: any) {
            toast.error(`Failed to load unavailable days: ${err.message}`);
        }
    };

    useEffect(() => {
        loadShifts();
        loadUnavailableDays();
    }, [employeeid]);

    const handlePreferenceChange = (shiftId: number, checked: boolean) => {
        setSelectedPreferences(prev =>
            checked ? [...prev, shiftId] : prev.filter(id => id !== shiftId)
        )
    }

    const handleSubmitPreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await customPost(`attendance/preferred-shifts`, "POST", {
                shiftid: selectedPreferences,
                employeeid,
            });
            toast.success(`Preferences for employee saved successfully.`);
        } catch (err: any) {
            toast.error(`Failed to save preferences: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePreference = async (shiftId: number) => {
        try {
            await customPost(`attendance/preferred-shifts/${employeeid}/${shiftId}`, "DELETE", {});
            setSelectedPreferences((prev) => prev.filter((id) => id !== shiftId));
            toast.success(`Shift preference for shift deleted successfully.`);
        } catch (err: any) {
            toast.error(`Failed to delete preference: ${err.message}`);
        }
    };

    const handleUnavailableDaysChange = (dayId: string, checked: boolean) => {
        setUnavailableDays((prev) =>
            checked ? [...prev, dayId] : prev.filter((id) => id !== dayId)
        );
    };

    const handleSubmitUnavailableDays = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingUnavailableDays(true);
        try {
            await customPost(`employee/unavailable-days`, "POST", {
                employeeid,
                dayofweek: unavailableDays,
            });
            toast.success(`Unavailable days for employee  saved successfully.`);
            loadUnavailableDays();
        } catch (err: any) {
            toast.error(`Failed to save unavailable days: ${err.message}`);
        } finally {
            setSavingUnavailableDays(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-8">
            <PrimeToast />
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Employee Shift Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <form onSubmit={handleSubmitPreferences} className="space-y-4">
                                <div className="space-y-4">
                                    {shifts.map((shift) => (
                                        <div key={shift.id} className="flex items-center justify-between space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`shift-${shift.id}`}
                                                    checked={selectedPreferences.includes(shift.id)}
                                                    onCheckedChange={(checked) => 
                                                        handlePreferenceChange(shift.id, checked as boolean)
                                                    }
                                                />
                                                <div
                                                    className="h-4 w-4 rounded"
                                                    style={{ backgroundColor: shift.color }}
                                                />
                                                <label
                                                    htmlFor={`shift-${shift.id}`}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    {shift.name} ({shift.starttime.slice(0, 5)} - {shift.endtime.slice(0, 5)})
                                                </label>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeletePreference(shift.id)}
                                                disabled={!selectedPreferences.includes(shift.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {saving ? "Saving..." : "Save Preferences"}
                                </Button>
                            </form>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">Employee Unavailable Days</h3>
                                <form onSubmit={handleSubmitUnavailableDays} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {daysOfWeek.map((day) => (
                                            <div key={day.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`day-${day.id}`}
                                                    checked={unavailableDays.includes(day.id)}
                                                    onCheckedChange={(checked) =>
                                                        handleUnavailableDaysChange(day.id, checked as boolean)
                                                    }
                                                />
                                                <label
                                                    htmlFor={`day-${day.id}`}
                                                    className="text-sm font-medium leading-none"
                                                >
                                                    {day.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="submit" disabled={savingUnavailableDays}>
                                        {savingUnavailableDays && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {savingUnavailableDays ? "Saving..." : "Save Unavailable Days"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
