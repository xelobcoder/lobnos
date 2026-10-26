import React, { useState, useEffect, useRef } from 'react';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';
import { roleAllowed } from '../../Auth/roles';
import { Modal, Table, Button, Spinner, Form } from 'react-bootstrap';

import { toast } from 'react-toastify';

import globalStyles from '../../../styles/SmsTemplateList.module.css'; // Existing global styles
import chartComponentStyles from './Chart.module.css';
import { RiCheckFill, RiErrorWarningFill, RiCloseCircleFill } from '@remixicon/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart, // NEW: For responsive charts
    // ReferenceLine // Already imported, good for explicit limits
} from 'recharts';
import { useRouter } from 'next/navigation';
import { useApplication } from '../../Auth/useApplicationContext';

// --- Professional Color Palette (Inspired by ShadCN/Tailwind) ---
const CHART_COLORS = {
    primary: 'hsl(222, 47%, 55%)',        // Muted blue for QC values (vibrant yet professional)
    mean: 'hsl(160, 50%, 45%)',           // Teal-green for mean (calm and stable)
    sd1: 'hsl(48, 60%, 55%)',             // Soft amber for ±1SD (neutral, non-alarming)
    sd2Warning: 'hsl(30, 70%, 50%)',      // Warm orange for ±2SD (warning, attention-grabbing)
    sd3Action: 'hsl(0, 65%, 50%)',        // Deep red for ±3SD (critical, urgent)
    grid: 'hsl(210, 20%, 90%)',           // Light gray for grid lines (subtle, non-intrusive)
    axisLine: 'hsl(210, 15%, 75%)',       // Medium gray for axis lines (clear but understated)
    text: 'hsl(210, 30%, 20%)',           // Dark gray for primary text (high contrast)
    textMuted: 'hsl(210, 20%, 50%)',      // Muted gray for secondary text (ticks, legend)
    tooltipBackground: 'hsl(0, 0%, 98%)', // Near-white for tooltip background (clean, light)
    tooltipBorder: 'hsl(210, 20%, 85%)',  // Light gray for tooltip border
};

interface QCSession {
    id: string;
    controlMaterialId: string;
    comments: string | null;
    createdby: number;
    updatedby: number;
    createdAt: string;
    updatedAt: string;
    control_material_name: string;
    created_by_username: string;
}

interface FetchResponse {
    data: QCSession[];
    total: number;
    page: number;
    totalPages: number;
}

interface QCReading {
    id: string;
    sessionId: string;
    parameterId: string;
    parameter: string;
    value: string;
    status: 'normal' | 'warning' | 'critical' | 'unmonitored';
    createdAt: string | null;
    createdby: number;
    controlMaterialId: string;
    unit: string;
    standardDeviation: string;
    warningLimit: string;
    actionLimit: string;
    validationNotes: string | null;
    updatedby: number;
    updatedAt: string;
    mean?: string;
}

interface WestgardViolation {
    rule: string;
    description: string;
}

// Custom Tooltip for Recharts
const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className={chartComponentStyles.customTooltip}>
                <p className={chartComponentStyles.tooltipLabel}>{`Time/Point: ${label}`}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} className={chartComponentStyles.tooltipItem} style={{ color: pld.color }}>
                        <span className={chartComponentStyles.tooltipItemName}>{`${pld.name}: `}</span>
                        <span className={chartComponentStyles.tooltipItemValue}>{parseFloat(pld.value).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};


