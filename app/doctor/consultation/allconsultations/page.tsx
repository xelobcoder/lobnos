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
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchConsultationRecords = async () => {
        try {
            setLoading(true);
            const { page, count } = pagination;
            const url = `records/consulations/records?page=${page}&&count=${count}${searchTerm ? `&&patientid=${encodeURIComponent(searchTerm)}` : ''}`;
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

    const handleRowClick = (record: any) => {
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
        if (!dateString) return "-";
        return moment(dateString).format("MMMM Do YYYY, h:mm:ss a");
    };

    const getConsultantName = (record) => {
        return record?.consultationby || record?.consulationby || "-";
    };

    const getProgressReport = (record) => {
        return record?.progress_report || record?.complaints || "";
    };

    const getProgressPreview = (record, maxChars = 140) => {
        const report = (getProgressReport(record) || "").replace(/\s+/g, " ").trim();
        if (report.length <= maxChars) return report;
        return `${report.slice(0, maxChars)}...`;
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
                const age = record.age || "";
                const gender = record.gender ? record.gender.charAt(0).toUpperCase() : "";
                const agetype = record.agetype || "";
                return age ? `${age} ${agetype}(${gender})` : "";
            },
        },
        {
            Header: "Progress Report",
            accessor: "progress_report",
            Cell: ({ row }) => {
                const fullReport = getProgressReport(row.original);
                return (
                    <div
                        title={fullReport || "-"}
                        style={{
                            maxWidth: 320,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            lineHeight: 1.35,
                        }}
                    >
                        {getProgressPreview(row.original)}
                    </div>
                );
            },
        },
        { Header: "Record Type", accessor: "record_type" },
        {
            Header: "Consultation By",
            accessor: "consultationby",
            Cell: ({ row }) => getConsultantName(row.original),
        },
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
            }} size="xl" scrollable>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title as="div" className="w-100">
                        <div className="border rounded-4 p-4 bg-body-tertiary">
                            <div className="text-uppercase text-muted small fw-semibold mb-2">Clinical Record Review</div>
                            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
                                <div>
                                    <h4 className="fw-bold mb-1 text-dark">Consultation Record Details</h4>
                                    <div className="text-muted small">Review the patient context and the submitted progress report in one structured view.</div>
                                </div>
                                {selectedRecord ? (
                                    <div className="d-flex flex-wrap gap-2">
                                        <span className="badge rounded-pill text-bg-info px-3 py-2">{selectedRecord.record_type || 'Consultation'}</span>
                                        <span className="badge rounded-pill text-bg-light text-dark border px-3 py-2">{formatDate(selectedRecord.created_at)}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-3">
                    {selectedRecord && (
                        <div className="container-fluid px-0">
                            <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                    <div className="border rounded-4 p-3 h-100 bg-white">
                                        <div className="text-uppercase text-muted small fw-semibold mb-2">Patient</div>
                                        <div className="fw-bold text-dark mb-1">{`${selectedRecord.designation ? `${selectedRecord.designation} ` : ''}${selectedRecord.firstname || ''} ${selectedRecord.middlename || ''} ${selectedRecord.lastname || ''}`.replace(/\s+/g, ' ').trim() || '-'}</div>
                                        <div className="text-muted small">{selectedRecord.fullpatientid || '-'}</div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="border rounded-4 p-3 h-100 bg-white">
                                        <div className="text-uppercase text-muted small fw-semibold mb-2">Consultation By</div>
                                        <div className="fw-bold text-dark mb-1">{getConsultantName(selectedRecord)}</div>
                                        <div className="text-muted small">Recorded clinician</div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="border rounded-4 p-3 h-100 bg-white">
                                        <div className="text-uppercase text-muted small fw-semibold mb-2">Recorded On</div>
                                        <div className="fw-bold text-dark mb-1">{formatDate(selectedRecord.created_at)}</div>
                                        <div className="text-muted small">Source consultation timestamp</div>
                                    </div>
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-lg-6">
                                    <div className="border rounded-4 p-3 p-md-4 h-100 bg-white shadow-sm">
                                        <h6 className="fw-bold mb-3">Demographics</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm align-middle mb-0">
                                                <tbody>
                                                    {[
                                                        { key: "fullpatientid", label: "Patient ID" },
                                                        { key: "designation", label: "Designation" },
                                                        { key: "firstname", label: "First Name" },
                                                        { key: "middlename", label: "Middle Name" },
                                                        { key: "lastname", label: "Last Name" },
                                                        { key: "age", label: "Age" },
                                                        { key: "agetype", label: "Age Type" },
                                                        { key: "gender", label: "Gender" },
                                                        { key: "marital_status", label: "Marital Status" },
                                                        { key: "occupation", label: "Occupation" },
                                                        { key: "mobile_number", label: "Mobile Number" },
                                                        { key: "email", label: "Email" },
                                                        { key: "organization", label: "Organization" },
                                                        { key: "contactpointer", label: "Contact Pointer" },
                                                        { key: "whatAppcontact", label: "WhatsApp Contact" },
                                                        { key: "relativecontactname", label: "Relative Contact Name" },
                                                        { key: "relativecontactnumber", label: "Relative Contact Number" },
                                                    ].map((col) => (
                                                        <tr key={col.key}>
                                                            <td className="text-muted small fw-semibold" style={{ width: '42%' }}>{col.label}</td>
                                                            <td className="text-dark">{selectedRecord[col.key] ?? "-"}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-lg-6">
                                    <div className="p-3 p-md-4 h-100 border rounded-4 bg-white shadow-sm">
                                        <h6 className="fw-bold mb-3">Progress Report</h6>
                                        <pre
                                            className="mb-0 text-wrap rounded-4 bg-body-tertiary p-3 p-md-4 border"
                                            style={{
                                                whiteSpace: "pre-wrap",
                                                wordBreak: "break-word",
                                                overflowWrap: "anywhere",
                                                maxHeight: "45vh",
                                                overflowY: "auto",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            {getProgressReport(selectedRecord) || "-"}
                                        </pre>
                                        <div className="mt-3 border rounded-4 bg-body-tertiary p-3">
                                            <small className="text-muted d-block text-uppercase fw-semibold mb-1">Clinical Note Summary</small>
                                            <div className="fw-semibold text-dark">{truncateWords(getProgressReport(selectedRecord) || '-', 24)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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