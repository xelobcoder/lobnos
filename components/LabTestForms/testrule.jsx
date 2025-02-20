import { useState, useEffect } from "react";
import { handleComments } from "../Auth/customFetch";
import { customPost } from "../Auth/customPost";
import Indicator from "../accessories/Reports/indicator";
import { toast, ToastContainer } from 'react-toastify';
import Loader from "../accessories/Loader";
import { BarChart, Dangerous, History } from "@mui/icons-material";
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

	const getAscensionEditCount = async () => {
		;
		const count = getAscensionEditCountServerideS({ billingid, testid, patientid, ascensionid })
		count ? setEditCount(count) : null
	}

	useEffect(() => {
		const gettingFields = async function () {
			try {
				const [resultResponse, commentsResponse] = await getResultEntryDataServerSide({ testid, billingid, patientid })


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

	const handleSubmit = async () => {
		try {
			const transformed = rule.map((item) => {
				return { field: item?.name, value: item?.value };
			});
			const allHasValues = transformed.some((a) => a.value == "");
			if (allHasValues) {
				toast.error("Some fields are empty", { autoClose: 2000 });
			}
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
		}
	};

	const handleCreateFields = () => {
		if (testid) {
			window.open(`/settings/testpanel/testlist/createfields?testid=${testid}&&testname=${testname}`);
		}
	};


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

	return (
		<div>
			<ToastContainer theme="colored" position="top-center" className={'text-sm'} />
			<section className="card mx-2">
				<div style={{ backgroundColor:'#FFFDEC'}} className="card-header p-2 d-flex flex-column flex-md-row justify-content-between pls-color fw-bold">
					<div className="btn-group mb-2 mb-md-0 " role="group" aria-label="result form entry label ">
						<h5 title={`test edited ${editCount} times`}> {editCount} </h5> <Indicator resultEntered={resultEntered} />
						<h5 >{testname}</h5>
					</div>
					<div style={{ marginTop: '-60px' }}>
						<Link className={`pls-color text-sm mx-2`} href="/" >
							{AuditLogIcon} Audit log
						</Link>
						<Link className={`pls-color text-sm mx-2`} href="/" type='Link' >
							{ClientTestTrendIcon} Client test trend
						</Link>
						<Link className={`pls-color text-sm mx-2`} href="/" type='Link' >
							{ReportCriticalValuesIcon} Report critical values
						</Link>
					</div>  
				</div>
				<div className="card-body">
					<div>
						<div className="d-flex flex-column flex-sm-row justify-content-between pls-color">
							<span className="bg-secondary-subtle p-2 heightedBorder mb-2 mb-sm-0">{resultEntryStart ? `Result Entry Started At: ${moment(resultEntryStart).format('LLLL')}` : null}</span>
							<span className="bg-secondary-subtle p-2 heightedBorder">{resultEntryEnd ? `Result Concluded on: ${moment(resultEntryEnd).format('LLLL')}` : null}</span>
						</div>
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
							handlestate={handlestate} />
					</div>
				</div>
			</section>
		</div>
	);
}
