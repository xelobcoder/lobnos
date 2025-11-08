import styles from '../../../styles/SmsTemplateList.module.css'
import { RiCheckboxLine, RiCheckboxBlankLine, RiCheckDoubleLine, RiCloseCircleLine, RiErrorWarningLine } from '@remixicon/react'

const REJECTION_REASONS = [
    {
        id: 'contamination',
        label: 'Sample Contamination',
        description: 'Sample has been contaminated during collection, transport, or processing',
        severity: 'high',
        correctiveActions: [
            'Discard contaminated sample',
            'Recollect sample using proper technique',
            'Review collection procedures with staff',
            'Document incident in quality log'
        ]
    },
    {
        id: 'improper_collection',
        label: 'Improper Collection Technique',
        description: 'Sample was not collected according to established protocols',
        severity: 'medium',
        correctiveActions: [
            'Recollect sample with proper technique',
            'Provide additional training to collector',
            'Review collection instructions',
            'Document training completion'
        ]
    },
    {
        id: 'labeling_error',
        label: 'Labeling Error',
        description: 'Sample labeling is incorrect or incomplete',
        severity: 'critical',
        correctiveActions: [
            'Relabel sample correctly',
            'Verify patient identification',
            'Review labeling procedures',
            'Implement double-check system'
        ]
    },
    {
        id: 'insufficient_volume',
        label: 'Insufficient Sample Volume',
        description: 'Sample volume is inadequate for required testing',
        severity: 'medium',
        correctiveActions: [
            'Recollect adequate volume',
            'Adjust test requirements if possible',
            'Review volume requirements with clinicians',
            'Document volume specifications'
        ]
    },
    {
        id: 'hemolysis',
        label: 'Hemolysis',
        description: 'Blood sample shows signs of hemolysis',
        severity: 'high',
        correctiveActions: [
            'Recollect sample with minimal trauma',
            'Use proper collection technique',
            'Review phlebotomy procedures',
            'Consider alternative collection methods'
        ]
    },
    {
        id: 'clotted_sample',
        label: 'Clotted Sample',
        description: 'Blood sample has clotted before processing',
        severity: 'high',
        correctiveActions: [
            'Recollect sample immediately',
            'Ensure proper mixing with anticoagulant',
            'Review tube selection and filling',
            'Monitor room temperature during transport'
        ]
    },
    {
        id: 'temperature_excursion',
        label: 'Temperature Excursion',
        description: 'Sample was not maintained at proper temperature',
        severity: 'critical',
        correctiveActions: [
            'Discard sample if stability compromised',
            'Review transport and storage procedures',
            'Verify temperature monitoring systems',
            'Implement corrective actions for transport'
        ]
    },
    {
        id: 'expired_tube',
        label: 'Expired Collection Tube',
        description: 'Collection tube has exceeded expiration date',
        severity: 'medium',
        correctiveActions: [
            'Replace with fresh collection tube',
            'Review inventory management procedures',
            'Implement tube rotation system',
            'Document expiration dates clearly'
        ]
    },
    {
        id: 'wrong_tube_type',
        label: 'Wrong Tube Type',
        description: 'Incorrect tube type used for the requested test',
        severity: 'high',
        correctiveActions: [
            'Recollect in correct tube type',
            'Review test requirements and tube selection',
            'Update collection guides',
            'Provide additional training'
        ]
    },
    {
        id: 'other',
        label: 'Other',
        description: 'Other rejection reason not listed above',
        severity: 'medium',
        correctiveActions: [
            'Document specific reason',
            'Determine appropriate corrective action',
            'Review procedures if needed',
            'Prevent recurrence'
        ]
    }
];

