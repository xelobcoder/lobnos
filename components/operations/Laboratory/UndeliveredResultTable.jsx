"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import dayjs from "dayjs";
import { customFetch, customPost } from "../../Auth/customFetch";
import SingleWorkFlowResultDeliveryModal from "./singleWorkFlowDeliveryResult";
import BulkWorkFlowResultDeliveryModal from "./bulkWorkFlowDeliveryResult";
import { RiAlertLine, RiCheckLine, RiExternalLinkLine, RiInboxArchiveLine, RiTruckLine, RiRefreshLine, RiSearchLine, RiCloseLine, RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import s from "./UndeliveredResults.module.css";
import OperationsWorkspaceNavigation from "../OperationsWorkspaceNavigation";

const defaults = { search: "", startDate: "", endDate: "", mode: "", issuesOnly: false };
const methods = { whatapp: 'WhatsApp', whatsapp: 'WhatsApp', email: 'Email', hardcopy: 'Printed copy', phonecall: 'Phone call' };
const dateText = value => value && dayjs(value).isValid() ? dayjs(value).format('DD MMM YYYY, HH:mm') : 'Date unavailable';
const normalizeRecords = records => records.map(item => ({ ...item, ascensionid: Number(item.ascensionid ?? item.ascension_id), ascension_id: Number(item.ascensionid ?? item.ascension_id), fullname: [item.firstname, item.middlename, item.lastname].filter(Boolean).join(' ') || item.fullname || 'Patient name unavailable' }));

export default function UndeliveredResultTable({ employeeid }) {
    const [rows, setRows] = useState([]), [total, setTotal] = useState(null), [loading, setLoading] = useState(true), [error, setError] = useState('');
    const [draftFilters, setDraftFilters] = useState({ ...defaults }), [filters, setFilters] = useState({ ...defaults }), [filterError, setFilterError] = useState('');
    const [page, setPage] = useState(1), [size, setSize] = useState(20), [revision, setRevision] = useState(0), [notice, setNotice] = useState('');
    const [selected, setSelected] = useState(new Set()), [deliveryRow, setDeliveryRow] = useState(null), [bulkOpen, setBulkOpen] = useState(false);
    const [issueRow, setIssueRow] = useState(null), [reason, setReason] = useState(''), [reasonError, setReasonError] = useState(''), [savingReason, setSavingReason] = useState(false);
    const request = useRef(0), allCheckbox = useRef(null), issueLock = useRef(false);
    const refresh = useCallback(() => { setSelected(new Set()); setRevision(value => value + 1); }, []);
    useEffect(() => {
        const id = ++request.current; let live = true;
        setLoading(true); setError(''); setSelected(new Set());
        const query = new URLSearchParams({ page: String(page), count: String(size) });
        for (const key of ['search','startDate','endDate','mode']) if (filters[key]) query.set(key, filters[key]);
        if (filters.issuesOnly) query.set('issuesOnly', 'true');
        customFetch(`result/delivery/record/result/undelivered?${query}`).then(response => {
            if (!live || request.current !== id) return;
            if (response?.status !== true || !Array.isArray(response?.records?.dataset)) throw new Error(response?.message || 'Unable to load undelivered results. Please retry.');
            const count = Math.max(0, Number(response.records.totalcount) || 0), last = Math.max(1, Math.ceil(count / size));
            if (page > last) { setPage(last); return; }
            setRows(normalizeRecords(response.records.dataset)); setTotal(count);
        }).catch(failure => { if (live && request.current === id) { setRows([]); setTotal(null); setError(failure.message || 'Unable to load undelivered results.'); } }).finally(() => { if (live && request.current === id) setLoading(false); });
        return () => { live = false; };
    }, [filters, page, size, revision]);
    useEffect(() => { if (allCheckbox.current) allCheckbox.current.indeterminate = selected.size > 0 && selected.size < rows.length; }, [selected, rows]);
    const issueCount = rows.filter(row => row.failurenotes || row.delivered_mode === 'not_delivered').length;
    const selectedItems = useMemo(() => rows.filter(row => selected.has(row.ascensionid)), [rows, selected]);
    const hasFilters = Object.entries(filters).some(([key,value]) => value !== defaults[key]);
    const pages = Math.max(1, Math.ceil((total || 0) / size));
    const change = (key, value) => setDraftFilters(previous => ({ ...previous, [key]: value }));
    function apply(event) {
        event.preventDefault(); setNotice('');
        if (draftFilters.startDate && draftFilters.endDate && draftFilters.startDate > draftFilters.endDate) { setFilterError('The end date must be on or after the start date.'); return; }
        setFilterError(''); setSelected(new Set()); setPage(1); setFilters({ ...draftFilters, search: draftFilters.search.trim() });
    }
    function clear() { setDraftFilters({ ...defaults }); setFilters({ ...defaults }); setPage(1); setFilterError(''); setSelected(new Set()); setNotice(''); }
    function toggle(id) { setSelected(previous => { const next = new Set(previous); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
    function openIssue(row) { setIssueRow(row); setReason(''); setReasonError(''); }
    async function saveIssue(event) {
        event.preventDefault(); if (issueLock.current) return;
        if (!reason.trim()) { setReasonError('Enter the reason delivery was unsuccessful.'); return; }
        issueLock.current = true; setSavingReason(true); setReasonError('');
        try {
            const response = await customPost('result/delivery/record', 'POST', { billingid: Number(issueRow.billingid), ascensionid: Number(issueRow.ascensionid), delivered_mode: 'not_delivered', delivered_at: new Date().toISOString(), notes: null, failurenotes: reason.trim() });
            if (response?.status !== true && response?.status !== 'success') throw new Error(response?.message || 'The delivery issue could not be saved. Please retry.');
            setIssueRow(null); setReason(''); setNotice('Delivery issue recorded. The result remains in the pending queue.'); refresh();
        } catch (failure) { setReasonError(failure.message || 'Unable to save this delivery issue. Your note has been kept.'); }
        finally { issueLock.current = false; setSavingReason(false); }
    }
    return <main className={s.page}>
        <header className={s.heading}><div><span className={s.eyebrow}>LABORATORY / RESULT DELIVERY</span><h1>Undelivered results</h1><p>Review ready results, follow up on delivery issues and record each handover.</p></div><button type="button" className={s.secondary} disabled={loading} onClick={refresh}><RiRefreshLine size={18} aria-hidden="true"/>Refresh</button></header>
        <OperationsWorkspaceNavigation current="delivery"/>
        <section className={s.summary} aria-label="Delivery queue summary">
            <div className={s.primaryMetric}><span className={s.metricIcon}><RiInboxArchiveLine size={22}/></span><div><span>{hasFilters ? 'Matching undelivered results' : 'Awaiting delivery'}</span><strong>{total == null ? '—' : total.toLocaleString()}</strong></div></div>
            <div><span className={s.metricIcon}><RiCheckLine size={22}/></span><div><span>Ready on this page</span><strong>{loading ? '—' : rows.length}</strong></div></div>
            <div><span className={s.issueIcon}><RiAlertLine size={22}/></span><div><span>Delivery issues on this page</span><strong>{loading ? '—' : issueCount}</strong></div></div>
        </section>
        <section className={s.panel} aria-label="Results pending delivery">
            <form className={s.filters} onSubmit={apply}>
                <div className={s.filterHeading}><h2>Find results</h2><span>Dates refer to result completion</span></div>
                <div className={s.filterGrid}><label className={s.searchField}>Search results<div><RiSearchLine size={18} aria-hidden="true"/><input type="search" maxLength={100} value={draftFilters.search} onChange={event=>change('search',event.target.value)} placeholder="Patient, patient ID, test or bill number"/></div></label>
                    <label>Requested delivery<select value={draftFilters.mode} onChange={event=>change('mode',event.target.value)}><option value="">Any method</option>{Object.entries(methods).filter(([key])=>key!=='whatsapp').map(([value,label])=><option key={value} value={value}>{label}</option>)}<option value="unspecified">Not specified</option></select></label>
                    <label>Completed from<input type="date" value={draftFilters.startDate} max={draftFilters.endDate || undefined} onChange={event=>change('startDate',event.target.value)}/></label>
                    <label>Completed to<input type="date" value={draftFilters.endDate} min={draftFilters.startDate || undefined} onChange={event=>change('endDate',event.target.value)}/></label>
                </div><div className={s.filterFooter}><label className={s.check}><input type="checkbox" checked={draftFilters.issuesOnly} onChange={event=>change('issuesOnly',event.target.checked)}/>Only results with delivery issues</label><div className={s.actions}><button type="button" className={s.textButton} onClick={clear}>Clear filters</button><button type="submit" className={s.primary} disabled={loading}>Apply filters</button></div></div>
                {filterError && <p className={s.error} role="alert">{filterError}</p>}
            </form>
            <div className={s.queueToolbar}><div><h2>Delivery queue</h2><span>{loading ? 'Loading results…' : error ? 'Results unavailable' : `${total?.toLocaleString() || 0} results${hasFilters ? ' matching your filters' : ' awaiting delivery'}`}</span></div><div className={s.actions}><label className={s.pageSize}>Rows per page<select value={size} disabled={loading} onChange={event=>{setSize(Number(event.target.value));setPage(1);setSelected(new Set());}}>{[10,20,50,100].map(value=><option key={value} value={value}>{value}</option>)}</select></label><button type="button" className={s.primary} disabled={loading || !selected.size} onClick={()=>setBulkOpen(true)}><RiTruckLine size={18} aria-hidden="true"/>Record selected{selected.size ? ` (${selected.size})` : ''}</button></div></div>
            {notice && <div className={s.notice} role="status">{notice}<button type="button" aria-label="Dismiss notification" onClick={()=>setNotice('')}><RiCloseLine size={18}/></button></div>}
            {selected.size>0 && <div className={s.selection}><strong>{selected.size} selected on this page</strong><span>Record delivery only after the result has been handed over or sent.</span><button type="button" onClick={()=>setSelected(new Set())}>Clear selection</button></div>}
            {error ? <div className={s.empty} role="alert"><RiAlertLine size={32}/><h3>We couldn’t load the delivery queue</h3><p>{error}</p><button type="button" className={s.secondary} onClick={refresh}>Retry</button></div> : loading && !rows.length ? <div className={s.empty} role="status"><RiRefreshLine size={30}/><h3>Loading the delivery queue…</h3><p>Checking completed and validated results.</p></div> : !rows.length ? <div className={s.empty}><RiInboxArchiveLine size={36}/><h3>{hasFilters ? 'No results match these filters' : 'You’re all caught up'}</h3><p>{hasFilters ? 'Try another patient, test or completion date.' : 'There are no completed and validated results awaiting delivery.'}</p>{hasFilters && <button type="button" className={s.secondary} onClick={clear}>Clear filters</button>}</div> : <>
                <div className={s.tableWrap} role="region" aria-label="Undelivered results table" tabIndex={0} aria-busy={loading}><table className={s.table}><thead><tr><th className={s.checkboxColumn}><input ref={allCheckbox} type="checkbox" aria-label="Select all results on this page" disabled={loading} checked={rows.length>0 && selected.size===rows.length} onChange={()=>setSelected(selected.size===rows.length ? new Set() : new Set(rows.map(row=>row.ascensionid)))}/></th><th>Patient</th><th>Test / ready since</th><th>Requested delivery</th><th>Follow-up</th><th>Actions</th></tr></thead><tbody>{rows.map(row=><tr key={row.ascensionid} data-selected={selected.has(row.ascensionid) || undefined}>
                    <td><input type="checkbox" aria-label={`Select ${row.fullname} — ${row.test_name || 'result'}`} disabled={loading} checked={selected.has(row.ascensionid)} onChange={()=>toggle(row.ascensionid)}/></td>
                    <td><div className={s.patient}><strong>{row.fullname}</strong><span>{row.fullpatientid || row.patientid || 'Patient ID unavailable'}</span><small>Bill #{row.billingid} · Accession #{row.ascensionid}</small></div></td>
                    <td><div className={s.record}><strong>{row.test_name || row.name || 'Laboratory test'}</strong><span>{dateText(row.completed_at)}</span><small className={s.validated}><RiCheckLine size={14} aria-hidden="true"/>Completed & validated</small></div></td>
                    <td><div className={s.record}><span className={s.method}>{methods[row.requested_mode] || (row.requested_mode ? String(row.requested_mode).replaceAll('_',' ') : 'Not specified')}</span>{row.requested_mode_detail && <span className={s.deliveryDetail}>{row.requested_mode_detail}</span>}</div></td>
                    <td>{row.failurenotes || row.delivered_mode==='not_delivered' ? <div className={s.issue}><span><RiAlertLine size={14} aria-hidden="true"/>Delivery issue</span><p>{row.failurenotes || 'A previous delivery attempt was unsuccessful.'}</p></div> : <span className={s.pending}>Awaiting handover</span>}</td>
                    <td><div className={s.rowActions}><button type="button" className={s.deliverButton} disabled={loading} onClick={()=>setDeliveryRow(row)}><RiTruckLine size={16} aria-hidden="true"/>Record delivery</button><div><button type="button" className={s.issueButton} disabled={loading} onClick={()=>openIssue(row)}>Log issue</button><a href={`/operations/laboratory/main/dailyRequest/visit?billingid=${encodeURIComponent(row.billingid)}&patientid=${encodeURIComponent(row.patientid)}&isOpenSideBarShow=false`} target="_blank" rel="noopener noreferrer">Open visit<RiExternalLinkLine size={14} aria-hidden="true"/></a></div></div></td>
                </tr>)}</tbody></table></div>
                <footer className={s.pagination}><span>Showing {(page-1)*size+1}–{Math.min(page*size,total || 0)} of {total?.toLocaleString()} results</span><div><button type="button" className={s.secondary} aria-label="Previous page" disabled={loading || page===1} onClick={()=>setPage(value=>value-1)}><RiArrowLeftSLine size={18}/>Previous</button><span>Page {page} of {pages}</span><button type="button" className={s.secondary} aria-label="Next page" disabled={loading || page>=pages} onClick={()=>setPage(value=>value+1)}>Next<RiArrowRightSLine size={18}/></button></div></footer>
            </>}
        </section>
        {deliveryRow && <SingleWorkFlowResultDeliveryModal key={deliveryRow.ascensionid} show onHide={()=>setDeliveryRow(null)} workflow="resultDelivery" item={deliveryRow} employeeid={Number(employeeid)} onSuccess={()=>{setDeliveryRow(null);setNotice('Result delivery recorded.');refresh();}}/>}
        {bulkOpen && <BulkWorkFlowResultDeliveryModal show onHide={()=>setBulkOpen(false)} employeeid={Number(employeeid)} items={selectedItems} onSuccess={()=>{setBulkOpen(false);refresh();}}/>}
        <Modal show={!!issueRow} onHide={()=>{if(!savingReason)setIssueRow(null)}} centered backdrop="static" keyboard={!savingReason}><form onSubmit={saveIssue}>
            <Modal.Header closeButton={!savingReason}><Modal.Title>Record a delivery issue</Modal.Title></Modal.Header><Modal.Body>{issueRow && <div className={s.issueContext}><strong>{issueRow.fullname}</strong><span>{issueRow.test_name || 'Laboratory result'} · Bill #{issueRow.billingid}</span></div>}<p className={s.help}>Keep a note for the next person following up. This result will remain awaiting delivery.</p><label className={s.reasonLabel} htmlFor="undelivered-reason">What prevented delivery?</label><textarea id="undelivered-reason" className={s.reasonInput} autoFocus rows={4} maxLength={500} required disabled={savingReason} value={reason} onChange={event=>setReason(event.target.value)} placeholder="For example, the patient could not be reached."/><div className={s.characterCount}>{reason.length}/500 characters</div>{reasonError && <div className={s.error} role="alert">{reasonError}</div>}</Modal.Body><Modal.Footer><button type="button" className={s.secondary} disabled={savingReason} onClick={()=>setIssueRow(null)}>Cancel</button><button type="submit" className={s.primary} disabled={savingReason || !reason.trim()}>{savingReason ? 'Saving…' : 'Save delivery issue'}</button></Modal.Footer>
        </form></Modal>
    </main>;
}
