"use client";
import { useState } from "react";
import { defaultCreationRule } from "../../../../../components/settingsComponents/FieldsCreation/data/testUtil";
import TrackAlertLevelValueForm from "../../../../../components/settingsComponents/FieldsCreation/TrackAlertValueForm";

export default function AlertLevelsPage({ params }: { params: { testId: string } }) {
    const [field, setField] = useState(defaultCreationRule);

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Test Field Level Constraints</h2>
                </div>
                <div className="card-body">
                    <TrackAlertLevelValueForm 
                        field={field} 
                        setField={setField} 
                    />
                </div>
            </div>
        </div>
    );
}