"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Spinner, Alert, Button, Collapse } from "react-bootstrap";
import { customFetch } from "../../../../components/Auth/customFetch";



export default function AuditLogsPage() {
    const params = useParams();
    const ascensionid = params?.ascensionid;
    const [logs, setLogs] = useState<any[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

    const fetchLogs = async (refreshing = false, search = "") => {

        try {
            if (refreshing) setIsRefreshing(true);
            else if (search) setIsSearching(true);
            else setIsLoading(true);

            let url;
            if (search) {
                url = `result/auditlogs/paginated?ascensionid=${encodeURIComponent(search)}&&page=1&&pageSize=100`;
            } else {
                url = `result/auditlogs/paginated?page=1&&pageSize=100`;
            }

            const resp = await customFetch(url);

            if (resp && Array.isArray(resp.data)) {
                const validLogs = resp.data.filter((log: unknown) => log !== null && log !== undefined);
                setLogs(validLogs);
            } else {
                setLogs([]);
            }
        } catch (err) {
            setError("Failed to load audit logs");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsSearching(false);
        }
    };

    const handleSearch = () => {
        if (searchText.trim()) {
            fetchLogs(false, searchText.trim());
        }
    };

    const handleKeyPress = (e: { key: string; }) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRefresh = () => {
        setSearchText("");
        fetchLogs(true);
    };

    useEffect(() => {
        fetchLogs();
    }, [ascensionid]);

    const groupedData = useMemo(() => {
        const groupedMap = new Map();

        logs.forEach(log => {
            if (!log || !log.edit_session_id) return;

            if (!groupedMap.has(log.edit_session_id)) {
                groupedMap.set(log.edit_session_id, {
                    id: log.id,
                    edit_session_id: log.edit_session_id,
                    created_on: log.created_on,
                    employee_name: log.employee_name,
                    employee_role: log.employee_role,
                    employee_email: log.employee_email,
                    action_type: log.action_type,
                    entrymode: log.entrymode,
                    ascensionid: log.ascensionid,
                    billingid: log.billingid,
                    patientid: log.patientid,
                    testid: log.testid,
                    fields: [],
                    changes: []
                });
            }

            const entry = groupedMap.get(log.edit_session_id);
            if (log.field) {
                entry.changes.push({
                    field: log.field,
                    oldValue: log.previous_value,
                    oldOriginalValue: log.previous_originalvalue,
                    newValue: log.new_value,
                    newOriginalValue: log.new_originalvalue
                });
            }
        });

        return Array.from(groupedMap.values())
            .sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime());
    }, [logs]);

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    };

    if (isLoading) {
        return <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /> Loading audit logs...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>
    }

    return (
        <div>
            <div className="row mb-3 align-items-center">
                <div className="col-auto">
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="d-flex align-items-center gap-2"
                    >
                        {isRefreshing ? (
                            <>
                                <Spinner animation="border" size="sm" />
                                <span>Refreshing...</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                                </svg>
                                <span>Refresh Data</span>
                            </>
                        )}
                    </Button>
                </div>
                <div className="col"></div>
                <div className="col-2">
                    <div className="d-flex gap-1">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isSearching}
                        />
                        <button
                            className="btn btn-primary btn-sm"
                            type="button"
                            onClick={handleSearch}
                            disabled={!searchText.trim() || isSearching}
                        >
                            {isSearching ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                </svg>
                            )}
                        </button>
                        {searchText && (
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                type="button"
                                onClick={() => {
                                    setSearchText("");
                                    fetchLogs(true);
                                }}
                                disabled={isSearching}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {logs.length === 0 && searchText && !isSearching && !isLoading && (
                <div className="mb-3 text-danger">
                    <small>No results found for {searchText}</small>
                </div>
            )}

            {groupedData.length > 0 ? (
                <div className="position-relative" style={{ paddingLeft: '40px' }}>
                    {/* Timeline Line */}
                    <div
                        style={{
                            position: 'absolute',
                            left: '20px',
                            top: '0',
                            bottom: '0',
                            width: '2px',
                            background: 'linear-gradient(to bottom, #dee2e6 0%, #dee2e6 100%)'
                        }}
                    />

                    {groupedData.map((entry, index) => {
                        const isExpanded = expandedSessions.has(entry.edit_session_id);
                        return (
                            <div key={entry.edit_session_id} className="mb-4 position-relative">
                                {/* Timeline Dot */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '-28px',
                                        top: '8px',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        backgroundColor: '#dc3545',
                                        border: '3px solid white',
                                        zIndex: 1
                                    }}
                                />

                                <div className="bg-white border rounded p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 className="mb-1 fw-bold">{entry.action_type === 'UPDATE' ? 'Patient Update' : entry.action_type}</h6>
                                            <small className="text-muted">
                                                {entry.created_on ? new Date(entry.created_on).toLocaleString('en-US', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : '-'} pm by {entry.employee_name}
                                            </small>
                                        </div>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => toggleSession(entry.edit_session_id)}
                                            className="text-decoration-none p-0"
                                        >
                                            {isExpanded ? 'Show Less' : 'Show More'}
                                        </Button>
                                    </div>

                                    <p className="mb-3 small text-muted">
                                        User information has been updated from (Name= {entry.employee_name},
                                        Role={entry.employee_role}) {entry.action_type}
                                    </p>

                                    <Collapse in={isExpanded}>
                                        <div>
                                            {entry.changes && entry.changes.length > 0 ? (
                                                <table className="table table-bordered mb-0" style={{ fontSize: '0.85rem' }}>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th style={{ width: '33%', fontSize: '0.85rem' }}>Attribute</th>
                                                            <th style={{ width: '33%', fontSize: '0.85rem' }}>New Value</th>
                                                            <th style={{ width: '33%', fontSize: '0.85rem' }}>Old Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entry.changes.map((change: {field: string; oldValue?: React.ReactNode; newValue?: React.ReactNode}, idx: number) => (
                                                            <tr key={idx}>
                                                                <td className="fw-semibold" style={{ fontSize: '0.85rem' }}>{change.field}</td>
                                                                <td style={{ backgroundColor: 'rgba(144, 238, 144, 0.3)', fontSize: '0.85rem' }}>
                                                                    {change.newValue || '-'}
                                                                </td>
                                                                <td style={{ backgroundColor: 'rgba(255, 182, 193, 0.3)', fontSize: '0.85rem' }}>
                                                                    {change.oldValue || '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-muted small mb-0">No field changes recorded</p>
                                            )}
                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-5 text-muted">
                    <p className="mb-0">No audit logs found.</p>
                </div>
            )}
        </div>
    );
}
