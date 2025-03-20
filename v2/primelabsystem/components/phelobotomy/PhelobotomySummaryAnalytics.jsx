import { customFetch } from "../Auth/customFetch";
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Pending Cases
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Collected Cases
import CancelIcon from '@mui/icons-material/Cancel'; // Rejected Cases
import AutorenewIcon from '@mui/icons-material/Autorenew'; // Redrawn Completed

const defaultValues = { rejected: null, orders: null, completed: null, pending: null };

export default async function PhelobotomySummaryAnalytics() {
    let data = defaultValues;

    const fetchSummary = async function () {
        try {
            const response = await customFetch(`ascension/phelobotomistAnalyticsSummary`);
            data = response;
        } catch (err) {
            data = defaultValues;
        }
    };

    await fetchSummary();

    return (
        <div className="">
            <div className="d-flex flex-column flex-md-row gap-1">
                {/* Pending Cases Card */}
                <div
                    className="card border-0 shadow rounded"
                    style={{
                        background: '#ECF2FF',
                        borderRadius: '12px',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        height: '89px',
                        flex: '1 1 auto',
                        margin: '0 8px',
                    }}
                >
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    backgroundColor: '#3B82F6',
                                    padding: '6px',
                                    borderRadius: '6px',
                                }}
                            >
                                <AccessTimeIcon style={{ fontSize: '1rem', color: 'white' }} />
                            </div>
                            <h6 className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                                Pending Cases {"<"} 24 hours {">"}
                            </h6>
                        </div>
                        <div className="fw-bold" style={{ fontSize: '1rem' }}>
                            {data.pending}
                        </div>
                    </div>
                </div>

                {/* Collected Cases Card */}
                <div
                    className="card border-0 shadow rounded"
                    style={{
                        background: '#E8FDF5',
                        borderRadius: '12px',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        height: '89px',
                        flex: '1 1 auto',
                        margin: '0 8px',
                    }}
                >
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    backgroundColor: '#10B981',
                                    padding: '6px',
                                    borderRadius: '6px',
                                }}
                            >
                                <CheckCircleIcon style={{ fontSize: '1rem', color: 'white' }} />
                            </div>
                            <h6 className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                                Collected Cases {"<"} 24 hours {">"}
                            </h6>
                        </div>
                        <div className="fw-bold" style={{ fontSize: '1rem' }}>
                            {data.completed}
                        </div>
                    </div>
                </div>

                {/* Rejected Cases Card */}
                <div
                    className="card border-0 shadow rounded"
                    style={{
                        background: '#FEE2E2',
                        borderRadius: '12px',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        height: '89px',
                        flex: '1 1 auto',
                        margin: '0 8px',
                    }}
                >
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    backgroundColor: '#EF4444',
                                    padding: '6px',
                                    borderRadius: '6px',
                                }}
                            >
                                <CancelIcon style={{ fontSize: '1rem', color: 'white' }} />
                            </div>
                            <h6 className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                                Rejected Cases {"<"} 24 hours {">"}
                            </h6>
                        </div>
                        <div className="fw-bold" style={{ fontSize: '1rem' }}>
                            {data.rejected}
                        </div>
                    </div>
                </div>

                {/* Redrawn Completed Card */}
                <div
                    className="card border-0 shadow rounded"
                    style={{
                        background: '#F3E8FF',
                        borderRadius: '12px',
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        height: '89px',
                        flex: '1 1 auto',
                        margin: '0 8px',
                    }}
                >
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                    backgroundColor: '#E11D48',
                                    padding: '6px',
                                    borderRadius: '6px',
                                }}
                            >
                                <AutorenewIcon style={{ fontSize: '1rem', color: 'white' }} />
                            </div>
                            <h6 className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
                                Redrawn Completed {"<"} 24 hours {">"}
                            </h6>
                        </div>
                        <div className="fw-bold" style={{ fontSize: '1rem' }}>
                            {data.completed}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}