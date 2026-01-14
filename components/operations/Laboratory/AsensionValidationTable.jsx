import React, { useState } from "react";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { PrepareResultEntryHeader, printResultNavigator } from "../../Auth/customFetch";
import { useRouter } from "next/navigation";
import ActionDropdown from "./ActionAscensionTables";
import { useMediaQuery } from 'react-responsive';
import { RiCheckboxMultipleLine } from '@remixicon/react';
import ValidationModal from "./ValidationModal";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import moment from "moment";
import { useApplication } from "../../Auth/useApplicationContext";
import { Tabs, Tab } from 'react-bootstrap';


export default function ValidationAscensionTable({ employeeid }) {
	const { isLoading, collection, queryParams, setCollection } = useLaboratoryContext();
	const router = useRouter();
	const isMobile = useMediaQuery({ maxWidth: 768 });
	const [isValidationModalOpened, setIsValidationModalOpened] = useState(false);
	const [selectedAscension, setSelectedAscension] = useState(null);
	const [visibleTimelines, setVisibleTimelines] = useState({});
	const { branchid } = useApplication();
	const [selectedRows, setSelectedRows] = useState(new Set());
	const [isBulkValidating, setIsBulkValidating] = useState(false);
	const [groupByPatient, setGroupByPatient] = useState(true);

	const viewResultHandler = (item) => {
		printResultNavigator(router, item.billingid, { ...item, testid: item.id }, true);
	};

	const handleActionClick = (doc) => {
		setSelectedAscension(doc);
		setIsValidationModalOpened(true);
	};

	const handleCloseModal = (ascensionid) => {
		setIsValidationModalOpened(false);
		setSelectedAscension(null);
		if (ascensionid) {
			const prev = collection.filter((item, index) => item.ascensionid != ascensionid)
			setCollection(prev);
		}
	};

	const handleRowSelection = (ascensionid) => {
		setSelectedRows(prev => {
			const newSet = new Set(prev);
			if (newSet.has(ascensionid)) {
				newSet.delete(ascensionid);
			} else {
				newSet.add(ascensionid);
			}
			return newSet;
		});
	};

	const handleSelectAll = () => {
		if (selectedRows.size === collection.length) {
			setSelectedRows(new Set());
		} else {
			setSelectedRows(new Set(collection.map(item => item.ascensionid)));
		}
	};

	const handleBulkValidate = () => {
		if (selectedRows.size === 0) {
			alert('Please select at least one test to validate');
			return;
		}
		const selectedAscensions = collection.filter(item => selectedRows.has(item.ascensionid));
		setSelectedAscension(selectedAscensions);
		setIsBulkValidating(true);
		setIsValidationModalOpened(true);
	};


	const onNavigate = (row) => {
		PrepareResultEntryHeader(row, false, branchid);
	}

	// Group data by patient ID and billing ID
	const groupDataByPatient = (data) => {
		const grouped = {};
		data.forEach(item => {
			const key = `${item.fullpatientid || item.patientid}_${item.billingid}`;
			if (!grouped[key]) {
				grouped[key] = {
					patientid: item.patientid,
					fullpatientid: item.fullpatientid,
					fullname: item.fullname,
					age: item.age,
					billingid: item.billingid,
					tests: [],
					allValidators: new Set()
				};
			}
			grouped[key].tests.push(item);
			if (item.validators && Array.isArray(item.validators)) {
				item.validators.forEach(v => grouped[key].allValidators.add(JSON.stringify(v)));
			}
		});

		return Object.values(grouped).map(group => ({
			...group,
			allValidators: Array.from(group.allValidators).map(v => JSON.parse(v))
		}));
	};

	const columns = [
		{ Header: "Fullname", accessor: "fullname", width: 150, Cell: ({ value, row }) => <div className="text-uppercase">{value}<br />{row.original.age}</div> },
		{ Header: "Patient ID", accessor: "fullpatientid", width: 60 },
		{ Header: "Test Name", accessor: "name", width: 150 },
		{
			Header: "Processing", accessor: "processing", width: 150,
			Cell: ({ row }) => (
				<div className="list-group p-0 bg-secondary-subtle">
					<span className="list-group-item p-0" key={`proc-start-${row.original.patientid}`}>
						{moment(row.original.processingStartDate).format("LLLL")}
					</span>
					<span className="list-group-item p-0" key={`proc-end-${row.original.patientid}`}>
						{moment(row.original.processingEndDate).format("LLLL")}
					</span>
				</div>
			)
		},
		{ Header: "Department", accessor: "department", width: 120 },
		{ Header: "Clinician", accessor: "clinicianName", width: 120, Cell: ({ value }) => value ? value : <span className="text-muted">N/A</span> },
		{
			Header: "Status", accessor: "paymentstatus", width: 80, Cell: ({ value }) => {
				let badgeClass = "badge bg-secondary";
				if (value === "paid") badgeClass = "badge bg-success";
				else if (value === "pending") badgeClass = "badge bg-warning text-dark";
				else if (value === "partial") badgeClass = "badge bg-info text-dark";
				return <span className={badgeClass}>{value}</span>;
			}
		},
		{
			Header: "Results",
			accessor: "results",
			width: 150,
			Cell: ({ row }) => (
				<div className="list-group p-0 bg-secondary-subtle">
					<span className="list-group-item p-0" key={`start-${row.original.patientid}`}>
						{moment(row.original.resultEntryStart).format("LLLL")}
					</span>
					<span className="list-group-item p-0" key={`end-${row.original.patientid}`}>
						{moment(row.original.resultEntryEnd).format("LLLL")}
					</span>
				</div>
			),
		},
		{
			Header: "Action",
			accessor: "action",
			width: 50,
			Cell: ({ row }) => (
				<div className="d-flex align-items-center gap-2">
					<input
						type="checkbox"
						checked={selectedRows.has(row.original.ascensionid)}
						onChange={() => handleRowSelection(row.original.ascensionid)}
						style={{ cursor: 'pointer' }}
					/>
					<ActionDropdown
						onValidate={() => handleActionClick(row.original)}
						onViewResult={() => viewResultHandler(row.original)}
						onNavigate={() => { onNavigate(row.original) }}
					/>
				</div>
			),
		}
	];

	// Grouped columns
	const groupedColumns = [
		{
			Header: 'Patient ID',
			accessor: 'fullpatientid',
			Cell: ({ row }) => <strong>{row.original.fullpatientid || row.original.patientid}</strong>
		},
		{
			Header: 'Full Name',
			accessor: 'fullname',
			Cell: ({ row }) => <div className='text-uppercase'><strong>{row.original.fullname}</strong><br />{row.original.age}</div>
		},
		{
			Header: 'Billing ID',
			accessor: 'billingid'
		},
		{
			Header: 'Tests',
			accessor: 'tests',
			Cell: ({ row }) => (
				<span className="">{row.original.tests?.length || 0} test{(row.original.tests?.length || 0) !== 1 ? 's' : ''}</span>
			)
		},
		{
			Header: 'Validators',
			accessor: 'allValidators',
			Cell: ({ row }) => (
				<div className="list-group list-group-sm">
					{row.original.allValidators && row.original.allValidators.map((validator, idx) => (
						<span key={idx} className="list-group-item list-group-item-sm py-1 px-2 text-sm">
							{validator.username}
						</span>
					))}
				</div>
			)
		},
		{
			Header: 'Action',
			accessor: '',
			Cell: ({ row }) => (
				<button
					className="btn btn-sm btn-primary"
					onClick={() => handleActionClick(row.original.tests[0])}
				>
					View Details
				</button>
			)
		}
	];

	const groupedData = groupByPatient ? groupDataByPatient(collection) : collection;

	if (isLoading) return <div className="p-2 text-center heightedBorder bg-secondary-subtle">Loading...</div>;

	return (
		<div >
			<Tabs
				activeKey={groupByPatient ? "grouped" : "ungrouped"}
				onSelect={(k) => setGroupByPatient(k === "grouped")}
				className="mb-3"
			>
				<Tab eventKey="grouped" title={`Grouped View (${groupByPatient ? groupedData.length : 0})`} />
				<Tab eventKey="ungrouped" title={`Individual Records (${!groupByPatient ? collection.length : 0})`} />
			</Tabs>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div className="d-flex gap-2">
					<button
						className="btn btn-light btn-sm"
						onClick={handleSelectAll}
						disabled={collection.length === 0}
						title={selectedRows.size === collection.length ? "Deselect all" : "Select all"}
					>
						{isMobile ? <RiCheckboxMultipleLine title="select and unselect all ascensions" size={16} /> : (selectedRows.size === collection.length ? "Deselect All" : "Select All")}
					</button>
					{selectedRows.size > 0 && (
						<button
							className="btn btn-primary btn-sm"
							onClick={handleBulkValidate}
						>
							Validate All ({selectedRows.size})
						</button>
					)}
				</div>
				{selectedRows.size > 0 && (
					<span className="text-muted small">{selectedRows.size} of {collection.length} selected</span>
				)}
			</div>
			{groupByPatient ? (
				<PrimeTable column={groupedColumns} data={groupedData} />
			) : (
				<PrimeTable column={columns} data={collection}
					urlparams={{
						_dateFrom: queryParams._dateFrom,
						searchString: queryParams.searchString,
						_dateEnd: queryParams._dateEnd,
						isUltrasound: queryParams.isUltrasound,
						employeeid, ascension_stage: 'VALIDATION'
					}}
					serverSideFiltering={true}
					handleSeverSideProcessing={handleServerSideProcessingAscensionData}
				/>
			)}
			{isValidationModalOpened && (
				<ValidationModal show={isValidationModalOpened} onClose={handleCloseModal} selectedAscension={selectedAscension} isBulk={isBulkValidating} />
			)}
		</div>
	);
}
