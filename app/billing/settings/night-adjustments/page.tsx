"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { customFetch, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import { RiMoonClearLine, RiTimeLine, RiPercentLine, RiMoneyDollarCircleLine } from "@remixicon/react";

const timeOptions = Array.from({ length: 24 }, (_, index) => ({
    value: `${index.toString().padStart(2, '0')}:00`,
    label: `${index.toString().padStart(2, '0')}:00`
}));

export default function NightAdjustment() {
    const [isAdjustmentApplied, setIsAdjustmentApplied] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [nightAdjustMode, setNightAdjustMode] = useState<string>("");
    const [nightAdjustmentValue, setNightAdjustmentValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const toggleAdjustment = () => {
        setIsAdjustmentApplied(prevState => !prevState);
    };

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);

        const isValidNightShift = (startHour >= 18 && endHour <= 12) ||
            (startHour < endHour);

        if (!isValidNightShift) {
            toast.error("Invalid night shift hours. For overnight shifts, start time should be evening (18:00-23:00) and end time should be morning (00:00-12:00)", {
                position: "top-center",
                className: "text-sm",
            });
            return;
        }

        setLoading(true);

        const requestResponse = await customPost(`applicationsettings/updates/billingsettings`, 'PUT',
            {
                hasNightAdjustment: isAdjustmentApplied,
                nightAdjustmentValue,
                nightAdjustmentMode: nightAdjustMode,
                startTime,
                endTime
            }
        );

        setLoading(false);

        const { status } = requestResponse;

        if (status == true) {
            toast.success("Night adjustment settings updated successfully", {
                position: "top-center",
            });
        } else {
            toast.error("Failed to update night adjustment settings", {
                position: "top-center",
            });
        }
    };

    const handleNightAdjustModeChange = (event) => {
        setNightAdjustMode(event.target.value);
    };

    const handleNightAdjustmentValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNightAdjustmentValue(event.target.value);
    };

    useEffect(() => {
        customFetch(`applicationsettings/target/billingsettings`)
            .then((response) => {
                const { billingsettings } = response;
                if (!billingsettings) return;
                const { hasNightAdjustment, nightAdjustmentMode, nightAdjustmentValue, startTime, endTime } = billingsettings;

                setIsAdjustmentApplied(hasNightAdjustment);
                setNightAdjustMode(nightAdjustmentMode);
                setNightAdjustmentValue(nightAdjustmentValue);
                setStartTime(startTime || "");
                setEndTime(endTime || "");
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <div className="">
            <div className="card" >
                <div className="card-header d-flex align-items-center gap-3">
                    <div className="rounded-circle">
                        <RiMoonClearLine className="text-primary" size={24} />
                    </div>
                    <h4 className="mb-0 fw-semibold">Night Billing Adjustment</h4>
                </div>
                <div className="card-body">

                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="applyAdjustmentCheckbox" className="mb-3">
                            <Form.Check
                                type="switch"
                                label="Apply Night Adjustment"
                                checked={isAdjustmentApplied}
                                onChange={toggleAdjustment}
                                className="fs-5"
                            />
                        </Form.Group>

                        {isAdjustmentApplied && (
                            <div>
                                <div >
                                    <Form.Group controlId="startTime">
                                        <Form.Label className="d-flex align-items-center gap-2">
                                            <RiTimeLine /> Start Time
                                        </Form.Label>
                                        <Select
                                            options={timeOptions}
                                            value={timeOptions.find(option => option.value === startTime)}
                                            styles={reactSelectCustomStyles}
                                            onChange={(selectedOption) => setStartTime(selectedOption?.value || "")}
                                            placeholder="Select Start Time"
                                        />
                                    </Form.Group>
                                </div>

                                <div >
                                    <Form.Group controlId="endTime">
                                        <Form.Label className="d-flex align-items-center gap-2">
                                            <RiTimeLine /> End Time
                                        </Form.Label>
                                        <Select
                                            options={timeOptions}
                                            value={timeOptions.find(option => option.value === endTime)}
                                            styles={reactSelectCustomStyles}
                                            onChange={(selectedOption) => setEndTime(selectedOption?.value || "")}
                                            placeholder="Select End Time"
                                        />
                                    </Form.Group>
                                </div>

                                <div >
                                    <Form.Group controlId="nightAdjustMode">
                                        <Form.Label className="d-flex align-items-center gap-2">
                                            <RiPercentLine /> Adjustment Mode
                                        </Form.Label>
                                        <Form.Control
                                            as="select"
                                            className="form-select"
                                            value={nightAdjustMode}
                                            onChange={handleNightAdjustModeChange}
                                        >
                                            <option value="">Select Mode</option>
                                            <option value="percentage">Percentage</option>
                                            <option value="absolute">Absolute Value</option>
                                        </Form.Control>
                                    </Form.Group>
                                </div>

                                <div >
                                    <Form.Group controlId="nightAdjustmentValue">
                                        <Form.Label className="d-flex align-items-center gap-2">
                                            <RiMoneyDollarCircleLine /> Adjustment Value
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            className="form-control"
                                            value={nightAdjustmentValue}
                                            onChange={handleNightAdjustmentValueChange}
                                            disabled={!nightAdjustMode}
                                            placeholder="Enter Value"
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? (
                                    <><Spinner animation="border" size="sm" className="me-2" /> Updating...</>
                                ) : (
                                    "Save Night Adjustment Settings"
                                )}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}
