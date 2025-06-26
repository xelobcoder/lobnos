"use client";
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { handleServerTurnAroundTime } from '../../serverActions/ActionFiltering';
import moment from 'moment';
import { RiEyeLine, RiCheckboxCircleLine,  RiAccessibilityFill } from '@remixicon/react';

export default function TurnAroundDataTable({ data }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const handleRowClick = (row) => {
        setSelectedRow(row.original);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRow(null);
    };

    const columns = [
        { Header: "Billed On", accessor: "billedon" },
        { Header: "Ascension ID", accessor: "ascensionId" },
        { Header: "Test Name", accessor: "test" },
        { Header: "Patient Name", accessor: "patientName" },
        { Header: "Pre-TAT", accessor: "preTAT" },
        { Header: "Processing TAT", accessor: "processingTAT" },
        { Header: "Post-TAT", accessor: "postTAT" },
        { Header: "Total TAT", accessor: "totalTAT" },
        { Header: "Set Tat", accessor: "setTat" },
        { Header: "Set Pre Tat", accessor: "setPreTat" },
        { Header: "Set Post Tat", accessor: "setPostTat" },
        {
            Header: "Actions",
            accessor: "actions",
            Cell: ({ row }) => (
                <Button
                    variant="outline-primary"
                    className="btn btn-sm"
                    onClick={() => handleRowClick(row)}
                >
                    <RiEyeLine size={16} />
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="bg-secondary-subtle pls-color br-5 p-3">Turn Around Time</h1>
            <PrimeTable
                column={columns}
                data={data}
                handleSeverSideProcessing={handleServerTurnAroundTime}
                serverSideFiltering={true}
            />

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton className="pls-color bg-secondary-subtle">
                    <Modal.Title>Timeline for Ascension ID: {selectedRow?.ascensionId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRow && (
                        <div className="timeline pls-color">
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiCheckboxCircleLine className="text-success" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Billed On</h3>
                                                <small className="text-muted">
                                                    {selectedRow.billedon}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiCheckboxCircleLine className="text-success" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Collection Start</h3>
                                                <small className="text-muted">
                                                    {moment(selectedRow.collectionStartDate).format("YYYY-MM-DD HH:mm")}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiCheckboxCircleLine className="text-success" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Collection End</h3>
                                                <small className="text-muted">
                                                    {moment(selectedRow.collectionEndDate).format("YYYY-MM-DD HH:mm")}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiCheckboxCircleLine className="text-success" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Processing Start</h3>
                                                <small className="text-muted">
                                                    {moment(selectedRow.processingStartDate).format("YYYY-MM-DD HH:mm")}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiCheckboxCircleLine className="text-success" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Processing End</h3>
                                                <small className="text-muted">
                                                    {moment(selectedRow.processingEndDate).format("YYYY-MM-DD HH:mm")}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiAccessibilityFill className="text-primary" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Result Entry Start</h3>
                                                <small className="text-muted">
                                                    {selectedRow.resultEntryStart ? moment(selectedRow.resultEntryStart).format("YYYY-MM-DD HH:mm") : "N/A"}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="timeline-item position-relative mb-4">
                                <div className="d-flex">
                                    <div className="position-relative" style={{ zIndex: 1 }}>
                                        <div className="timeline-icon rounded-circle border bg-white d-flex align-items-center justify-content-center"
                                            style={{ width: '44px', height: '44px' }}>
                                            <RiAccessibilityFill className="text-primary" fontSize="medium" />
                                        </div>
                                    </div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="card">
                                            <div className="card-body">
                                                <h3 className="h6 mb-1">Result Entry End</h3>
                                                <small className="text-muted">
                                                    {selectedRow.resultEntryEnd ? moment(selectedRow.resultEntryEnd).format("YYYY-MM-DD HH:mm") : "N/A"}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
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
}