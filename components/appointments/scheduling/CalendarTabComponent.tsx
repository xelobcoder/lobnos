"use client";
import React from "react";

interface CalendarTabProps {
    dateRange: Date[];
    calendarView: { [date: string]: any[] };
    shiftCycleStart: string;
    shiftCycleEnd: string;
    setSelectedCalendarDate: (date: string) => void;
    setShowModal: (show: boolean) => void;
    isReadOnly: boolean;
}

const calendarGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "8px",
    padding: "10px"
};

const dayBoxStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "8px",
    backgroundColor: "#f9f9f9",
    minHeight: "120px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: "pointer",
};

const dateHeaderStyle: React.CSSProperties = {
    fontWeight: 600,
    marginBottom: "6px"
};

const eventStyle = (color: string): React.CSSProperties => ({
    backgroundColor: color,
    color: "white",
    padding: "2px 4px",
    marginBottom: "2px",
    borderRadius: "4px",
    fontSize: "0.85rem"
});

const CalendarTab: React.FC<CalendarTabProps> = ({
    dateRange,
    calendarView,
    shiftCycleStart,
    shiftCycleEnd,
    setSelectedCalendarDate,
    setShowModal,
    isReadOnly,
}) => {
    return (
        <div style={calendarGridStyle}>
            {dateRange.map(date => {
                const dateStr = date.toISOString().split("T")[0];
                return (
                    <div
                        key={dateStr}
                        style={{ ...dayBoxStyle, opacity: isReadOnly ? 0.7 : 1 }}
                        onClick={() => {
                            if (!isReadOnly) {
                                setSelectedCalendarDate(dateStr);
                                setShowModal(true);
                            }
                        }}
                    >
                        <div style={dateHeaderStyle}>{date.toLocaleDateString()}</div>
                        <div>
                            {calendarView[dateStr]?.map((event, index) => (
                                <div key={index} style={eventStyle(event.shift.color)}>
                                    {event.employee.username} - {event.shift.name}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CalendarTab;