import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { RiDeleteBinLine } from '@remixicon/react';
import { ControlParameterType } from '../types/ControlParameter';
import styles from './ParametersTable.module.css';

interface ParametersTableProps {
    parameters: ControlParameterType[];
    onEdit: (param: ControlParameterType, index: number) => void;
    onDelete: (index: number) => void;
}

export function ParametersTable({ parameters, onEdit, onDelete }: ParametersTableProps) {
    if (parameters.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p className="mb-3">No parameters have been created yet.</p>
            </div>
        );
    }

    const handleInputChange = (index: number, field: keyof ControlParameterType, value: string) => {
        const updatedParam = {
            ...parameters[index],
            [field]: field === 'parameter' || field === 'unit' || field === 'validationNotes' 
                ? value 
                : value === '' ? 0 : parseFloat(value)
        };
        onEdit(updatedParam, index);
    };

    return (
        <div className={styles.tableWrapper}>
            <table className={`${styles.table} hover stripped`}>
                <thead className={styles.tableHeader}>
                    <tr>
                        <td>#</td>
                        <th>Parameter Name</th>
                        <th>Unit</th>
                        <th>Expected Value</th>
                        <th>Standard Deviation</th>
                        <th>Warning Limit</th>
                        <th>Action Limit</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    {parameters.map((param, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{param.parameter}</td>
                            <td>{param.unit}</td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="number"
                                    value={param.value || ''}
                                    onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="number"
                                    value={param.standardDeviation || ''}
                                    onChange={(e) => handleInputChange(index, 'standardDeviation', e.target.value)}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="number"
                                    value={param.warningLimit || ''}
                                    onChange={(e) => handleInputChange(index, 'warningLimit', e.target.value)}
                                />
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    type="number"
                                    value={param.actionLimit || ''}
                                    onChange={(e) => handleInputChange(index, 'actionLimit', e.target.value)}
                                />
                            </td>
                            <td>
                                <div className={styles.actions}>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className={styles.actionButton}
                                        onClick={() => onDelete(index)}
                                    >
                                        <RiDeleteBinLine className="text-danger" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}