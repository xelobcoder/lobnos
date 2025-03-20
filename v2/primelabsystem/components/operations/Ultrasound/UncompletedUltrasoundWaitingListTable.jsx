import React from "react";
import { Dropdown } from 'react-bootstrap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useUltrasoundContext } from "./UltrasoundContext";
import Pagination from "../../accessories/pagination";
import { generateRandomTextAndNumbers, PrepareResultEntryHeader } from "../../Auth/customFetch";
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';

export default function AscentionUltrasoundUnCompletedTable() {
	const { isLoading, collection, queryParams, setLoadPage, updatePageValue } = useUltrasoundContext();

	const handlePrintResult = (row) => {
		let { billingid, name, id, patientid, ascensionid } = row;
		billingid = `${generateRandomTextAndNumbers(70)}${billingid}`;
		patientid = `${generateRandomTextAndNumbers(50)}${patientid}`;
		window.open(`${process.env.PLS_PDF_GENERATOR}result/pdf/generate?csvid=${billingid}&&ptid=${patientid}&&target=70,50&&ascensionId=${ascensionid}&&testname=${name}&&testid=${id}&&isUltrasound=true&&isMultiple=false`, "_blank");
	};

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
						<MoreHorizIcon />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						<Dropdown.Item onClick={() => PrepareResultEntryHeader(row.original, true)}>
							<CheckIcon fontSize="small" /> Enter result
						</Dropdown.Item>
						<Dropdown.Item onClick={() => handlePrintResult(row.original)}>
							<CloseIcon fontSize="small" />
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
			<PrimeTable column={columns} data={collection} />
			<div className="d-flex justify-content-center">
				<Pagination page={queryParams.page} updateFunction={updatePageValue} load={setLoadPage} />
			</div>
		</div>
	);
}
