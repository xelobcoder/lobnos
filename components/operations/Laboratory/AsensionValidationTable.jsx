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


export default function ValidationAscensionTable({ employeeid }) {
	const { isLoading, collection, queryParams, setCollection } = useLaboratoryContext();
	const router = useRouter();
	const isMobile = useMediaQuery({ maxWidth: 768 });
	const [isValidationModalOpened, setIsValidationModalOpened] = useState(false);
	const [selectedAscension, setSelectedAscension] = useState(null);
	const [visibleTimelines, setVisibleTimelines] = useState({});
	const { branchid } = useApplication();

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


	const onNavigate = (row) => {
		PrepareResultEntryHeader(row, false, branchid);
	}

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
				<ActionDropdown
					onValidate={() => handleActionClick(row.original)}
					onViewResult={() => viewResultHandler(row.original)}
					onNavigate={() => { onNavigate(row.original) }}
				/>
			),
		}
	];



	if (isLoading) return <div className="p-2 text-center heightedBorder bg-secondary-subtle">Loading...</div>;


	return (
		<div >
			<div className="d-flex justify-content-between">
				<button
					className="btn btn-light btn-sm"
					onClick={() => {
						const allSelected = rows.length === Object.keys(tableInstance.state.selectedRowIds).length;
						tableInstance.toggleAllRowsSelected(!allSelected);
					}}
					disabled={collection.length === 0}
				>
					{isMobile ? <RiCheckboxMultipleLine title="select and unselect all ascensions" size={16} /> : "Select All"}
				</button>
			</div>
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
			{isValidationModalOpened && (
				<ValidationModal show={isValidationModalOpened} onClose={handleCloseModal} selectedAscension={selectedAscension} />
			)}
		</div>
	);
}
