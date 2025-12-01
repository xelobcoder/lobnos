'use client'



import { useEffect, useState } from "react";
import { customFetch, customFile, customPost } from "../../components/Auth/customFetch";
import { toast } from 'react-toastify';
import { RiMoreFill, RiAddLine, RiFileExcel2Line } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { Button, Dropdown, Modal } from "react-bootstrap";
import PrimeTable from "../../components/accessories/Datatables/PrimeTable";
import Link from "next/link";
import { useApplication } from "../../components/Auth/useApplicationContext";
import BasicInformationClinician from "../../components/Clinicians/BasicInformationClinician";


const ActionButtons = ({ original, onEdit, onView, onDelete }) => {
    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id={`dropdown-${original.id}`} style={{ zIndex: 9999, height: 'auto' }} size="sm">
                <RiMoreFill size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="m-0 p-0 bg-white">
                <Dropdown.Item className='text-capitalize' onClick={() => onEdit(original)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ marginRight: '8px' }}>
                        <path d="M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18.5858 17L16.7574 15.1716L18.1716 13.7574L22.4142 18L18.1716 22.2426L16.7574 20.8284L18.5858 19H15V17H18.5858Z"></path>
                    </svg>
                    Edit Details
                </Dropdown.Item>
                <Dropdown.Item className='text-capitalize' onClick={() => onView(original)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ marginRight: '8px' }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                    View Profile
                </Dropdown.Item>
                <Dropdown.Item className='text-capitalize'>
                    <Link href={`/clinicians/payment-information/${original.id}`} className="text-decoration-none text-dark d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ marginRight: '8px' }}>
                            <path d="M3.00488 3.00275H21.0049C21.5572 3.00275 22.0049 3.45046 22.0049 4.00275V20.0027C22.0049 20.555 21.5572 21.0027 21.0049 21.0027H3.00488C2.4526 21.0027 2.00488 20.555 2.00488 20.0027V4.00275C2.00488 3.45046 2.4526 3.00275 3.00488 3.00275ZM4.00488 5.00275V19.0027H20.0049V5.00275H4.00488ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.0027 10.0049 8.0027H11.0049V6.0027H13.0049V8.0027H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path>
                        </svg>
                        Payment Info
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item className='text-capitalize'>
                    <Link href={`/billing/billing-strategy/clinician/${original.id}/check`} className="text-decoration-none text-dark d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ marginRight: '8px' }}>
                            <path d="M21 4H7C5.89543 4 5 4.89543 5 6C5 7.10457 5.89543 8 7 8H21V21C21 21.5523 20.5523 22 20 22H7C4.79086 22 3 20.2091 3 18V6C3 3.79086 4.79086 2 7 2H20C20.5523 2 21 2.44772 21 3V4ZM5 18C5 19.1046 5.89543 20 7 20H19V10H7C6.27143 10 5.58835 9.80521 5 9.46487V18ZM20 7H7C6.44772 7 6 6.55228 6 6C6 5.44772 6.44772 5 7 5H20V7Z"></path>
                        </svg>
                        Special Billing
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item className='text-capitalize'>
                    <Link href={`/clinicians-analytics/${original.id}/overall`} className="text-decoration-none text-dark d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ marginRight: '8px' }}>
                            <path d="M19 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9V10ZM5 12V20H19V12H5ZM11 14H13V18H11V14ZM17 10V9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9V10H17Z"></path>
                        </svg>
                        View Analytics
                    </Link>
                </Dropdown.Item>
                <Dropdown.Item className='text-capitalize' onClick={() => onDelete(original)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" style={{ marginRight: '8px' }}>
                        <path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z"></path>
                    </svg>
                    Delete
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
};

type Clinician = {
    id: number;
    name: string;
    email: string;
    location: string;
    commission: number;
    phone: string;
    occupation: string;
    address: string;
    _showFinancialModal?: (row: any) => void;
};

