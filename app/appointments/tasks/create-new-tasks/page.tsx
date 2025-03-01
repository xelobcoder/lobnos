"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import EmployeeFiltering from "../../../../components/accessories/SectorFileringComponents/StaffFiltering";

const Select = dynamic(() => import("react-select"), {
    ssr: false, // Disable SSR for react-select
});

interface Task {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    priority: "low" | "medium" | "high";
    frequency: "daily" | "weekly" | "monthly";
    assignedTo: "all" | string | null; // 'all' for all employees, or employee ID for a single employee
    completed: boolean;
}

interface Option {
    value: string;
    label: string;
}

const priorityOptions: Option[] = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const frequencyOptions: Option[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
];

const CreateTask = () => {
    const [taskName, setTaskName] = useState<string>("");
    const [taskDescription, setTaskDescription] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [priority, setPriority] = useState<Option>(priorityOptions[1]);
    const [frequency, setFrequency] = useState<Option>(frequencyOptions[0]);
    const [assignTo, setAssignTo] = useState<"all" | "single">("all"); // 'all' or 'single'
    const [assignedTo, setAssignedTo] = useState<string | null>(null); // Employee ID for single assignment
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onTaskCreate = async (newTask: Task) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                throw new Error("Failed to create task");
            }

            const data = await response.json();
            console.log("Task created successfully:", data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectedEmployee = (employeeData: any) => {
        setAssignedTo(employeeData.id); // Set the selected employee ID
        console.log("Selected Employee:", employeeData);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!taskName.trim()) {
            alert("Task name is required");
            return;
        }

        const newTask: Task = {
            id: Date.now(),
            name: taskName,
            description: taskDescription,
            startDate,
            endDate,
            priority: priority.value as "low" | "medium" | "high",
            frequency: frequency.value as "daily" | "weekly" | "monthly",
            assignedTo: assignTo === "all" ? "all" : assignedTo, // Set 'all' or employee ID
            completed: false,
        };

        onTaskCreate(newTask);
        setTaskName("");
        setTaskDescription("");
        setStartDate("");
        setEndDate("");
        setPriority(priorityOptions[1]);
        setFrequency(frequencyOptions[0]);
        setAssignTo("all"); // Reset to 'all' after submission
        setAssignedTo(null); // Reset assigned employee
    };

    return (
        <div className="create-task">
            <h2 className="bg-secondary-subtle p-2 pls-label border-opacity-50 br-5">
                Create a New Task
            </h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="taskName">Task Name:</label>
                    <input
                        type="text"
                        id="taskName"
                        className="custom-input"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="Enter task name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="taskDescription">Task Description:</label>
                    <textarea
                        id="taskDescription"
                        className="form-control"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Enter task description"
                    />
                </div>
                <div>
                    <label htmlFor="startDate">Start Date:</label>
                    <input
                        type="date"
                        id="startDate"
                        className="custom-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="endDate">End Date:</label>
                    <input
                        type="date"
                        id="endDate"
                        className="custom-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="priority">Priority:</label>
                    <Select
                        id="priority"
                        value={priority}
                        onChange={(option) => setPriority(option as Option)}
                        options={priorityOptions}
                        styles={reactSelectCustomStyles}
                    />
                </div>
                <div>
                    <label htmlFor="frequency">Frequency:</label>
                    <Select
                        id="frequency"
                        value={frequency}
                        onChange={(option) => setFrequency(option as Option)}
                        options={frequencyOptions}
                        styles={reactSelectCustomStyles}
                    />
                </div>
                <div>
                    <label htmlFor="assignTo">Assign To:</label>
                    <select
                        id="assignTo"
                        className="custom-select"
                        value={assignTo}
                        onChange={(e) => setAssignTo(e.target.value as "all" | "single")}
                    >
                        <option value="all">All Employees</option>
                        <option value="single">Single Employee</option>
                    </select>
                    {assignTo === "single" && (
                        <div className="my-2">
                            <EmployeeFiltering onSelect={handleSelectedEmployee} />
                        </div>
                    )}
                    {assignTo === "single" && assignedTo && (
                        <p>Selected Employee ID: {assignedTo}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="btn btn-primary btn-sm my-2"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating..." : "Create Task"}
                </button>
                {error && <p className="text-danger">{error}</p>}
            </form>
        </div>
    );
};

export default CreateTask;