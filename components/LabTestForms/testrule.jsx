import { useState, useEffect, useRef } from "react";
import { customPost, handleComments, validatePin } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import Loader from "../accessories/Loader";
import ResultEntryMainEntryBase from "./ResultEntryMainEntryBase";
import moment from "moment";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { getAscensionEditCountServerideS, getResultEntryDataServerSide } from "../serverActions/ActionFiltering";
import Link from "next/link";
import ValidationModal from "../operations/Laboratory/ValidationModal";
import ResultEntryWorkflowSummary from "./ResultEntryWorkflowSummary";
import { createResultSaveSession } from "../../lib/resultSaveSession";
import ManualParameterRerun from "./ManualParameterRerun";
import { roleAllowed } from "../Auth/roles";



export default function CreateTestRule({ clientdata, onSaved, onNavigate }) {
	const { testid, test, patientid, billingid, employeeid, ascensionid, resultEntryStart, resultEntryEnd, globalPin } = clientdata;
	const applicationSettings = useApplicationSettings().applicationsettings || {};
	const { result, settings, user } = applicationSettings;
	const [comments, setComments] = useState({ comments: '' });
	const [testname, setTestname] = useState("");
	const [resultEntered, setResultEntered] = useState(false);
	const [isloading, setLoading] = useState(true);
	const [rule, setRule] = useState([]);
	const [persistedRule, setPersistedRule] = useState([]);
	const [editCount, setEditCount] = useState(0);
	const [hasDrugs, setHasDrugs] = useState(false);
	const [modifiedDrugs, setModifiedDrugs] = useState([]);
	const dropdownRef = useRef(null);
	const [isSaving, setIsSaving] = useState(false);
	const saveSession = useRef(null);
	if (!saveSession.current) saveSession.current = createResultSaveSession();
	const [pin, setPin] = useState("");
	const isPinShared = Boolean(globalPin);
	const effectivePin = isPinShared ? globalPin : pin;
	const [showValidationModal, setShowValidationModal] = useState(false);
	const [requiresRevalidation, setRequiresRevalidation] = useState(false);
	const [resultDeliveryPreference, setResultEntryPreference] = useState({
		requested_mode: "HardCopy", requested_mode_detail: "",
		updated_by_employeeid: null
	})
	const [saveFeedback, setSaveFeedback] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [workflowRevision, setWorkflowRevision] = useState(0);

    const refreshPersistedReport = async () => {
        const [latestResponse] = await getResultEntryDataServerSide({ testid, billingid, patientid, ascensionid, employeeid });
        const latest = Array.isArray(latestResponse?.result) ? latestResponse.result : [];
        setRule(latest);
        setPersistedRule(latest);
        setResultEntered(latest.some((item) => item?.value !== "" && item?.value !== null && item?.value !== undefined));
    };



	const getAscensionEditCount = async () => {
		try {
			const count = await getAscensionEditCountServerideS({ billingid, testid, patientid, ascensionid });
			const numericCount = Number(count);
			setEditCount(Number.isSafeInteger(numericCount) && numericCount >= 0 ? numericCount : 0);
		} catch {
			setEditCount(0);
		}
	}

	useEffect(() => {
		const gettingFields = async function () {
            setLoading(true); setLoadError("");
			try {
				const [resultResponse, commentsResponse] = await getResultEntryDataServerSide({ testid, billingid, patientid, ascensionid, employeeid })

				function updatesResultForm(data) {
					const { testname, result, hasDrugs, resultDeliveryPreference } = data;
					if (result && Array.isArray(result)) {
						setRule(result);
						setPersistedRule(result);
						if (result.length === 0) return;
						const hasAnyValueEntered = result.some((item) => item?.value != "");
						setResultEntered(hasAnyValueEntered);
					}
					testname && setTestname(testname);
					setHasDrugs(hasDrugs);
					resultDeliveryPreference && setResultEntryPreference(resultDeliveryPreference)
				}

				function updatesCommentsForm(data) {
					setComments({ comments: data.comments });
				}

				updatesResultForm(resultResponse);
				updatesCommentsForm(commentsResponse);
				setLoading(false);
				await getAscensionEditCount();
			} catch (err) {
				setLoading(false);
                setLoadError("Unable to load this result form. Reload the page before entering results.");
                setRule([]);
				setComments({ comments: "" });
			} finally {
				if (resultEntryStart) return;
				const selectedItem = {
					ascensionid,
					testid,
					value: new Date().toISOString(),
					employeeid,
					stage: 'resultEntryStart',
				};

				const { status } = await customPost("ascension/collection/update/stage", 'POST', selectedItem);

				if (status === true) {
					console.log('result entry logged!!!');
				}
			}
		};
		if (testid && billingid && patientid && employeeid) {
			gettingFields();
		}
	}, [testid, billingid, patientid, employeeid, ascensionid]);


	const handlestate = async (ev, index) => {
		setSaveFeedback({tone:"warning", message:"Unsaved changes"});
        const value = ev.target.value;
		const newRule = [...rule];
		newRule[index]["value"] = value;
		setRule(newRule);
	};



	const handleSubmit = async () => {
		if (!saveSession.current.start()) return;
		setIsSaving(true);
        setSaveFeedback({tone:"info", message:"Saving results…"});
		try {
			const pinOnResultEntry = settings?.pinOnResultEntry;
			if (pinOnResultEntry == 1) {
				if (!effectivePin) {
					setSaveFeedback({tone:"danger", message:"Enter your PIN before saving."});
                    return toast.error("PIN is required");
				}
				const response = await validatePin(employeeid, effectivePin);
				if (response?.status !== true) {setSaveFeedback({tone:"danger",message:response?.message || "Invalid PIN"});return toast.error(response?.message || "Invalid PIN");}
			}

			const transformed = rule.map((item) => {
				return { field: item?.name, value: item?.value, fieldid: item.fieldid, originalvalue: item?.value };
			});

			const allHasValues = transformed.some((a) => a.value == "");
			if (allHasValues) toast.error("Some fields are empty", { autoClose: 2000 });
			const selectedDrugs = hasDrugs && Array.isArray(modifiedDrugs) && modifiedDrugs.length > 0 ? modifiedDrugs.filter(drug => drug.selected) : [];

			const data = {
				fields: transformed,
				csvid: billingid,
				ascensionid,
				employeeid,
				ptid: patientid,
				comments: comments.comments,
				test,
				testid,
				hasDrugs,
				drugs: hasDrugs ? selectedDrugs : [],
			};

			if (data.employeeid && data.csvid && data.fields.length > 0) {
				const response = await customPost("result/entry/customtest", "POST", saveSession.current.identify(data));
				const { message, statusCode, status } = response;
				if (status === "success" && statusCode === 200) {
					setRequiresRevalidation(response.requires_revalidation === true);
                    setSaveFeedback({tone:"success",message:response.requires_revalidation ? "Saved. Previous approvals were cleared; validate the updated result again." : "Results saved. Continue to validation when ready."});
                    setWorkflowRevision(value=>value+1);
                    void getAscensionEditCount();
					toast.success(message, { autoClose: response.requires_revalidation ? 5000 : 500 });
					if (typeof onSaved === "function") onSaved();
					void refreshPersistedReport().catch(() => {});
					// A delayed retry may refer to a revision superseded by another editor.
					if (!response.replayed) setShowValidationModal(true);
				} else {
					setSaveFeedback({tone:"danger",message:message || "Results could not be saved."});
                    toast.error(message, { autoClose: 2000 });
				}
			} else {
                setSaveFeedback({tone:"danger",message:"The patient, test or result fields are missing. Reload this request before saving."});
            }

		} catch (err) {
			setSaveFeedback({tone:"danger",message:"Results could not be saved. Check your connection and try again."});
            toast.error("Something went wrong", { autoClose: 1000 });
		} finally {
			saveSession.current.finish();
			setIsSaving(false);
		}
	};

	const handleCreateFields = () => {
		if (testid && testname) {
			window.open(`/settings/applicationsettings/testpanels/testlist/createfields?testid=${testid}&testname=${testname}`);
		}
	};

	useEffect(() => {
		const dropdown = dropdownRef.current;
		if (!dropdown) return;
		const handler = (e) => {
			if (!dropdown.contains(e.target)) {
				dropdown.classList.remove('show');
				dropdown.querySelector('.dropdown-menu').classList.remove('show');
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	if (isloading) return <Loader />;
    if (loadError) return <div className="alert alert-danger" role="alert">{loadError}</div>;

	const AuditLogIcon = (
		<svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
			<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0m5-5c1.657-1.657-4-6-6-6s-7 .429c-.894-.894-.6682-.6682-.6682-.6682l8.2843 .0017L13.42 .0027C13 .0027C13 .0027C13 .0027C12.6561 -.0003L11 -.0003l1e+05 -1e+05 -10 -10z" />
			<path d="M16a8a8a8" />
			<path d="M16a8" />
		</svg>
	);


	const ClientTestTrendIcon = (
		<svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M3 3v15m0 0l2-2m-2 2l-2-2m19-11v7a2 2 0 01-2 2H5a2 2 0 01-2-2V3a2 2 0 012-2h14a2 2 0 012 2z" />
		</svg>
	);

	const ReportCriticalValuesIcon = (
		<svg width={16} height={16} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L12 3.768l-8.566 11.302c-.77 1.333.192 3 1.732 3z" />
		</svg>
	);

	const decryptedPatientId = patientid ? patientid.slice(50) : null;
	const authorizedForManualRerun = roleAllowed(user?.role, ["admin", "manager", "scientist"]);

	return (
		<div>
			<section className="card border-0 mx-auto my-4" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
				<div style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', borderBottom: '1px solid var(--bs-border-color)', fontSize: '1rem' }} className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 fw-bold">
					<div className="btn-group mb-2 mb-md-0 align-items-center" role="group" aria-label="result form entry label ">
						<h5 className="mb-0 me-2" title={`test edited ${editCount} times`} style={{ color: 'var(--bs-secondary-color)', fontWeight: 500, fontSize: '1rem' }}>{editCount} edits</h5>
						<Indicator resultEntered={resultEntered} />
						<span className="mb-0 ms-3 text-primary" style={{ fontSize: '1rem', fontWeight: 600 }}>{testname}</span>
					</div>
					<div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
						<button className="btn btn-outline-secondary border dropdown-toggle" type="button" id="actionsDropdown" onClick={e => {
							e.preventDefault();
							const menu = e.currentTarget.nextSibling;
							menu.classList.toggle('show');
							e.currentTarget.parentNode.classList.toggle('show');
						}} aria-expanded="false">
							Actions
						</button>
						<ul className="dropdown-menu" aria-labelledby="actionsDropdown" style={{ minWidth: 0, width: 'max-content', maxWidth: 220, whiteSpace: 'nowrap', right: 0, left: 'auto', fontSize: '0.92rem' }}>
							{Number.isSafeInteger(Number(ascensionid)) && Number(ascensionid) > 0 && (
								<ManualParameterRerun
									ascensionid={ascensionid}
									testid={testid}
									persistedFields={persistedRule}
									authorized={authorizedForManualRerun && !isSaving && saveFeedback?.tone !== "warning"}
									onConfirmed={refreshPersistedReport}
								/>
							)}
							<li>
								<Link className="dropdown-item d-flex align-items-center" href={`/operations/laboratory/auditlogs/${ascensionid}`}>
									{AuditLogIcon} <span className="ms-2">Audit log</span>
								</Link>
							</li>
							<li>
								<Link
									className="dropdown-item d-flex align-items-center"
									href={`/operations/laboratory/resulttrend/${decryptedPatientId}/${testid}?trendNumber=100`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{ClientTestTrendIcon} <span className="ms-2">Client test trend</span>
								</Link>
							</li>
							<li>
								<Link className="dropdown-item d-flex align-items-center" href="/operations/laboratory/criticalvaluesAlert">
									{ReportCriticalValuesIcon} <span className="ms-2">Report critical values</span>
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="card-body p-0" style={{ padding: 0 }}>
					<div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 px-4 pt-4 px-2">
						<span className="alert alert-warning-subtle text-sm border border-2 border-warning p-2 px-3 rounded-3 border mb-2 mb-sm-0 mt-2" style={{ minWidth: 220 }}>
							Result Delivery Preference: {resultDeliveryPreference.requested_mode || "Printed Hardcopy"}
							({resultDeliveryPreference.requested_mode_detail || ""})
						</span>
					</div>
                    <div className="px-3 pt-3"><ResultEntryWorkflowSummary ascensionid={ascensionid} refreshKey={workflowRevision} testName={testname} blocked={isSaving || saveFeedback?.tone === "warning" || saveFeedback?.tone === "danger"} onValidate={() => setShowValidationModal(true)} />
                        {(resultEntryStart || resultEntryEnd) && <p className="small text-body-secondary mt-2 mb-0">{resultEntryStart && `Entry started: ${moment(resultEntryStart).format('DD MMM YYYY, HH:mm')}`}{resultEntryStart && resultEntryEnd && ' · '}{resultEntryEnd && `Saved: ${moment(resultEntryEnd).format('DD MMM YYYY, HH:mm')}`}</p>}
                    </div>
					<div onChangeCapture={() => setSaveFeedback({tone:"warning",message:"Unsaved changes"})} className="rounded-4 mx-3 my-3" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
                        {saveFeedback && <div className={`alert alert-${saveFeedback.tone} py-2`} role={saveFeedback.tone === "danger" ? "alert" : "status"}>{saveFeedback.message}</div>}
						<ResultEntryMainEntryBase
							rule={rule}
							handleComments={handleComments}
							comments={comments}
							setComments={value => {setComments(value);setSaveFeedback({tone:"warning",message:"Unsaved changes"});}}
							hasDrugs={hasDrugs}
							testid={testid}
							pin={effectivePin}
							setPin={isPinShared ? () => { } : setPin}
							ascensionid={ascensionid}
							setModifiedDrugs={setModifiedDrugs}
							isPinUsed={result.isPinOnResultEntry}
							isPinShared={isPinShared}
							handleSubmit={handleSubmit}
							handleCreateFields={handleCreateFields}
							handlestate={handlestate}
							isloading={isSaving} />
					</div>
				</div>
			</section>
            {showValidationModal && <ValidationModal show selectedAscension={{ascensionid, id:testid, name:testname, patientid: Number(String(patientid).slice(50)), billingid: Number(String(billingid).slice(70))}} isBulk={false} onClose={() => {setShowValidationModal(false);setWorkflowRevision(value => value + 1);}} />}

			<style jsx>{`
				.hover-bg:hover {
					background: var(--bs-tertiary-bg);
					transition: background 0.2s;
				}
			`}</style>
		</div>
	);
}
