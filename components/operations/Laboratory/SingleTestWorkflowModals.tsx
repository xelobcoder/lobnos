"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { customFetch, customPost, validatePin } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";

type WorkflowBaseProps = {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
};

type TestContext = {
  billingid: number;
  patientid: string;
  ascensionid: number;
  testid: number;
  testname: string;
  ascensionDate?: string;
  collectionStartDate?: string;
  collectionEndDate?: string;
  samplevalidatedon?: string;
  processingStartDate?: string;
  processingEndDate?: string;
  resultEntryStart?: string;
  resultEntryEnd?: string;
  isapproved?: number;
};

const formatWhen = (iso?: string) => {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleString();
};

type StepStatus = "done" | "pending";

const getDotColor = (status: StepStatus) => (status === "done" ? "var(--bs-success)" : "var(--bs-secondary)");

function StageTimeline({
  title,
  steps,
}: {
  title: string;
  steps: Array<{ label: string; when: string; extra?: string | null; status: StepStatus }>;
}) {
  return (
    <div className="mb-3 p-2 rounded border bg-body" style={{ fontFamily: "var(--theme-font-family)" }}>
      <div className="fw-semibold mb-2" style={{ fontSize: "0.92rem" }}>
        {title}
      </div>
      <div style={{ position: "relative", paddingLeft: 18 }}>
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 4,
            bottom: 4,
            width: 2,
            background: "var(--bs-border-color)",
          }}
        />
        <div className="d-flex flex-column gap-2">
          {steps.map((s) => (
            <div key={s.label} style={{ position: "relative", paddingLeft: 12 }}>
              <div
                style={{
                  position: "absolute",
                  left: -18,
                  top: 4,
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: "2px solid var(--bs-body-bg)",
                  background: getDotColor(s.status),
                }}
              />
              <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                {s.label}
              </div>
              <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                {s.when}
              </div>
              {s.extra ? (
                <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {s.extra}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SingleTestCollectionWorkflowModal({
  show,
  onHide,
  onSuccess,
  test,
}: WorkflowBaseProps & { test: TestContext }) {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const [submitting, setSubmitting] = useState(false);
  const [startAt, setStartAt] = useState<string | undefined>(undefined);
  const [endAt, setEndAt] = useState<string | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!show) return;
    setStartAt(test.collectionStartDate);
    setEndAt(test.collectionEndDate);
    const sync = async () => {
      try {
        setSyncing(true);
        const resp = await customFetch(`operations/overview/folder/open/transaction?billingid=${test.billingid}`);
        const result = resp?.result;
        const found =
          Array.isArray(result)
            ? result.find((r: any) => Number(r.ascension_id) === Number(test.ascensionid) || Number(r.testid) === Number(test.testid))
            : null;
        if (found?.collectionStartDate) setStartAt((prev) => prev || found.collectionStartDate);
        if (found?.collectionEndDate) setEndAt((prev) => prev || found.collectionEndDate);
      } catch {
      } finally {
        setSyncing(false);
      }
    };
    sync();
  }, [show]);

  const canInitiate = !startAt;
  const canComplete = Boolean(startAt) && !endAt;

  const updateStage = async (stage: "collectionStartDate" | "collectionEndDate") => {
    if (!employeeid) return toast.error("Missing employee id");
    const proceed = window.confirm(stage === "collectionStartDate" ? "Initiate sample collection for this test?" : "Complete sample collection for this test?");
    if (!proceed) return;
    try {
      setSubmitting(true);
      const value = new Date().toISOString();
      const payload = { ascensionid: test.ascensionid, testid: test.testid, collection: "true", samplemessage: "", value, stage, employeeid };
      const res = await customPost("ascension/collection/update/stage", "POST", payload);
      if (res?.status === true) {
        toast.success(stage === "collectionStartDate" ? "Collection started" : "Collection completed");
        if (stage === "collectionStartDate") setStartAt(value);
        if (stage === "collectionEndDate") setEndAt(value);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.message || "Failed to update collection");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" dialogClassName="pls-modal-top">
      <Modal.Header closeButton className="bg-body-tertiary">
        <Modal.Title>Sample Collection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-1 fw-semibold">{test.testname}</div>
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          Ascension: {test.ascensionid} • Test: {test.testid} • Billing: {test.billingid}
        </div>
        <hr />
        <StageTimeline
          title="Collection Timeline"
          steps={[
            {
              label: "Initiated",
              when: startAt ? formatWhen(startAt) : "Not started",
              status: startAt ? "done" : "pending",
            },
            {
              label: "Completed",
              when: endAt ? formatWhen(endAt) : "Not completed",
              status: endAt ? "done" : "pending",
            },
          ]}
        />
        {syncing ? (
          <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
            Syncing status...
          </div>
        ) : null}
        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>Start</div>
            <span className={`badge ${startAt ? "bg-success" : "bg-secondary"}`}>{formatWhen(startAt)}</span>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>End</div>
            <span className={`badge ${endAt ? "bg-success" : "bg-secondary"}`}>{formatWhen(endAt)}</span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="gap-2">
        <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={() => updateStage("collectionStartDate")} disabled={!canInitiate || submitting}>
          {submitting ? <Spinner size="sm" /> : "Initiate"}
        </Button>
        <Button variant="outline-success" onClick={() => updateStage("collectionEndDate")} disabled={!canComplete || submitting}>
          {submitting ? <Spinner size="sm" /> : "Complete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function SingleTestSampleValidationWorkflowModal({
  show,
  onHide,
  onSuccess,
  test,
}: WorkflowBaseProps & { test: TestContext }) {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<any | null>(null);
  const [decision, setDecision] = useState<"accept" | "reject" | "">("");
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!show) return;
    setDecision("");
    setRejectReason("");
    const run = async () => {
      try {
        setLoading(true);
        const resp = await customFetch(`phelobotomy/sample/assesment/list?billingid=${test.billingid}`);
        const found = Array.isArray(resp?.result) ? resp.result.find((r: any) => Number(r.testid) === Number(test.testid)) : null;
        setItem(found || null);
      } catch {
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [show, test.billingid, test.testid]);

  const submit = async () => {
    if (!employeeid) return toast.error("Missing employee id");
    if (!item) return toast.error("Unable to load sample for this test");
    if (!decision) return toast.error("Select Accept or Reject");
    if (decision === "reject" && !rejectReason.trim()) return toast.error("Provide a rejection reason");

    const updated = {
      ...item,
      validatedby: employeeid,
      approvalstatus: decision === "accept" ? 1 : 0,
      declinemessage: decision === "reject" ? rejectReason.trim() : null,
      validatedon: new Date().toISOString(),
      rejectionDetails: decision === "reject" ? { reason: rejectReason.trim() } : null,
    };

    try {
      setSubmitting(true);
      const res = await customPost("sample/transaction/sample/validation/update", "PUT", { testcollection: [updated] });
      if (res?.status === true) {
        toast.success(res?.message || "Sample validation updated");
        if (onSuccess) onSuccess();
        onHide();
      } else {
        toast.error(res?.message || "Failed to update sample validation");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" dialogClassName="pls-modal-top">
      <Modal.Header closeButton className="bg-body-tertiary">
        <Modal.Title>Sample Validation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-1 fw-semibold">{test.testname}</div>
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          Ascension: {test.ascensionid} • Test: {test.testid} • Billing: {test.billingid}
        </div>
        <hr />
        <StageTimeline
          title="Sample Validation Timeline"
          steps={[
            {
              label: "Validated",
              when: test.samplevalidatedon ? formatWhen(test.samplevalidatedon) : "Not validated",
              status: test.samplevalidatedon ? "done" : "pending",
            },
          ]}
        />
        {loading ? (
          <div className="text-center py-3">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="mb-2">Validated On: {test.samplevalidatedon ? formatWhen(test.samplevalidatedon) : "Not validated"}</div>
            <div className="d-flex gap-3">
              <Form.Check
                type="radio"
                id="sv-accept"
                label="Accept"
                checked={decision === "accept"}
                onChange={() => setDecision("accept")}
              />
              <Form.Check
                type="radio"
                id="sv-reject"
                label="Reject"
                checked={decision === "reject"}
                onChange={() => setDecision("reject")}
              />
            </div>
            {decision === "reject" ? (
              <div className="mt-3">
                <Form.Label>Rejection reason</Form.Label>
                <Form.Control as="textarea" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
            ) : null}
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="gap-2">
        <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
          Close
        </Button>
        <Button variant="primary" onClick={submit} disabled={loading || submitting}>
          {submitting ? <Spinner size="sm" /> : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function SingleTestProcessingWorkflowModal({
  show,
  onHide,
  onSuccess,
  test,
}: WorkflowBaseProps & { test: TestContext }) {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const [submitting, setSubmitting] = useState(false);
  const [startAt, setStartAt] = useState<string | undefined>(undefined);
  const [endAt, setEndAt] = useState<string | undefined>(undefined);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!show) return;
    setStartAt(test.processingStartDate);
    setEndAt(test.processingEndDate);
    const sync = async () => {
      try {
        setSyncing(true);
        const resp = await customFetch(`operations/overview/folder/open/transaction?billingid=${test.billingid}`);
        const result = resp?.result;
        const found =
          Array.isArray(result)
            ? result.find((r: any) => Number(r.ascension_id) === Number(test.ascensionid) || Number(r.testid) === Number(test.testid))
            : null;
        if (found?.processingStartDate) setStartAt((prev) => prev || found.processingStartDate);
        if (found?.processingEndDate) setEndAt((prev) => prev || found.processingEndDate);
      } catch {
      } finally {
        setSyncing(false);
      }
    };
    sync();
  }, [show]);

  const canStart = !startAt;
  const canEnd = Boolean(startAt) && !endAt;

  const updateStage = async (stage: "processingStartDate" | "processingEndDate") => {
    if (!employeeid) return toast.error("Missing employee id");
    const proceed = window.confirm(stage === "processingStartDate" ? "Start processing for this test?" : "Complete processing for this test?");
    if (!proceed) return;
    try {
      setSubmitting(true);
      const value = new Date().toISOString();
      const payload = { ascensionid: test.ascensionid, testid: test.testid, value, employeeid, stage };
      const res = await customPost("ascension/collection/update/stage", "POST", payload);
      if (res?.status === true) {
        toast.success(stage === "processingStartDate" ? "Processing started" : "Processing completed");
        if (stage === "processingStartDate") setStartAt(value);
        if (stage === "processingEndDate") setEndAt(value);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.message || "Failed to update processing");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" dialogClassName="pls-modal-top">
      <Modal.Header closeButton className="bg-body-tertiary">
        <Modal.Title>Processing</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-1 fw-semibold">{test.testname}</div>
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          Ascension: {test.ascensionid} • Test: {test.testid} • Billing: {test.billingid}
        </div>
        <hr />
        <StageTimeline
          title="Processing Timeline"
          steps={[
            {
              label: "Started",
              when: startAt ? formatWhen(startAt) : "Not started",
              status: startAt ? "done" : "pending",
            },
            {
              label: "Completed",
              when: endAt ? formatWhen(endAt) : "Not completed",
              status: endAt ? "done" : "pending",
            },
          ]}
        />
        {syncing ? (
          <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
            Syncing status...
          </div>
        ) : null}
        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>Start</div>
            <span className={`badge ${startAt ? "bg-success" : "bg-secondary"}`}>{formatWhen(startAt)}</span>
          </div>
          <div className="d-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: "0.9rem" }}>End</div>
            <span className={`badge ${endAt ? "bg-success" : "bg-secondary"}`}>{formatWhen(endAt)}</span>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="gap-2">
        <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
          Close
        </Button>
        <Button variant="outline-primary" onClick={() => updateStage("processingStartDate")} disabled={!canStart || submitting}>
          {submitting ? <Spinner size="sm" /> : "Start"}
        </Button>
        <Button variant="outline-success" onClick={() => updateStage("processingEndDate")} disabled={!canEnd || submitting}>
          {submitting ? <Spinner size="sm" /> : "Complete"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function SingleTestResultValidationWorkflowModal({
  show,
  onHide,
  onSuccess,
  test,
}: WorkflowBaseProps & { test: TestContext }) {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const settings = applicationsettings?.settings;
  const pinOnResultValidation = settings?.pinOnResultValidation == 1;
  const [approved, setApproved] = useState(false);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [patientName, setPatientName] = useState<string>("N/A");

  useEffect(() => {
    if (!show) return;
    setApproved(false);
    setPin("");
    const run = async () => {
      try {
        const resp = await customFetch(`register/personalinformation?patientid=${test.patientid}`);
        const p = resp?.result;
        const full = `${p?.designation || ""} ${p?.firstname || ""} ${p?.middlename || ""} ${p?.lastname || ""}`.trim();
        setPatientName(full || "N/A");
      } catch {
        setPatientName("N/A");
      }
    };
    run();
  }, [show, test.patientid]);

  const submit = async () => {
    if (!employeeid) return toast.error("Missing employee id");
    if (!approved) return toast.error("Approve is required");
    try {
      setSubmitting(true);
      if (pinOnResultValidation) {
        if (!pin) return toast.error("PIN is required");
        const vr = await validatePin(employeeid, pin);
        if (vr?.status == false) return toast.error(vr?.message || "Invalid PIN");
      }

      const payload = { username: patientName, employeeid, ascensionid: test.ascensionid };
      const res = await customPost(
        `test/approval/get/staffQualifiedToValidationResult?employeeid=${employeeid}&&ascensionid=${test.ascensionid}&&ascensionId=${test.ascensionid}`,
        "PUT",
        payload
      );
      if (res?.status === true) {
        toast.success("Validation successful");
        if (onSuccess) onSuccess();
        onHide();
      } else {
        toast.error(res?.message || "Validation failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" dialogClassName="pls-modal-top">
      <Modal.Header closeButton className="bg-body-tertiary">
        <Modal.Title>Result Validation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-1 fw-semibold">{test.testname}</div>
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          Ascension: {test.ascensionid} • Test: {test.testid} • Billing: {test.billingid}
        </div>
        <hr />
        <StageTimeline
          title="Result Validation Timeline"
          steps={[
            {
              label: "Validated",
              when: test.isapproved === 1 ? "Validated" : "Not validated",
              status: test.isapproved === 1 ? "done" : "pending",
            },
          ]}
        />
        <Form.Check
          type="switch"
          id="rv-approve"
          label="Approve this result"
          checked={approved}
          onChange={(e) => setApproved(e.target.checked)}
        />
        {pinOnResultValidation && approved ? (
          <div className="mt-3">
            <Form.Label>PIN</Form.Label>
            <Form.Control type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer className="gap-2">
        <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
          Close
        </Button>
        <Button variant="success" onClick={submit} disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : "Validate"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function BulkResultValidationWorkflowModal({
  show,
  onHide,
  onSuccess,
  tests,
  billingid,
  patientid,
}: WorkflowBaseProps & { tests: Array<{ ascensionid: number; testid: number; testname: string }>; billingid: number; patientid: string }) {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;
  const settings = applicationsettings?.settings;
  const pinOnResultValidation = settings?.pinOnResultValidation == 1;
  const [approved, setApproved] = useState(false);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [patientName, setPatientName] = useState<string>("N/A");

  const pendingAscensions = useMemo(() => tests, [tests]);

  useEffect(() => {
    if (!show) return;
    setApproved(false);
    setPin("");
    const run = async () => {
      try {
        const resp = await customFetch(`register/personalinformation?patientid=${patientid}`);
        const p = resp?.result;
        const full = `${p?.designation || ""} ${p?.firstname || ""} ${p?.middlename || ""} ${p?.lastname || ""}`.trim();
        setPatientName(full || "N/A");
      } catch {
        setPatientName("N/A");
      }
    };
    run();
  }, [show, patientid]);

  const submit = async () => {
    if (!employeeid) return toast.error("Missing employee id");
    if (!approved) return toast.error("Approve is required");
    if (pendingAscensions.length === 0) return toast.error("No tests to validate");
    try {
      setSubmitting(true);
      if (pinOnResultValidation) {
        if (!pin) return toast.error("PIN is required");
        const vr = await validatePin(employeeid, pin);
        if (vr?.status == false) return toast.error(vr?.message || "Invalid PIN");
      }

      const payloadBase = { username: patientName, employeeid };
      const results = await Promise.all(
        pendingAscensions.map((t) =>
          customPost(
            `test/approval/get/staffQualifiedToValidationResult?employeeid=${employeeid}&&ascensionid=${t.ascensionid}&&ascensionId=${t.ascensionid}`,
            "PUT",
            { ...payloadBase, ascensionid: t.ascensionid }
          )
        )
      );
      const ok = results.filter((r) => r?.status === true).length;
      const fail = results.length - ok;
      if (ok > 0) toast.success(`Validated ${ok} test(s)`);
      if (fail > 0) toast.error(`${fail} test(s) failed validation`);
      if (ok > 0 && onSuccess) onSuccess();
      if (fail === 0) onHide();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" dialogClassName="pls-modal-top">
      <Modal.Header closeButton className="bg-body-tertiary">
        <Modal.Title>Validate All Results (Billing {billingid})</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
          {pendingAscensions.length} test(s)
        </div>
        <div className="mt-2" style={{ maxHeight: 240, overflowY: "auto" }}>
          <ul className="mb-0">
            {pendingAscensions.map((t) => (
              <li key={t.ascensionid}>
                {t.testname} (Asc {t.ascensionid})
              </li>
            ))}
          </ul>
        </div>
        <hr />
        <Form.Check
          type="switch"
          id="rv-approve-all"
          label="Approve all listed tests"
          checked={approved}
          onChange={(e) => setApproved(e.target.checked)}
        />
        {pinOnResultValidation && approved ? (
          <div className="mt-3">
            <Form.Label>PIN</Form.Label>
            <Form.Control type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer className="gap-2">
        <Button variant="outline-secondary" onClick={onHide} disabled={submitting}>
          Close
        </Button>
        <Button variant="success" onClick={submit} disabled={submitting}>
          {submitting ? <Spinner size="sm" /> : "Validate All"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
