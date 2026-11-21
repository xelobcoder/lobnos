"use client";
import {formatAnalyticTat} from "../../../lib/analyticTat";
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

        {Header:'Analytic TAT',accessor:'actualAnalyticTatMinutes',Cell:({value})=><strong>{formatAnalyticTat(value)}</strong>},
        {Header:'Analytic target',accessor:'analyticTatMinutes',Cell:({value})=>formatAnalyticTat(value)},
        {Header:'Status',accessor:'analyticTatExceeded',Cell:({value})=>value===null||value===undefined?'Not evaluated':value?'Exceeded':'Within target'},

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
					Analytic TAT
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
					<Modal.Title>Analytic TAT Summary</Modal.Title>
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
							<div className="mb-2 text-sm"><strong>Analytic TAT:</strong> {formatAnalyticTat(selectedRow.actualAnalyticTatMinutes)}</div>
							<div className="mb-2 text-sm"><strong>Analytic target:</strong> {formatAnalyticTat(selectedRow.analyticTatMinutes)}</div>
							<div className="mb-2 text-sm"><strong>Status:</strong> {selectedRow.analyticTatExceeded==null?'Not evaluated — processing timestamps or target are missing':selectedRow.analyticTatExceeded?`Exceeded by ${formatAnalyticTat(selectedRow.analyticTatExceededBy)}`:'Within target'}</div>
                            <p className="small text-muted">Analytic TAT measures processing start to processing end. Missing or bypassed processing is not reported as zero.</p>
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