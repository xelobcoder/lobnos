import { PrepareResultEntryHeader } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { fnTiming } from "./Lib";
import { Button } from 'react-bootstrap';
import { RiCheckLine } from '@remixicon/react';
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import dayjs from "dayjs";

export default function AscentionCompletedTable({ employeeid, branchid }) {
	const {
		isLoading,
		collection,
		queryParams
	} = useLaboratoryContext();


	const columns = [
		{
			Header: 'Ascension Date(ID)',
			accessor: 'ascension_date',
			Cell: ({ value, row }) => <>{dayjs(value).format('DD-MM-YYYY hh:mm:ss')} ({row.original.ascensionid})</>,
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
					{row.original.fullpatientid} <br />
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
				<Button
					variant="outline-success"
					size="sm"
					className="p-1"
					onClick={() => PrepareResultEntryHeader(row.original, false, branchid)}
				>
					<RiCheckLine size={16} className="me-2" /> Enter result
				</Button>
			),
			width: 50
		},
	]



	if (isLoading) {
		return <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading .......................</div>;
	}



	return (
		<div className="container-fluid p-2">
			<PrimeTable column={columns}
				data={collection}
				urlparams={{
					_dateFrom: queryParams._dateFrom,
					searchString: queryParams.searchString,
					_dateEnd: queryParams._dateEnd,
					isUltrasound: queryParams.isUltrasound,
					employeeid, ascension_stage: 'COMPLETED'
				}}
				handleSeverSideProcessing={handleServerSideProcessingAscensionData}
				serverSideFiltering={true} />
		</div>
	);
}
