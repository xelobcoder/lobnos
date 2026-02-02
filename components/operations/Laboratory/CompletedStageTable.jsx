import { generateRandomTextAndNumbers, PrepareResultEntryHeader, validatePin } from "../../Auth/customFetch";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { fnTiming } from "./Lib";
import { Button, Modal } from 'react-bootstrap';
import { RiCheckLine } from '@remixicon/react';
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import dayjs from "dayjs";
import { Tabs, Tab } from 'react-bootstrap';
import { useState } from 'react';
import ResultEntryComponent from "../ViewTwoResultEntry/ResultEntryComponent";
import { useApplication } from "../../Auth/useApplicationContext";



export default function AscentionCompletedTable({ employeeid, branchid }) {
	const { isLoading, collection, queryParams ,setCollection} = useLaboratoryContext();
	const [groupByPatient, setGroupByPatient] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [selectedGroupTests, setSelectedGroupTests] = useState(null);
	const [operations, setOperations] = useState({});
	const [pin, setPin] = useState("");
	const [isPinValid, setIsPinValid] = useState(false);
	const applicationSettings = useApplication();
	const appsettings = applicationSettings?.settings || {};
	const allowResultEnteringUpaid = appsettings?.allowResultEnteringUnpaid && allowResultEnteringUpaid == 1 ? true : false;

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
			Header: 'Payment status',
			accessor: 'paymentstatus',
			Cell: ({ row }) => (
				<span className={`text-capitalize ${row.original.paymentstatus === 'paid' ? 'bg-success text-white' : 'bg-danger text-white'} p-4`}>
					{row.original.paymentstatus || 'N/A'}
				</span>
			)
		},
		{
			Header: 'Action',
			accessor: 'action',
			Cell: ({ row }) => (
				<Button
					variant="outline-success"
					size="sm"
					disabled={!allowResultEnteringUpaid && row.original.paymentstatus !== 'paid'}
					className="p-1"
					onClick={() => PrepareResultEntryHeader(row.original, false, branchid)}
				>
					<RiCheckLine size={16} className="me-2" /> Enter result
				</Button>
			),
			width: 50
		},
	]

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
				<div>
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
					<Button
						variant="outline-primary"
						size="sm"
						className="mx-2"
						onClick={() => {
							if (Array.isArray(row.original.tests) && row.original.tests.length > 0) {
								PrepareResultEntryHeader(row.original.tests[0], false, branchid);
							}
						}}
					>
						Bulk Result Entry
					</Button>
				</div>
			)
		}
	];



	const validatePinUser = async () => {
		const { status, message } = await validatePin(employeeid, pin);
		setIsPinValid(status);
		if (!status) {
			alert(message || "Invalid PIN. Please try again.");
		}
	}


	const showResultEntry = () => {
		if (!isPinValid && operations?.testid) {
			return <div className="px-0 py-3" >
				<label className="fw-bold m-0">Enter PIN to proceed:</label>
				<div className="d-flex  align-items-center row m-0 p-0">
					<div className="col-3">
						<input autocomplete="one-time-code" onPaste={(ev) => { setPin("") }} type="password" className="form-control  form-control-sm" placeholder="Enter PIN to proceed" value={pin} onChange={(ev) => { setPin(ev.target.value); }}
						/>
					</div>
					<div className="col-2">
						<button className="btn btn-primary btn-sm" onClick={validatePinUser} >validate Pin</button>
					</div>
				</div>
			</div>
		} else if (isPinValid && operations?.testid) {
			return <ResultEntryComponent operations={{ ...operations, testid: operations.testid, uiLayout: 3, ascensionid: operations.ascensionid, globalPin: pin }} />
		} else {
			return <div>Please select a test to enter results.</div>
		}
	}



	const groupedData = groupByPatient ? groupDataByPatient(collection) : collection;

	if (isLoading) return <div className="text-center heightedBorder p-2 bg-secondary-subtle">Loading .......................</div>;



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
				<PrimeTable
					column={groupedColumns}
					urlparams={{
						_dateFrom: queryParams._dateFrom,
						searchString: queryParams.searchString,
						_dateEnd: queryParams._dateEnd,
						isUltrasound: queryParams.isUltrasound,
						employeeid, ascension_stage: 'COMPLETED',
						grouped: "grouped"
					}}
					data={groupedData}
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
					serverSideFiltering={true}
				/>
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
			<Modal show={showModal} onHide={() => {
				setShowModal(false)
				setOperations({})
				setPin("")
				setIsPinValid(false)
			}
			} size="xl">
				<Modal.Header closeButton>
					<Modal.Title>Tests</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedGroupTests && selectedGroupTests.length > 0 ? (
						<div>
							<div className="table-responsive">
								<table className="table table-sm table-hover">
									<thead className="table-light">
										<tr>
											<th>TEST NAME</th>
											<th>ASCENSION ID</th>
											<th>ASCENSION DATE</th>
											<th>TIMING</th>
											<th>PAYMENT STATUS</th>
											<th>ACTION</th>
										</tr>
									</thead>
									<tbody>
										{Array.isArray(selectedGroupTests) && selectedGroupTests.map((test, idx) => (
											<tr key={idx}>
												<td className="fw-bold">{test.name}</td>
												<td>{test.ascensionid}</td>
												<td >{dayjs(test.ascension_date).format('DD-MM-YYYY hh:mm:ss')}</td>
												<td className="p-3 text-sm">{fnTiming(test)}</td>
												<td className={` text-capitalize ${test.paymentstatus === 'paid' ? 'text-success' : 'text-danger'} `}>
													{test.paymentstatus}
												</td>
												<td>
													<span className="d-flex">
														<Button
															variant="outline-success"
															size="sm"
															disabled={!allowResultEnteringUpaid && test.paymentstatus !== 'paid'}
															className="p-1"
															onClick={() => {

																const { resultEntryStart, resultEntryEnd, patientid, billingid, ascensionid, name, id, fullname, fullpatientid } = test;
																const generated_billing_id = `${generateRandomTextAndNumbers(70)}${billingid}`;
																const generated_patient_id = `${generateRandomTextAndNumbers(50)}${patientid}`;

																setOperations({
																	testid: id,
																	test: name,
																	patientid: generated_patient_id,
																	billingid: generated_billing_id,
																	employeeid,
																	ascensionid,
																	resultEntryStart,
																	testList: [],
																	resultEntryEnd,
																	globalPin: '',
																	loadtest: true,

																	isInitLoading: true,
																	showPatientData
																		:
																		true,
																	showPrevTcount
																		:
																		false,
																	showPreviousRecords
																		:
																		false,
																	showSlideLeftIcon
																		:
																		true,
																	showSlideRightIcon
																		:
																		true,
																	showTestCollection
																		:
																		true,

																	uiLayout
																		:
																		3,
																	minifyClientInfo: true,
																	viewDetails: true,
																	patientInfo: {
																		patientid, fullpatientid, firstname: fullname.toString().split('')[0],
																		lastname: fullname.toString().split('')[1]
																	}
																});
															}}
														>
															<RiCheckLine size={16} className="me-2" /> Enter result
														</Button>
														<Button
															variant="primary"
															size="sm"
															disabled={!allowResultEnteringUpaid && test.paymentstatus !== 'paid'}
															className="mx-2"
															onClick={(ev) => {
																PrepareResultEntryHeader(test, false, branchid);
																setShowModal(false);
															}}
														>
															Bulk Entry
														</Button>
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>

								{operations?.testid && showResultEntry()}
							</div>

						</div>
					) : (
						<p className="text-muted">No tests available</p>
					)}
				</Modal.Body>
			</Modal>
		</div >
	);
}
