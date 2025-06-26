"use client"
import React from 'react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { useApplicationSettings } from '../Auth/useApplicationContext';
import { handleLoginHistoryServerProcessing } from '../serverActions/ActionFiltering';

export default function ApplicationUserLoginHx({ history, employeeid }) {
    const { applicationsettings } = useApplicationSettings();
    const { auth } = applicationsettings.user;
    const formatDate = (value: string) => {
        return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`;
    };

    const columns = [
        { Header: "employee", accessor: 'username' },
        { Header: "loginTime", accessor: 'loginTime', Cell: ({ value }) => formatDate(value) },
        {
            Header: "logged out", accessor: "actualLogout", Cell: ({ value }) => value == 0 || value == null ? '' : formatDate(value)
        },
        { Header: "system timeout", accessor: 'logoutTime', Cell: ({ value }) => formatDate(value) },
        {
            Header: 'status', accessor: '', Cell: ({ row }) => {
                if (row.original.loggedout == 0) return <span className="bg-success br-5 text-white p-1">loggedIn</span>;
                else return <span className="bg-danger br-5 text-white p-1">LoggedOut</span>;
            }
        },
        {
            Header: 'Device', accessor: "", Cell: ({ row }) => {
                const { browserInformation } = row.original;
                return <span>{JSON.parse(browserInformation)?.userAgent}</span>;
            }
        },
        {
            Header: 'action', accessor: '', Cell: () => {
                return <button disabled={auth?.role != "admin" && auth?.role != "manager"} className="btn btn-danger btn-sm">sign out user</button>;
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