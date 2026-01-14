import { PrepareResultEntryHeader } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { fnTiming } from "./Lib";
import { Button, Modal } from 'react-bootstrap';
import { RiCheckLine } from '@remixicon/react';
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import dayjs from "dayjs";
import { Tabs, Tab } from 'react-bootstrap';
import { useState } from 'react';

export default function AscentionCompletedTable({ employeeid, branchid }) {
	const {
		isLoading,
		collection,
		queryParams
	} = useLaboratoryContext();
	const [groupByPatient, setGroupByPatient] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [selectedGroupTests, setSelectedGroupTests] = useState(null);

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
					tests: []
				};
			}
			grouped[key].tests.push(item);
		});

		return Object.values(grouped);
	};

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
			Header: 'Action',
			accessor: '',
			Cell: ({ row }) => (
				<Button
					variant="outline-success"
					size="sm"
					className="p-1"
					onClick={() => {
						setSelectedGroupTests(row.original.tests);
						setShowModal(true);
					}}
				>
					<RiCheckLine size={16} className="me-2" /> View Tests
				</Button>
			)
		}
	];

	const groupedData = groupByPatient ? groupDataByPatient(collection) : collection;

	if (isLoading) {
		return <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading .......................</div>;
	}

	return (
		<div className="container-fluid p-2">
			<Tabs
				activeKey={groupByPatient ? "grouped" : "ungrouped"}
				onSelect={(k) => setGroupByPatient(k === "grouped")}
				className="mb-3"
			>
				<Tab eventKey="grouped" title={`Grouped View (${groupByPatient ? groupedData.length : 0})`} />
				<Tab eventKey="ungrouped" title={`Individual Records (${!groupByPatient ? collection.length : 0})`} />
			</Tabs>
			{groupByPatient ? (
				<PrimeTable column={groupedColumns} data={groupedData} />
			) : (
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
			)}

			{/* Modal for viewing tests */}
			<Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Tests</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedGroupTests && selectedGroupTests.length > 0 ? (
						<div className="table-responsive">
							<table className="table table-sm table-hover">
								<thead className="table-light">
									<tr>
										<th>Test Name</th>
										<th>Ascension Date</th>
										<th>Timing</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{selectedGroupTests.map((test, idx) => (
										<tr key={idx}>
											<td className="fw-bold">{test.name}</td>
											<td>{dayjs(test.ascension_date).format('DD-MM-YYYY hh:mm:ss')}</td>
											<td>{fnTiming(test)}</td>
											<td>
												<Button
													variant="outline-success"
													size="sm"
													className="p-1"
													onClick={() => {
														PrepareResultEntryHeader(test, false, branchid);
														setShowModal(false);
													}}
												>
													<RiCheckLine size={16} className="me-2" /> Enter result
												</Button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<p className="text-muted">No tests available</p>
					)}
				</Modal.Body>
			</Modal>
		</div>
	);
}
