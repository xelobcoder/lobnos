import { PrepareResultEntryHeader } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { fnTiming } from "./Lib";
import { Dropdown } from 'react-bootstrap';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";

export default function AscentionCompletedTable({employeeid}) {
	const {
		isLoading,
		collection,
		queryParams
	} = useLaboratoryContext();


	const columns = [
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
