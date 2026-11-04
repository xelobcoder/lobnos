"use client"
import React from 'react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { handleLoginHistoryServerProcessing } from '../serverActions/ActionFiltering';
import { customFetchMutation } from '../Auth/customFetch';
import { roleAllowed } from '../Auth/roles';

interface LoginHistory {keyid: number; username: string; isActive: boolean; loginTime: string; actualLogout: string | number | null; logoutTime: string; forcedLogoutByName?: string; forcedLogoutBy?: number; forcedLogoutAt?: string; forcedLogoutReason?: string; browserInformation?: {userAgent?: string}}
export default function ApplicationUserLoginHx({ history, employeeid, onChanged }: { history: LoginHistory[]; employeeid: string | number; onChanged?: () => void }) {
    const { applicationsettings } = useApplicationSettings();
    const { role } = applicationsettings.user;
    const formatDate = (value: string) => {
        return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`;
    };

    const handleSessionLogout = async (sessionKey: number, username: string) => {
        if (!window.confirm(`Sign out ${username} from this session? They will be signed out on their next request.`)) return;
        const reason = window.prompt("Reason for signing this user out (optional):") ?? "";
        try {
            const response = await customFetchMutation(`security/sessions/${sessionKey}/force-logout`, "POST", { reason, employeeid: applicationsettings.user.employeeid });
            if (response?.status === "success") {
                alert("User has been signed out successfully.");
                onChanged?.();
            } else {
                alert(response?.message || "Failed to sign out the user. Please try again.");
            }
        } catch {
            alert("Failed to sign out the user. Please try again.");
        }
    };

    const columns = [
        { Header: "employee", accessor: 'username' },
        { Header: "loginTime", accessor: 'loginTime', Cell: ({ value }: {value: string}) => formatDate(value) },
        {
            Header: "logged out", accessor: "actualLogout", Cell: ({ value }: {value: string | number | null}) => value == 0 || value == null ? '' : formatDate(String(value))
        },
        { Header: "system timeout", accessor: 'logoutTime', Cell: ({ value }: {value: string}) => formatDate(value) },
        {
            Header: 'status', accessor: '', Cell: ({ row }: {row: {original: LoginHistory}}) => {
                const { isActive, forcedLogoutByName, forcedLogoutBy, forcedLogoutAt, forcedLogoutReason } = row.original;
                if (isActive) return <span className="bg-success br-5 text-white p-1">loggedIn</span>;
                if (forcedLogoutAt) return <span className="bg-warning br-5 p-1" title={forcedLogoutReason || ''}>Signed out by {forcedLogoutByName || `#${forcedLogoutBy}`}</span>;
                return <span className="bg-danger br-5 text-white p-1">LoggedOut</span>;
            }
        },
        {
            Header: 'Device', accessor: "", Cell: ({ row }: {row: {original: LoginHistory}}) => {
                const { browserInformation } = row.original;
                return <span>{browserInformation?.userAgent}</span>;
            }
        },
        {
            Header: 'action', accessor: '', Cell: ({ row }: {row: {original: LoginHistory}}) => {
                const { keyid, username, isActive } = row.original;
                return <button disabled={!isActive || !roleAllowed(role, ["admin", "manager"])} onClick={() => handleSessionLogout(keyid, username)} className="btn btn-danger btn-sm">sign out user</button>;
            }
        }
    ];



    return (
        <div>
            <PrimeTable column={columns} data={history}
                serverSideFiltering={true}
                urlparams={{ employeeid }}
                handleSeverSideProcessing={handleLoginHistoryServerProcessing}
                filtering={false} />
        </div>
    );
}