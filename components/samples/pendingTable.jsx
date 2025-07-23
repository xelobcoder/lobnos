"use client";

import React, { useState, useEffect } from 'react';
import SampleAssessmentModal from '../accessories/SampleAssessmentModal/SampleAssessmentModal';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { handleServerSideProcessingSampleValidation } from '../serverActions/ActionFiltering';
import { RiInformationLine, RiCheckboxCircleLine, RiCalendarLine, RiRefreshLine } from '@remixicon/react';
import { customFetch } from '../Auth/customFetch';



export default function SampleValidationComponent({ data: initialData, initialStartDate = '', initialEndDate = '', removeClient }) {
	const [data, setData] = useState(initialData);
	const [loading, setLoading] = useState(false);
	const [sortBy, setSortBy] = useState('DESC');
	const [showAssesModal, setShowAssesModal] = useState(false);
	const [target, setTarget] = useState(null);
	const [multiMode, setMultiMode] = useState(false);
	const [startDate, setStartDate] = useState(initialStartDate);
	const [endDate, setEndDate] = useState(initialEndDate);
	const [selectedItems, setSelectedItems] = useState([]);


	const removeClientFromList = (id) => {
		if (!id) return;
		setLoading(true);
		setData((prev) => prev.filter((item) => item.billingid !== id));
		setLoading(false);
	};

	const handleMultiProcessComplete = (processedIds) => {
		setSelectedItems(prev => prev.filter(id => !processedIds.includes(id)));
		setData(prev => prev.filter(item => !processedIds.includes(item.billingid)));
	};

	const openModal = (ev, multi = false) => {
		setMultiMode(multi);
		setShowAssesModal(true);
	};


	const closeModal = (ev) => {
		setShowAssesModal(false);
		setMultiMode(false);
		setTarget(null);
	};

	const handleLoadData = async () => {
		setLoading(true);
		try {
			let url = 'sample/client/list/unvalidated?count=10&page=1&&sortby=' + sortBy;
			if (startDate) url += `&startDate=${startDate}`;
			if (endDate) url += `&endDate=${endDate}`;
			const fetchResponse = await customFetch(url);
			const { result } = fetchResponse;
			if (result && Array.isArray(result) && result.length > 0) {
				setData(result);
				console.log('Successfully loaded data:', result.length, 'records');
			} else {
				console.log('No results returned from API');
			}
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setLoading(false);
		}
	};

	const columns = [
		{
			Header: (
				<input
					type="checkbox"
					checked={data.length > 0 && selectedItems.length === data.length}
					indeterminate={selectedItems.length > 0 && selectedItems.length < data.length}
					onChange={e => {
						if (e.target.checked) {
							setSelectedItems(data.map(item => item.billingid));
						} else {
							setSelectedItems([]);
						}
					}}
					title="Select All"
				/>
			),
			accessor: "select",
			Cell: ({ row }) => {
				const item = row.original;
				return (
					<input
						type="checkbox"
						checked={selectedItems.includes(item.billingid)}
						onChange={e => {
							if (e.target.checked) {
								setSelectedItems(prev => [...prev, item.billingid]);
							} else {
								setSelectedItems(prev => prev.filter(id => id !== item.billingid));
							}
						}}
					/>
				);
			},
			disableSortBy: true,
			width: 40,
		},
		{
			Header: "Billing Date",
			accessor: "date",
			Cell: function ({ value }) {
				return <div className="text-nowrap">{new Date(value).toLocaleDateString()}</div>;
			},
		},
		{
			Header: "Full Name",
			accessor: "fullname",
			Cell: function ({ value }) {
				return <div className="font-weight-medium">{value}</div>;
			}
		},
		{
			Header: "Billing ID",
			accessor: "billingid",
			Cell: function ({row}) {
				return <div className="text-monospace">
					<span className="text-muted">BillingId:{row.original.billingid}</span>
					<br />
					<span className="text-muted"> Ascensionid: ASC-{row.original.ascensionid} </span>
				</div>;
			}
		},
		{
			Header: "Action",
			accessor: "action",
			Cell: function ({ row }) {
				const item = row.original;
				return (
					<div className="d-flex ">
						<button
							className="btn btn-primary btn-sm d-flex align-items-center"
							onClick={(ev) => {
								setTarget(item?.billingid);
								openModal(ev, false);
							}}>
							<RiCheckboxCircleLine className="me-1" />
							Validate Sample
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="pls-color text-sm">
			{/* Open All Checked Button */}
			<div className="mb-2">
				{selectedItems.length > 0 && (
					<div className="d-flex gap-2 align-items-center">
						<button
							className="btn btn-success btn-sm d-flex align-items-center gap-1"
							onClick={() => {
								setTarget(selectedItems);
								openModal(null, true);
							}}
						>
							<RiCheckboxCircleLine className="me-1" />
							Process Selected ({selectedItems.length}) Items
						</button>
						<span className="text-muted small">
							{selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
						</span>
					</div>
				)}
			</div>
			<div className='d-flex justify-content-between align-items-center mb-3'>
				<div className="d-flex align-items-center">
					<h6 className="p-3 bg-light rounded-3 d-flex align-items-center mb-0">
						<RiInformationLine className="me-2" />
						Sample Validation
					</h6>
				</div>

				{/* Date Range Filter */}
				<div className="d-flex align-items-center gap-3">
					<RiCalendarLine className="text-muted" />
					<div className="d-flex align-items-center gap-2">
						<label className="form-label mb-0 text-muted small">From:</label>
						<input
							type="date"
							className="form-control form-control-sm"
							style={{ maxWidth: '150px' }}
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>
					<div className="d-flex align-items-center gap-2">
						<label className="form-label mb-0 text-muted small">To:</label>
						<input
							type="date"
							className="form-control form-control-sm"
							style={{ maxWidth: '150px' }}
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							min={startDate} 
						/>
					</div>
					<div>
						<select className='form-select form-select-sm' onChange={(e) => {
							const sortValue = e.target.value;
							setSortBy(sortValue);
						}} defaultValue="DESC">
							<option value="" disabled>Sort By</option>
							<option value="">Default</option>
							<option value="DESC">Sort by Date (Newest)</option>
							<option value="ASC">Sort by Date (Oldest)</option>
						</select>
					</div>
					<button
						className="btn btn-primary btn-sm d-flex align-items-center gap-1"
						onClick={handleLoadData}
						disabled={loading || (!startDate && !endDate)}
					>
						{loading ? (
							<>
								<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
								<span>Loading...</span>
							</>
						) : (
							<>
								<RiRefreshLine />
								<span>Load Data</span>
							</>
						)}
					</button>
					{(startDate || endDate) && (
						<button
							className="btn btn-outline-secondary btn-sm"
							onClick={() => {
								setStartDate('');
								setEndDate('');
							}}
							title="Clear date filters"
						>
							Clear
						</button>
					)}
				</div>
			</div>

			{data.length > 0 && (
				<div className="alert alert-info p-2 my-2 d-flex align-items-center">
					<RiInformationLine className="me-2" />
					<div>
						<strong>Note:</strong> Please check the sample before validating. Click on the assess button to view the sample.
					</div>
				</div>
			)}

			<div className="my-2">
				<section className="bg-white rounded-3 shadow-sm p-3">
					{loading ? (
						<div className="d-flex justify-content-center py-5">
							<div className="spinner-border text-primary" role="status">
								<span className="visually-hidden">Loading...</span>
							</div>
						</div>
					) : (
						<PrimeTable
							column={columns}
							handleSeverSideProcessing={handleServerSideProcessingSampleValidation}
							data={data}
							filtering={false}
							urlparams={{ startDate, endDate , sortBy }}
							serverSideFiltering={true}
							className="table-striped table-hover"
						/>
					)}
				</section>
			</div>

			<SampleAssessmentModal
				show={showAssesModal}
				hide={closeModal}
				billingid={target}
				removeClient={removeClientFromList}
				multiMode={multiMode}
				selectedItems={selectedItems}
				onMultiProcessComplete={handleMultiProcessComplete}
				data={data.filter(item => multiMode ? selectedItems.includes(item.billingid) : item.billingid === target)}
			/>
		</div>
	);
}