const FinancialInfoModal = ({ show, onHide, data }) => (
    <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title>Financial Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {data ? (
                <div className="d-flex flex-column gap-2 text-sm">
                    <div className="border px-3 py-2"><strong>Identifier:</strong> {data.identifier || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Module:</strong> {data.module || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Momo Number:</strong> {data.momo || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Momo Name:</strong> {data.momoname || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Bank Name:</strong> {data.bankname || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Bank Branch:</strong> {data.bankbranch || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Account Number:</strong> {data.accountnumber || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Account Name:</strong> {data.accountname || 'N/A'}</div>
                    <div className="border px-3 py-2"><strong>Commission Rate:</strong> {data.commission != null ? `${data.commission}%` : 'N/A'}</div>
                </div>
            ) : <div>No data</div>}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="outline-secondary" onClick={onHide} size="sm">Close</Button>
        </Modal.Footer>
    </Modal>
);

export default function ClinicianList() {
    const [clinicianList, setClinician] = useState<Clinician[]>([]);
    const [pagination, setPagination] = useState({ page: 1, count: 10, show: false });
    const [loading, setLoading] = useState(false);
    const [showFinancialModal, setShowFinancialModal] = useState(false);
    const [financialModalData, setFinancialModalData] = useState(null);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    type ExcelPreview = {
        header: string[];
        data: any[];
        [key: string]: any;
    };
    const [excelPreview, setExcelPreview] = useState<ExcelPreview | null>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const role = useApplication().user.role;
    const isAdmin = role === 'admin' || role === 'superadmin';
    const router = useRouter();

    const getClinicianData = async () => {
        try {
            setLoading(true);
            const response = await customFetch(`clinicians?count=${pagination.count}&page=${pagination.page}&&role=${role}`)
            const { result, statusCode } = response;
            if (statusCode == 200 && result && Array.isArray(result)) {
                setClinician(result);
            } else {
                toast.error('Failed to fetch clinicians', {
                    position: 'top-right',
                    autoClose: 2000,
                });
            }
        } catch (err) {
            toast.error(err.message || 'Error connecting to server', {
                position: 'top-right',
                autoClose: 2000,
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        role && getClinicianData();
    }, []);

    const handleEdit = (original) => {
        const { id } = original;
        if (!id) return;
        router.push(`/clinicians/add-new?clinicianid=${id}`);
    };

    const handleView = (original) => {
        const { id } = original;
        if (!id) return;
        router.push(`/clinicians/clinicianview?clinicianid=${id}`);
    };

    const handleDelete = async (original: Clinician) => {
        const confirmation = confirm('Are you sure you want to delete this clinician?');

        if (!confirmation) return;
        const { id } = original;

        if (!id) return;

        try {
            const deleteResponse = await customPost('clinicians', 'DELETE', { id });
            const { statusCode, status, message } = deleteResponse;

            if (statusCode === 200 && status === 'success') {
                toast.success(message, { position: 'top-right', autoClose: 2000 });
                setClinician((prev) => prev.filter((item) => item.id !== id));
            } else {
                toast.error(message, { position: 'top-right', autoClose: 2000 });
            }
        } catch (err) {
            toast.error(err.message || 'Error connecting to server', {
                position: 'top-right',
                autoClose: 2000,
            });
        }
    };

    const handleExcelImport = () => {
        setShowExcelModal(true);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
            setExcelFile(file);
        } else {
            toast.error('Please select a valid Excel file (.xlsx or .xls)', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    const handleExcelUpload = async () => {
        if (!excelFile) {
            toast.error('Please select a file first', {
                position: 'top-right',
                autoClose: 2000,
            });
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('file', excelFile);
        formData.append('target', 'clinician');
        try {
            const response = await customFile('parse-excel', formData);
            if (response && response.header && response.data) {
                setExcelPreview(response);
                setSelectedRows([]); // Reset selected rows when new data is loaded
            } else {
                toast.error('Failed to parse Excel file', {
                    position: 'top-right',
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error('Error uploading file. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!excelPreview) return;
        const filteredData = excelPreview.data.filter((_, index) => !selectedRows.includes(index));

        if (filteredData.length === 0) {
            return toast.error('No data to import. Please unselect some rows or upload a different file.', {
                position: 'top-right',
                autoClose: 3000,
            });
        }

        setUploading(true);
        try {
            const saveResponse = await customPost('clinicians/bulk', 'POST', {
                data: filteredData,
            });

            if (saveResponse && (saveResponse.success || saveResponse.status === 'success' || saveResponse.status === true)) {
                toast.success(`Bulk registration complete! Success: ${saveResponse.successCount ?? saveResponse.total} / ${saveResponse.total ?? filteredData.length}`, {
                    position: 'top-right',
                    autoClose: 4000,
                });

                setShowExcelModal(false);
                setExcelPreview(null);
                setExcelFile(null);
                setSelectedRows([]);
                getClinicianData();
            } else if (saveResponse && (saveResponse.partialSuccess || saveResponse.failCount > 0)) {
                const errors = Array.isArray(saveResponse.results) ? saveResponse.results.slice(0, 5) : [];
                let msg = `Some records failed. Success: ${saveResponse.successCount ?? 0} / ${saveResponse.total ?? filteredData.length}`;
                if (errors.length > 0) {
                    msg += '\nExample errors:';
                    errors.forEach((err, i) => { msg += `\n${i + 1}. ${err}`; });
                }
                toast.error(msg, {
                    position: 'top-right',
                    autoClose: 8000,
                });
            } else {
                const errors = Array.isArray(saveResponse?.results) ? saveResponse.results.slice(0, 5) : [];
                let msg = saveResponse?.message || 'Bulk registration failed.';
                if (errors.length > 0) {
                    msg += '\nExample errors:';
                    errors.forEach((err, i) => { msg += `\n${i + 1}. ${err}`; });
                }
                toast.error(msg, {
                    position: 'top-right',
                    autoClose: 8000,
                });
            }
        } catch (err) {
            toast.error('Error saving clinicians. Please try again.', {
                position: 'top-right',
                autoClose: 3000,
            });
        } finally {
            setUploading(false);
        }
    };

    const updatePage = async (pagination) => {
        const { count, page } = pagination;
        if (!count || !page) return;

        try {
            const response = await customFetch(`clinicians?count=${count}&page=${page}`);
            const { result } = response;

            if (result && Array.isArray(result)) {
                return { result, error: false };
            }
        } catch (err) {
            return { result: [], error: err };
        }
    };

    const columnsMini = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Location', accessor: 'location' },
        {
            Header: 'Commission Rate',
            accessor: 'commission',
            Cell: ({ row }) => (
                <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success-subtle text-success-emphasis px-2 py-1">
                        {row.original?.commission}%
                    </span>
                </div>
            ),
        },
        { Header: 'Phone', accessor: 'phone' },
        { Header: 'Occupation', accessor: 'occupation' },
        { Header: 'Address', accessor: 'address' },
        {
            Header: 'Actions',
            accessor: '',
            Cell: ({ row }) => (
                <ActionButtons
                    original={row.original}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            ),
        },
    ];

    const handleShowFinancialModal = (clinician) => {
        setFinancialModalData(clinician);
        setShowFinancialModal(true);
    };

    const extendAdminView = [
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phone' },
        { Header: 'Location', accessor: 'location' },
        { Header: 'Address', accessor: 'address' },
        { Header: 'Occupation', accessor: 'occupation' },
        {
            Header: 'Financial Info',
            accessor: 'financial',
            disableSortBy: true,
            Cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="outline-info"
                    onClick={() => handleShowFinancialModal(row.original)}
                    className="d-flex align-items-center gap-1 px-2"
                >
                    Details
                </Button>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }) => (
                <ActionButtons
                    original={row.original}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                />
            ),
        },
    ];

    const columns = isAdmin ? extendAdminView : columnsMini;

    const handleRowSelect = (rowIndex: number) => {
        setSelectedRows(prev =>
            prev.includes(rowIndex)
                ? prev.filter(index => index !== rowIndex)
                : [...prev, rowIndex]
        );
    };

    const handleSelectAll = () => {
        if (!excelPreview) return;

        if (selectedRows.length === excelPreview.data.length) {
            // If all rows are selected, deselect all
            setSelectedRows([]);
        } else {
            // Select all rows
            setSelectedRows(excelPreview.data.map((_, index) => index));
        }
    };

    const handleRemoveSelected = () => {
        if (!excelPreview || selectedRows.length === 0) return;

        const newData = excelPreview.data.filter((_, index) => !selectedRows.includes(index));
        setExcelPreview({
            ...excelPreview,
            data: newData
        });
        setSelectedRows([]);
    };

    return (
        <>
            <div className="container-fluid">
                {loading ? (
                    <div className="p-5 text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <h6 className="text-muted">Loading clinician data...</h6>
                    </div>
                ) : (
                    <div>
                        <div className="bg-gradient-primary text-white py-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleExcelImport}
                                        className="d-flex align-items-center gap-2 fw-semibold"
                                    >
                                        <RiFileExcel2Line size={16} />
                                        Import Excel
                                    </Button>
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => setShowAddModal(true)}
                                        className="d-flex align-items-center gap-2 fw-semibold"
                                    >
                                        <RiAddLine size={18} />
                                        Add New Clinician
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-0">
                            <div className="table-responsive">
                                <PrimeTable
                                    column={columns}
                                    data={clinicianList}
                                    filtering={false}
                                    serverSideFiltering={true}
                                    handleSeverSideProcessing={updatePage}
                                />
                            </div>
                            <FinancialInfoModal
                                show={showFinancialModal}
                                onHide={() => setShowFinancialModal(false)}
                                data={financialModalData}
                            />
                            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} backdrop="static" keyboard={false} size="lg">
                                <Modal.Header closeButton>
                                    <Modal.Title className="d-flex align-items-center gap-2">
                                        <RiAddLine size={20} />
                                        Add New Clinician
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <BasicInformationClinician />
                                </Modal.Body>
                            </Modal>

                            <Modal show={showExcelModal} onHide={() => setShowExcelModal(false)} backdrop="static" keyboard={false} fullscreen>
                                <Modal.Header closeButton>
                                    <Modal.Title className="d-flex align-items-center gap-2">
                                        <RiFileExcel2Line size={20} />
                                        {excelPreview ? "Preview Imported Data" : "Import Clinicians from Excel"}
                                    </Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    {!excelPreview ? (
                                        <>
                                            <div className="mb-3">
                                                <label htmlFor="excelFile" className="form-label fw-semibold">
                                                    Choose Excel File
                                                </label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    id="excelFile"
                                                    accept=".xlsx,.xls"
                                                    onChange={handleFileSelect}
                                                />
                                                <div className="form-text">
                                                    Supported formats: .xlsx, .xls
                                                </div>
                                            </div>

                                            {excelFile && (
                                                <div className="alert alert-info">
                                                    <strong>Selected file:</strong> {excelFile.name}
                                                </div>
                                            )}

                                            <div className="alert alert-warning">
                                                <strong>Note:</strong> Make sure your Excel file has the following columns:
                                                <ul className="mb-0 mt-2">
                                                    <li>Name</li>
                                                    <li>Email</li>
                                                    <li>Phone</li>
                                                    <li>Location</li>
                                                    <li>Address</li>
                                                    <li>Occupation</li>
                                                    <li>Commission</li>
                                                </ul>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="mb-3">
                                                <strong>Review the data below. Click Confirm & Save to import, or Back to select a different file.</strong>
                                            </div>

                                            {excelPreview.data && excelPreview.data.length > 0 && (
                                                <div className="mb-3 d-flex gap-2 align-items-center">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={handleSelectAll}
                                                    >
                                                        {selectedRows.length === excelPreview.data.length ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                    {selectedRows.length > 0 && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={handleRemoveSelected}
                                                        >
                                                            Remove Selected ({selectedRows.length})
                                                        </button>
                                                    )}
                                                    <small className="text-muted">
                                                        {excelPreview.data.length} total rows
                                                    </small>
                                                </div>
                                            )}

                                            <div style={{ overflow: 'auto' }}>
                                                <table className="table table-bordered table-striped">
                                                    <thead className="table-dark">
                                                        <tr>
                                                            <th>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={excelPreview.data && selectedRows.length === excelPreview.data.length && excelPreview.data.length > 0}
                                                                    onChange={handleSelectAll}
                                                                />
                                                            </th>
                                                            {excelPreview.header && excelPreview.header.map((header, index) => (
                                                                <th key={index}>{header}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {excelPreview.data && excelPreview.data.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className={selectedRows.includes(rowIndex) ? 'table-warning' : ''}>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        checked={selectedRows.includes(rowIndex)}
                                                                        onChange={() => handleRowSelect(rowIndex)}
                                                                    />
                                                                </td>
                                                                {excelPreview.header && excelPreview.header.map((header, colIndex) => (
                                                                    <td key={colIndex} className="fw-medium">
                                                                        {row[header] || '-'}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            if (excelPreview) {
                                                setExcelPreview(null);
                                                setSelectedRows([]);
                                            } else {
                                                setShowExcelModal(false);
                                            }
                                        }}
                                        disabled={uploading}
                                        size="sm"
                                    >
                                        {excelPreview ? "Back" : "Cancel"}
                                    </Button>
                                    {!excelPreview ? (
                                        <Button
                                            variant="outline-primary"
                                            onClick={handleExcelUpload}
                                            disabled={!excelFile || uploading}
                                            size="sm"
                                        >
                                            {uploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Parsing...
                                                </>
                                            ) : (
                                                <>
                                                    <RiFileExcel2Line size={16} className="me-1" />
                                                    Parse & Preview
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline-primary"
                                            onClick={handleConfirmImport}
                                            disabled={uploading}
                                            size="sm"
                                        >
                                            {uploading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <RiFileExcel2Line size={16} className="me-1" />
                                                    Confirm & Save
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}