"use client";
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { handleServerTurnAroundTime } from '../../serverActions/ActionFiltering';
import moment from 'moment';
import { RiEyeLine, RiCheckboxCircleLine } from '@remixicon/react';
import { customFetch } from '../../Auth/customFetch';

export default function TurnAroundDataTable({ data: initialData }) {
	const [showModal, setShowModal] = useState(false);
	const [selectedRow, setSelectedRow] = useState(null);
	const [data, setData] = useState(initialData || []);
	const [sorting, setSorting] = useState('ASC');
	const [loading, setLoading] = useState(false);
	const [ascensionIdFilter, setAscensionIdFilter] = useState("");

	const handleRowClick = (row) => {
		setSelectedRow(row.original);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedRow(null);
	};

	const fetchSortedData = async (sortOrder) => {
		setLoading(true);
		try {
			const response = await customFetch(`testascension/tat-data?page=1&count=10&sortby=${sortOrder}`);
			if (response?.data && Array.isArray(response?.data)) {
				setData(response.data);
			}
		} catch (e) {
			console.error("Error fetching sorted data:", e);
		} finally {
			setLoading(false);
		}
	};

	const handleSortingChange = (e) => {
		const value = e.target.value;
		setSorting(value);
	};

	const handleAscensionIdFilter = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await customFetch(`testascension/tat-data?page=1&count=10&sortby=${sorting}&ascensionId=${ascensionIdFilter}`);
			if (response?.data && Array.isArray(response?.data)) {
				setData(response.data);
			}
		} catch (e) {
			console.error("Error filtering by Ascension ID:", e);
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		fetchSortedData(sorting);
	}, [sorting]);

	const columns = [
		{
			Header: "Client Info", accessor: "patientName", width: 150, Cell: ({ value, row }) => (
				<div className="fw-bold">
					<div><strong>{value}</strong></div>
					<div className="text-muted">AscensionId: {row.original.ascensionId}</div>
				</div>
			)
		},
		{
			Header: "Billed On/test", accessor: "billedon", width: 100, Cell: ({ value, row }) => {
				return (
					<div>
						<div className='fw-bold'>{row.original.test}</div>
						{/* <br/> */}
						({value ? moment(value).format("MMM DD, YYYY HH:mm") : "N/A"})
					</div>
				)
			}
		},

		{
			Header: "Collection Phase",
			accessor: "collections",
			width: 300,
			Cell: ({ row }) => {
				const data = row.original;
				const cs = data.collectionStartDate ? moment(data.collectionStartDate).format("DD/MM HH:mm") : "N/A";
				const ce = data.collectionEndDate ? moment(data.collectionEndDate).format("DD/MM HH:mm") : "N/A";
				const exceeded = data.preTATExceeded;
				const hasSetTat = data.setPreTat !== null && data.setPreTat !== undefined;
				return (
					<div className={`px-2 py-1 rounded-2 d-flex flex-column gap-1 ${exceeded ? 'bg-danger-subtle border border-danger' : hasSetTat ? 'bg-success-subtle border border-success' : 'bg-secondary-subtle border border-secondary'}`}
						style={{ fontSize: '0.95em', minHeight: 0 }}>
						<div className="d-flex justify-content-between align-items-center">
							<span className="text-muted">Start: <strong>{cs}</strong></span>
							<span className="text-muted">End: <strong>{ce}</strong></span>
						</div>
						<div className="d-flex justify-content-between align-items-center mt-1">
							<small><strong>TAT:</strong> {data.preTAT}</small>
							{!hasSetTat ? (
								<span className="badge bg-secondary text-white">No Limit</span>
							) : exceeded ? (
								<span className="badge bg-danger">+{data.preTatExceededBy}m</span>
							) : (
								<span className="badge bg-success">✓</span>
							)}
						</div>
					</div>
				);
			}
		},
		{
			Header: "Processing Phase",
			accessor: "processing",
			width: 300,
			Cell: ({ row }) => {
				const data = row.original;
				const ps = data.processingStartDate ? moment(data.processingStartDate).format("DD/MM HH:mm") : "N/A";
				const pe = data.processingEndDate ? moment(data.processingEndDate).format("DD/MM HH:mm") : "N/A";
				const exceeded = data.processingTATExceeded;
				const hasSetTat = data.setTat !== null && data.setTat !== undefined;
				return (
					<div className={`px-2 py-1 rounded-2 d-flex flex-column gap-1 ${exceeded ? 'bg-danger-subtle border border-danger' : hasSetTat ? 'bg-success-subtle border border-success' : 'bg-secondary-subtle border border-secondary'}`}
						style={{ fontSize: '0.95em', minHeight: 0 }}>
						<div className="d-flex justify-content-between align-items-center">
							<span className="text-muted">Start: <strong>{ps}</strong></span>
							<span className="text-muted">End: <strong>{pe}</strong></span>
						</div>
						<div className="d-flex justify-content-between align-items-center mt-1">
							<small><strong>TAT:</strong> {data.processingTAT}</small>
							{!hasSetTat ? (
								<span className="badge bg-secondary text-white">No Limit</span>
							) : exceeded ? (
								<span className="badge bg-danger">+{data.processingTatExceededBy}m</span>
							) : (
								<span className="badge bg-success">✓</span>
							)}
						</div>
					</div>
				);
			}
		},
		{
			Header: "Result Entry Phase",
			accessor: "resultEntry",
			width: 300,
			Cell: ({ row }) => {
				const data = row.original;
				const rs = data.resultEntryStart ? moment(data.resultEntryStart).format("DD/MM HH:mm") : "N/A";
				const re = data.resultEntryEnd ? moment(data.resultEntryEnd).format("DD/MM HH:mm") : "N/A";
				const exceeded = data.postTATExceeded;
				const hasSetTat = data.setPostTat !== null && data.setPostTat !== undefined;
				return (
					<div className={`px-2 py-1 rounded-2 d-flex flex-column gap-1 ${exceeded ? 'bg-danger-subtle border border-danger' : hasSetTat ? 'bg-success-subtle border border-success' : 'bg-secondary-subtle border border-secondary'}`}
						style={{ fontSize: '0.95em', minHeight: 0 }}>
						<div className="d-flex justify-content-between align-items-center">
							<span className="text-muted">Start: <strong>{rs}</strong></span>
							<span className="text-muted">End: <strong>{re}</strong></span>
						</div>
						<div className="d-flex justify-content-between align-items-center mt-1">
							<small><strong>TAT:</strong> {data.postTAT}</small>
							{!hasSetTat ? (
								<span className="badge bg-secondary text-white">No Limit</span>
							) : exceeded ? (
								<span className="badge bg-danger">+{data.postTatExceededBy}m</span>
							) : (
								<span className="badge bg-success">✓</span>
							)}
						</div>
					</div>
				);
			}
		},
		{
			Header: "Total TAT Summary",
			accessor: "totalTAT",
			width: 300,
			Cell: ({ row }) => {
				const data = row.original;
				const exceeded = data.tatExceeded;
				const hasSetTat = data.setTat !== null && data.setTat !== undefined;
				return (
					<div className={`px-2 py-1 rounded-2 d-flex flex-column gap-1 ${exceeded ? 'bg-danger-subtle border border-danger' : hasSetTat ? 'bg-success-subtle border border-success' : 'bg-secondary-subtle border border-secondary'}`}
						style={{ fontSize: '0.95em', minHeight: 0 }}>
						<div className="d-flex justify-content-between align-items-center">
							<span className="text-muted">Total:</span>
							<strong className="text-primary">{data.totalTAT}</strong>
						</div>
						<div className="d-flex justify-content-between align-items-center">
							<span className="text-muted">Limit:</span>
							<small>{hasSetTat ? `${data.setTat} min` : 'Not Set'}</small>
						</div>

					</div>
				);
			}
		},
		{
			Header: "Actions",
			accessor: "actions",
			width: 80,
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
			<div className="mb-4">
				<h1 className="border-bottom pb-3 mb-0" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#212529' }}>
					Turn Around Time
				</h1>
			</div>
			<form className="mb-3 d-flex align-items-center gap-2 flex-wrap" onSubmit={handleAscensionIdFilter}>
				<label htmlFor="ascensionIdInput" className="fw-bold mb-0">Filter by Ascension ID:</label>
				<input
					type="text"
					id="ascensionIdInput"
					className="form-control form-control-sm w-auto"
					placeholder="Enter Ascension ID"
					value={ascensionIdFilter}
					onChange={e => setAscensionIdFilter(e.target.value)}
				/>
				<button type="submit" className="btn btn-primary btn-sm">Filter</button>
				<button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setAscensionIdFilter(""); fetchSortedData(sorting); }}>Clear</button>
				<label className="fw-bold mb-0 ms-3">Sort:</label>
				<select className="form-select form-select-sm d-inline-block w-auto" value={sorting} onChange={handleSortingChange} disabled={loading}>
					<option value="ASC">Ascending</option>
					<option value="DESC">Descending</option>
				</select>
			</form>
			<PrimeTable
				column={columns}
				urlparams={{ sortby: sorting }}
				data={data}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleServerTurnAroundTime}
			/>

			<Modal show={showModal} onHide={handleCloseModal} >
				<Modal.Header closeButton className="bg-secondary-subtle">
					<Modal.Title>TAT Summary</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedRow && (
						<div >
							<div className='bg-secondary-subtle text-sm p-3 rounded-3 br-5'>
								<div className="mb-2"><strong>Test:</strong> {selectedRow.test}</div>
								<div className="mb-2"><strong>Patient:</strong> {selectedRow.patientName}</div>
								<div className="mb-2"><strong>Ascension ID:</strong> {selectedRow.ascensionId}</div>
								<div className="mb-2"><strong>Billed On:</strong> {selectedRow.billedon ? moment(selectedRow.billedon).format("MMM DD, YYYY HH:mm") : "N/A"}</div>
							</div>
							<hr />
							<div className="mb-2 text-sm"><strong>Total TAT:</strong> {selectedRow.totalTAT}</div>
							<div className="mb-2 text-sm"><strong>Set TAT Limit:</strong> {selectedRow.setTat ? `${selectedRow.setTat} min` : 'Not Set'}</div>
							<div className="mb-2 text-sm"><strong>Status:</strong> {!selectedRow.setTat ? (
								<span className="badge bg-secondary">No Limit</span>
							) : selectedRow.tatExceeded ? (
								<span className="badge bg-danger">Exceeded by {selectedRow.totalTatExceededBy}m</span>
							) : (
								<span className="badge bg-success">On Time</span>
							)}
							</div>
							{selectedRow.tatConsistencyWarning && (
								<div className="alert alert-warning mt-2 text-sm ">
									<strong>Warning:</strong> {selectedRow.tatConsistencyWarning}
								</div>
							)}
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