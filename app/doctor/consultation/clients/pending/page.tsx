"use client";
import { useState, useEffect } from "react";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import Loader from "../../../../../components/accessories/Loader";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Link from "next/link";
import { Button } from "react-bootstrap";
import moment from "moment";
import { plsEncryption } from "../../../../../lib/encryption";

interface PendingConsultation {
    serviceid: number;
    billingid: number;
    username: string;
    id: number;
    designation: string;
    firstname: string;
    email: string;
    dob: string;
    serviceAddedOn: string;
    age: number;
    gender: string;
    marital_status: string;
    mobile_number: string;
    agetype: string;
    occupation: string;
    date: string;
    activation_status: string;
    lastname: string;
    middlename: string;
    organization: string;
    contactpointer: string;
    patientid: number;
    whatAppcontact: string;
}

const PendingDoctorConsultationList = () => {
    const [pendingRecords, setPendingRecords] = useState<PendingConsultation[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState({ page: 1, count: 10 });
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const fetchPendingConsultations = async () => {
        try {
            setLoading(true);
            const { page, count } = pagination;
            const url = `records/consulations/pending/records?page=${page}&&count=${count}&&sortby=ASC`;
            const response = await customFetch(url);

            if (response && Array.isArray(response)) {
                setPendingRecords(response);
                setTotalRecords(response.length);
            }
        } catch (err) {
            console.error("Error fetching pending consultations:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaginationChange = async (newPagination: { page: number; count: number, sortby: 'ASC' | 'DESC' }) => {
        const { page, count, sortby } = newPagination;
        const url = `records/consulations/pending/records?page=${page}&&count=${count}&&sortby=${sortby}`;
        try {
            const response = await customFetch(url);
            if (response && Array.isArray(response)) {
                return { result: response, error: false };
            } else {
                return { result: [], error: false };
            }
        } catch (err) {
            console.error("Error fetching pending consultations:", err);
            return { result: [], error: true };
        }
    };

    useEffect(() => {
        fetchPendingConsultations();
    }, [pagination.page, pagination.count]);

    const getFullName = (firstname: string, middlename: string, lastname: string) => {
        return `${firstname} ${middlename} ${lastname}`.trim();
    };

    const columns = [
        { Header: "Service ID", accessor: "serviceid" },
        { Header: "Billing ID", accessor: "billingid" },
        {
            Header: "Patient Name",
            accessor: "fullname",
            Cell: ({ row }: { row: { original: PendingConsultation } }) =>
                getFullName(row.original.firstname, row.original.middlename, row.original.lastname),
        },
        { Header: "Patient ID", accessor: "patientid" },
        { Header: "Age", accessor: "age" },
        { Header: "Gender", accessor: "gender" },
        { Header: "Mobile Number", accessor: "mobile_number" },
        {
            Header: "service AddedO n",
            accessor: "serviceAddedOn",
            Cell: ({ row }: { row: { original: PendingConsultation } }) =>
                moment(row.original.serviceAddedOn).format("MMMM Do YYYY, h:mm:ss a")
        },
        {
            Header: "Actions",
            accessor: "",
            Cell: ({ row }: { row: { original: PendingConsultation } }) => (
                <Link href={row.original.patientid ? `/doctor/consultation/${plsEncryption(row.original.patientid.toString())}?serviceid=${row.original.serviceid}` : ''} passHref>
                    <Button variant="primary" size="sm">
                        Initialize Consultation
                    </Button>
                </Link>
            ),
        },
    ];



    if (loading) return <Loader w={20} h={20} />;

    return (
        <div>
            <h5 className="d-flex justify-content-end text-decoration-underline">
                Pending Consultation Records
            </h5>
            <PrimeTable
                column={columns}
                data={pendingRecords}
                filtering={false}
                serverSideFiltering={true}
                handleSeverSideProcessing={handlePaginationChange}
            />
        </div>
    );
};

export default PendingDoctorConsultationList;