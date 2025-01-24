import React, { useMemo, useState } from "react";
import { Info } from "@mui/icons-material";
import { PrepareResultEntryHeader } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import Pagination from "../../accessories/pagination";
import { fnTiming } from "./Lib";
import {
	useTable,
	useSortBy,
	useFilters,
	useRowSelect,
	useFlexLayout,
} from "react-table";
import { Dropdown } from 'react-bootstrap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SortAscendingIcon from '@mui/icons-material/ArrowUpward';
import SortDescendingIcon from '@mui/icons-material/ArrowDownward';
import ShowTableCount from "./ShowCountTable";
import FilterIcon from "./FilterIcon";
import PrimeTable from "../../accessories/Datatables/PrimeTable";

export default function AscentionCompletedTable() {
	const {
		isLoading,
		collection,
		// queryParams,
		// setLoadPage,
		// setQueryParams,
		// canloadPage,
		// updatePageValue,
	} = useLaboratoryContext();


	const columns = [
		{
			Header: '#',
			accessor: '',
			Cell: ({ row }) => <input type="checkbox"  />,
			width: 20,
		},
		{
			Header: 'Ascension Date',
			accessor: 'ascension_date',
			Cell: ({ value }) => new Date(value).toLocaleDateString(),
			width: 70
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
			width: 100
		},
		{
			Header: 'Test Name',
			accessor: 'name',
		},
		{
			Header: 'Timing',
			accessor: 'timing',
			Cell: ({ row }) => fnTiming(row.original),
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
						<Dropdown.Item onClick={() => PrepareResultEntryHeader(row.original)}>
							<CheckIcon fontSize="small" /> Enter result
						</Dropdown.Item>
						<Dropdown.Item onClick={() => console.log(`Enter All related for ${row.original.patientid}`)}>
							<CloseIcon fontSize="small" /> Enter All related
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			),
			width: 50
		},
	]



	if (isLoading) {
		return <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading .......................</div>;
	}



	return (
		<div className="container-fluid p-2">
			<button
				className="btn btn-light btn-sm mb-2"
				onClick={() => {
					const allSelected = rows.length === Object.keys(tableInstance.state.selectedRowIds).length;
					toggleAllRowsSelected(!allSelected);
				}}
			>
				Select All
			</button>

			<PrimeTable column={columns} data={collection} serverSideFiltering={true} />
		</div>
	);
}
