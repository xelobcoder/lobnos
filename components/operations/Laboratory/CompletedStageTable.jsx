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
	const { isLoading, collection, queryParams, setCollection, category='ungrouped' } = useLaboratoryContext();
	const [groupByPatient, setGroupByPatient] = useState(category === 'grouped');
	const [showModal, setShowModal] = useState(false);
	const [selectedGroupTests, setSelectedGroupTests] = useState(null);
	const [operations, setOperations] = useState({});
	const [pin, setPin] = useState("");
	const [isPinValid, setIsPinValid] = useState(false);
	const applicationSettings = useApplication();
	const appsettings = applicationSettings?.settings || {};
	const allowResultEnteringUpaid = appsettings?.allowResultEnteringUnpaid && allowResultEnteringUpaid == 1 ? true : false;

	const calculateProcessingTime = (startDate, endDate) => {
		if (!startDate || !endDate) return 'N/A';
		const start = new Date(startDate);
		const end = new Date(endDate);
		const diffMs = end - start;

		if (diffMs < 0) return 'N/A';

		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffDays > 0) {
			return `${diffDays}d ${diffHours % 24}h`;
		} else if (diffHours > 0) {
			return `${diffHours}h ${diffMinutes % 60}m`;
		} else if (diffMinutes > 0) {
			return `${diffMinutes}m ${diffSeconds % 60}s`;
		} else {
			return `${diffSeconds}s`;
		}
	};

	const columns = [
		{
			Header: 'Name',
			accessor: 'fullname',
			Cell: ({ row }) => (
				<div className="text-uppercase fw-bold">
					{row.original.fullname}
					<br />
					<span className="text-muted small">{row.original.age}</span>
				</div>
			),
		},
		{
			Header: 'Patient ID / Billing ID',
			accessor: 'fullpatientid',
			Cell: ({ row }) => (
				<div>
					<div>{row.original.fullpatientid || row.original.patientid}</div>
					<div>{row.original.billingid}</div>
				</div>
			),
			width: 100
		},
		{
			Header: 'Test Name',
			accessor: 'name',
			Cell: ({ row }) => <span>{row.original.name}</span>,
		},
		{
			Header: 'Timing',
			accessor: 'timing',
			Cell: ({ row }) => fnTiming(row.original),
		},
		{
			Header: 'Processing Time',
			accessor: 'processingTime',
			Cell: ({ row }) => calculateProcessingTime(row.original.processingStartDate, row.original.processingEndDate),
			width: 100
		},
		{
			Header: 'Payment Status',
			accessor: 'paymentstatus',
			Cell: ({ row }) => (
				<span className="text-capitalize">
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
					onClick={() => PrepareResultEntryHeader(row.original, false, branchid,false)}
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
					paymentstatus: item.paymentstatus, // Include payment status for row styling
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
			Header: 'Full Name',
			accessor: 'fullname',
			Cell: ({ row }) => <div className='text-uppercase'><strong>{row.original.fullname}</strong><br />{row.original.age}</div>
		},
		{
			Header: 'Patient ID / Billing ID',
			accessor: 'fullpatientid',
			Cell: ({ row }) => (
				<div>
					<div><strong>{row.original.fullpatientid || row.original.patientid}</strong></div>
					<div>{row.original.billingid}</div>
				</div>
			)
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
						grouped: "grouped",
						billingid: queryParams.billingid,
						patientname: queryParams.patientname,
						patientid: queryParams.patientid,
						billingid: queryParams.billingid,
						ascensionid: queryParams.ascensionid
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
					rowStyling={{
						type: "custom",
						getRowStyle: (rowData) => {
							const status = rowData?.paymentstatus?.toLowerCase();
							if (status === "pending") {
								return { backgroundColor: "#f8d7da", color: "#842029" };
							} else if (status === "partial") {
								return { backgroundColor: "#fff3cd", color: "#664d03" };
							}
							return {};
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
						employeeid, ascension_stage: 'COMPLETED',
						billingid: queryParams.billingid,
						patientname: queryParams.patientname,
						patientid: queryParams.patientid,
						billingid: queryParams.billingid,
						ascensionid: queryParams.ascensionid
					}}
					handleSeverSideProcessing={handleServerSideProcessingAscensionData}
					rowStyling={{
						type: "custom",
						getRowStyle: (rowData) => {
							const status = rowData?.paymentstatus?.toLowerCase();
							if (status === "pending") {
								return { backgroundColor: "#f8d7da", color: "#842029" };
							} else if (status === "partial") {
								return { backgroundColor: "#fff3cd", color: "#664d03" };
							}
							return {};
						}
					}}
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
