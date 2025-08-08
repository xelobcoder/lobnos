"use client";
import React, { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";

interface PatientData {
    firstname?: string;
    middlename?: string;
    lastname?: string;
    dob?: string;
    age?: number;
    ageType?: string;
    mobile?: string;
    gender?: string;
    maritalstatus?: string;
    date?: string;
    email?: string;
}

interface RSCPreviewPatientInformationProps {
    patientid: string;
}


export default function RSCPreviewPatientInformation({ patientid }: RSCPreviewPatientInformationProps) {
    const [data, setData] = useState<PatientData>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!patientid) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await customFetch(`register/personalinformation?patientid=${patientid}`);
                setData(response?.result || {});
                setIsLoading(false);
            } catch (err) {
                setError("Error loading patient information");
                setData({});
                setIsLoading(false);
            }
        };
        fetchData();
    }, [patientid]);

    if (!patientid) {
        return (
            <div className="heightedBorder p-2 bg-secondary-subtle d-flex justify-content-center">
                {"<"}No Patient ID provided{" >"}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="heightedBorder p-2 bg-secondary-subtle d-flex justify-content-center">
                {"<"}Loading Patient Information please ....... {">"}
            </div>
        );
    }

    if (error) {
        return (
            <div className="heightedBorder p-2 bg-danger-subtle d-flex justify-content-center">
                {error}
            </div>
        );
    }

    return (
        <div className="">
            <ul className="pls-color list-group m-0  br-5">
                <li className="list-group-item text-capitalize bg-secondary-subtle fw-bold">
                    Full Name: {data?.firstname} {data?.middlename} {data?.lastname}
                </li>

                <div className="list-group-item d-flex flex-wrap justify-content-between">
                    <span className="text-capitalize">Date of Birth: {new Date(data?.dob || "").toLocaleDateString()}</span>
                    <span className="text-capitalize">Age: {data?.age} {data?.ageType}</span>
                </div>

                <div className="list-group-item d-flex flex-wrap justify-content-between">
                    <span className="text-capitalize">Mobile Number: 0{data?.mobile}</span>
                    <span className="text-capitalize">Gender: {data?.gender}</span>
                </div>

                <div className="list-group-item d-flex flex-wrap justify-content-between">
                    <span className="text-capitalize">Marital Status: {data?.maritalstatus}</span>
                    <span className="text-capitalize">Registration Date: {new Date(data?.date || "").toLocaleDateString()}</span>
                </div>
                <li className="list-group-item text-capitalize">Email: {data?.email}</li>
            </ul>
        </div>
    );
}