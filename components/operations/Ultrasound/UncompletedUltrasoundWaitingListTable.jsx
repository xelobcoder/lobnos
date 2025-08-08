import React from "react";
import { Dropdown } from 'react-bootstrap';
import { RiMoreLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import { useUltrasoundContext } from "./UltrasoundContext";
import { generateRandomTextAndNumbers, PrepareResultEntryHeader } from "../../Auth/customFetch";
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { useApplication } from "../../Auth/useApplicationContext";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";


export default function AscentionUltrasoundUnCompletedTable() {
	const { isLoading, collection, queryParams } = useUltrasoundContext();
	const branchid = useApplication().branchid;
	const handlePrintResult = (row) => {
		let { billingid, name, id, patientid, ascensionid } = row;
		billingid = `${generateRandomTextAndNumbers(70)}${billingid}`;
		patientid = `${generateRandomTextAndNumbers(50)}${patientid}`;
		window.open(`/result/labreport/4?isScan=true&&csvid=${billingid}&&ptid=${patientid}&&target=70,50&&ascensionId=${ascensionid}&&testname=${name}&&testid=${id}&&isUltrasound=true&&isMultiple=false&&password&&is_password_encrypted=false`, "_blank");
		// window.open(`/ultrasound/report?csvid=${billingid}&&ptid=${patientid}&&target=70,50&&ascensionId=${ascensionid}&&testname=${name}&&testid=${id}&&isUltrasound=true&&isMultiple=false&&password&&is_password_encrypted=false`)
	};

	console.log(queryParams)

	const columns = [
		{
			Header: '#',
			accessor: 'select',
			Cell: ({ row }) => (
				<input type="checkbox" />
			),
			width: 20,
		},
		{
			Header: 'Ascension Date',
			accessor: 'ascension_date',
			Cell: ({ value }) => new Date(value).toLocaleDateString(),
			width: 70,
		},
		{
			Header: 'Name',
			accessor: 'fullname',
			Cell: ({ row }) => (
				<div className="text-uppercase fw-bold">
					{row.original.fullname} <br />
				</div>
			),
		},
		{ Header: 'Age', accessor: 'age', width: 50 },
		{
			Header: 'Patient ID & Bill ID',
			accessor: 'patientid',
			Cell: ({ row }) => (
				<div>
					{row.original.patientid} <br />
					{row.original.billingid}
				</div>
			),
			width: 100,
		},
		{
			Header: 'Test Name',
			accessor: 'name',
		},
		{
			Header: 'Action',
			accessor: 'action',
			Cell: ({ row }) => (
				<Dropdown>
					<Dropdown.Toggle variant="link" size="sm" className="p-0">
						<RiMoreLine size={16} />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<Dropdown.Item onClick={() => PrepareResultEntryHeader(row.original, true, branchid)}>
							<RiCheckLine size={16} className="me-1" /> Enter result
						</Dropdown.Item>
						<Dropdown.Item onClick={() => handlePrintResult(row.original)}>
							<RiCloseLine size={16} className="me-1" />
							Print Result
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			),
			width: 50,
		},
	];

	if (isLoading) {
		return <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading .......................</div>;
	}

	return (
		<div>
			<PrimeTable
				column={columns}
				data={collection}
				urlparams={{...queryParams, isUltrasound: true }}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleServerSideProcessingAscensionData } />
		</div>
	);
}
