import styles from '../../../styles/SmsTemplateList.module.css'
export default function AssessmentRenderingView({ loading, testcollection = [], handleDeclineMessage, validateSample }) {
    if (loading) return <div>Loading ....</div>


    if (testcollection.length == 0) return <h5>No Sample Available for Asssement</h5>

    return (
        <table className={`${styles.table} pls-color `} style={{fontSize:'13px'}}>
            <thead className="column-bordered">
                <tr>
                    <th className="text-capitalize column-bordered">ascension No.</th>
                    <th className="text-capitalize column-bordered">test</th>
                    <th className="text-capitalize column-bordered">sample</th>
                    <th className="text-capitalize column-bordered">sample status</th>
                    <th className="text-capitalize column-bordered">validation status</th>
                    <th className="text-capitalize column-bordered">reason for rejection</th>
                    <th className="text-capitalize column-bordered">actions</th>
                </tr>
            </thead>
            <tbody>
                {testcollection.map((item, index) => {
                    return (
                        <tr key={index}>
                            <td className="column-bordered">ASCID{item?.id}</td>
                            <td className="column-bordered">
                                <span>{item.name}</span>
                                <span>
                                    {item.approvalstatus == 1 ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            fill="green"
                                            class="bi bi-check-lg"
                                            viewBox="0 0 16 16">
                                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" class="bi bi-x" viewBox="0 0 16 16">
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                        </svg>
                                    )}
                                </span>
                            </td>
                            <td className="column-bordered">{item.sample}</td>
                            <td className="column-bordered">{item.collection == "true" ? "collected" : "N/A"}</td>
                            <td className="column-bordered">
                                {item.approvalstatus == 1 ? (
                                    <span className="text-success">accepted</span>
                                ) : item.approvalstatus == 0 ? (
                                    <span className="text-danger">rejected</span>
                                ) : (
                                    <span>N/A</span>
                                )}
                            </td>
                            <td className="column-bordered">
                                <textarea
                                    value={item?.rejectionemessage}
                                    onChange={(ev) => {
                                        handleDeclineMessage(ev, item?.testid)
                                    }}
                                    disabled={item?.approvalstatus === 1}
                                    className="form-control"
                                    rows="2"></textarea>
                            </td>
                            <td className="column-bordered">
                                <div className="d-flex justify-content-between">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={(ev) => {
                                            validateSample(item?.testid, "accept")
                                        }}>
                                        accept
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={(ev) => {
                                            validateSample(item?.testid, "reject")
                                        }}>
                                        reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    )
}