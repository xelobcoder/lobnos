import { useState, useEffect } from "react";
import { customFetch, handleComments } from "../Auth/customFetch";
import { customPost } from "../Auth/customPost";
import Indicator from "../accessories/Reports/indicator";
import { toast } from 'react-toastify';
import Loader from "../accessories/Loader";
import { BarChart, Dangerous, History } from "@mui/icons-material";
import ResultEntryMainEntryBase from "./ResultEntryMainEntryBase";
import moment from "moment";
import { useApplicationSettings } from "../Auth/useApplicationContext";


export default function CreateTestRule({ clientdata }) {
	const { testid, test, patientid, billingid, employeeid, timerInitiated, ascensionid, resultEntryStart, resultEntryEnd } = clientdata;

	const { result } = useApplicationSettings();
	const [comments, setComments] = useState({ comments: '' })
	const [testname, setTestname] = useState("")
	const [resultEntered, setResultEntered] = useState(false);
	const [isloading, setLoading] = useState(true);
	const [rule, setRule] = useState([]);
	const [editCount, setEditCount] = useState(0);
	const [hasDrugs, setHasDrugs] = useState(false);
	const [modifiedDrugs, setModifiedDrugs] = useState
		([]);



	const getAscensionEditCount = async () => {
		customFetch(`ascension/edit/count?csvid=${billingid}&&ascensionid=${ascensionid}&&testid=${testid}&&ptid=${patientid}`)
			.then((result) => {
				setEditCount(result?.count);
			})
			.catch((err) => console.log(err))
	}






	useEffect(() => {
		const gettingFields = async function () {
			try {
				const commentsFetch = customFetch(
					`testpanel/list/customtestrule/previous/comments?testid=${testid}&&csvid=${billingid}&&ptid=${patientid}`
				);

				const testResultFetch = customFetch(
					`testpanel/list/customtestrule/previous?testid=${testid}&&ptid=${patientid}&&csvid=${billingid}`
				);

				const [resultResponse, commentsResponse] = await Promise.all([testResultFetch, commentsFetch]);

				function updatesResultForm(data) {
					const { testname, result, hasDrugs } = data;
					if (result && Array.isArray(result)) {
						setRule(result);
						if (result.length === 0) return;
						const hasAnyValueEntered = result.some((item, index) => item?.value != "");
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
					console.log('result entry logged!!!')
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

	const handleSubmit = async (ev) => {
		try {
			const transformed = rule.map((item, index) => {
				return { field: item?.name, value: item?.value };
			});
			const allHasValues = transformed.some((a, i) => a.value == "");
			if (allHasValues) {
				toast.error("some fields are empty", { autoClose: 2000 });
			}
			const data = { fields: transformed, csvid: billingid, ascensionid, employeeid, ptid: patientid, comments: comments.comments, test, testid, hasDrugs, drugs: hasDrugs ? modifiedDrugs : [] };
			if (data.employeeid && data.csvid && data.fields.length > 0) {
				const response = await customPost("result/entry/customtest", "POST", data);
				const { message, statusCode, status } = response;
				if (status == "success" && statusCode == 200) {
					toast.success(message, { autoClose: 500 });
				} else {
					toast.error(message, { autoClose: 2000 });
				}
			}
		} catch (err) {
			toast.error("something wrong occured", { autoClose: 1000 });
		}
	};


	const handleCreateFields = (ev) => {
		if (testid) {
			window.open(`/settings/testpanel/testlist/createfields?testid=${testid}&&testname=${testname}`)
		}
	}



	const renderingView = () => {
		if (isloading) return <Loader />
		else {
			return (
				<div>
					<div className="d-flex justify-content-between">
						<span className=" bg-secondary-subtle p-2 heightedBorder">{resultEntryStart ? `Result Entry Started At: ${moment(resultEntryStart).format('LLLL')}` : null}</span>
						<span className=" bg-secondary-subtle p-2 heightedBorder">{resultEntryEnd ? `Result Concluded on: ${moment(resultEntryEnd).format('LLLL')}` : null}</span>
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
			)
		}
	}

	return (
		<div>
			<section className="card mx-2 my-2">
				<div className="card-header d-flex justify-content-between">
					<div className="btn-group" role="group" aria-label="result form entry label">
						<button className="border d-flex br-5 p-1 mx-1 pls-color text-uppercase">
							<h4 title={`test edited ${editCount} times`}> {editCount} </h4> <Indicator resultEntered={resultEntered} />
						</button>
						<button className="border br-5 p-1 mx-1 pls-color text-uppercase">
							<h5>{testname}</h5>
						</button>
					</div>
					<div>
						<button className="btn btn-light btn-sm text-capitalize border-secondary border-2"><History /> Audit log</button>
						<button type='button' className="btn btn-dark btn-sm text-capitalize mx-1 ">
							<BarChart /> client test trend
						</button>
						<button type='button' className="btn btn-danger btn-sm text-capitalize"><Dangerous /> report critical values</button>
					</div>
				</div>
				<div className="card-body">
					{renderingView()}
				</div>
			</section>
		</div>
	)
}