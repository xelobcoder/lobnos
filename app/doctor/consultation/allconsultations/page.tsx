"use client";
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { RiRefreshLine } from "@remixicon/react"
import moment from "moment";
import Loader from "../../../../components/accessories/Loader";
import { customFetch } from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";

const ConsultationRecordsTable = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, count: 10 });
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchConsultationRecords = async () => {
        try {
            setLoading(true);
            const { page, count } = pagination;
            const url = `records/consulations/records?page=${page}&&count=${count}${searchTerm ? `&&search=${encodeURIComponent(searchTerm)}` : ''}`;
            const response = await customFetch(url);

            if (response && Array.isArray(response)) {
                setRecords(response);
                setTotalRecords(response.length);
            }
        } catch (err) {
            console.error("Error fetching consultation records:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePaginationChange = async (pagination: { page: number, count: number }) => {
        try {
            const { page, count } = pagination;
            const url = `records/consulations/records?page=${page}&&count=${count}${searchTerm ? `&&search=${encodeURIComponent(searchTerm)}` : ''}`;
            const response = await customFetch(url);
            if (response && Array.isArray(response)) {
                return { result: response, error: false }
            } else {
                return { result: [], error: false }
            }
        } catch (err) {
            return { result: [], error: true }
        }

    };

    useEffect(() => {
        fetchConsultationRecords();
    }, [pagination]);

    const handleRowClick = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    const clearFilter = () => {
        setSearchTerm('');
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchConsultationRecords();
    };

    const truncateWords = (text, maxWords = 100) => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length > maxWords) {
            return words.slice(0, maxWords).join(" ") + "...";
        }
        return text;
    };

    const formatDate = (dateString) => {
        return moment(dateString).format("MMMM Do YYYY, h:mm:ss a");
    };

    const columns = [

        {
            Header: "Patient Name",
            accessor: "",
            Cell: ({ row }) => {
                const record = row.original;
                const designation = record.designation ? record.designation + " " : "";
                const firstname = record.firstname || "";
                const middlename = record.middlename ? " " + record.middlename : "";
                const lastname = record.lastname || "";
                return designation + firstname + middlename + " " + lastname;
            },
        },
        { Header: "Patient ID", accessor: "fullpatientid" },
        {
            Header: "Demographics",
            accessor: "",
            Cell: ({ row }) => {
                const record = row.original;
                const age = record.age || '';
                const gender = record.gender ? record.gender.charAt(0).toUpperCase() : '';
                const agetype = record.agetype || '';
                return age ? `${age} ${agetype}(${gender})` : '';
            },
        },
        {
            Header: "Complaints",
            accessor: "complaints",
            Cell: ({ value }) => truncateWords(value, 50),
        },
        { Header: "Record Type", accessor: "record_type" },
        { Header: "Consultation By", accessor: "consultationby" },
        {
            Header: "Created At",
            accessor: "created_at",
            Cell: ({ value }) => formatDate(value),
        },
        {
            Header: "Actions",
            accessor: "",
            Cell: ({ row }) => (
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRowClick(row.original)}
                >
                    Details
                </Button>
            ),
        },
    ];

    const totalPages = Math.ceil(totalRecords / pagination.count);

    if (loading) return <Loader w={20} h={20} />;

    return (
        <div>
            <h4>Consultation Records</h4>
            <div className="mb-3 d-flex gap-2 align-items-center">
                <Form.Control
                    type="text"
                    placeholder="Search by Patient ID (full or short)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
                <Button
                    variant="primary"
                    onClick={() => {
                        setPagination(prev => ({ ...prev, page: 1 }));
                        fetchConsultationRecords();
                    }}
                    disabled={loading}
                    title="Search"
                >
                    Search
                </Button>
                <Button
                    variant="outline-danger"
                    onClick={clearFilter}
                    disabled={loading}
                    title="Clear Filter"
                >
                    Clear
                </Button>
            </div>
            <PrimeTable
                column={columns}
                data={records}
                filtering={false}
                serverSideFiltering={true}
                handleSeverSideProcessing={handlePaginationChange}
            />

            <Modal show={showModal} backdrop="static" onHide={() => {
                setShowModal(false);
                setSelectedRecord(null);
            }} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Consultation Record Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <table className="table">
                            <tbody>
                                {[
                                    { key: "id", label: "ID" },
                                    { key: "complaints", label: "Complaints" },
                                    { key: "hpc", label: "HPC" },
                                    { key: "pmh", label: "PMH" },
                                    { key: "sh", label: "SH" },
                                    { key: "odq", label: "ODQ" },
                                    { key: "dhx", label: "DHX" },
                                    { key: "se", label: "SE" },
                                    { key: "fh", label: "FH" },
                                    { key: "obsGynecHistory", label: "Obs Gynec History" },
                                    { key: "oe", label: "OE" },
                                    { key: "record_type", label: "Record Type" },
                                    { key: "created_at", label: "Created At" },
                                    { key: "consultationby", label: "Consultation By" },
                                    { key: "patientid", label: "Patient ID" },
                                    { key: "associatedTransactionid", label: "Associated Transaction ID" },
                                    { key: "employeeid", label: "Employee ID" }, { key: "fullpatientid", label: "Full Patient ID" },
                                    { key: "designation", label: "Designation" },
                                    { key: "firstname", label: "First Name" },
                                    { key: "lastname", label: "Last Name" },
                                    { key: "middlename", label: "Middle Name" },
                                    { key: "email", label: "Email" },
                                    { key: "dob", label: "Date of Birth" },
                                    { key: "age", label: "Age" },
                                    { key: "agetype", label: "Age Type" },
                                    { key: "gender", label: "Gender" },
                                    { key: "marital_status", label: "Marital Status" },
                                    { key: "mobile_number", label: "Mobile Number" },
                                    { key: "occupation", label: "Occupation" },
                                    { key: "organization", label: "Organization" },
                                    { key: "contactpointer", label: "Contact Pointer" },
                                    { key: "whatAppcontact", label: "WhatsApp Contact" },
                                    { key: "date", label: "Registration Date" },
                                    { key: "activation_status", label: "Activation Status" },].map((col) => (
                                        <tr key={col.key}>
                                            <td className="pls-label"><strong>{col.label}</strong></td>
                                            <td className="text-sm">
                                                {col.key === "created_at" || col.key === "date" || col.key === "dob"
                                                    ? formatDate(selectedRecord[col.key]) // Format the date in the modal
                                                    : selectedRecord[col.key]}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {
                        setShowModal(false);
                        setSelectedRecord(null);
                    }}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ConsultationRecordsTable;