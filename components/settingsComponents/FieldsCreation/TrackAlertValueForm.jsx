import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import SingleFieldMultipleSingleConstraintsComponent from "./MultiConditionComponents/singleFieldMultipleSingleConstraintsComponent";
import { defaultConstaints } from './data/testUtil';
import styles from './TrackAlertValueForm.module.css';

export default function TrackAlertLevelValueForm({ field, setField }) {
    const { isValueTracked } = field;
    const showTrack = !isNaN(isValueTracked) && parseInt(isValueTracked) === 1;
    const [createdConstraints, setCreatedConstraints] = useState([]);

    const updateFieldTrack = (ev) => {
        const { checked } = ev.target;
        setField({ ...field, isValueTracked: checked ? 1 : 0 });
    };

    const createConstraints = () => {
        setCreatedConstraints(prev => [...prev, defaultConstaints]);
    };

    const handleChangeWithState = (index, target, event) => {
        const { value } = event.target;
        setCreatedConstraints(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [target]: value };
            }
            return updated;
        });
    };

    const updateFieldConstraints = () => {
        setField(prevField => ({ ...prevField, fieldConstraints: createdConstraints }));
    };

    useEffect(() => {
        if (field.fieldConstraints && field.fieldConstraints.length > 0) {
            setCreatedConstraints(field.fieldConstraints);
        }
    }, [field.fieldConstraints]);

    useEffect(() => {
        updateFieldConstraints();
    }, [createdConstraints]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={field?.isValueTracked === 1}
                        onChange={updateFieldTrack}
                        className={styles.checkbox}
                    />
                    <span>Track value(s) of parameter</span>
                </label>
                {showTrack && (
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={createConstraints}
                    >
                        <Add fontSize="small" />
                        <span>Add Constraint</span>
                    </button>
                )}
            </div>
            
            {showTrack && createdConstraints.length > 0 && (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Constraints</th>
                                <th>Value</th>
                                <th>Action</th>
                                <th>Replacing Value</th>
                                <th>Prefix</th>
                                <th>Suffix</th>
                            </tr>
                        </thead>
                        <tbody>
                            {createdConstraints.map((item, index) => (
                                <SingleFieldMultipleSingleConstraintsComponent
                                    key={index}
                                    index={index}
                                    field={item}
                                    handleChangeWithState={handleChangeWithState}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
