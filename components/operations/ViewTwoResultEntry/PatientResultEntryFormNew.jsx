"use client"
import OperationsListTestCollection from "./OperationsListTestCollection";
import React, { } from "react";
import { useApplicationSettings } from "../../Auth/useApplicationContext";


export default function PatientResultEntryFormComponentNew({ operations }) {
    const { user } = useApplicationSettings().applicationsettings;
    const employeeid = user?.employeeid;

    return (
        <React.Fragment>
            <OperationsListTestCollection operations={{ ...operations, employeeid }} />
        </React.Fragment>
    )
}