'use client';

import { useEffect, useRef, useState } from "react";
import { customFetch, customFetchMutation } from "../../../../../components/Auth/customFetch";
import {
    initialReadySelection, responseData, sameSelection, validWorkspace, smsErrorMessage, isUncertainSmsResponse,
    type ResultSmsPreview, type ResultSmsWorkspace,
} from "../../../../../lib/resultSmsWorkspace";

type Confirmation = { jobid: number; status: string };
const errorText = (error: unknown) => smsErrorMessage(error);

export function useResultSmsWorkspace(billingid: string, patientid: string, linkedId: string) {
    const [workspace, setWorkspace] = useState<ResultSmsWorkspace | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [selected, setSelected] = useState<number[]>([]);
    const [note, setNote] = useState("");
    const [preview, setPreview] = useState<ResultSmsPreview | null>(null);
    const [previewing, setPreviewing] = useState(false);
    const [sending, setSending] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [actionError, setActionError] = useState("");
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const [uncertain, setUncertain] = useState(false);
    const [revision, setRevision] = useState(0);
    const [historyRevision, setHistoryRevision] = useState(0);
    const alive = useRef(false);
    const sendLock = useRef(false);
    const previewLock = useRef(false);
    const generation = useRef(0);
    const previewGeneration = useRef<number | null>(null);
    const selectedRef = useRef<number[]>([]);
    const noteRef = useRef("");
    const loadingRef = useRef(true);
    const confirmedRef = useRef(false);
    const uncertainRef = useRef(false);
    const initialized = useRef(false);

    function invalidatePreview() {
        generation.current++;
        previewGeneration.current = null;
        previewLock.current = false;
        setPreview(null);
        setConfirmed(false);
        confirmedRef.current = false;
        setPreviewing(false);
    }

    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
            generation.current++;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        loadingRef.current = true;
        setLoadError("");
        setWorkspace(null);
        invalidatePreview();
        if (!/^[1-9]\d*$/.test(billingid)) {
            setLoadError("A valid billing ID is required.");
            setLoading(false);
            loadingRef.current = false;
            return;
        }
        const query = new URLSearchParams({ billingid });
        if (patientid) query.set("patientid", patientid);
        void (async () => {
            try {
                const data = responseData<ResultSmsWorkspace>(await customFetch(`sms/events/result-ready/workspace?${query}`));
                if (!validWorkspace(data, billingid, patientid)) throw new Error("SMS workspace identity could not be verified.");
                if (cancelled) return;
                setWorkspace(data);
                selectedRef.current = initialized.current
                    ? selectedRef.current.filter(id => data.tests.some(test => test.ascensionid === id && test.status === "ready"))
                    : initialReadySelection(data.tests, linkedId);
                setSelected(selectedRef.current);
                initialized.current = true;
            } catch (error) {
                if (!cancelled) setLoadError(errorText(error));
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    loadingRef.current = false;
                }
            }
        })();
        return () => { cancelled = true; };
    }, [billingid, patientid, linkedId, revision]);

    const eligible = Boolean(workspace?.smsAvailable && workspace.patient.phone && selected.length
        && selected.every(id => workspace.tests.some(test => test.ascensionid === id && test.status === "ready")));

    function changeSelection(ids: number[]) {
        if (sendLock.current) return;
        invalidatePreview();
        setActionError("");
        selectedRef.current = [...new Set(ids)].filter(id => workspace?.tests.some(test => test.ascensionid === id && test.status === "ready")).sort((a, b) => a - b);
        setSelected(selectedRef.current);
    }

    function changeNote(value: string) {
        if (sendLock.current) return;
        invalidatePreview();
        setActionError("");
        noteRef.current = value.slice(0, 1000);
        setNote(noteRef.current);
    }

    function refreshWorkspace() {
        if (sendLock.current) return;
        invalidatePreview();
        loadingRef.current = true;
        setLoading(true);
        setRevision(value => value + 1);
    }

    async function requestPreview() {
        const ids = [...selectedRef.current];
        const message = noteRef.current;
        if (sendLock.current || previewLock.current || !workspace?.smsAvailable || !workspace.patient.phone
            || !ids.length || !ids.every(id => workspace.tests.some(test => test.ascensionid === id && test.status === "ready"))
            || uncertainRef.current || loadingRef.current) return;
        invalidatePreview();
        const token = generation.current;
        previewLock.current = true;
        setPreviewing(true);
        setActionError("");
        try {
            const data = responseData<ResultSmsPreview>(await customFetchMutation(
                `sms/events/result-ready/preview?${new URLSearchParams({ billingid })}`,
                "POST", { ascensionids: ids, message },
            ));
            if (!alive.current || token !== generation.current) return;
            if (data.billingid !== Number(billingid) || data.patientid !== workspace?.patient.patientid
                || !Array.isArray(data.ascensionids) || !sameSelection(data.ascensionids, ids)
                || typeof data.phone !== "string" || !data.phone || typeof data.message !== "string"
                || typeof data.fingerprint !== "string" || !data.fingerprint
                || !Array.isArray(data.testNames) || !data.testNames.every(name => typeof name === "string")
                || !Number.isInteger(data.segments) || data.segments < 1
                || typeof data.encoding !== "string" || !Number.isInteger(data.pendingCount) || data.pendingCount < 0) {
                throw new Error("The preview does not match this patient and selection. Refresh results.");
            }
            previewGeneration.current = token;
            setPreview(data);
        } catch (error) {
            if (alive.current && token === generation.current) setActionError(errorText(error));
        } finally {
            if (alive.current && token === generation.current) {
                previewLock.current = false;
                setPreviewing(false);
            }
        }
    }

    async function send() {
        // Ref guard closes the gap before React commits disabled controls.
        if (sendLock.current || !preview || previewGeneration.current !== generation.current
            || !confirmedRef.current || !eligible || uncertainRef.current || loadingRef.current) return;
        sendLock.current = true;
        setSending(true);
        setActionError("");
        const token = generation.current;
        try {
            const response = await customFetchMutation(
                `sms/events/result-ready/send?${new URLSearchParams({ billingid })}`,
                "POST", { ascensionids: [...selectedRef.current], message: noteRef.current, fingerprint: preview.fingerprint },
            );
            if (!alive.current || token !== generation.current) return;
            if (response?.success === false) {
                if (isUncertainSmsResponse(response)) {
                    uncertainRef.current = true;
                    setUncertain(true);
                    const reason = smsErrorMessage(response).replace(/Retry the original operation\.?/gi, "").trim();
                    setActionError(`SMS outcome is uncertain. Review refreshed message history first; do not retry blindly.\n${reason}`);
                } else {
                    setActionError(smsErrorMessage(response, "The SMS request was rejected."));
                }
            } else {
                const data = responseData<Confirmation>(response);
                if (!Number.isInteger(data.jobid) || data.jobid < 1 || typeof data.status !== "string") throw new Error("Unconfirmed SMS response.");
                setConfirmation(data);
            }
        } catch (error) {
            if (alive.current && token === generation.current) {
                setUncertain(true);
                uncertainRef.current = true;
                setActionError(`SMS outcome is uncertain. Review refreshed message history first; do not retry blindly.\n${smsErrorMessage(error, "No confirmation was received.")}`);
            }
        } finally {
            if (alive.current && token === generation.current) {
                sendLock.current = false;
                setSending(false);
                invalidatePreview();
                setHistoryRevision(value => value + 1);
                loadingRef.current = true;
                setRevision(value => value + 1);
            }
        }
    }

    function confirm(value: boolean) {
        if (!sendLock.current) {
            confirmedRef.current = value;
            setConfirmed(value);
        }
    }

    function acknowledgeHistoryReview() {
        if (sendLock.current) return;
        setUncertain(false);
        uncertainRef.current = false;
        invalidatePreview();
        // Keep the failure reason visible even after reviewing history.
    }

    return {
        workspace, loading, loadError, selected, note, preview, previewing, sending, confirmed,
        actionError, confirmation, uncertain, historyRevision, eligible,
        changeSelection, changeNote, refreshWorkspace, requestPreview, send, confirm, acknowledgeHistoryReview,
    };
}
