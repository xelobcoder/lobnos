"use client";

import { Spinner } from 'react-bootstrap';
import type { BookingSlot } from '../../lib/patientPortal';
import styles from './PortalShell.module.css';

/** Hourly slot buttons; full or past slots stay visible but disabled so patients understand why. */
export default function SlotPicker({ slots, value, onChange, loading, error, label = 'Available times' }: {
    slots: BookingSlot[] | null | undefined;
    value: string;
    onChange: (time: string) => void;
    loading?: boolean;
    error?: string;
    label?: string;
}) {
    if (loading) return <p role="status" className="text-muted mb-0"><Spinner animation="border" size="sm" className="me-2" />Checking available times…</p>;
    if (error) return <p role="alert" className="text-danger mb-0">{error}</p>;
    if (!slots) return <p className="text-muted mb-0">Choose a date to see available times.</p>;
    if (!slots.some(slot => slot.available)) return <p className="text-muted mb-0">No times are available on this date. Please choose another date.</p>;
    return (
        <div role="radiogroup" aria-label={label} className={styles.slotGrid}>
            {slots.map(slot => (
                <button key={slot.time} type="button" role="radio" aria-checked={value === slot.time}
                    disabled={!slot.available} onClick={() => onChange(slot.time)}
                    className={`${styles.slot} ${value === slot.time ? styles.slotSelected : ''}`}
                    title={slot.available ? `${slot.capacity - slot.booked} place(s) left` : slot.booked >= slot.capacity ? 'Fully booked' : 'No longer available'}>
                    {slot.time}
                    <small>{slot.available ? `${slot.capacity - slot.booked} left` : slot.booked >= slot.capacity ? 'Full' : 'Closed'}</small>
                </button>
            ))}
        </div>
    );
}
