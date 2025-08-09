"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Spinner, Alert, Button } from "react-bootstrap";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
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
                setLogs(resp.data);
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

    const handleKeyPress = (e) => {
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
            if (!log.edit_session_id) return;
            
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
                    fields: {}
                });
            }
            
            const entry = groupedMap.get(log.edit_session_id);
            if (log.field) {
                entry.fields[log.field] = log.previous_value;
            }
        });
        
        return Array.from(groupedMap.values())
            .sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime());
    }, [logs]);

    const allFields = useMemo(() => {
        const fieldSet = new Set<string>();
        logs.forEach(log => {
            if (log.field && typeof log.field === 'string') {
                fieldSet.add(log.field);
            }
        });
        return Array.from(fieldSet);
    }, [logs]);

    const columns = useMemo(() => {
        const metaCols = [
            {
                Header: "#",
                accessor: "rownum",
                Cell: ({ row }) => row.index + 1,
            },
            {
                Header: "Date/Time",
                accessor: "created_on",
                Cell: ({ value }) => value ? new Date(value).toLocaleString() : "-",
            },
            {
                Header: "Changed By",
                accessor: "employee_name",
                Cell: ({ row }) => (
                    <span>
                        <span className="fw-bold">{row.original.employee_name}</span>
                        <span className="text-muted ms-2">({row.original.employee_role})</span>
                    </span>
                ),
            },
            {
                Header: "Action",
                accessor: "action_type",
                Cell: ({ value, row }) => (
                    <div>
                        <span className={`badge bg-${value === 'UPDATE' ? 'info' : value === 'DELETE' ? 'danger' : 'secondary'} text-uppercase`}>
                            {value}
                        </span>
                        <small className="d-block text-muted mt-1">
                            {Object.keys(row.original.fields).length} fields
                        </small>
                    </div>
                ),
            },
            {
                Header: "Entry Mode",
                accessor: "entrymode",
                Cell: ({ value }) => <span className="badge bg-secondary text-uppercase">{value}</span>,
            },
        ];
        
        const fieldCols = allFields.map(field => ({
            Header: String(field),
            accessor: `field_${String(field).replace(/\s+/g, '_').toLowerCase()}`,
            Cell: ({ row }) => {
                const fieldStr = String(field);
                const value = row.original.fields && typeof row.original.fields === 'object' ? 
                    (row.original.fields as Record<string, string>)[fieldStr] : undefined;
                return value ? (
                    <span className="text-danger fw-bold">{value}</span>
                ) : <span className="text-muted">-</span>;
            },
        }));
        return [...metaCols, ...fieldCols];
    }, [allFields]);

    if (isLoading) {
        return <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /> Loading audit logs...</div>;
    }
    
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
            
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
                                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                            </svg>
                            <span>Refresh Data</span>
                        </>
                    )}
                </Button>
            </div>
            
            <p className="text-muted mb-3">Showing changes grouped by editing sessions. Each row represents a set of changes made in a single editing session.</p>
            
            <div className="mb-4">
                <div className="input-group">
                    <span className="input-group-text">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search audit logs by ascension id" 
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSearching}
                    />
                    <button 
                        className="btn btn-primary" 
                        type="button"
                        onClick={handleSearch}
                        disabled={!searchText.trim() || isSearching}
                    >
                        {isSearching ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Searching...
                            </>
                        ) : (
                            "Search"
                        )}
                    </button>
                    {searchText && (
                        <button 
                            className="btn btn-outline-secondary" 
                            type="button"
                            onClick={() => {
                                setSearchText("");
                                fetchLogs(true);
                            }}
                            disabled={isSearching}
                        >
                            Clear
                        </button>
                    )}
                </div>
           
                
                {logs.length === 0 && searchText && !isSearching && !isLoading && (
                    <div className="mt-2 text-danger">
                        <small>No results found for "{searchText}"</small>
                    </div>
                )}
            </div>
            
            <PrimeTable
                column={columns}
                data={groupedData}
                filtering={true}
                handleSeverSideProcessing={null}
                serverSideFiltering={true}
                urlparams={{ ascensionid, search: searchText }}
                isExpoerted={true}
            />
        </div>
    );
}
