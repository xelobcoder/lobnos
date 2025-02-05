"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { customFetch, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";

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
        if (startTime >= endTime) {
            toast.error("End time must be greater than start time", {
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
        customFetch(`applicationsettings/billingsettings`)
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
        <div className="night-adjustment-form">
            <h4 className="p-3 bg-secondary-subtle br-5">Night Billing Adjustment</h4>
            <Form onSubmit={handleFormSubmit}>
                <Form.Group controlId="applyAdjustmentCheckbox">
                    <Form.Check
                        type="checkbox"
                        label="Apply Night Adjustment"
                        checked={isAdjustmentApplied}
                        onChange={toggleAdjustment}
                    />
                </Form.Group>

                {isAdjustmentApplied && (
                    <>
                        <Form.Group className="grid-reg mt-2 col-7" controlId="startTime">
                            <Form.Label>Start Time (24-hour format)</Form.Label>
                            <Select
                                options={timeOptions}
                                value={timeOptions.find(option => option.value === startTime)}
                                styles={reactSelectCustomStyles}
                                onChange={(selectedOption) => setStartTime(selectedOption?.value || "")}
                                placeholder="Select Start Time"
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg mt-2 col-7" controlId="endTime">
                            <Form.Label>End Time (24-hour format)</Form.Label>
                            <Select
                                options={timeOptions}
                                value={timeOptions.find(option => option.value === endTime)}
                                styles={reactSelectCustomStyles}
                                onChange={(selectedOption) => setEndTime(selectedOption?.value || "")}
                                placeholder="Select End Time"
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg mt-2 col-7" controlId="nightAdjustMode">
                            <Form.Label>Adjustment Mode</Form.Label>
                            <Form.Control
                                as="select"
                                className="custom-select"
                                value={nightAdjustMode}
                                onChange={handleNightAdjustModeChange}
                            >
                                <option value="">Select Mode</option>
                                <option value="percentage">Percentage</option>
                                <option value="absolute">Absolute Value</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group className="grid-reg mt-2 col-7" controlId="nightAdjustmentValue">
                            <Form.Label>Adjustment Value</Form.Label>
                            <Form.Control
                                className="custom-input"
                                type="number"
                                value={nightAdjustmentValue}
                                onChange={handleNightAdjustmentValueChange}
                                disabled={!nightAdjustMode}
                            />
                        </Form.Group>
                    </>
                )}

                <Button variant="primary" size="sm" type="submit" disabled={loading}>
                    {loading ? (
                        <Spinner animation="border" size="sm" />
                    ) : (
                        "Submit Night Adjustments"
                    )}
                </Button>
            </Form>

            <ToastContainer className={'text-sm'} theme="colored" />
        </div>
    );
}
