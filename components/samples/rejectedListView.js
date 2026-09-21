"use client"
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { customFetch, customFetchMutation, parseDate } from "../../components/Auth/customFetch";
import { plsEncryption } from "../../lib/encryption";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import { handleSeverSideProcessingRejectedSample } from "../serverActions/ActionFiltering";
import { useApplicationSettings } from "../Auth/useApplicationContext";

export default function RejectedSamplesComponent({ data }) {
	const employeeid = useApplicationSettings().applicationsettings?.user?.employeeid;
	const [reviewTarget, setReviewTarget] = useState(null);
	const [reviewReason, setReviewReason] = useState('');
	const [reviewNotes, setReviewNotes] = useState('');
	const [busy, setBusy] = useState(false);

	const openReview = async (item) => {
		setBusy(true);
		try {
			const response = await customFetch(`physical-samples/ascension/${item.ascensionid}`);
			if (!response?.success) throw new Error(response?.message || 'No physical container is linked to this rejected test.');
			setReviewTarget(response.data);
			setReviewReason('');
			setReviewNotes('');
		} catch (error) { toast.error(error?.message || 'Unable to load rejected container.'); }
		finally { setBusy(false); }
	};

	const requestReview = async () => {
		if (!reviewTarget) return;
		setBusy(true);
		try {
			const response = await customFetchMutation(`physical-samples/${reviewTarget.id}/reviews`, 'POST', { reason: reviewReason });
			if (!response?.success) throw new Error(response?.message || 'Unable to request review.');
			setReviewTarget({ ...reviewTarget, latestReview: response.data });
			toast.success('Independent review requested.');
		} catch (error) { toast.error(error?.message || 'Unable to request review.'); }
		finally { setBusy(false); }
	};

	const decideReview = async (decision) => {
		if (!reviewTarget?.latestReview) return;
		setBusy(true);
		try {
			const response = await customFetchMutation(`physical-samples/${reviewTarget.id}/reviews/${reviewTarget.latestReview.id}/decision`, 'POST', { decision, notes: reviewNotes });
			if (!response?.success) throw new Error(response?.message || 'Unable to decide review.');
			setReviewTarget({ ...response.data.sample, latestReview: response.data.review });
			toast.success(decision === 'usable' ? 'Sample restored as usable.' : 'Rejection upheld; recollection is required.');
		} catch (error) { toast.error(error?.message || 'Unable to decide review.'); }
		finally { setBusy(false); }
	};

	const recollect = async () => {
		if (!reviewTarget) return;
		setBusy(true);
		try {
			const response = await customFetchMutation(`physical-samples/${reviewTarget.id}/recollect`, 'POST', {});
			if (!response?.success) throw new Error(response?.message || 'Unable to create recollection.');
			toast.success(`Recollection ${response.data.sample_uid} created.`);
			setReviewTarget(null);
		} catch (error) { toast.error(error?.message || 'Unable to create recollection.'); }
		finally { setBusy(false); }
	};

	const columns = [
		{ Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className="text-capitalize">{value}</div> },
		{
			Header: 'details', accessor: 'age', Cell: ({ value, row }) => {
				const { gender, mobilenumber } = row.original;
				return (<div>{value}{" || "}{gender}{" || "}{mobilenumber}</div>)
			}
		},

		{ Header: 'test', accessor: 'testname', Cell: ({ value }) => <span className="border-bottom border-danger border-2">{value}</span> },
		{ Header: 'collected on', accessor: "collectionEndDate", Cell: ({ value }) => parseDate(value) },
		{ Header: 'collected by', accessor: "sampleCollectedBy" },
		{ Header: 'validated On', accessor: "samplevalidatedon", Cell: ({ value }) => <div>{new Date(value).toLocaleDateString()}</div> },
		{ Header: 'last validated by', accessor: 'validatedby', Cell: ({ value }) => <div>{value}</div> },
		{ Header: 'reason', accessor: 'rejectionmessage', width: 200 },
		{
			Header: 'actions', accessor: '', Cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="d-flex justify-content-between pls-color">
						<button className="btn btn-sm btn-secondary pls-color"
							onClick={() => {
								window.open(`/operations/laboratory/sample/rejected/history?ascensionid=${plsEncryption(item.ascensionid.toString())}`)
							}}>
							history
						</button>
						<button className="btn btn-sm btn-warning mx-1 pls-color" disabled={busy} onClick={() => openReview(item)}>Review / Recollect</button>
					</div>
				)
			}
		}
	]


	return (
		<>
			<h6>Rejected Sample List</h6>
			<section>
				<PrimeTable column={columns} data={data} filtering={false} serverSideFiltering={true} handleSeverSideProcessing={handleSeverSideProcessingRejectedSample} />
			</section>
			{reviewTarget && <Modal show animation={false} backdrop="static" onHide={() => setReviewTarget(null)} dialogClassName="mt-3"><Modal.Header closeButton><Modal.Title className="h5">Rejected Container Review</Modal.Title></Modal.Header><Modal.Body><div className="border bg-light p-3 mb-3"><strong>{reviewTarget.sample_uid}</strong><div className="text-muted">{reviewTarget.sample_type_name || 'Specimen'} · {reviewTarget.container_type_name || 'Container'}</div><div className="mt-2">Linked tests: {reviewTarget.tests?.map((test) => test.testName).join(', ')}</div><div className="text-danger mt-2">Reason: {reviewTarget.rejection_reason}</div></div>{reviewTarget.communications?.map((communication) => <div className="border p-2 mb-3" key={communication.id}><div className="d-flex justify-content-between"><strong>Patient communication</strong><span className="text-capitalize">{communication.status}</span></div><div className="small text-muted mt-1">{communication.message}</div>{communication.attempts?.map((attempt) => <div className="small mt-1 text-capitalize" key={attempt.id}>{attempt.channel}: {attempt.status}{attempt.failure_reason ? ` — ${attempt.failure_reason}` : ''}</div>)}</div>)}{!reviewTarget.latestReview && <><label className="form-label fw-semibold">Why should another scientist review this?</label><textarea className="form-control" rows={3} value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} /></>}{reviewTarget.latestReview?.status === 'pending' && <>{Number(reviewTarget.latestReview.requested_by) === Number(employeeid) ? <div className="alert alert-info">Review pending. A different scientist must make the decision.</div> : <><label className="form-label fw-semibold">Independent review notes</label><textarea className="form-control" rows={3} value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} /></>}</>}{reviewTarget.status === 'recollection_required' && <div className="alert alert-warning">Rejection was upheld. Create a replacement physical container.</div>}</Modal.Body><Modal.Footer><button className="btn btn-outline-secondary" onClick={() => setReviewTarget(null)}>Close</button>{!reviewTarget.latestReview && <button className="btn btn-primary" disabled={busy || reviewReason.trim().length < 3} onClick={requestReview}>Request review</button>}{reviewTarget.latestReview?.status === 'pending' && Number(reviewTarget.latestReview.requested_by) !== Number(employeeid) && <><button className="btn btn-outline-danger" disabled={busy} onClick={() => decideReview('rejection_upheld')}>Uphold rejection</button><button className="btn btn-success" disabled={busy} onClick={() => decideReview('usable')}>Mark usable</button></>}{reviewTarget.status === 'recollection_required' && <button className="btn btn-primary" disabled={busy} onClick={recollect}>Create recollection</button>}</Modal.Footer></Modal>}
		</>
	)
}