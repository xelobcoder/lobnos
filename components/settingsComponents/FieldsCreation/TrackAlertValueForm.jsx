import { useEffect, useState } from "react";
import { Add } from "@mui/icons-material";
import SingleFieldMultipleSingleConstraintsComponent from "./MultiConditionComponents/singleFieldMultipleSingleConstraintsComponent";
import styles from './TrackAlertValueForm.module.css';

export default function TrackAlertLevelValueForm({field,constraints, handleChangeWithState, createConstraints}) {

    return (
        <div className={styles.container}>
            <button
                type="button"
                className={styles.addButton}
                onClick={createConstraints}
            >
                <Add fontSize="small" />
                <span>Add Constraint</span>
            </button>

            {constraints && constraints.length > 0 && (
                <div >
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
                            {constraints.map((item, index) => (
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
