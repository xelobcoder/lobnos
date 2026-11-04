"use client";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import TrackAlertLevelValueForm from "./TrackAlertValueForm";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../Auth/customFetch";
import PrimeToast from "../../accessories/PrimeToast";

interface IConstraints {
    action: string;
    constraint_type: string;
    replacement_text: string;
    value: string;
    id?: number;
    fieldid: number;
    suffix: string;
    prefix: string;
    testid: number;
}



const defaultConstraints = {
    action: "replace",
    constraint_type: "",
    replacement_text: "",
    value: "",
    fieldid: 0,
    suffix: "",
    prefix: ""
}
export default function CreateFieldConstraintsModal({ fieldId, show, onHide, isValueTracked = false, testId }: {fieldId: number; show: boolean; onHide: () => void; isValueTracked?: boolean; testId: number}) {
    const [field, setField] = useState<IConstraints>({ ...defaultConstraints, testid: testId });
    const [constraints, setConstraints] = useState<IConstraints[] | []>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFieldConstraints = async () => {
            if (!fieldId) return;
            try {
                console.log(fieldId)
                const response = await customFetch(`field-constraints/field/${fieldId}`);
                const { status, data } = response;
                if (status === true && data && Array.isArray(data) && data.length > 0) {
                    setConstraints(data);
                } else {
                    setConstraints([]);
                }
            } catch (error) {
                toast.error("Failed to load field constraints");
                console.error("Error loading field constraints:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (show) {
            fetchFieldConstraints();
        }
    }, [fieldId]);


    const createConstraints = () => {
        setConstraints(prev => [...prev, field]);
    };

    const handleChangeWithState = (index: number, target: keyof IConstraints, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { value } = event.target;
        setConstraints(prev => {
            const updated = [...prev];
            if (updated[index]) {
                updated[index] = { ...updated[index], [target]: value };
            }
            return updated;
        });
    };

    const handleSaving = async () => {
        const fieldsconstaints = constraints.map((constraint) => {
            return {
                ...constraint,
                fieldid: fieldId,
                testid: testId
            };
        });
        const response = await customPost(`field-constraints`, 'POST', { constraints: fieldsconstaints });
        const { status, data } = response;
        if (status === true) {
            toast.success("Field constraints updated successfully");
        }
    }


    return (
        <Modal show={show} onHide={onHide} size="xl" >
            <Modal.Header className="bg-secondary-subtle" closeButton>
                <Modal.Title>Field Level Constraints</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <PrimeToast/>
                {isLoading ?
                    <div className="p-4 text-center">Loading field constraints...</div> :
                    <TrackAlertLevelValueForm
                        constraints={constraints}
                        createConstraints={createConstraints}
                        handleChangeWithState={handleChangeWithState}
                        field={defaultConstraints}
                    />
                }
            </Modal.Body>
            <Modal.Footer className="bg-secondary-subtle">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onHide}>
                    Close
                </button>
                <button type="button" className="btn btn-outline-success  btn-sm" onClick={(ev) => { handleSaving() }} >
                    Save changes
                </button>
            </Modal.Footer>
        </Modal>
    );
}