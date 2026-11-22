"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SampleAssessmentModal from '../accessories/SampleAssessmentModal/SampleAssessmentModal';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { handleServerSideProcessingSampleValidation } from '../serverActions/ActionFiltering';
import { RiInformationLine, RiCheckboxCircleLine, RiRefreshLine } from '@remixicon/react';
import { customFetch } from '../Auth/customFetch';
import dayjs from 'dayjs';
import DateFilterReusable from '../operations/Laboratory/ResuableFilter/DateFilterReusable';



export default function SampleValidationComponent() {
	const searchParams = useSearchParams();
	const today = new Date().toISOString().split('T')[0];
	const urlStartDate = searchParams.get('start_date') || today;
	const urlEndDate = searchParams.get('end_date') || today;
	const billingid = searchParams.get('billingid') || '';

	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [validationBypassed, setValidationBypassed] = useState(false);
	const [sortBy, setSortBy] = useState('DESC');
	const [showAssesModal, setShowAssesModal] = useState(false);
	const [target, setTarget] = useState(null);
	const [multiMode, setMultiMode] = useState(false);
	const [queryParams, setQueryParams] = useState({
		_dateFrom: urlStartDate,
		_dateEnd: urlEndDate
	});
	const [selectedItems, setSelectedItems] = useState([]);
	const [searchFilter, setSearchFilter] = useState('');
	const [dateFilter, setDateFilter] = useState(urlStartDate === today && urlEndDate === today ? 'Today' : 'Custom Range');

	useEffect(() => {
		setQueryParams(prev => ({ ...prev, _dateFrom: urlStartDate, _dateEnd: urlEndDate }));
		setDateFilter(urlStartDate === today && urlEndDate === today ? 'Today' : 'Custom Range');
	}, [urlStartDate, urlEndDate, today]);

	useEffect(() => {
		const loadInitialData = async () => {
			setLoading(true);
			try {
				let url = billingid ? `sample/client/list/unvalidated?billingid=${billingid}&&count=10&page=1&sortby=DESC` : `sample/client/list/unvalidated?count=10&page=1&sortby=DESC`;
				if (urlStartDate && !billingid) url += `&startDate=${urlStartDate}`;
				if (urlEndDate && !billingid) url += `&endDate=${urlEndDate}`;
				const fetchResponse = await customFetch(url);
				const { result } = fetchResponse;
				const bypassed = fetchResponse?.workflow?.sampleValidation === 'bypassed';
				setValidationBypassed(bypassed);
				if (bypassed) {
					setData([]);
					setSelectedItems([]);
				} else if (result && Array.isArray(result)) {
					setData(result);
				}
			} catch (error) {
				console.error('Error loading initial data:', error);
			} finally {
				setLoading(false);
			}
		};
		loadInitialData();
	}, []);

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
			if (queryParams._dateFrom) url += `&startDate=${queryParams._dateFrom}`;
			if (queryParams._dateEnd) url += `&endDate=${queryParams._dateEnd}`;
			if (searchFilter) url += `&searchString=${encodeURIComponent(searchFilter)}`;
			const fetchResponse = await customFetch(url);
			const { result } = fetchResponse;
			const bypassed = fetchResponse?.workflow?.sampleValidation === 'bypassed';
			setValidationBypassed(bypassed);
			if (bypassed) {
				setData([]);
				setSelectedItems([]);
			} else if (Array.isArray(result)) {
				setData(result);
				setSelectedItems([]);
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
					ref={node => { if (node) node.indeterminate = selectedItems.length > 0 && selectedItems.length < data.length; }}
                    aria-label="Select all samples"
                    aria-checked={selectedItems.length > 0 && selectedItems.length < data.length ? "mixed" : data.length > 0 && selectedItems.length === data.length}
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
				return <div className="text-nowrap">{dayjs(value).format('DD-MM-YYYY hh:mm:ss')}</div>;
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
			Cell: function ({ row }) {
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
			<header className="card border-0 shadow-sm mb-3">
				<div className="card-body d-flex flex-wrap align-items-center gap-3 p-3 p-lg-4">
					<div className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
						<RiInformationLine size={24} />
					</div>
					<div className="me-auto">
						<h1 className="h5 fw-bold mb-1">Sample validation</h1>
						<p className="text-muted mb-0">Review collected specimens for suitability before laboratory processing.</p>
					</div>
					<div className={`badge rounded-pill px-3 py-2 ${validationBypassed ? 'text-bg-secondary' : 'text-bg-primary'}`} aria-live="polite">
						{validationBypassed ? 'Stage bypassed' : `${data.length} pending case${data.length === 1 ? '' : 's'}`}
					</div>
				</div>
			</header>

			{validationBypassed ? (
				<div className="alert alert-info border-0 shadow-sm d-flex align-items-start gap-2" role="status">
					<RiInformationLine className="mt-1 flex-shrink-0" />
					<div><strong>Sample validation is bypassed.</strong><div>No samples need assessment under the current facility workflow configuration.</div></div>
				</div>
			) : <>
				{selectedItems.length > 0 && (
					<div className="alert alert-primary d-flex flex-wrap align-items-center gap-3 mb-3">
						<strong>{selectedItems.length} case{selectedItems.length === 1 ? '' : 's'} selected</strong>
						<button className="btn btn-success btn-sm d-flex align-items-center gap-1" onClick={() => { setTarget(selectedItems); openModal(null, true); }}>
							<RiCheckboxCircleLine className="me-1" /> Review selected
						</button>
					</div>
				)}

				<section className="card border-0 shadow-sm mb-3">
					<div className="card-body p-3 p-lg-4">
						<div className="row g-3 align-items-end">
							<div className="col-12 col-lg-3">
								<label htmlFor="sample-validation-date-range" className="form-label small fw-semibold">Date range</label>
								<DateFilterReusable
									id="sample-validation-date-range"
									value={dateFilter}
									onChange={setDateFilter}
									startDate={queryParams._dateFrom}
									endDate={queryParams._dateEnd}
									onDateRangeChange={(startDate, endDate) => setQueryParams(prev => ({ ...prev, _dateFrom: startDate, _dateEnd: endDate }))}
									label="Choose date range"
									className="w-100"
								/>
							</div>
							<div className="col-12 col-lg">
								<label htmlFor="sample-validation-search" className="form-label small fw-semibold">Find a patient or billing</label>
								<input id="sample-validation-search" type="search" className="form-control" placeholder="Patient name or billing ID" value={searchFilter} onChange={(event) => setSearchFilter(event.target.value)} />
							</div>
							<div className="col-12 col-md-5 col-lg-3">
								<label htmlFor="sample-validation-sort" className="form-label small fw-semibold">Sort cases</label>
								<select id="sample-validation-sort" className="form-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
									<option value="DESC">Newest first</option>
									<option value="ASC">Oldest first</option>
								</select>
							</div>
							<div className="col-12 col-md-auto d-flex gap-2">
								<button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleLoadData} disabled={loading}>
									{loading ? <span className="spinner-border spinner-border-sm" role="status" /> : <RiRefreshLine />}
									{loading ? 'Loading' : 'Apply filters'}
								</button>
								<button className="btn btn-outline-secondary" onClick={() => { setQueryParams(prev => ({ ...prev, _dateFrom: '', _dateEnd: '' })); setSearchFilter(''); }} disabled={loading || (!queryParams._dateFrom && !queryParams._dateEnd && !searchFilter)} title="Clear filters">
									Clear
								</button>
							</div>
						</div>
					</div>
				</section>

				{data.length > 0 && (
					<div className="alert alert-light border d-flex align-items-start gap-2 mb-3">
						<RiInformationLine className="mt-1" />
						<div><strong>Before approving:</strong> inspect the physical specimen and confirm it is suitable for the linked tests.</div>
					</div>
				)}

				<section className="card border-0 shadow-sm">
					<div className="card-body p-2 p-lg-3">
						{loading ? (
							<div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading</span></div></div>
						) : data.length === 0 ? (
							<div className="text-center py-5">
								<RiCheckboxCircleLine size={42} className="text-success mb-2" />
								<h2 className="h6 fw-bold">No specimens awaiting review</h2>
								<p className="text-muted mb-0">Try a different date range or search term, or refresh the worklist.</p>
							</div>
						) : (
							<PrimeTable
								column={columns}
								handleSeverSideProcessing={handleServerSideProcessingSampleValidation}
								data={data}
								filtering={false}
								urlparams={{ ...queryParams, sortBy, searchString: searchFilter, billingid }}
								serverSideFiltering={true}
								className="table-striped table-hover align-middle"
							/>
						)}
					</div>
				</section>
			</>}

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