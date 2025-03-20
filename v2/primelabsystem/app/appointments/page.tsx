'use client';
import React, { useState, useEffect } from 'react';
import {customFetch} from '@/lib/customFetch';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { ChevronLeft, ChevronRight, Plus, Edit, Save, X } from "lucide-react";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge"

dayjs.locale('en');

interface Appointment {
    id: number;
    title: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
}

export default function AppointmentPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isDataLoading, setDataLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointments, setSelectedAppointments] = useState<Appointment[]>([]);
    const [editedAppointments, setEditedAppointments] = useState<Appointment[]>([]);
    const [viewMode, setViewMode] = useState('Month');
    const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const currentMonth = currentDate.getMonth() + 1;
                const response = await customFetch(`appointments/month?month=${currentMonth}`);
                if (Array.isArray(response) && response.length > 0) {
                    setAppointments(response);
                } else {
                    setAppointments([]);
                }
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setAppointments([]);
            } finally {
                setDataLoading(false);
            }
        };
        fetchAppointments();
    }, [currentDate]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setViewMode('Day');
            } else {
                setViewMode('Month');
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigateToPreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(newDate);
        setDataLoading(true);
    };

    const navigateToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(newDate);
        setDataLoading(true);
    };

    const navigateToToday = () => {
        setCurrentDate(new Date());
        setDataLoading(true);
    };

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const dayOfWeek = firstDayOfMonth.getDay();
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        const days = [];

        // Previous month days
        for (let i = dayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false });
        }

        return days;
    };

    const getWeekViewDays = () => {
        const current = new Date(currentDate);
        const dayIndex = current.getDay();
        const sunday = new Date(current);
        sunday.setDate(current.getDate() - dayIndex);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);
            days.push({ date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() });
        }
        return days;
    };

    const getFiveDaysView = () => {
        const days = [];
        const start = new Date(currentDate);
        for (let i = 0; i < 5; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push({ date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() });
        }
        return days;
    };

    const getDayView = () => {
        return [{ date: new Date(currentDate), isCurrentMonth: true }];
    };

    const getViewDays = () => {
        switch (viewMode) {
            case 'Month':
                return { days: generateCalendarDays(), columns: 7, isGrid: true };
            case 'Week':
                return { days: getWeekViewDays(), columns: 7, isGrid: false };
            case '5 Days':
                return { days: getFiveDaysView(), columns: 5, isGrid: false };
            case 'Day':
                return { days: getDayView(), columns: 1, isGrid: false };
            default:
                return { days: [], columns: 0, isGrid: false };
        }
    };

    const getAppointmentsForDay = (day: { date: Date; isCurrentMonth: boolean }) => {
        if (!appointments || appointments.length === 0) return [];
        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointment_date);
            return (
                appointmentDate.getDate() === day.date.getDate() &&
                appointmentDate.getMonth() === day.date.getMonth() &&
                appointmentDate.getFullYear() === day.date.getFullYear()
            );
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return '';
        if (timeString.includes('AM') || timeString.includes('PM')) return timeString;
        const [hours, minutes] = timeString.split(':');
        const hourNum = parseInt(hours, 10);
        if (hourNum === 0) return `12:${minutes} AM`;
        else if (hourNum < 12) return `${hourNum}:${minutes} AM`;
        else if (hourNum === 12) return `12:${minutes} PM`;
        else return `${hourNum - 12}:${minutes} PM`;
    };

    const handleDayClick = (day: { date: Date; isCurrentMonth: boolean }) => {
        const dayAppointments = getAppointmentsForDay(day);
        setSelectedDate(day.date);
        setSelectedAppointments(dayAppointments);
        setEditedAppointments(dayAppointments.map(appt => ({ ...appt })));
        setShowModal(true);
        setModalMode('view');
    };

    const getMonthName = (date: Date) => {
        return date.toLocaleString('default', { month: 'long' });
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'Confirmed':
                return 'default';
            case 'Pending':
                return 'secondary';
            case 'Cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const renderDayCell = (day: { date: Date; isCurrentMonth: boolean }, index: number) => {
        const dayAppointments = getAppointmentsForDay(day);
        const today = new Date();
        const isToday = day.date.getDate() === today.getDate() &&
            day.date.getMonth() === today.getMonth() &&
            day.date.getFullYear() === today.getFullYear();

        const isSelected = selectedDate &&
            day.date.getDate() === selectedDate.getDate() &&
            day.date.getMonth() === selectedDate.getMonth() &&
            day.date.getFullYear() === selectedDate.getFullYear();

        return (
            <motion.div
                key={day.date.toString()}
                className={`relative p-2 min-h-[120px] cursor-pointer border ${
                    !day.isCurrentMonth ? 'bg-muted text-muted-foreground' :
                    isToday ? 'bg-primary/10' :
                    isSelected ? 'border-primary' : 'border-border'
                }`}
                onClick={() => handleDayClick(day)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
            >
                <div className="flex justify-between items-center mb-1">
                    <span className={`${isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                        {day.date.getDate()}
                    </span>
                </div>
                <div className="mt-1 space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center text-xs p-1 rounded truncate border-l-2 ${
                                appointment.status === 'Confirmed' ? 'border-l-primary bg-primary/10' :
                                appointment.status === 'Pending' ? 'border-l-orange-500 bg-orange-50' :
                                'border-l-destructive bg-destructive/10'
                            }`}
                            title={appointment.title}
                        >
                            <span className="ml-1">
                                {formatTime(appointment.appointment_time).split(' ')[0]} · {appointment.title}
                            </span>
                        </div>
                    ))}
                    {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-1">
                            + {dayAppointments.length - 3} more
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const handleEditChange = (index: number, field: keyof Appointment, value: string) => {
        const updated = [...editedAppointments];
        updated[index] = { ...updated[index], [field]: value };
        setEditedAppointments(updated);
    };

    const handleSaveChanges = async () => {
        try {
            // Add your save logic here
            setSelectedAppointments(editedAppointments);
            setModalMode('view');
        } catch (error) {
            console.error('Error saving appointments:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditedAppointments(selectedAppointments.map(appt => ({ ...appt })));
        setModalMode('view');
    };

    if (isDataLoading) return <div>Loading </div>

    const { days } = getViewDays();
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-2xl font-bold">Appointments</h4>
                <Button onClick={() => window.location.href = '/appointments/book'}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Appointment
                </Button>
            </div>

            <div className="border rounded-lg">
                <div className="bg-muted p-4 flex justify-between items-center">
                    <h5 className="text-lg font-semibold">
                        {getMonthName(currentDate)} {currentDate.getFullYear()}
                    </h5>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={navigateToPreviousMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" onClick={navigateToToday}>Today</Button>
                            <Button variant="outline" size="icon" onClick={navigateToNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-1">
                            {['Day', '5 Days', 'Week', 'Month'].map((mode) => (
                                <Button
                                    key={mode}
                                    variant={viewMode === mode ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setViewMode(mode)}
                                >
                                    {mode}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    {viewMode === 'Month' && (
                        <>
                            <div className="grid grid-cols-7 text-center bg-muted border-b">
                                {weekdays.map(day => (
                                    <div key={day} className="p-2 font-semibold text-sm">{day}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7">
                                {days.map((day, index) => (
                                    <div key={index}>
                                        {renderDayCell(day, index)}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {viewMode !== 'Month' && (
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
                            {days.map((day, index) => (
                                <div key={index} className="p-2">
                                    <div className="text-center font-semibold mb-2">
                                        {day.date.getDate()}
                                    </div>
                                    {renderDayCell(day, index)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedDate ? dayjs(selectedDate).format('MMMM D, YYYY') : 'Appointment Details'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        {selectedAppointments.length === 0 ? (
                            <p className="text-center text-muted-foreground">No appointments for this day.</p>
                        ) : modalMode === 'view' ? (
                            <div className="space-y-4">
                                {selectedAppointments.map(appointment => (
                                    <div key={appointment.id} className="flex justify-between items-start pb-4 border-b">
                                        <div>
                                            <h6 className="font-medium">{appointment.title}</h6>
                                            <p className="text-sm text-muted-foreground">
                                                {formatTime(appointment.appointment_time)}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusVariant(appointment.status)}>
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {editedAppointments.map((appointment, index) => (
                                    <div key={appointment.id} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                value={appointment.title}
                                                onChange={(e) => handleEditChange(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Time</label>
                                            <Input
                                                type="time"
                                                value={appointment.appointment_time}
                                                onChange={(e) => handleEditChange(index, 'appointment_time', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Status</label>
                                            <Select
                                                value={appointment.status}
                                                onValueChange={(value) => handleEditChange(index, 'status', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {modalMode === 'view' && selectedAppointments.length > 0 && (
                            <Button variant="outline" onClick={() => setModalMode('edit')}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        )}
                        {modalMode === 'edit' && (
                            <>
                                <Button variant="outline" onClick={handleCancelEdit}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveChanges}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}