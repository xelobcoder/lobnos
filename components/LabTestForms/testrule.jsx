import { useState, useEffect, useRef } from "react";
import { customPost, handleComments } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
import { toast } from 'react-toastify';
import Loader from "../accessories/Loader";
import ResultEntryMainEntryBase from "./ResultEntryMainEntryBase";
import moment from "moment";
import { useApplicationSettings } from "../Auth/useApplicationContext";
import { getAscensionEditCountServerideS, getResultEntryDataServerSide } from "../serverActions/ActionFiltering";
import Link from "next/link";


export default function CreateTestRule({ clientdata }) {
	const { testid, test, patientid, billingid, employeeid, ascensionid, resultEntryStart, resultEntryEnd } = clientdata;
	const { result } = useApplicationSettings().applicationsettings;
	const [comments, setComments] = useState({ comments: '' });
	const [testname, setTestname] = useState("");
	const [resultEntered, setResultEntered] = useState(false);
	const [isloading, setLoading] = useState(true);
	const [rule, setRule] = useState([]);
	const [editCount, setEditCount] = useState(0);
	const [hasDrugs, setHasDrugs] = useState(false);
	const [modifiedDrugs, setModifiedDrugs] = useState([]);
	const dropdownRef = useRef(null);

	const getAscensionEditCount = async () => {
		;
		const count = getAscensionEditCountServerideS({ billingid, testid, patientid, ascensionid })
		count ? setEditCount(count) : null
	}

	useEffect(() => {
		const gettingFields = async function () {
			try {
				const [resultResponse, commentsResponse] = await getResultEntryDataServerSide({ testid, billingid, patientid, ascensionid, employeeid })

				function updatesResultForm(data) {
					const { testname, result, hasDrugs } = data;
					if (result && Array.isArray(result)) {
						setRule(result);
						if (result.length === 0) return;
						const hasAnyValueEntered = result.some((item) => item?.value != "");
						setResultEntered(hasAnyValueEntered);
					}
					testname && setTestname(testname);
					setHasDrugs(hasDrugs);
				}

				function updatesCommentsForm(data) {
					setComments({ comments: data.comments });
				}

				updatesResultForm(resultResponse);
				updatesCommentsForm(commentsResponse);
				setLoading(false);
				getAscensionEditCount();
			} catch (err) {
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
	}, [testid, billingid, patientid, employeeid]);

	const handlestate = async (ev, index) => {
		const value = ev.target.value;
		const newRule = [...rule];
		newRule[index]["value"] = value;
		setRule(newRule);
	};

	const [isSaving, setIsSaving] = useState(false);

	const handleSubmit = async () => {
		try {
			setIsSaving(true);
			const transformed = rule.map((item) => {
				return { field: item?.name, value: item?.value, fieldid: item.fieldid, originalvalue: item?.value };
			});
			const allHasValues = transformed.some((a) => a.value == "");
			if (allHasValues) toast.error("Some fields are empty", { autoClose: 2000 });

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
				drugs: hasDrugs ? modifiedDrugs : [],
			};
			if (data.employeeid && data.csvid && data.fields.length > 0) {
				const response = await customPost("result/entry/customtest", "POST", data);
				const { message, statusCode, status } = response;
				if (status === "success" && statusCode === 200) {
					toast.success(message, { autoClose: 500 });
				} else {
					toast.error(message, { autoClose: 2000 });
				}
			}
		} catch (err) {
			toast.error("Something went wrong", { autoClose: 1000 });
		} finally {
			setIsSaving(false);
		}
	};

	const handleCreateFields = () => {
		if (testid && testname) {
			window.open(`/settings/applicationsettings/testpanels/testlist/createfields?testid=${testid}&&testname=${testname}`);
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

	return (
		<div>
			<section className="card rounded-4 border-0 mx-auto my-4" style={{ maxWidth: 800, background: '#f9fafb' }}>
				<div style={{ backgroundColor: '#e9ecef', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', borderBottom: '1px solid #ececec', fontSize: '1rem' }} className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 fw-bold">
					<div className="btn-group mb-2 mb-md-0 align-items-center" role="group" aria-label="result form entry label ">
						<h5 className="mb-0 me-2" title={`test edited ${editCount} times`} style={{ color: '#6c757d', fontWeight: 500, fontSize: '1rem' }}>{editCount}</h5>
						<Indicator resultEntered={resultEntered} />
						<span className="mb-0 ms-3 text-primary" style={{ fontSize: '1rem', fontWeight: 600 }}>{testname}</span>
					</div>
					<div className="dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
						<button className="btn btn-light border dropdown-toggle" type="button" id="actionsDropdown" onClick={e => {
							e.preventDefault();
							const menu = e.currentTarget.nextSibling;
							menu.classList.toggle('show');
							e.currentTarget.parentNode.classList.toggle('show');
						}} aria-expanded="false">
							Actions
						</button>
						<ul className="dropdown-menu" aria-labelledby="actionsDropdown" style={{ minWidth: 0, width: 'max-content', maxWidth: 220, whiteSpace: 'nowrap', right: 0, left: 'auto', fontSize: '0.92rem' }}>
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
								<Link className="dropdown-item d-flex align-items-center" href="/">
									{ReportCriticalValuesIcon} <span className="ms-2">Report critical values</span>
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="card-body p-0" style={{ padding: 0 }}>
					<div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mb-3 px-4 pt-4 px-2">
						<span className="bg-secondary-subtle p-2 px-3 rounded-3 border mb-2 mb-sm-0" style={{ minWidth: 220 }}>{resultEntryStart ? `Result Entry Started At: ${moment(resultEntryStart).format('LLLL')}` : null}</span>
						<span className="bg-secondary-subtle p-2 px-3 rounded-3 border" style={{ minWidth: 220 }}>{resultEntryEnd ? `Result Concluded on: ${moment(resultEntryEnd).format('LLLL')}` : null}</span>
					</div>
					<div className="bg-white rounded-4 mx-4 mb-4">
						<ResultEntryMainEntryBase
							rule={rule}
							handleComments={handleComments}
							comments={comments}
							setComments={setComments}
							hasDrugs={hasDrugs}
							testid={testid}
							ascensionid={ascensionid}
							setModifiedDrugs={setModifiedDrugs}
							isPinUsed={result.isPinOnResultEntry}
							handleSubmit={handleSubmit}
							handleCreateFields={handleCreateFields}
							handlestate={handlestate}
							isloading={isSaving} />
					</div>
				</div>
			</section>
			<style jsx>{`
				.hover-bg:hover {
					background: #f1f3f6;
					transition: background 0.2s;
				}
			`}</style>
		</div>
	);
}