export const QCSessionsTable: React.FC = () => {
    const [sessions, setSessions] = useState<QCSession[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [displayReadingsModal, setDisplayReadingsModal] = useState<boolean>(false);
    const [currentReadings, setCurrentReadings] = useState<QCReading[]>([]);
    const [readingsLoading, setReadingsLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [westgardViolations, setWestgardViolations] = useState<{ [key: string]: WestgardViolation[] }>({});
    const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(null);
    const [bypassSession, setBypassSession] = useState<QCSession | null>(null);
    const [bypassReason, setBypassReason] = useState('');
    const router = useRouter();
    const currentUser = useApplication()?.user;
    const employeeId = Number(currentUser?.employeeid);
    const canBypassQc = roleAllowed(currentUser?.role, ['admin']);
    const [listError,setListError]=useState(''),[readingsError,setReadingsError]=useState(''),[reviewError,setReviewError]=useState(''),[reviewedSession,setReviewedSession]=useState<QCSession|null>(null),[chartsOpen,setChartsOpen]=useState(false);
    const listRequest=useRef(0),readingRequest=useRef(0),reviewLock=useRef(false);

    useEffect(() => {
        fetchSessions(rows, currentPage);
    }, [currentPage, rows]);

    const fetchSessions = async (limit:number,page:number) => {
        const request=++listRequest.current;setLoading(true);setListError('');
        try{const response:FetchResponse=await customFetch(`qc-sessions?limit=${limit}&page=${page}`);if(request!==listRequest.current)return;
            if(!Array.isArray(response?.data))throw Error('QC sessions could not be loaded');
            const last=Math.max(1,Number(response.totalPages)||1);if(page>last){setCurrentPage(last);return}
            setSessions(response.data);setTotalRecords(Number(response.total)||0);setTotalPages(last);
        }catch{if(request!==listRequest.current)return;setListError('QC sessions could not be loaded. Please retry.');setSessions([])}
        finally{if(request===listRequest.current)setLoading(false)}
    };

    const fetchReadings = async (session: QCSession) => {
        const request=++readingRequest.current;setReviewedSession(session);setDisplayReadingsModal(true);setReadingsLoading(true);setReadingsError('');setReviewError('');setCurrentReadings([]);setWestgardViolations({});setChartsOpen(false);
        try {
            const response=await customFetch(`qc-readings/session/${session.id}?page=1&limit=100`);
            if(request!==readingRequest.current)return;
            if(!Array.isArray(response))throw Error('Readings could not be loaded');
            setCurrentReadings(response);setWestgardViolations(evaluateWestgardRules(response));
        }catch(error:any){if(request===readingRequest.current)setReadingsError(error.message||'Readings could not be loaded')}
        finally{if(request===readingRequest.current)setReadingsLoading(false)}
    };

    const evaluateWestgardRules = (readings: QCReading[]): { [key: string]: WestgardViolation[] } => {
        const violations: { [key: string]: WestgardViolation[] } = {};
        const sortedReadings = [...readings].sort((a, b) =>
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        );

        sortedReadings.forEach((reading, index) => {
            violations[reading.id] = [];
            const value = parseFloat(reading.value);
            const mean = parseFloat(reading.mean || '');
            const sd = parseFloat(reading.standardDeviation);

            if (isNaN(value) || isNaN(mean) || isNaN(sd) || sd === 0) {
                violations[reading.id].push({ rule: 'Data Error', description: 'Invalid numeric data for QC analysis.' });
                return;
            }
            const zScore = (value - mean) / sd;
            if (Math.abs(zScore) > 2) violations[reading.id].push({ rule: '1_2s', description: `Exceeds Mean ± 2SD (Z: ${zScore.toFixed(2)})` });
            if (Math.abs(zScore) > 3) violations[reading.id].push({ rule: '1_3s', description: `Exceeds Mean ± 3SD (Z: ${zScore.toFixed(2)})` });

            if (index > 0) {
                const prevReading = sortedReadings[index - 1];
                if (prevReading.parameterId === reading.parameterId) {
                    const prevValue = parseFloat(prevReading.value);
                    const prevMean = parseFloat(prevReading.mean || '');
                    const prevSd = parseFloat(prevReading.standardDeviation);
                    if (!isNaN(prevValue) && !isNaN(prevMean) && !isNaN(prevSd) && prevSd !== 0) {
                        const prevZScore = (prevValue - prevMean) / prevSd;
                        if (Math.abs(zScore) > 2 && Math.abs(prevZScore) > 2 && Math.sign(zScore) === Math.sign(prevZScore)) {
                            violations[reading.id].push({ rule: '2_2s', description: '2 consecutive points > ±2SD (same side).' });
                        }
                        if (Math.abs(zScore - prevZScore) > 4) { // R4s rule based on Z-scores
                            violations[reading.id].push({ rule: 'R_4s', description: 'Range between consecutive points > 4SD.' });
                        }
                    }
                }
            }
            const relevantPrevReadings = sortedReadings.slice(0, index).filter(r => r.parameterId === reading.parameterId).reverse();
            if (relevantPrevReadings.length >= 3) {
                const lastFourZScores = [zScore, ...relevantPrevReadings.slice(0, 3).map(r => (parseFloat(r.value) - parseFloat(r.mean || '')) / parseFloat(r.standardDeviation))].filter(z => !isNaN(z));
                if (lastFourZScores.length === 4 && lastFourZScores.every(z => Math.abs(z) > 1) && lastFourZScores.every(z_ => Math.sign(z_) === Math.sign(lastFourZScores[0]))) {
                    violations[reading.id].push({ rule: '4_1s', description: '4 consecutive points > ±1SD (same side).' });
                }
            }
            if (relevantPrevReadings.length >= 9) {
                const lastTenDeviations = [value - mean, ...relevantPrevReadings.slice(0, 9).map(r => parseFloat(r.value) - parseFloat(r.mean || r.value))].filter(dev => !isNaN(dev));
                if (lastTenDeviations.length === 10 && lastTenDeviations.every(dev => Math.sign(dev) === Math.sign(lastTenDeviations[0])) && Math.sign(lastTenDeviations[0]) !== 0) {
                    violations[reading.id].push({ rule: '10_x', description: '10 consecutive points on same side of mean.' });
                }
            }
        });
        return violations;
    };

    const prepareChartData = (readingsForChart: QCReading[]) => {
        if (!readingsForChart || readingsForChart.length === 0) return [];
        const firstValidReading = readingsForChart.find(r => r.mean && r.standardDeviation);
        if (!firstValidReading) return [];
        const chartMean = parseFloat(firstValidReading.mean!);
        const chartSD = parseFloat(firstValidReading.standardDeviation!);
        if (isNaN(chartMean) || isNaN(chartSD) || chartSD === 0) return [];

        return readingsForChart.map((reading, index) => {
            const value = parseFloat(reading.value);
            return {
                name: reading.createdAt ? new Date(reading.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `Pt ${index + 1}`,
                value: isNaN(value) ? null : value,
                meanLine: chartMean,
                plus1SD: chartMean + chartSD, minus1SD: chartMean - chartSD,
                plus2SD: chartMean + 2 * chartSD, minus2SD: chartMean - 2 * chartSD,
                plus3SD: chartMean + 3 * chartSD, minus3SD: chartMean - 3 * chartSD,
            };
        }).filter(d => d.value !== null);
    };

    const hideReadingsModal = () => {
        readingRequest.current++;setReviewedSession(null);setDisplayReadingsModal(false); setCurrentReadings([]); setWestgardViolations({});
    };

    const handleNewReading = (session: QCSession) => {
        router.push(`/operations/laboratory/quality-control/qc-recording/${session.id}/${session.controlMaterialId}`);
    };

    const reviewSession = async (session: QCSession, decision: 'accepted' | 'bypassed', reason?: string) => {
        if(reviewLock.current)return false;
        if (!employeeId) {
            toast.error('Your employee session could not be identified.');
            return false;
        }
        reviewLock.current=true;setReviewingSessionId(session.id);setReviewError('');
        try {
            const action = decision === 'accepted' ? 'accept-for-results' : 'bypass-for-results';
            const response = await customFetchMutation(`qc-sessions/${session.id}/${action}?employeeid=${employeeId}`, 'POST', decision === 'bypassed' ? { reason } : {});
            if (response?.status !== true) throw new Error(response?.error || 'QC review was not saved');
            toast.success(decision === 'accepted' ? 'QC accepted for result entry' : 'QC bypass recorded');
            await fetchSessions(rows, currentPage);
            return true;
        } catch (error: any) {
            setReviewError(error?.message || error?.error || 'Could not save QC review');toast.error(error?.message || error?.error || 'Could not save QC review');
            return false;
        } finally {
            reviewLock.current=false;setReviewingSessionId(null);
        }
    };

    const submitBypass = async () => {
        if (!bypassSession || !bypassReason.trim()) {
            toast.error('A reason is required to bypass QC.');
            return;
        }
        if (await reviewSession(bypassSession, 'bypassed', bypassReason.trim())) {
            setBypassSession(null);
            setBypassReason('');
        }
    };

    const formatNumericString = (valueStr: string | null | undefined, decimalPlaces: number = 2): string => {
        if (valueStr === null || valueStr === undefined) return 'N/A';
        const num = parseFloat(valueStr);
        return isNaN(num) ? valueStr : num.toFixed(decimalPlaces);
    };

    const groupedReadings = currentReadings.reduce((acc, reading) => {
        const key = reading.parameterId || reading.parameter;
        if (!acc[key]) acc[key] = { parameterName: reading.parameter, readings: [] };
        acc[key].readings.push(reading);
        acc[key].readings.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        return acc;
    }, {} as Record<string, { parameterName: string; readings: QCReading[] }>);

    return (
        <div>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3"><span className="text-muted">{totalRecords} sessions · Page {currentPage} of {Math.max(1,totalPages)}</span><div className="d-flex align-items-center gap-2"><label htmlFor="qc-page-size">Rows</label><select id="qc-page-size" className="form-select" value={rows} disabled={loading} onChange={e=>{setRows(Number(e.target.value));setCurrentPage(1)}}>{[10,20,50].map(n=><option key={n} value={n}>{n}</option>)}</select><Button variant="outline-primary" disabled={loading} onClick={()=>void fetchSessions(rows,currentPage)}>Refresh sessions</Button></div></div>
            {listError?<div role="alert" className="alert alert-danger">{listError} <Button variant="outline-danger" onClick={()=>void fetchSessions(rows,currentPage)}>Retry sessions</Button></div>:loading?<div role="status" className="p-4">Loading QC sessions…</div>:!sessions.length?<div className="p-4 text-center text-muted">No QC sessions found. Use New QC session to begin.</div>:<><div className="table-responsive" role="region" aria-label="QC session list" tabIndex={0}><Table><thead><tr><th>Control material / session</th><th>Created by</th><th>Created</th><th>Actions</th></tr></thead><tbody>{sessions.map(session=><tr key={session.id}><td><strong>{session.control_material_name}</strong><small className="d-block text-muted">{session.id}</small></td><td>{session.created_by_username||'Not recorded'}</td><td>{session.createdAt?new Date(session.createdAt).toLocaleString():'Not recorded'}</td><td><div className="d-flex flex-wrap gap-2"><Button variant="outline-primary" disabled={reviewingSessionId!==null} onClick={()=>void fetchReadings(session)}>Review results</Button><Button variant="outline-secondary" disabled={reviewingSessionId!==null} onClick={()=>handleNewReading(session)}>Record readings</Button>{canBypassQc&&<Button variant="outline-danger" disabled={reviewingSessionId!==null} onClick={()=>{setBypassReason('');setReviewError('');setBypassSession(session)}}>Bypass QC</Button>}</div></td></tr>)}</tbody></Table></div><div className="d-flex justify-content-between align-items-center mt-3"><Button variant="outline-primary" disabled={currentPage===1||loading} onClick={()=>setCurrentPage(p=>p-1)}>Previous page</Button><span>Page {currentPage}</span><Button variant="outline-primary" disabled={currentPage>=totalPages||loading} onClick={()=>setCurrentPage(p=>p+1)}>Next page</Button></div></>}


            <Modal
                show={Boolean(bypassSession)}
                onHide={() => { if(!reviewingSessionId){setBypassSession(null);setBypassReason('')} }}
                animation={false}
                centered={false}
                dialogClassName="mt-3"
            >
                <Modal.Header closeButton={!reviewingSessionId}>
                    <Modal.Title>Record QC Bypass</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-2">A reason will be recorded in the QC audit trail.</p>
                    {reviewError&&<div role="alert" className="alert alert-danger">{reviewError}</div>}<Form.Group controlId="qc-bypass-reason">
                        <Form.Label>Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={bypassReason}
                            onChange={(event) => setBypassReason(event.target.value)}
                            maxLength={1000}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" disabled={reviewingSessionId!==null} onClick={() => { setBypassSession(null); setBypassReason(''); }}>Cancel</Button>
                    <Button variant="danger" disabled={!bypassReason.trim() || reviewingSessionId !== null} onClick={() => void submitBypass()}>
                        {reviewingSessionId ? <Spinner size="sm" className="me-2" /> : null}Record Bypass
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={displayReadingsModal} onHide={()=>{if(!reviewingSessionId)hideReadingsModal()}} size="xl" backdrop="static" keyboard={!reviewingSessionId}>
                <Modal.Header closeButton={!reviewingSessionId}>
                    <Modal.Title>Review QC results</Modal.Title>
                </Modal.Header>
                <Modal.Body><p className="text-muted">{reviewedSession?.control_material_name} · Session {reviewedSession?.id}</p>{reviewError&&<div role="alert" className="alert alert-danger">{reviewError}</div>}
                    {readingsLoading ? (
                        <div className="text-center py-5"><Spinner animation="border" style={{ color: CHART_COLORS.primary }} /> <span style={{ marginLeft: '10px', color: CHART_COLORS.textMuted }}>Loading readings...</span></div>
                    ) : readingsError ? <div role="alert" className="alert alert-danger">{readingsError} <Button variant="outline-danger" onClick={()=>reviewedSession&&void fetchReadings(reviewedSession)}>Retry readings</Button></div> : Object.keys(groupedReadings).length > 0 ? (
                        <>
                            <details onToggle={e=>setChartsOpen(e.currentTarget.open)} className="mb-3"><summary className="text-primary">Levey–Jennings charts and analysis</summary>{chartsOpen && Object.entries(groupedReadings).map(([parameterKey, data]) => {
                                const chartData = prepareChartData(data.readings);
                                if (chartData.length === 0) {
                                    return (
                                        <div key={parameterKey} className={chartComponentStyles.chartWrapper}>
                                            <h5>{data.parameterName} - Levey-Jennings Chart</h5>
                                            <p style={{ color: CHART_COLORS.textMuted }}>Not enough data or invalid data to display chart for {data.parameterName}.</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div key={parameterKey} className={chartComponentStyles.chartWrapper}>
                                        <h5>{data.parameterName} - Levey-Jennings Chart</h5>
                                        <div style={{ width: '100%', height: 400 }}> {/* Container for ResponsiveContainer */}
                                            <div style={{ width: '100%', height: 400 }}>
                                                <div style={{ width: '100%', height: 400 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart
                                                            data={chartData}
                                                            margin={{ top: 5, right: 30, left: 0, bottom: 25 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                                                            <XAxis
                                                                dataKey="name"
                                                                stroke={CHART_COLORS.axisLine}
                                                                tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
                                                                tickLine={{ stroke: CHART_COLORS.axisLine }}
                                                                label={{ value: 'Reading Sequence / Time', position: 'insideBottom', offset: -15, fill: CHART_COLORS.textMuted, fontSize: 12 }}
                                                            />
                                                            <YAxis
                                                                stroke={CHART_COLORS.axisLine}
                                                                tick={{ fill: CHART_COLORS.textMuted, fontSize: 12 }}
                                                                tickLine={{ stroke: CHART_COLORS.axisLine }}
                                                                label={{ value: data.readings[0]?.unit || 'Value', angle: -90, position: 'insideLeft', fill: CHART_COLORS.textMuted, fontSize: 12, dx: -5 }}
                                                                domain={['auto', 'auto']}
                                                                allowDataOverflow={true}
                                                            />
                                                            <Tooltip content={<CustomTooltipContent />} cursor={{ stroke: CHART_COLORS.textMuted, strokeDasharray: '3 3' }} />
                                                            <Legend wrapperStyle={{ fontSize: 12, color: CHART_COLORS.textMuted, paddingTop: '10px' }} />

                                                            <Area
                                                                type="monotone"
                                                                dataKey="value"
                                                                name="QC Value"
                                                                stroke={CHART_COLORS.primary}
                                                                fill={CHART_COLORS.primary}
                                                                fillOpacity={0.4} // Slightly higher opacity for prominence
                                                                strokeWidth={2}
                                                                dot={{ r: 3, fill: CHART_COLORS.primary, strokeWidth: 1, stroke: CHART_COLORS.tooltipBackground }}
                                                                activeDot={{ r: 5, strokeWidth: 2 }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="meanLine"
                                                                name="Mean"
                                                                stroke={CHART_COLORS.mean}
                                                                fill={CHART_COLORS.mean}
                                                                fillOpacity={0.05} // Very low opacity for subtle fill
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="plus1SD"
                                                                name="+1 SD"
                                                                stroke={CHART_COLORS.sd1}
                                                                fill={CHART_COLORS.sd1}
                                                                fillOpacity={0.05}
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="minus1SD"
                                                                name="-1 SD"
                                                                stroke={CHART_COLORS.sd1}
                                                                fill={CHART_COLORS.sd1}
                                                                fillOpacity={0.05}
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="plus2SD"
                                                                name="+2 SD (Warning)"
                                                                stroke={CHART_COLORS.sd2Warning}
                                                                fill={CHART_COLORS.sd2Warning}
                                                                fillOpacity={0.1} // Slightly higher for warning visibility
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="minus2SD"
                                                                name="-2 SD (Warning)"
                                                                stroke={CHART_COLORS.sd2Warning}
                                                                fill={CHART_COLORS.sd2Warning}
                                                                fillOpacity={0.1}
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="plus3SD"
                                                                name="+3 SD (Action)"
                                                                stroke={CHART_COLORS.sd3Action}
                                                                fill={CHART_COLORS.sd3Action}
                                                                fillOpacity={0.15} // Higher opacity for critical actions
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="minus3SD"
                                                                name="-3 SD (Action)"
                                                                stroke={CHART_COLORS.sd3Action}
                                                                fill={CHART_COLORS.sd3Action}
                                                                fillOpacity={0.15}
                                                                strokeWidth={1.5}
                                                                dot={false}
                                                                strokeDasharray="5 5"
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}</details>

                            <h5 className="mt-3 mb-3" style={{ color: CHART_COLORS.text }}>Readings Details</h5>
                            <Table className={globalStyles.table} striped bordered hover responsive size="sm">
                                <thead>
                                    <tr>
                                        <th>Parameter</th><th>Value</th><th>Status</th><th>Unit</th><th>Mean</th><th>Std. Dev.</th>
                                        <th>Validation Notes</th><th>Recorded At</th><th>Westgard Violations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentReadings.map(reading => (
                                        <tr key={reading.id}>
                                            <td>{reading.parameter}</td>
                                            <td>{formatNumericString(reading.value)}</td>
                                            <td style={{ fontWeight: 500 }} className={
                                                reading.status === 'critical' ? 'bg-danger text-white p-1' :
                                                    reading.status === 'warning' ? 'bg-warning text-dark p-1' :
                                                        reading.status === 'normal' ? 'bg-success text-white p-1' : 'p-1'
                                            }>
                                                {reading.status === 'normal' && <RiCheckFill size={16} className="me-1" style={{ verticalAlign: 'middle' }} />}
                                                {reading.status === 'warning' && <RiErrorWarningFill size={16} className="me-1" style={{ verticalAlign: 'middle' }} />}
                                                {reading.status === 'critical' && <RiCloseCircleFill size={16} className="me-1" style={{ verticalAlign: 'middle' }} />}
                                                {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
                                            </td>
                                            <td>{reading.unit || 'N/A'}</td>
                                            <td>{reading.mean ? formatNumericString(reading.mean) : 'N/A'}</td>
                                            <td>{formatNumericString(reading.standardDeviation)}</td>
                                            <td>{reading.validationNotes || <span style={{ color: CHART_COLORS.textMuted }}>N/A</span>}</td>
                                            <td>{reading.createdAt ? new Date(reading.createdAt).toLocaleString() : <span style={{ color: CHART_COLORS.textMuted }}>N/A</span>}</td>
                                            <td>
                                                {westgardViolations[reading.id]?.length > 0 ? (
                                                    <ul className="list-unstyled mb-0" style={{ fontSize: '0.8rem' }}>
                                                        {westgardViolations[reading.id].map((v, idx) => (
                                                            <li key={idx} style={{
                                                                color: v.rule.includes('3s') || v.rule.includes('R_4s') || v.rule.includes('2_2s') ? CHART_COLORS.sd3Action :
                                                                    v.rule.includes('1_2s') || v.rule.includes('4_1s') ? CHART_COLORS.sd2Warning : CHART_COLORS.textMuted,
                                                                fontWeight: v.rule.includes('3s') || v.rule.includes('R_4s') || v.rule.includes('2_2s') ? 600 : 400
                                                            }}>
                                                                <strong>{v.rule}:</strong> {v.description}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (<span style={{ color: CHART_COLORS.textMuted, fontSize: '0.8rem' }}>No violations</span>)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    ) : (
                        <p className="text-center py-5" style={{ color: CHART_COLORS.textMuted }}>No readings found for this session, or the data is empty.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" disabled={reviewingSessionId!==null} onClick={hideReadingsModal}>Close</Button>{reviewedSession&&<Button variant="outline-primary" disabled={readingsLoading||reviewingSessionId!==null} onClick={()=>handleNewReading(reviewedSession)}>Record readings</Button>}<Button variant="success" disabled={readingsLoading||!!readingsError||!currentReadings.length||currentReadings.some(r=>r.status!=='normal')||reviewingSessionId!==null} onClick={async()=>{if(reviewedSession&&await reviewSession(reviewedSession,'accepted'))hideReadingsModal()}}>{reviewingSessionId?'Saving review…':'Accept QC for results'}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};