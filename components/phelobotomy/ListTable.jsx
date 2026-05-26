import React, { useState } from "react";
import dayjs from "dayjs";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { handleSeverSideProcessingPhelobotomy } from "../serverActions/ActionFiltering";
import { RiInboxLine, RiTestTubeLine } from '@remixicon/react';
import { useApplication } from "../Auth/useApplicationContext";
import { customPost } from "../Auth/customFetch";

export default function ListTable({ data, handleCollectSample, filter, selectedItems = [], setSelectedItems, onToggleSelection }) {
	const isCompleteFlowDisabled = !(useApplication()?.settings?.completeFlow);
	const employeeid = useApplication()?.user?.employeeid;
	const branchid = useApplication()?.branchid;

	const [isBypassingMultiple, setIsBypassingMultiple] = useState(false);

	// Handle bypass for multiple selected items
	const handleMultipleByPass = async () => {
		if (selectedItems.length === 0) {
			alert("Please select at least one item to bypass.");
			return;
		}

		if (!employeeid) {
			alert("Employee ID is required.");
			return;
		}

		setIsBypassingMultiple(true);

		try {
			const dates = selectedItems.map(item => new Date(item.date));
			const earliestDate = new Date(Math.min(...dates)).toISOString().split('T')[0];


			const billingIds = selectedItems.map(item => item.billingid);
			const ascensionIds = selectedItems.map(item => item.ascensionid);

			const result = await customPost(`operations/ascension/bypass/mutiple/completeflow/bypass-multiple`, 'POST', {
				billingIds,
				employeeid
			});

			const { status, message } = result;

			if (status === 'success') {
				const firstItem = selectedItems[0];
				const newWindow = window.open(
					`/operations/laboratory/completed?patientid=${firstItem.patientid}&billingid=${firstItem.billingid}&isOpenSideBarShow=false&ascensionid=${ascensionIds.join(',')}`,
					'_blank',
					"width=1200,height=800,resizable,scrollbars"
				);

				setSelectedItems([]);
				window.close()
			} else {
				alert(message || "Failed to bypass the complete flow.");
			}
		} catch (error) {
			console.error("Bypass error:", error);
			alert("An error occurred while processing the bypass.");
		} finally {
			setIsBypassingMultiple(false);
		}
	};

	// Handle bypass for single row
	const handleSingleByPass = async (row) => {
		const billingid = row.billingid;
		if (!employeeid || !billingid) return;

		const result = await customPost(`operations/ascension/completeflow/bypass`, 'POST', {
			billingid,
			employeeid
		});

		const { status, message } = result;
		if (status === 'success') {
			const { date, billingid, patientid } = row;
			let newWindow = window.open(
				`/operations/laboratory/completed?patientid=${patientid}&billingid=${billingid}&start_date=${date}&end_date=${date}&isOpenSideBarShow=false`,
				'_blank',
				"width=1200,height=800,resizable,scrollbars"
			);
			window.close()
		} else {
			alert(message || "Failed to bypass the complete flow.");
		}
	};

	const columns = [
		{
			Header: "Select",
			accessor: "select",
			Cell: ({ row }) => (
				<input
					type="checkbox"
					checked={selectedItems.some(item => item.billingid === row.original.billingid)}
					onChange={() => onToggleSelection(row.original)}
				/>
			),
		},
		{
			Header:"PatientId/BillID",
			accessor: 'patientid',
			Cell: ({row}) => <div>{row.original.patientid}({row.original.billingid})</div>
		},
		{
			Header: "Date",
			accessor: "date",
			Cell: ({ value }) => dayjs(value).format('DD-MM-YYYY HH:mm:ss'),
		},
		{ Header: "Fullname", accessor: "fullname" },
		{ Header: "Age", accessor: "age" },
		{ Header: "Gender", accessor: "gender" },
		{
			Header: "Payment Status",
			accessor: "clientstatus",
			Cell: ({ value }) => (
				value === "urgent" ? (
					<span className="btn btn-danger btn-sm">{value}</span>
				) : (
					<div>{value}</div>
				)
			),
		},
		{
			Header: "Action",
			accessor: "action",
			Cell: ({ row }) => (
				<div className="d-flex gap-1">
					{isCompleteFlowDisabled && (
						<button
							onClick={() => handleSingleByPass(row.original)}
							className="btn btn-primary btn-sm btn"
						>
							<RiInboxLine size={16} />
							<span>By pass Complete Flow</span>
						</button>
					)}
					{!isCompleteFlowDisabled && (
						<button
							className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
							onClick={() => {
								handleCollectSample(
									row.original.billingid,
									row.original.patientid,
									row.original.fullname
								);
							}}
						>
							<RiTestTubeLine size={16} />
							<span>Pull Sample</span>
						</button>
					)}
				</div>
			),
		},
	];

	return (
		<div>
			{isCompleteFlowDisabled && selectedItems.length > 0 && (
				<div className="mb-3">
					<button
						className="btn btn-primary"
						onClick={handleMultipleByPass}
						disabled={isBypassingMultiple}
					>
						{isBypassingMultiple ? (
							<>
								<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
								Processing...
							</>
						) : (
							`By pass ${selectedItems.length} Selected Items`
						)}
					</button>
				</div>
			)}

			<PrimeTable
				column={columns}
				handleSeverSideProcessing={handleSeverSideProcessingPhelobotomy}
				data={data}
				urlparams={filter}
				filtering={false}
				serverSideFiltering={true}
			/>
		</div>
	);
}