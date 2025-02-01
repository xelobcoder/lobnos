"use client";
import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
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

    const fetchConsultationRecords = async () => {
        try {
            setLoading(true);
            const { page, count } = pagination;
            const url = `records/consulations/records?page=${page}&&count=${count}`;
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
            const url = `records/consulations/records?page=${page}&&count=${count}`;
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
    }, []);

    const handleRowClick = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRecord(null);
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
        { Header: "ID", accessor: "id" },
        {
            Header: "Complaints",
            accessor: "complaints",
            Cell: ({ value }) => truncateWords(value, 100),
        },
        { Header: "Record Type", accessor: "record_type" },
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
            <PrimeTable
                column={columns}
                data={records}
                filtering={false}
                serverSideFiltering={true}
                handleSeverSideProcessing={handlePaginationChange}
            />

            <Modal show={showModal} backdrop="static" onHide={handleCloseModal} size="xl">
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
                                ].map((col) => (
                                    <tr key={col.key}>
                                        <td className="pls-label"><strong>{col.label}</strong></td>
                                        <td className="text-sm">
                                            {col.key === "created_at"
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
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ConsultationRecordsTable;