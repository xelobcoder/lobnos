import React, { useState } from 'react';
import ReformatTestParamOptions from './FormatOptions';
import CreateFieldConstraintsModal from './CreateFieldConstraintsModal';
import styles from './RenderTestCreationParametersTable.module.css';

export default function RenderTestCreationParameters({ data, reorder, setReorder, changeOrdering, editField, removeField, testid }) {
    const [showConstraintsModal, setShowConstraintsModal] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState(null);

    const handleOpenConstraintsModal = (fieldId) => {
        setSelectedFieldId(fieldId);
        setShowConstraintsModal(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => setReorder(!reorder)} className={styles.reorderBtn}>
                    {reorder ? 'Enable Reorder' : 'Disable Reorder'}
                </button>
            </div>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Parameter Name</th>
                            <th title="General Upper Limit">Upper Limit</th>
                            <th title="General Lower Limit">Lower Limit</th>
                            <th>Options</th>
                            <th>Plain</th>
                            <th>Ultrasound Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(data) && data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.upperlimit}</td>
                                <td>{item.lowerlimit}</td>
                                <td>{item.options && <ReformatTestParamOptions stringdata={item.options} />}</td>
                                <td>{item.textReference && <ReformatTestParamOptions stringdata={item.textReference} />}</td>
                                <td>{item.options === "ultrasoundFields" ? 'Yes' : 'No'}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <input
                                            type="number"
                                            className={styles.orderInput}
                                            value={item.ordering}
                                            disabled={reorder}
                                            onChange={(ev) => changeOrdering(item, ev)}
                                        />
                                        <button
                                            onClick={() => editField(item)}
                                            className={styles.editBtn}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => removeField(item)}
                                            className={styles.deleteBtn}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => handleOpenConstraintsModal(item.id)}
                                            className={styles.constraintsBtn}
                                        >
                                            Create Constraints
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <CreateFieldConstraintsModal
                fieldId={selectedFieldId}
                show={showConstraintsModal}
                testId={testid}
                onHide={() => setShowConstraintsModal(false)}
            />
        </div>
    );
}
