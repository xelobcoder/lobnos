export default function PhelobotomySummaryAnalytics() {
    return (
        <div>
            <section className="grid-4">
                <div className="mb-2 card bg-warning text-dark br-0 card-small">
                    <span className="card-header">
                        Pending Sample Cases</span>
                    <div className="card-body">
                        <span className="text-center">683</span>
                    </div>
                </div>
                <div className="mb-2 br-0 card bg-success text-white card-small">
                    <span className="card-header">
                        Collected</span>
                    <div className="card-body">
                        <span className="text-center">683</span>
                    </div>
                </div>
                <div className="mb-2 br-0 card bg-danger text-white card-small">
                    <span className="card-header">
                        Rejected Cases</span>
                    <div className="card-body">
                        <span className="text-center">683</span>
                    </div>
                </div>
                <div className="mb-2 card bg-info text-dark br-0 card-small">
                    <span className="card-header">
                        Redrawn</span>
                    <div className="card-body">
                        <span className="text-center">683</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
