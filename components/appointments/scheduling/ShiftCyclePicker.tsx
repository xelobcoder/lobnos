import { Refresh } from "@mui/icons-material";
import React from "react";
import { Form, Button } from "react-bootstrap";


interface ShiftCyclePickerProps {
    shiftCycleStart: string;
    shiftCycleEnd: string;
    onCycleStartChange: (value: string) => void;
    onCycleEndChange: (value: string) => void;
    onGenerate: () => void;
}

const ShiftCyclePicker: React.FC<ShiftCyclePickerProps> = ({
    shiftCycleStart,
    shiftCycleEnd,
    onCycleStartChange,
    onCycleEndChange,
    onGenerate,
}) => {
    return (
        <div className="d-flex mb-3">
            <div className="col-4">
                <Form.Control
                    className="custom-input"
                    type="date"
                    value={shiftCycleStart}
                    onChange={(e) => onCycleStartChange(e.target.value)}
                    placeholder="Shift Cycle Start"
                />
            </div>
            <div className="col-4">
                <Form.Control
                    className="custom-input mx-2"
                    type="date"
                    value={shiftCycleEnd}
                    onChange={(e) => onCycleEndChange(e.target.value)}
                    placeholder="Shift Cycle End"
                />
            </div>
            <div className="mx-2">
                <Button onClick={onGenerate} className="btn-sm mx-2">
                    <Refresh/> Generate
                </Button>
            </div>
        </div>
    );
};

export default ShiftCyclePicker;