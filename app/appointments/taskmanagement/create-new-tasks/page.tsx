"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { customFetch, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import EmployeeFiltering from "../../../../components/accessories/SectorFileringComponents/StaffFiltering";
import { toast } from 'react-toastify';
import PrimeToast from "../../../../components/accessories/PrimeToast";
import { useSearchParams } from "next/navigation";

const Select = dynamic(() => import("react-select"), {
    ssr: false,
});

interface Task {
    id: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    priority: "low" | "medium" | "high";
    frequency: "daily" | "weekly" | "monthly";
    assignedTo: "all" | string | null;
    completed: 0 | 1 | 2; // 0 = uninitialized, 1 = in progress, 2 = completed
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

const completedOptions: Option[] = [
    { value: "0", label: "Uninitialized" },
    { value: "1", label: "In Progress" },
    { value: "2", label: "Completed" },
];

const CreateTask = () => {
    const [taskName, setTaskName] = useState<string>("");
    const [taskDescription, setTaskDescription] = useState<string>("");
    const [assinedtoName, sertAssignedName] = useState('');
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [priority, setPriority] = useState<Option>(priorityOptions[1]);
    const [frequency, setFrequency] = useState<Option>(frequencyOptions[0]);
    const [assignTo, setAssignTo] = useState<"all" | "single">("all");
    const [assignedTo, setAssignedTo] = useState<string | null>(null);
    const [completed, setCompleted] = useState<Option>(completedOptions[0]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const tasktoEdit = useSearchParams()?.get("taskid");

    useEffect(() => {
        if (tasktoEdit) {
            const fetchTask = async () => {
                setIsLoading(true);
                try {
                    const task = await customFetch(`primelims/tasks/${tasktoEdit}`);
                    setTaskName(task.name);
                    setTaskDescription(task.description);
                    setStartDate(new Date(task.startDate).toISOString().split('T')[0]); // Format as YYYY-MM-DD
                    sertAssignedName(task.username);
                    setEndDate(new Date(task.endDate).toISOString().split('T')[0]); // Format as YYYY-MM-DD
                    setPriority(priorityOptions.find(option => option.value === task.priority) || priorityOptions[1]);
                    setFrequency(frequencyOptions.find(option => option.value === task.frequency) || frequencyOptions[0]);
                    setAssignTo(task.assignedTo === "all" ? "all" : "single");
                    setAssignedTo(task.assignedTo === "all" ? null : task.assignedTo);
                    setCompleted(completedOptions.find(option => option.value === task.completed.toString()) || completedOptions[0]);
                } catch (err) {
                    setError(err instanceof Error ? err.message : "An error occurred");
                    toast.error("An error occurred");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTask();
        }
    }, [tasktoEdit]);

    const onTaskCreate = async (newTask: any) => {
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = tasktoEdit ? `primelims/tasks/${parseInt(tasktoEdit)}` : "primelims/tasks";
            const method = tasktoEdit ? "PUT" : "POST";
            const pushData = method == "PUT" && tasktoEdit ? { ...newTask, id: parseInt(tasktoEdit) } : newTask;

            const data = await customPost(endpoint, method, pushData);
            const { status } = data;
            if (status) {
                toast.success(tasktoEdit ? 'Task updated successfully!!!' : 'Task created successfully!!!');
                if (!tasktoEdit) {
                    setTaskName("");
                    setTaskDescription("");
                    setStartDate("");
                    setEndDate("");
                    setPriority(priorityOptions[1]);
                    setFrequency(frequencyOptions[0]);
                    setAssignTo("all");
                    setAssignedTo(null);
                    setCompleted(completedOptions[0]);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectedEmployee = (employeeData: any) => {
        setAssignedTo(employeeData.employeeid);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!taskName.trim()) {
            toast.error("Task name is required");
            return;
        }

        const formattedTask = {
            name: taskName,
            description: taskDescription,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            priority: priority.value,
            frequency: frequency.value,
            assignedTo: assignTo === "all" ? "all" : assignedTo,
            completed: parseInt(completed.value),
        };

        onTaskCreate(formattedTask);
    };

    return (
        <div className="create-task">
            <PrimeToast />
            <h2 className="bg-secondary-subtle p-2 pls-label border-opacity-50 br-5">
                {tasktoEdit ? "Edit Task" : "Create a New Task"}
            </h2>
            {tasktoEdit && assinedtoName && <h6 className="pls-label my-2 br-5  alert alert-info col-2  text-sm pls-color">Assigned To:  {assinedtoName}</h6>}
            <form onSubmit={handleSubmit}>
                <div className="grid-reg my-3">
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
                <div className="grid-reg my-3">
                    <label htmlFor="taskDescription">Task Description:</label>
                    <textarea
                        id="taskDescription"
                        className="form-control"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Enter task description"
                    />
                </div>
                <div className="grid-reg my-3">
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
                <div className="grid-reg my-3">
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
                <div className="grid-reg my-3">
                    <label htmlFor="priority">Priority:</label>
                    <Select
                        id="priority"
                        value={priority}
                        onChange={(option) => setPriority(option as Option)}
                        options={priorityOptions}
                        styles={reactSelectCustomStyles}
                    />
                </div>
                <div className="grid-reg my-3">
                    <label htmlFor="frequency">Frequency:</label>
                    <Select
                        id="frequency"
                        value={frequency}
                        onChange={(option) => setFrequency(option as Option)}
                        options={frequencyOptions}
                        styles={reactSelectCustomStyles}
                    />
                </div>
                <div className="grid-reg my-3">
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
                </div>
                <div className="grid-reg my-3">
                    <label htmlFor="completed">Status:</label>
                    <Select
                        id="completed"
                        value={completed}
                        onChange={(option) => setCompleted(option as Option)}
                        options={completedOptions}
                        styles={reactSelectCustomStyles}
                    />
                </div>
                <div>
                    {assignTo === "single" && (
                        <div className="my-2  grid-reg">
                            <label htmlFor="employee">Employee </label>
                            <EmployeeFiltering onSelect={handleSelectedEmployee} />
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="btn btn-primary btn-sm my-2"
                    disabled={isLoading}
                >
                    {isLoading ? (tasktoEdit ? "Updating..." : "Creating...") : (tasktoEdit ? "Update Task" : "Create Task")}
                </button>
                {error && <p className="text-danger">{error}</p>}
            </form>
        </div>
    );
};

export default CreateTask;