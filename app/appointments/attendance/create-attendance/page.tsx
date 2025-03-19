"use client";
import React, { useState, useEffect } from "react";
import ShiftCyclePicker from "../../../../components/appointments/scheduling/ShiftCyclePicker";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import styles from '../../../../styles/SmsTemplateList.module.css'
import { useRouter } from "next/navigation";
import { plsEncryption } from "../../../../lib/encryption";

interface Cycle {
    id: number;
    cyclestart: string;
    cycleend: string;
    description: string | null;
}

const ScheduleGenerator: React.FC = () => {
    const [shiftCycleStart, setShiftCycleStart] = useState<string>("");
    const [shiftCycleEnd, setShiftCycleEnd] = useState<string>("");
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [loadingCycles, setLoadingCycles] = useState<boolean>(false);

    const loadCycles = async () => {
        setLoadingCycles(true);
        try {
            const response = await customFetch("attendance/cycles");
            if (response.success) {
                setCycles(response.data);
            } else {
                toast.error("Failed to load cycles.");
            }
        } catch (error: any) {
            toast.error(`Failed to load cycles: ${error.message}`);
        } finally {
            setLoadingCycles(false);
        }
    };

    useEffect(() => {
        loadCycles();
    }, []);

    const handleCreateAttendance = async () => {
        if (shiftCycleEnd && shiftCycleStart) {
            const data = { cyclestart: shiftCycleStart, cycleend: shiftCycleEnd };
            try {
                const createResponse = await customPost(`attendance/cycles`, "POST", data);
                if (createResponse.success) {
                    toast.success(createResponse?.data?.message || "Cycle created successfully");
                    loadCycles();
                } else {
                    toast.error("Failed to create cycle.");
                }
            } catch (error: any) {
                toast.error(`Error creating cycle: ${error.message}`);
            }
        }
    };

    const handleDeleteCycle = async (cycleId: number) => {
        try {
            const deleteResponse = await customPost(`attendance/cycles/${cycleId}`, "DELETE", {});
            if (deleteResponse.success) {
                toast.success("Cycle deleted successfully");
                loadCycles();
            } else {
                toast.error("Failed to delete cycle.");
            }
        } catch (error: any) {
            toast.error(`Error deleting cycle: ${error.message}`);
        }
    };

    const router = useRouter()

    const handleViewAttendance = (item: any) => {
        router.push(`/appointments/attendance/create-attendance/${plsEncryption(item.id.toString())}`)
    }


    return (
        <div>
            <h3 className="pls-label bg-secondary-subtle p-3 br-5 col-3">Shift Cycle Picker</h3>
            <ShiftCyclePicker
                shiftCycleStart={shiftCycleStart}
                shiftCycleEnd={shiftCycleEnd}
                onCycleStartChange={setShiftCycleStart}
                onCycleEndChange={setShiftCycleEnd}
                onGenerate={handleCreateAttendance}
            />
            <h3 className="mt-4 pls-label">Existing Cycles</h3>
            {loadingCycles ? (
                <p>Loading cycles...</p>
            ) : (
                <table className={`${styles.table}`}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cycle Start</th>
                            <th>Cycle End</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cycles.map((cycle) => (
                            <tr key={cycle.id}>
                                <td>{cycle.id}</td>
                                <td>{new Date(cycle.cyclestart).toLocaleDateString()}</td>
                                <td>{new Date(cycle.cycleend).toLocaleDateString()}</td>
                                <td>{cycle.description || "-"}</td>
                                <td>
                                    <button className="btn btn-primary btn-sm mx-2" onClick={(ev) => { handleViewAttendance(cycle) }}>
                                        create/view attendance
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeleteCycle(cycle.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ScheduleGenerator;
