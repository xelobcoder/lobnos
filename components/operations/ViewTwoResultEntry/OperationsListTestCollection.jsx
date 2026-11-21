import { useState } from "react";
import { Modal } from "react-bootstrap";
import ResultEntryComponent from "./ResultEntryComponent";
import AccessRequestForm from "../../../app/operations/imaging/ultrasound/result/[branchid]/AccessRequestForm";
import { RiArrowRightLine } from '@remixicon/react';
import { useApplication } from "../../Auth/useApplicationContext";

export default function OperationsListTestCollection({ operations }) {
	const { testList, ascensionid, patientid, patientInfo } = operations;
	const appCtx = useApplication();
	const employeeid = appCtx?.user?.employeeid;
	const [selectedTests, setSelectedTests] = useState([]);
	const [multiMode, setMultiMode] = useState(false);
	const [loaded, setLoaded] = useState(false);
    const [pendingSingleTest, setPendingSingleTest] = useState(null);
	const [showAccessRequest, setShowAccessRequest] = useState(false);
	const [selectedTestForAccess, setSelectedTestForAccess] = useState(null);
	const [globalPin, setGlobalPin] = useState("");
	const pinOnResultEntry = appCtx?.settings?.pinOnResultEntry == 1 ? true : false;




	const handleCheckboxChange = (item) => {
		setSelectedTests((prev) => {
			if (prev.some((t) => t.ascensionid === item.ascensionid)) {
				return prev.filter((t) => t.ascensionid !== item.ascensionid);
			} else {
				return [...prev, item];
			}
		});
	};

	const handleTestCollectionSingle = (item) => setPendingSingleTest(item);
    const confirmSingleEntry = () => {
        if (!pendingSingleTest) return;
        setGlobalPin("");
        setSelectedTests([pendingSingleTest]);
        setLoaded(true);
        setPendingSingleTest(null);
        window.scrollTo(0, 0);
    };

	const handleLoadAll = () => {
		setSelectedTests(testList);
		setLoaded(true);
	};

	const handleMultiMode = () => {
        setGlobalPin("");
		if (!multiMode) {
			setMultiMode(true);
			setSelectedTests(testList);
			setLoaded(true);
		} else {
			setMultiMode(false);
			setSelectedTests([]);
			setLoaded(false);
		}
	};

	const handleRequestAccess = (test) => {
		setSelectedTestForAccess(test);
		setShowAccessRequest(true);
	};


	return (
		<div className="mb-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 my-3"><div><h1 className="h4 mb-1">Laboratory result entry</h1><p className="text-body-secondary mb-2">Choose a test, enter results, then review and validate.</p></div><span className="badge bg-primary-subtle text-primary-emphasis">{testList?.length || 0} tests · {selectedTests.length} open</span></div>
			<button className={`btn btn-sm btn-${multiMode ? "secondary" : "primary"}`} onClick={handleMultiMode}>
				{multiMode ? "Cancel Multi-Select" : "Load Multiple"}
			</button>
			{multiMode && (
				<button className="btn btn-sm btn-success ms-2" onClick={handleLoadAll}>
					Load All
				</button>
			)}
			<div
				className="list-group mb-2 mt-2 responsive-grid"
			>
				{Array.isArray(testList) && testList.length > 0 && testList.map((item, index) => {
					const checked = selectedTests.some((t) => t.ascensionid === item.ascensionid);
					return (
						<div
							key={item.ascensionid} className={`list-group-item d-flex justify-content-between align-items-center p-2 mb-2 rounded shadow-sm pls-color ${checked ? "border-primary border-2" : "border"}`}
						>
							<input
								type="checkbox"
                                aria-label={`Select ${item.name}`}
								checked={checked}
								disabled={!multiMode}
								onChange={() => handleCheckboxChange(item)}
								style={{ marginRight: 8 }}
							/>
							<span className="fw-bold text-uppercase" style={{ flex: 1 }} onClick={() => multiMode && handleCheckboxChange(item)}>{item.name}<small className="d-block fw-normal text-body-secondary">Ascension #{item.ascensionid}</small></span>
							{!multiMode && (
								<>
									<button
										type="button"
										className="btn btn-sm btn-info me-2"
										onClick={(e) => {
											e.stopPropagation();
											handleRequestAccess(item);
										}}
									>
										Request Access
									</button>
									<button
										type="button"
										className={`btn btn-sm btn-outline-primary`}
                                        aria-label={`Enter results for ${item.name}`}
										onClick={(e) => {
											e.stopPropagation();
											if (multiMode) {
												if (!selectedTests.some((t) => t.ascensionid === item.ascensionid)) {
													setSelectedTests(prev => [...prev, item]);
												}
												setLoaded(true);
											} else {
												handleTestCollectionSingle(item);
											}
										}}
									>
										<RiArrowRightLine size={24} />
									</button>
								</>
							)}
						</div>
					);
				})}
			</div>
			{loaded && selectedTests.length > 0 && (
				<div>
					{
						pinOnResultEntry && selectedTests.length > 1 && (
							<div className="d-flex gap-2 mb-2 align-items-center">
								<input aria-label="Shared result entry PIN" type="password" className="form-control form-control-sm" placeholder="PIN for selected tests" value={globalPin} onChange={e => setGlobalPin(e.target.value)} style={{ maxWidth: 220 }} />
								<span className="small text-body-secondary">Used by each open test when saving.</span>
								<button className="btn btn-sm btn-outline-secondary" onClick={() => setGlobalPin('')}>Clear</button>
							</div>
						)
					}
					<div className={`mt-2 ${selectedTests.length > 1 ? "responsive-grid" : ""}`}>
						{Array.isArray(selectedTests) && selectedTests.length > 0 && selectedTests.map((test, idx) => (
							<div key={test.ascensionid} style={{ minWidth: 0 }}>
								<ResultEntryComponent operations={{ ...operations, testid: test.testid, uiLayout: 3, ascensionid: test.ascensionid, globalPin: selectedTests.length > 1 ? globalPin : "" }} />
							</div>
						))}
					</div>
				</div>
			)}

            <Modal show={Boolean(pendingSingleTest)} onHide={() => setPendingSingleTest(null)} centered>
                <Modal.Header closeButton><Modal.Title>Confirm result entry</Modal.Title></Modal.Header>
                <Modal.Body><p>Open <strong>{pendingSingleTest?.name}</strong> for <strong>{patientInfo?.fullname || [patientInfo?.firstname, patientInfo?.middlename, patientInfo?.lastname].filter(Boolean).join(' ') || patientInfo?.fullpatientid || `Patient ${patientid}`}</strong>?</p><p className="mb-0">Review the patient and test before continuing. Opening the form does not save or validate a result. Complete the required fields and save through the authorized workflow.</p></Modal.Body>
                <Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={() => setPendingSingleTest(null)}>Cancel entry</button><button type="button" className="btn btn-primary" onClick={confirmSingleEntry}>Open result form</button></Modal.Footer>
            </Modal>
			<Modal show={showAccessRequest} onHide={() => { setShowAccessRequest(false); setSelectedTestForAccess(null); }} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Request Access - {selectedTestForAccess?.name}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedTestForAccess && (
						<AccessRequestForm
							ascensionid={selectedTestForAccess.ascensionid?.toString() || ascensionid?.toString() || null}
							patientid={patientInfo.patientid}
							employeeid={employeeid?.toString() || ""}
						/>
					)}
				</Modal.Body>
			</Modal>

			<style jsx>{`
				.responsive-grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 16px;
				}
				@media (max-width: 768px) {
					.responsive-grid {
						grid-template-columns: 1fr;
						gap: 10px;
					}
					.list-group-item {
						font-size: 0.98rem;
						padding: 10px 8px;
					}
				}
			`}</style>
		</div>
	);
}