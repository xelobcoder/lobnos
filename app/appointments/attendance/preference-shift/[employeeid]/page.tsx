"use client";
import React, { useEffect, useState } from "react";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { customFetch, customPost } from "../../../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import PrimeToast from "../../../../../components/accessories/PrimeToast";


interface Shift {
    id: number;
    name: string;
    color: string;
    starttime: string;
    endtime: string;
}

interface EmployeePreferencesShiftPageProps {
    params: { employeeid: number };
}

export default function EmployeePreferencesShiftPage({ params }: EmployeePreferencesShiftPageProps) {
    const { employeeid } = params;
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);
    const [unavailableDays, setUnavailableDays] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savingUnavailableDays, setSavingUnavailableDays] = useState(false);

    const daysOfWeek = [
        { id: "1", name: "Monday" },
        { id: "2", name: "Tuesday" },
        { id: "3", name: "Wednesday" },
        { id: "4", name: "Thursday" },
        { id: "5", name: "Friday" },
        { id: "6", name: "Saturday" },
        { id: "7", name: "Sunday" },
    ];

    const loadShifts = async () => {
        setLoading(true);
        try {
            const shiftsData = await customFetch("attendance/shifts");
            setShifts(shiftsData);
            const preferredShifts = await customFetch(`attendance/preferred-shifts/${employeeid}`);
            const preferredShiftIds = preferredShifts.map((shift: any) => shift.shiftid);
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
            setUnavailableDays(data.dayofweek || []);
        } catch (err: any) {
            toast.error(`Failed to load unavailable days: ${err.message}`);
        }
    };

    useEffect(() => {
        loadShifts();
        loadUnavailableDays();
    }, [employeeid]);

    const handlePreferenceChange = (shiftId: number, checked: boolean) => {
        setSelectedPreferences((prev) =>
            checked ? [...prev, shiftId] : prev.filter((id) => id !== shiftId)
        );
    };

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
        <div className="mt-4">
            <PrimeToast/>
            <h2 className="pls-label">Employee Shift Preferences</h2>
            {loading ? (
                <div className="d-flex justify-content-center my-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading shifts...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    <Form onSubmit={handleSubmitPreferences}>
                        {shifts.map((shift) => (
                            <Form.Group key={shift.id} className="mb-3" controlId={`shift-${shift.id}`}>
                                <Form.Check
                                    type="checkbox"
                                    label={
                                        <span>
                                            <span
                                                style={{
                                                    backgroundColor: shift.color,
                                                    display: "inline-block",
                                                    width: "20px",
                                                    height: "20px",
                                                    marginRight: "8px",
                                                }}
                                            ></span>
                                            {shift.name} ({shift.starttime.slice(0, 5)} - {shift.endtime.slice(0, 5)})
                                        </span>
                                    }
                                    onChange={(e) => handlePreferenceChange(shift.id, e.target.checked)}
                                    checked={selectedPreferences.includes(shift.id)}
                                />
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeletePreference(shift.id)}
                                    disabled={!selectedPreferences.includes(shift.id)}
                                >
                                    Delete Preference
                                </Button>
                            </Form.Group>
                        ))}
                        <Button variant="primary" type="submit" disabled={saving} size="sm">
                            {saving ? "Saving Preferences..." : "Save Preferences"}
                        </Button>
                    </Form>

                    <hr className="my-4" />

                    <h2 className="pls-label">Employee Unavailable Days</h2>
                    <Form onSubmit={handleSubmitUnavailableDays}>
                        <Row>
                            {daysOfWeek.map((day) => (
                                <Col key={day.id} xs={6} md={4}>
                                    <Form.Check
                                        type="checkbox"
                                        id={`day-${day.id}`}
                                        label={day.name}
                                        value={day.id}
                                        onChange={(e) => handleUnavailableDaysChange(day.id, e.target.checked)}
                                        checked={unavailableDays.includes(day.id)}
                                    />
                                </Col>
                            ))}
                        </Row>
                        <Button variant="primary" type="submit" disabled={savingUnavailableDays} className="mt-3" size="sm">
                            {savingUnavailableDays ? "Saving Unavailable Days..." : "Save Unavailable Days"}
                        </Button>
                    </Form>
                </>
            )}
        </div>
    );
}
