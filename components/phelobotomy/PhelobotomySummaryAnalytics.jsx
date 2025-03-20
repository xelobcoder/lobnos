import { customFetch } from "../Auth/customFetch";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AutorenewIcon from '@mui/icons-material/Autorenew';

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
        <div className="px-2">
            <div className="row g-2">
                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card h-100 border-0 bg-white shadow-sm hover-shadow">
                        <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                                    <AccessTimeIcon className="text-primary" style={{ fontSize: '1.25rem' }} />
                                </div>
                                <span className="text-muted small text-end">Pending Cases (24h)</span>
                            </div>
                            <div className="mt-2">
                                <h3 className="h3 mb-0 fw-bold">{data.pending || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card h-100 border-0 bg-white shadow-sm hover-shadow">
                        <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <div className="bg-success bg-opacity-10 p-2 rounded-2">
                                    <CheckCircleIcon className="text-success" style={{ fontSize: '1.25rem' }} />
                                </div>
                                <span className="text-muted small text-end">Collected Cases (24h)</span>
                            </div>
                            <div className="mt-2">
                                <h3 className="h3 mb-0 fw-bold">{data.completed || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card h-100 border-0 bg-white shadow-sm hover-shadow">
                        <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <div className="bg-danger bg-opacity-10 p-2 rounded-2">
                                    <CancelIcon className="text-danger" style={{ fontSize: '1.25rem' }} />
                                </div>
                                <span className="text-muted small text-end">Rejected Cases (24h)</span>
                            </div>
                            <div className="mt-2">
                                <h3 className="h3 mb-0 fw-bold">{data.rejected || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <div className="card h-100 border-0 bg-white shadow-sm hover-shadow">
                        <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <div className="bg-info bg-opacity-10 p-2 rounded-2">
                                    <AutorenewIcon className="text-info" style={{ fontSize: '1.25rem' }} />
                                </div>
                                <span className="text-muted small text-end">Redrawn Completed (24h)</span>
                            </div>
                            <div className="mt-2">
                                <h3 className="h3 mb-0 fw-bold">{data.completed || 0}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}