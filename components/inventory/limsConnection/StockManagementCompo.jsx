'use client'
import React, { useState, useEffect } from "react";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import DocumentModal from "../../operations/Laboratory/DocumentInventoryDeductionLab";
import { Alert, Button } from "react-bootstrap";

import { RiEyeLine } from '@remixicon/react';
import dayjs from 'dayjs';
import { customFetch } from "../../Auth/customFetch";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import page from "../../../app/page";



export default function StockManagementCompo() {
	const { user, services } = useApplicationSettings().applicationsettings;
	const [data, setData] = useState([]);
	const [dateFrom, setDateFrom] = useState(dayjs().subtract(2, 'day').format('YYYY-MM-DD'));
	const [dateEnd, setDateEnd] = useState(dayjs().format('YYYY-MM-DD'));
	const employeeid = user?.employeeid;




	const fetchData = async (pagination) => {
		try {
			setIsLoading(true);
			const { page = 1, count = 10 } = pagination
			const result = await customFetch(
				`inventory/transactions/consumption/operations/direct?operationsStaging=COMPLETED` +
				`&&dateFrom=${dateFrom}` +
				`&&dateEnd=${dateEnd}` +
				`&&searchString=` +
				`&&page=${page}` +
				`&&count=${count}` +
				`&&isUltrasound=false` +
				`&&employeeid=${employeeid}`
			);
			if (result.success == true && Array.isArray(result?.data)) {
				setData(result.data);
				return { result: result.data, error: false };
			} else {
				setData([]);
				return { result: [], error: false };
			}
		} catch (err) {
			setData([]);
			console.error('Error fetching data:', err);
			return { result: [], error: true };
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData({ page: 1, count: 10 });
	}, []);

	const [isLoading, setIsLoading] = useState(true);
	const [queryParams, setQueryParams] = useState({
		_dateFrom: dateFrom,
		_dateEnd: dateEnd,
		searchString: '',
		page: 1,
		count: 10,
		isUltrasound: false,
	});

	const [showModal, setShowModal] = useState(false);
	const [selectedDoc, setSelectedDoc] = useState(null);
	const [viewMode, setViewMode] = useState('list');

	const columns = [
		{ Header: 'Asc. ID', accessor: 'ascensionid' },
		{ Header: 'Bill ID', accessor: 'billingid' },
		{ Header: 'Patient', accessor: 'fullname' },
		{ Header: 'Patient ID', accessor: 'fullpatientid' },
		{ Header: 'Age', accessor: 'age' },
		{ Header: 'Department', accessor: 'department' },
		{ Header: 'Test', accessor: 'name' },
		{ Header: 'Approval', accessor: 'approvalstatus', Cell: ({ value }) => (value === 1 ? 'Approved' : 'Pending') },
		{ Header: 'Consumption', accessor: 'consumption_status', Cell: ({ value }) => (value === 'completed' ? 'Completed' : value === 'pending' ? 'Pending' : (value || 'Unknown')) },
		{ Header: 'Billing Date', accessor: 'billing_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
		{ Header: 'Ascension Date', accessor: 'ascension_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
		{
			Header: 'Action',
			Cell: ({ row }) => (
				<span className="pointer" onClick={() => handleActionClick(row.original)} aria-label="View">
					<RiEyeLine size={18} />
				</span>
			),
		},
	];

	const handleActionClick = (doc) => {
		setSelectedDoc(doc);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedDoc(null);
	};


	return (
		<div>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div>
					<h5 className="mb-0">Stock Management</h5>
				</div>
				<div className="d-flex gap-2">
					<div className="btn-group btn-group-sm" role="group">
						<button
							type="button"
							className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
							onClick={() => setViewMode('list')}
						>
							List
						</button>
						<button
							type="button"
							className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
							onClick={() => setViewMode('table')}
						>
							Table
						</button>
					</div>
					<div className="d-flex gap-2 align-items-center">
						<label className="form-label mb-0 small">From:</label>
						<input
							id="date-from-picker"
							type="date"
							className='form-control-sm form-control'
							value={dateFrom}
							onChange={e => setDateFrom(e.target.value)}
						/>
						<label className="form-label mb-0 small">To:</label>
						<input
							id="date-end-picker"
							type="date"
							className='form-control-sm form-control'
							value={dateEnd}
							onChange={e => setDateEnd(e.target.value)}
						/>
					</div>
					<button className="btn btn-primary btn-sm" onClick={() => fetchData({ page: 1, count: 10 })}>
						Load
					</button>
				</div>
			</div>

			{viewMode === 'list' ? (
				<section className="position-relative" style={{ paddingLeft: '40px' }}>
					{isLoading ? (
						<div className="d-flex justify-content-center align-items-center py-5">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					) : (
						<>
							<div
								style={{
									position: 'absolute',
									left: '20px',
									top: '0',
									bottom: '0',
									width: '2px',
									background: 'linear-gradient(to bottom, #dee2e6 0%, #dee2e6 100%)'
								}}
							/>

							{data.map((item, index) => (
								<div key={item.ascensionid || index} className="mb-2 position-relative">
									<div
										style={{
											position: 'absolute',
											left: '-28px',
											top: '6px',
											width: '12px',
											height: '12px',
											borderRadius: '50%',
											backgroundColor: item.consumption_status === 'completed' ? '#198754' : item.consumption_status === 'pending' ? '#ffc107' : item.consumption_status === 'unknown-template' ? '#dc3545' : '#6c757d',
											border: '2px solid white',
											zIndex: 1
										}}
									/>

									<div className="bg-white border rounded p-2">
										<div className="d-flex justify-content-between align-items-start mb-1">
											<div>
												<h6 className="mb-0 fw-bold" style={{ fontSize: '0.95rem' }}>{item.fullname} - {item.fullpatientid}</h6>
												<small className="text-muted" style={{ fontSize: '0.75rem' }}>
													{item.billing_date ? new Date(item.billing_date).toLocaleString('en-US', {
														day: 'numeric',
														month: 'short',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit'
													}) : 'N/A'}
												</small>
											</div>
											<span
												className="pointer"
												onClick={() => handleActionClick(item)}
												aria-label="View"
											>
												<RiEyeLine size={18} />
											</span>
										</div>

										<p className="mb-1" style={{ fontSize: '0.8rem' }}>
											<span className="text-muted">Age:</span> {item.age} | <span className="text-muted">Asc:</span> {item.ascensionid} | <span className="text-muted">Bill:</span> {item.billingid} | <span className="text-muted">Dept:</span> {item.department} | <span className="text-muted">Test:</span> {item.name}
										</p>

										<div className="d-flex flex-wrap gap-2" style={{ fontSize: '0.75rem' }}>
											<span className="text-muted">
												Approval: {item.approvalstatus === 1 ? 'Approved' : 'Pending'}
											</span>
											<span className="text-muted">
												Consumption: {item.consumption_status === 'completed' ? 'Completed' : item.consumption_status === 'pending' ? 'Pending' : (item.consumption_status || 'Unknown')}
											</span>
										</div>
									</div>
								</div>
							))}
						</>
					)}
				</section>
			) : (
				<section>
					<PrimeTable
						column={columns}
						data={data}
						serverSideFiltering={true}
						handleSeverSideProcessing={fetchData}
						urlparams={{
							_dateFrom: dateFrom,
							searchString: queryParams.searchString,
							_dateEnd: dateEnd,
							isUltrasound: queryParams.isUltrasound,
							employeeid,
							ascension_stage: 'COMPLETED'
						}}
					/>
				</section>
			)}

			{selectedDoc && (
				<DocumentModal selectedDoc={selectedDoc} showModal={showModal} handleCloseModal={handleCloseModal} />
			)}
		</div>
	);
}
