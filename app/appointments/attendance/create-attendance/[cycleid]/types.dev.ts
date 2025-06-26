
interface Employee {
    employeeid: number;
    username: string;
    role: string;
    email: string;
    branch: number;
    branchname: string;
    emailAuthenticated: string;
    activation: number;
    preferredShifts: PreferredShift[];
    unAvailableDays: {
        employeeid: number;
        dayofweek: string[];
    };
}

interface Shift {
    id: number;
    name: string;
    color: string;
    starttime: string;
    endtime: string;
}

interface PreferredShift extends Shift {
    employeeid: number;
    shiftid: number;
    preferenceid: number;
}

interface CycleInfo {
    id: number;
    cyclestart: string;
    cycleend: string;
    description: string | null;
}

interface AttendanceRecord {
    employee: Employee;
    shift: Shift;
    date: string;
    day: string;
    month: string;
    cycleStart: string;
    cycleEnd: string;
    status: "pending" | "scheduled" | "completed" | "absent";
}

interface SummaryResponse {
    summary: Employee[];
    shifts: Shift[];
    cycleInfo: CycleInfo;
}
