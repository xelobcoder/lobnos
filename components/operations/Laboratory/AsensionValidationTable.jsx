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
	const { isLoading, collection, queryParams, setCollection ,category='ungrouped'} = useLaboratoryContext();
	const router = useRouter();
	const isMobile = useMediaQuery({ maxWidth: 768 });
	const [isValidationModalOpened, setIsValidationModalOpened] = useState(false);
	const [selectedAscension, setSelectedAscension] = useState(null);
	const [visibleTimelines, setVisibleTimelines] = useState({});
	const { branchid } = useApplication();
	const [selectedRows, setSelectedRows] = useState(new Set());
	const [isBulkValidating, setIsBulkValidating] = useState(false);
	const { settings } = useApplication();
	const [groupByPatient, setGroupByPatient] = useState(category === 'grouped');

	const viewResultHandler = (item) => {
		printResultNavigator(router, item.billingid, { ...item, testid: item.id }, true);
	};

	const handleActionClick = (doc) => {
		if (Array.isArray(doc) && doc.length > 0) {
			const filterPaidCollection = doc.filter(item => Number(settings?.allowValidationUpaid) === 1 || String(item.paymentstatus || '').trim().toLowerCase() === 'paid');
			if (filterPaidCollection.length === 0) {
				alert('No tests available for validation. Please ensure at least one test is paid or unpaid test validation is allowed in settings.');
				return;
			}
			setSelectedAscension(filterPaidCollection);
			setIsBulkValidating(true);
			setIsValidationModalOpened(true);
			return;
		}


		if (!Array.isArray(doc) && doc) {
			setSelectedAscension(doc);
			setIsBulkValidating(false);
			setIsValidationModalOpened(true);
		}
	};


	const handleCloseModal = (ascensionid) => {
		setIsValidationModalOpened(false);
		setSelectedAscension(null);
		setIsBulkValidating(false);
		if (Array.isArray(ascensionid)) {
			const updatedCollection = collection.filter(item => {
				return !ascensionid.includes(item.ascensionid);
			});
			setCollection(updatedCollection);
		} else if (ascensionid) {
			const updatedCollection = collection.filter(item => item.ascensionid !== ascensionid);
			setCollection(updatedCollection);
		} else {
			// No action needed if null
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
		const filterPaidCollection = collection.filter(item => Number(settings?.allowValidationUpaid) === 1 || String(item.paymentstatus || '').trim().toLowerCase() === 'paid');
		if (selectedRows.size === filterPaidCollection.length) {
			setSelectedRows(new Set());
		} else {
			setSelectedRows(new Set(filterPaidCollection.map(item => item.ascensionid)));
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
		{ Header: "Patient ID(Bill Id)", accessor: "fullpatientid", width: 60, Cell: ({ row }) => <div><strong>{row.original.fullpatientid || row.original.patientid}</strong><br />{row.original.billingid}</div> },
		{ Header: "Test Name", accessor: "name", width: 150, Cell: ({ value, row }) => <div>{value}{Number(row.original.requires_revalidation) === 1 && <span className="badge bg-warning text-dark d-block mt-1">Changed - revalidation required</span>}</div> },
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
			Header: "Payment Status", accessor: "paymentstatus", width: 80, Cell: ({ value }) => {
				let badgeClass = "bg-secondary";
				if (value === "paid") badgeClass = "text-success"
				else if (value === "pending") badgeClass = "text-dark";
				else if (value === "partial") badgeClass = "text-dark";
				return <span className={`${badgeClass} text-capitalize`}>{value}</span>;
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
						disabled={Number(settings?.allowValidationUpaid) !== 1 && String(row.original.paymentstatus || '').trim().toLowerCase() !== 'paid'}
						checked={selectedRows.has(row.original.ascensionid)}
						onChange={() => handleRowSelection(row.original.ascensionid)}
						style={{ cursor: 'pointer' }}
					/>
					<ActionDropdown
						allowValidationUpaid={settings?.allowValidationUpaid}
						paymentstatus={row.original.paymentstatus}
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
		// {
		// 	Header: 'Validators',
		// 	accessor: 'allValidators',
		// 	Cell: ({ row }) => (
		// 		<div className="list-group list-group-sm">
		// 			{row.original.allValidators && row.original.allValidators.map((validator, idx) => (
		// 				<span key={idx} className="list-group-item list-group-item-sm py-1 px-2 text-sm">
		// 					{validator.username}
		// 				</span>
		// 			))}
		// 		</div>
		// 	)
		// },
		{
			Header: 'Action',
			accessor: '',
			Cell: ({ row }) => (
				<button
					className="btn btn-sm btn-primary"
					onClick={() => handleActionClick(row.original.tests)}
				>
					View Details
				</button>
			)
		}
	];


	const urlparams = {
		_dateFrom: queryParams._dateFrom,
		searchString: queryParams.searchString,
		_dateEnd: queryParams._dateEnd,
		isUltrasound: queryParams.isUltrasound,
		employeeid, ascension_stage: 'VALIDATION',
		category: groupByPatient ? 'grouped' : 'ungrouped',
		billingid: queryParams.billingid,
		patientname: queryParams.patientname,
		patientid: queryParams.patientid,
		billingid: queryParams.billingid,
		ascensionid: queryParams.ascensionid
	}


	const handleServerSide = async (pagination) => {
		const response = await handleServerSideProcessingAscensionData(pagination);
		const { result, error } = response;
		if (Array.isArray(result) && !error && result.length > 0) {
			return { result: groupDataByPatient(result), error };
		} else if (Array.isArray(result) && !error) {
			return { result: [], error };
		} else {
			return { result, error };
		}
	}


	const groupedData = groupByPatient ? groupDataByPatient(collection) : collection;

	if (isLoading) return <div className="p-2 text-center heightedBorder bg-secondary-subtle">Loading...</div>;

	return (
		<div >
			<Tabs
				activeKey={groupByPatient ? "grouped" : "ungrouped"}
				onSelect={(k) => {
					setGroupByPatient(k === "grouped")
					const currenturl = `/operations/laboratory/validation?category=${k === "grouped" ? "grouped" : "ungrouped"}&employeeid=${employeeid}`;
					window.history.replaceState(null, '', currenturl);
				}}
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
				<PrimeTable
					column={groupedColumns}
					data={groupedData}
					serverSideFiltering={true}
					handleSeverSideProcessing={async (pagination) => {
						try {
							const { result } = await handleServerSideProcessingAscensionData(pagination)
							if (result && Array.isArray(result)) {
								setCollection(result);
								return {
									result: groupDataByPatient(result),
									error: false
								};

							}
							return { result: [], error: false };
						} catch (error) {
							return { result: [], error: true };
						}
					}}
					urlparams={{ ...urlparams, grouped: "grouped" }}
					rowStyling={{
						type: "custom",
						getRowStyle: (rowData) => {
							const status = rowData?.paymentstatus?.toLowerCase();
							if (status === "pending") {
								return { backgroundColor: "#f8d7da", color: "#842029" };
							}
							return {};
						}
					}}

				/>
			) : (
				<PrimeTable
					column={columns}
					data={collection}
					urlparams={urlparams}
					serverSideFiltering={true}
					handleSeverSideProcessing={handleServerSideProcessingAscensionData}
					rowStyling={{
						type: "custom",
						getRowStyle: (rowData) => {
							const status = rowData?.paymentstatus?.toLowerCase();
							if (status === "pending") {
								return { backgroundColor: "#f8d7da", color: "#842029" };
							}
							return {};
						}
					}}
				/>
			)}
			{isValidationModalOpened && (
				<ValidationModal show={isValidationModalOpened} onClose={handleCloseModal} selectedAscension={selectedAscension} isBulk={isBulkValidating} />
			)}
		</div>
	);
}
