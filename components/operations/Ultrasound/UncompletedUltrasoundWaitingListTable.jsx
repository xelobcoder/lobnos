import React from "react";
import { Button } from 'react-bootstrap';
import { RiPrinterFill, RiDoorClosedFill } from '@remixicon/react';
import { useUltrasoundContext } from "./UltrasoundContext";
import { generateRandomTextAndNumbers, PrepareResultEntryHeader } from "../../Auth/customFetch";
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import Loader from '../../accessories/Loader';
import { useApplication } from "../../Auth/useApplicationContext";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import dayjs from 'dayjs';
import ImagingResultActions from "./ImagingResultActions";


export default function AscentionUltrasoundUnCompletedTable({ stage }) {
	const { isLoading, collection, queryParams } = useUltrasoundContext();
	const branchid = useApplication().branchid;
	const handlePrintResult = (row) => {
		let { billingid, name, id, patientid, ascensionid } = row;
		billingid = `${generateRandomTextAndNumbers(70)}${billingid}`;
		patientid = `${generateRandomTextAndNumbers(50)}${patientid}`;
		window.open(`/result/labreport/4?isScan=true&&csvid=${billingid}&&ptid=${patientid}&&target=70,50&&ascensionId=${ascensionid}&&testname=${name}&&testid=${id}&&isUltrasound=true&&isMultiple=false&&password&&is_password_encrypted=false&isOpenSideBarShow=false`, "_blank");
	};


	const columns = [
		{
			Header: 'Ascension Date',
			accessor: 'ascension_date',
			Cell: ({ value }) => (
				<div className="fw-bold">
					{dayjs(value).format('DD-MM-YY HH:mm:ss')}
				</div>
			),
			width: 100,
		},
		{
			Header: 'Patient Details',
			accessor: 'fullname',
			Cell: ({ row }) => (
				<div>
					<div className="text-uppercase fw-bold">
						{row.original.fullname}({row.original.age})
					</div>

					<div className="small">
						<strong>ID:</strong> {row.original.fullpatientid}
					</div>
				</div>
			),
			width: 180,
		},
		{
			Header: 'Test Information',
			accessor: 'name',
			Cell: ({ row }) => (
				<div>
					<div className="fw-bold">{row.original.name}</div>
					<div className="small text-muted">
						Bill ID: {row.original.billingid}
					</div>
					{row.original.organization && (
						<div className="small text-info">
							<strong>Org:</strong> {row.original.organization}
						</div>
					)}
				</div>
			),
			width: 150,
		},
		{
			Header: 'Payment Status',
			accessor: 'clientstatus',
			Cell: ({ value }) => <span className="fw-semibold">{value?.toUpperCase() || "Unknown"}</span>,
			width: 100,
		},
		{
			Header: 'Result Entry',
			accessor: 'resultEntryStart',
			Cell: ({ row }) => {
				const start = row.original.resultEntryStart;
				const end = row.original.resultEntryEnd;
				const isCompleted = start && end;

				return (
					<div>
						{isCompleted ? (
							<div>
								<span className="fw-semibold">Completed</span>
								<div className="small text-muted">
									{dayjs(start).format('DD-MM-YY HH:mm:ss')}
								</div>
							</div>
						) : start ? (
							<div>
								<span className="fw-semibold">In progress</span>
								<div className="small text-muted">
									Started: {dayjs(start).format('DD-MM-YY HH:mm:ss')}
								</div>
							</div>
						) : (
							<span className="text-muted">Not started</span>
						)}
					</div>
				);
			},
			width: 120,
		},
		{
			Header: 'Entered By',
			accessor: 'entered_by_username',
			Cell: ({ row }) => (
				<div>
					<div className="fw-bold">{row.original.entered_by_username}</div>
					<div className="small text-muted">{row.original.entered_by_role}</div>
				</div>
			),
			width: 150,
		},
		{
			Header: 'Actions',
			accessor: 'action',
			Cell: ({ row }) => (
				// replace with your action buttons
				<>
					<div className="d-flex flex-wrap gap-2">
						<Button type="button" variant="outline-primary" size="sm" className="me-1 fw-bold" onClick={() => PrepareResultEntryHeader(row.original, true, branchid, false)} disabled={row.original.clientstatus === 'pending'}>
							<RiDoorClosedFill aria-hidden="true" />	{row.original.resultEntryStart ? 'Continue entry' : 'Enter result'}
						</Button>
						{stage == "ULTRASOUND_COMPLETED" && row.original.resultEntryEnd && (
							<>
							<Button type="button" variant="outline-success" size="sm" className="fw-bold" onClick={() => handlePrintResult(row.original)}>
								<RiPrinterFill aria-hidden="true" />	Print result
							</Button>
							<ImagingResultActions item={{ ...row.original, testid: row.original.testid || row.original.id }} />
							</>
						)}


					</div>
					{/* <Dropdown>
					<Dropdown.Toggle variant="link" size="sm" className="p-0">
						<RiMoreLine size={16} />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<Dropdown.Item
							onClick={() => PrepareResultEntryHeader(row.original, true, branchid,false)}
							disabled={row.original.clientstatus === 'pending'}
						>
							<RiCheckLine size={16} className="me-1" />
							{row.original.resultEntryStart ? 'Continue Result Entry' : 'Enter Result'}
						</Dropdown.Item>
						{stage == "ULTRASOUND_COMPLETED" && row.original.resultEntryEnd && (
							<Dropdown.Item onClick={() => handlePrintResult(row.original)}>
								<RiCloseLine size={16} className="me-1" />
								Print Result
							</Dropdown.Item>
						)}
					</Dropdown.Menu>
				</Dropdown> */}
				</>
			),
			width: 50,
		},
	];

	if (isLoading) {
		return (
			<div className="p-3" role="status" aria-busy="true">
				<Loader />
				<span className="visually-hidden">Loading ultrasound worklist</span>
			</div>
		);
	}

	return (
		<section aria-label="Ultrasound worklist" aria-busy={isLoading}>
			<PrimeTable
				column={columns}
				data={collection}
				urlparams={{
					_dateFrom: queryParams._dateFrom,
					_dateEnd: queryParams._dateEnd,
					isUltrasound: true,
					employeeid: queryParams.employeeid,
					ascension_stage: stage,
					billingid: queryParams.billingid,
					patientid: queryParams.patientid,
					patientname: queryParams.patientname,
					testid: queryParams.testid,
					branchid: queryParams.branchid,
					ascensionid: queryParams.ascensionid,
					category: queryParams.category
				}}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleServerSideProcessingAscensionData}
			/>
		</section>
	);
}