export default function AssessmentRenderingView({
    loading,
    testcollection = [],
    validateSample,
    selectedTests,
    handleCheckboxChange,
    handleRejectionDetailsChange,
    showRejectionForms = true
}) {
    if (loading) return <div>Loading ....</div>;
    if (testcollection.length == 0) return <h5>No Sample Available for Assessment</h5>;

    return (
        <div className="table-responsive">
            <table className={`${styles.table} pls-color table-hover`} style={{ fontSize: '13px' }}>
                <thead className="column-bordered bg-light">
                    <tr>
                        <th className="text-capitalize column-bordered"></th>
                        <th className="text-capitalize column-bordered">Ascension No.</th>
                        <th className="text-capitalize column-bordered">Test</th>
                        <th className="text-capitalize column-bordered">Sample</th>
                        <th className="text-capitalize column-bordered">Sample Status</th>
                        <th className="text-capitalize column-bordered">Validation Status</th>
                        <th className="text-capitalize column-bordered">Rejection Status</th>
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
                                {item.approvalstatus === 0 && item.rejectionDetails && item.rejectionDetails.reason ? (
                                    <div className="small">
                                        <strong>{REJECTION_REASONS.find(r => r.id === item.rejectionDetails.reason)?.label}</strong>
                                        {item.rejectionDetails.customReason && (
                                            <div className="text-muted">{item.rejectionDetails.customReason}</div>
                                        )}
                                        <div className="mt-1">
                                            <span className="badge bg-secondary">
                                                {REJECTION_REASONS.find(r => r.id === item.rejectionDetails.reason)?.severity}
                                            </span>
                                        </div>
                                        {item.rejectionDetails.correctiveActions?.length > 0 && (
                                            <div className="mt-1">
                                                <small className="text-muted">Actions: {item.rejectionDetails.correctiveActions.join(', ')}</small>
                                            </div>
                                        )}
                                    </div>
                                ) : item.approvalstatus === 0 ? (
                                    <span className="text-muted small">
                                        <RiErrorWarningLine className="me-1" />
                                        Details required on right
                                    </span>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
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

            {/* Rejection Details Forms */}
            {showRejectionForms && testcollection.some(item => item.approvalstatus === 0 && item.showRejectionForm) && (
                <div className="mt-4">
                    <h6 className="mb-3">
                        <RiErrorWarningLine className="me-2" />
                        Rejection Details Required
                    </h6>
                    {testcollection
                        .filter(item => item.approvalstatus === 0 && item.showRejectionForm)
                        .map((item, index) => (
                            <div key={`rejection-${item.testid}`} className="card mb-3">
                                <div className="card-header">
                                    <h6 className="mb-0">
                                        {item.name} - {item.patientname || item.fullname}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label fw-bold">Rejection Reason</label>
                                                <select
                                                    className="form-select"
                                                    value={item.rejectionDetails?.reason || ''}
                                                    onChange={(e) => {
                                                        const selectedReason = REJECTION_REASONS.find(r => r.id === e.target.value);
                                                        handleRejectionDetailsChange(item.testid, 'reason', e.target.value);
                                                        handleRejectionDetailsChange(item.testid, 'reasonLabel', selectedReason?.label);
                                                        handleRejectionDetailsChange(item.testid, 'severity', selectedReason?.severity);
                                                        handleRejectionDetailsChange(item.testid, 'correctiveActions', []);
                                                    }}
                                                >
                                                    <option value="">Select a reason...</option>
                                                    {REJECTION_REASONS.map(reason => (
                                                        <option key={reason.id} value={reason.id}>
                                                            {reason.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {item.rejectionDetails?.reason === 'other' && (
                                                <div className="mb-3">
                                                    <label className="form-label">Specify Other Reason</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows="2"
                                                        placeholder="Please specify the rejection reason..."
                                                        value={item.rejectionDetails?.customReason || ''}
                                                        onChange={(e) => handleRejectionDetailsChange(item.testid, 'customReason', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            <div className="mb-3">
                                                <label className="form-label">Additional Notes</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    placeholder="Any additional information about this rejection..."
                                                    value={item.rejectionDetails?.additionalNotes || ''}
                                                    onChange={(e) => handleRejectionDetailsChange(item.testid, 'additionalNotes', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            {item.rejectionDetails?.reason && (
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Severity</label>
                                                    <div>
                                                        <span className="badge bg-secondary fs-6 p-2">
                                                            {REJECTION_REASONS.find(r => r.id === item.rejectionDetails.reason)?.severity?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {item.rejectionDetails?.reason && (
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Suggested Corrective Actions</label>
                                                    <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {REJECTION_REASONS.find(r => r.id === item.rejectionDetails.reason)?.correctiveActions.map((action, idx) => (
                                                            <div key={idx} className="form-check">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`action-${item.testid}-${idx}`}
                                                                    checked={item.rejectionDetails?.correctiveActions?.includes(action) || false}
                                                                    onChange={(e) => {
                                                                        const currentActions = item.rejectionDetails?.correctiveActions || [];
                                                                        const newActions = e.target.checked
                                                                            ? [...currentActions, action]
                                                                            : currentActions.filter(a => a !== action);
                                                                        handleRejectionDetailsChange(item.testid, 'correctiveActions', newActions);
                                                                    }}
                                                                />
                                                                <label className="form-check-label" htmlFor={`action-${item.testid}-${idx}`}>
                                                                    {action}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}