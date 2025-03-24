export default function TestsCompletedVsInitiatedVrsUninitiated({ value = [] }) {
    return (
        <div>
            <div className="card br-0 my-2 border-0 p-0 br-0">
                <div className="card-header p-1 br-0 bg-secondary-subtle fw-bold text-capitalize">
                    <h5>tests completed Vs Initiated Vrs Uninitiated</h5>
                </div>
                <div className="card-body">
                    <h1 className="d-flex justify-content-between">
                        <span>
                            {value[0].completed_tests}
                        </span>
                        <span>
                            vrs
                        </span>
                        <span>
                            {value[0].initiated_tests}
                        </span>
                        <span>
                            vrs
                        </span>
                        <span>
                            {value[0].uninitiated}
                        </span>
                    </h1>
                </div>
            </div>
        </div>
    )
}