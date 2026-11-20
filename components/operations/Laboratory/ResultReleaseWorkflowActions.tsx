'use client';

import { useState } from 'react';
import { Alert, Button, Dropdown, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { controlApi } from '../OperationalControlsWorkspace';
import { ResultReviewValues } from '../../ResutlUI/useCustomResultTemplating';
import ReportRichText from '../../ResultView/ReportRichText';
import PreviewPatientInformation from '../../petientsComponent/PreviewPatientInformation';
import styles from './ValidationModal.module.css';

const reviewReasons = [
     'I have reviewed and approved these results.',
     'Results verified and ready for release.',
     'Amended results reviewed and approved.',
];

type Props = {
     ascensionId: number;
     patientName: string;
     testName: string;
     workflow: any;
     onUpdated: () => void | Promise<void>;
};

const statusMessage = (workflow: any) => {
     if (!workflow) return 'Workflow status is unavailable.';
     if (workflow.releaseBlockedReason) return workflow.releaseBlockedReason;
     if (workflow.releaseStatus === 'awaiting_validation') return 'Complete the required result validations first.';
     if (workflow.releaseStatus === 'awaiting_different_validator') return 'A validator who did not enter the result must approve it.';
     if (workflow.releaseStatus === 'awaiting_manager_approval') return 'Manager approval is required before release.';
     if (workflow.releaseStatus === 'released') return 'This result has been signed and released.';
     if (workflow.differentReleaserRequired && workflow.validatorIds?.includes(workflow.viewerEmployeeId)) return 'A staff member who did not validate this result must release it.';
     if (!workflow.canRelease) return 'Your staff account is not eligible to release this result under the facility settings.';
     return 'This result is ready for an authorized staff member to sign and release.';
};

export default function ResultReleaseWorkflowActions({ ascensionId, patientName, testName, workflow, onUpdated }: Props) {
     const [show, setShow] = useState(false);
     const [intent, setIntent] = useState<'manager' | 'release'>('release');
     const [preview, setPreview] = useState<any>(null);
     const [loading, setLoading] = useState(false);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState('');
     const [reasonChoice, setReasonChoice] = useState(reviewReasons[0]);
     const [customReason, setCustomReason] = useState('');
     const reason = reasonChoice === 'other' ? customReason.trim() : reasonChoice;
     const [confirmed, setConfirmed] = useState(false);

     const open = async (action: 'manager' | 'release') => {
          setIntent(action);
          setShow(true);
          setLoading(true);
          setError('');
          setReasonChoice(reviewReasons[0]);
          setCustomReason('');
          setConfirmed(false);
          setPreview(null);
          try {
               setPreview(await controlApi(`reports/${ascensionId}/release-preview`));
          } catch (requestError: any) {
               setError(requestError?.message || 'Unable to load the result release preview.');
          } finally {
               setLoading(false);
          }
     };

     const submit = async () => {
          if (busy) return;
          if (!preview?.workflow || reason.trim().length < 3 || !confirmed) return;
          setBusy(true);
          setError('');
          try {
               if (intent === 'manager') {
                    await controlApi(`reports/${ascensionId}/manager-approval`, 'POST', {
                         revision: preview.workflow.revision,
                         reason: reason.trim(),
                    });
                    setPreview(await controlApi(`reports/${ascensionId}/release-preview`));
               } else {
                    await controlApi(`reports/${ascensionId}/release`, 'POST', {
                         revision: preview.workflow.revision,
                         reviewHash: preview.reviewHash,
                         reason: reason.trim(),
                         confirmed: true,
                    });
                    setPreview(await controlApi(`reports/${ascensionId}/release-preview`));
               }
               await onUpdated();
               setReasonChoice(reviewReasons[0]);
          setCustomReason('');
               setConfirmed(false);
          } catch (requestError: any) {
               setError(requestError?.message || 'The result workflow could not be updated.');
          } finally {
               setBusy(false);
          }
     };

     const currentWorkflow = preview?.workflow || workflow;
     const canSubmit = intent === 'manager'
          ? Boolean(currentWorkflow?.canApproveManager)
          : Boolean(currentWorkflow?.canRelease && preview?.reviewHash);
     const actionHint = loading ? 'Loading the current result review…'
          : !canSubmit ? statusMessage(currentWorkflow)
          : reason.trim().length < 3 ? 'Enter an Other reason, or choose a standard confirmation.'
          : !confirmed ? 'Tick the review confirmation above to enable this action.'
          : 'Review confirmed. You can now approve or sign and release.';

     return (
          <>
               {workflow?.canApproveManager ? (
                    <Dropdown.Item as="button" onClick={() => void open('manager')}>
                         Manager approval
                    </Dropdown.Item>
               ) : workflow?.managerApprovalRequired && !workflow?.managerApproved && workflow?.validationComplete ? (
                    <Dropdown.Item as="button" disabled title="Only a manager or administrator can approve">
                         Manager approval pending
                    </Dropdown.Item>
               ) : null}
               {workflow?.releaseStatus !== 'released' ? (
                    <Dropdown.Item
                         as="button"
                         disabled={!workflow?.canRelease}
                         title={!workflow?.canRelease ? statusMessage(workflow) : undefined}
                         onClick={() => void open('release')}
                    >
                         Sign &amp; Release Result
                    </Dropdown.Item>
               ) : (
                    <Dropdown.Item as="button" onClick={() => void open('release')} title={statusMessage(workflow)}>
                         View release
                    </Dropdown.Item>
               )}
               <Modal show={show} onHide={() => !busy && setShow(false)} size="xl" scrollable backdrop="static" dialogClassName={styles.dialog}>
                    <Modal.Header closeButton={!busy} className={styles.header}>
                         <div><Modal.Title className="h5 fw-bold mb-1">{intent === 'manager' ? 'Manager approval' : currentWorkflow?.released ? 'Released result' : 'Sign & Release'}</Modal.Title>
                              <p className="small text-muted mb-0">Review the patient, current values, and comments before authorizing this result.</p></div>
                    </Modal.Header>
                    <Modal.Body className={styles.body}>
                         {error ? <Alert variant="danger" role="alert">{error}</Alert> : null}
                         {loading ? (
                              <div className="d-flex align-items-center gap-2 py-4" role="status">
                                   <Spinner size="sm" /> Loading current result and workflow status…
                              </div>
                         ) : (
                              <>
                                   <div className={styles.layout}>
                                   <section className={styles.review} aria-label={`Result review: ${testName}`}>
                                        <div className={styles.sectionHeading}>
                                             <div><h2 className="h6 fw-bold mb-1">{testName}</h2><div className="small text-muted">Ordered test #{ascensionId}</div></div>
                                             <span className="badge rounded-pill text-bg-light border">Revision {currentWorkflow?.revision}</span>
                                        </div>
                                        <div className={styles.patient}>
                                             {preview?.report?.patientid ? <PreviewPatientInformation patientid={preview.report.patientid} compact /> : <strong>{patientName}</strong>}
                                        </div>
                                        <div className={styles.results}>
                                             <ResultReviewValues result={preview?.report?.records || []} testname={testName}
                                                  isResultView={false} resultsettings={preview?.report?.resultsettings} />
                                        </div>
                                        {preview?.report?.comments && <section className={styles.comments} aria-label="Result comments">
                                             <h3 className="h6 fw-semibold mb-2">Comments</h3>
                                             <ReportRichText html={String(preview.report.comments)} />
                                        </section>}
                                   </section>
                                   <aside className={styles.approval} aria-label="Release authorization">
                                   <div className={styles.sectionHeading}><h2 className="h6 fw-bold mb-0">{currentWorkflow?.released ? 'Release details' : intent === 'manager' ? 'Your approval' : 'Your sign-off'}</h2></div>
                                   <div className={styles.approvalBody}>
                                        <dl className="small mb-3">
                                             <dt>Validation</dt><dd>{currentWorkflow?.validationCount ?? 0} / {currentWorkflow?.validationRequired ?? 1} recorded</dd>
                                             <dt>Manager approval</dt><dd>{currentWorkflow?.managerApprovalRequired ? currentWorkflow?.managerApproved ? 'Approved' : 'Pending' : 'Not required'}</dd>
                                             <dt>Release</dt><dd>{currentWorkflow?.released ? 'Released' : 'Not released'}</dd>
                                        </dl>
                                        {currentWorkflow?.releasedByName && <p className="small fw-semibold">Released by {currentWorkflow.releasedByName}<br />{new Date(currentWorkflow.releasedAt).toLocaleString()}</p>}
                                        <Alert variant={currentWorkflow?.released ? 'success' : 'info'} className="small">{statusMessage(currentWorkflow)}</Alert>
                                   {preview?.history?.length > 0 && <details className="mb-3">
                                        <summary>Authorization history</summary>
                                        <Table responsive size="sm"><thead><tr><th>Action</th><th>Revision</th><th>Staff ID</th><th>Recorded</th></tr></thead>
                                             <tbody>{preview.history.map((event: any, index: number) => <tr key={index}>
                                                  <td>{event.action}</td><td>{event.revision}</td><td>{event.employeeid}</td><td>{new Date(event.at).toLocaleString()}</td>
                                             </tr>)}</tbody></Table>
                                   </details>}
                                   {!currentWorkflow?.released && <>
                                   <Form.Group className="mb-3" controlId={`release-reason-${ascensionId}`}>
                                        <Form.Label className="small fw-semibold">{intent === 'manager' ? 'Approval confirmation' : 'Release confirmation'}</Form.Label>
                                        <Form.Select value={reasonChoice} disabled={busy} onChange={event => setReasonChoice(event.target.value)}>
                                             {reviewReasons.map(value => <option key={value} value={value}>{value}</option>)}
                                             <option value="other">Other</option>
                                        </Form.Select>
                                   </Form.Group>
                                   {reasonChoice === 'other' && <Form.Group className="mb-3" controlId={`release-custom-reason-${ascensionId}`}>
                                        <Form.Label className="small fw-semibold">Other reason</Form.Label>
                                        <Form.Control as="textarea" rows={2} minLength={3} maxLength={2000} disabled={busy}
                                             value={customReason} onChange={event => setCustomReason(event.target.value)} placeholder="Enter your reason" />
                                   </Form.Group>}
                                   <Form.Check id={`release-confirmation-${ascensionId}`} type="checkbox" checked={confirmed} disabled={busy}
                                        onChange={event => setConfirmed(event.target.checked)}
                                        label={intent === 'manager' ? 'I reviewed these results and approve them for release.' : 'I reviewed these results and authorize their release.'} />
                                   </>}
                                   {intent === 'release' ? (
                                        <p className="small text-muted mt-2 mb-0">The release is recorded against the current result version and the identity of your authenticated account.</p>
                                   ) : null}
                                   </div></aside></div>
                              </>
                         )}
                    </Modal.Body>
                    <Modal.Footer className={styles.footer}>
                         {!currentWorkflow?.released && <div className="small fw-semibold me-auto" role="status" aria-live="polite">{actionHint}</div>}
                         <Button variant="outline-secondary" onClick={() => setShow(false)} disabled={busy}>Close</Button>
                         {!currentWorkflow?.released && <Button variant="primary" onClick={() => void submit()}
                              disabled={loading || busy || !canSubmit || reason.trim().length < 3 || !confirmed}>
                              {busy ? 'Saving…' : intent === 'manager' ? 'Approve result' : 'Sign & Release'}
                         </Button>}
                    </Modal.Footer>
               </Modal>
          </>
     );
}
