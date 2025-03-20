import styles from '../../../styles/SmsTemplateList.module.css'
import { RiCheckboxLine, RiCheckboxBlankLine, RiCheckDoubleLine, RiCloseCircleLine } from '@remixicon/react'

export default function AssessmentRenderingView({ 
    loading, 
    testcollection = [], 
    handleDeclineMessage, 
    validateSample,
    selectedTests,
    handleCheckboxChange 
}) {
    if (loading) return <div>Loading ....</div>;
    if (testcollection.length == 0) return <h5>No Sample Available for Assessment</h5>;

    return (
        <div className="table-responsive">
            <table className={`${styles.table} pls-color table-hover`} style={{fontSize:'13px'}}>
                <thead className="column-bordered bg-light">
                    <tr>
                        <th className="text-capitalize column-bordered"></th>
                        <th className="text-capitalize column-bordered">Ascension No.</th>
                        <th className="text-capitalize column-bordered">Test</th>
                        <th className="text-capitalize column-bordered">Sample</th>
                        <th className="text-capitalize column-bordered">Sample Status</th>
                        <th className="text-capitalize column-bordered">Validation Status</th>
                        <th className="text-capitalize column-bordered">Reason for Rejection</th>
                        <th className="text-capitalize column-bordered">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {testcollection.map((item, index) => (
                        <tr key={index} className={selectedTests.includes(item.testid) ? 'table-active' : ''}>
                            <td className="column-bordered">
                                <div onClick={() => handleCheckboxChange(item.testid)} className="cursor-pointer">
                                    {selectedTests.includes(item.testid) ? 
                                        <RiCheckboxLine className="text-primary" /> : 
                                        <RiCheckboxBlankLine className="text-muted" />
                                    }
                                </div>
                            </td>
                            <td className="column-bordered">ASCID{item?.id}</td>
                            <td className="column-bordered">
                                <span>{item.name}</span>
                                <span className="ms-2">
                                    {item.approvalstatus == 1 ? (
                                        <RiCheckDoubleLine className="text-success" size={18} />
                                    ) : (
                                        <RiCloseCircleLine className="text-danger" size={18} />
                                    )}
                                </span>
                            </td>
                            <td className="column-bordered">{item.sample}</td>
                            <td className="column-bordered text-capitalize">
                                {item.collection == "true" ? "Collected" : "N/A"}
                            </td>
                            <td className="column-bordered text-capitalize">
                                {item.approvalstatus == 1 ? (
                                    <span className="badge bg-success">Accepted</span>
                                ) : item.approvalstatus == 0 ? (
                                    <span className="badge bg-danger">Rejected</span>
                                ) : (
                                    <span className="badge bg-secondary">N/A</span>
                                )}
                            </td>
                            <td className="column-bordered">
                                <textarea
                                    value={item?.rejectionemessage}
                                    onChange={(ev) => handleDeclineMessage(ev, item?.testid)}
                                    disabled={item?.approvalstatus === 1}
                                    className="form-control form-control-sm"
                                    rows="2"
                                    placeholder="Enter rejection reason..."
                                />
                            </td>
                            <td className="column-bordered">
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-success btn-sm d-flex align-items-center"
                                        onClick={() => validateSample(item?.testid, "accept")}
                                        disabled={item?.approvalstatus === 1}>
                                        <RiCheckDoubleLine className="me-1" size={14} />
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm d-flex align-items-center"
                                        onClick={() => validateSample(item?.testid, "reject")}
                                        disabled={item?.approvalstatus === 0}>
                                        <RiCloseCircleLine className="me-1" size={14} />
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}