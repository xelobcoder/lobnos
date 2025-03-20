import React, { useState, useCallback, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { customFetch, customPost } from "../../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";
import AssessmentRenderingView from "./AssessmentViewSampleValidation";
import { useApplicationSettings } from "../../Auth/useApplicationContext";

export default function SampleAssessmentModal({ show, hide, billingid, removeClient }) {
	const [loading, setLoading] = useState(true);
	const [testcollection, setTestCollection] = useState([]);
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;
	const employeeid = user?.employeeid;

	const getClientAscention = useCallback(async (id) => {
		if (id) {
			try {
				setLoading(true);
				const { result } = await customFetch(`phelobotomy/sample/assesment/list?billingid=${id}`);
				setTestCollection(result);
			} catch (err) {
				setTestCollection([]);
			} finally {
				setLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		if (show) {
			getClientAscention(billingid);
		}
	}, [billingid, getClientAscention, show]);

	const validateSample = async (id, sat) => {
		const status = sat === "accept" ? 1 : 0;
		setTestCollection((prev) => {
			return prev.map((item) => {
				if (item.testid == id) {
					if (status == 1) {
						return {
							...item,
							validatedby: employeeid,
							approvalstatus: status,
							declinemessage: null,
							validatedon: new Date(),
						};
					} else {
						const { rejectionmessage } = item
						if (rejectionmessage == null || (typeof rejectionmessage == "string" && item.rejectionmessage.length <= 5)) {
							return toast.error('Warning!! Kindly Provide Reason for Sample Rejection')
						}
						return {
							...item,
							approvalstatus: status,
							validatedby: employeeid,
							validatedon: new Date(),
						};
					}
				}
				return item;
			});
		});
	};

	const handleDeclineMessage = async (ev, id) => {
		const message = ev.target.value;
		setTestCollection((prev) => {
			return prev.map((item) => {
				if (item.testid == id) {
					return { ...item, rejectionmessage: message };
				}
				return item;
			});
		});
	};

	const handleSubmit = async (ev) => {
		try {
			const hasEmptyDeclineMessage = testcollection.some(
				(item) => item.approvalstatus === 0 && !item.rejectionmessage
			);

			if (hasEmptyDeclineMessage) {
				return toast.error("Decline message is required for rejected samples.");
			}

			setLoading(true);

			const pushResponse = await customPost(`sample/transaction/sample/validation/update`, "PUT", { testcollection }
			);

			const { status, message } = pushResponse;

			if (status === true) {
				toast.success(message);
				removeClient(billingid);
			} else {
				toast.error(message);
			}
		} catch (error) {
			toast.error("An error occurred while processing your request.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};


	return (
		<>
			<ToastContainer theme="colored" position="top-center" className={'text-sm'} />
			<Modal show={show} backdrop="static" size="fullscreen" onHide={hide} scrollable>
				<Modal.Header closeButton>
					<h5>Sample Assessment And Validation</h5>
				</Modal.Header>
				<Modal.Body>
					<AssessmentRenderingView
						loading={loading}
						handleDeclineMessage={handleDeclineMessage}
						validateSample={validateSample}
						testcollection={testcollection}
					/>
				</Modal.Body>
				<Modal.Footer>
					<button
						className="btn btn-primary btn-sm"
						onClick={handleSubmit}
						disabled={loading}
					>
						Save
					</button>
					<button
						className="btn btn-danger btn-sm"
						onClick={hide}
						disabled={loading}
					>
						Close
					</button>
				</Modal.Footer>
			</Modal>
		</>
	);
}