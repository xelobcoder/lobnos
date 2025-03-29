import React from 'react';
import { Button, Alert } from 'react-bootstrap';
import { RiDeleteBinLine, RiEditLine } from '@remixicon/react';
import { ControlParameterType } from '../types/ControlParameter';
import styles from './ParametersTable.module.css';

interface ParametersTableProps {
    parameters: ControlParameterType[];
    onEdit: (param: ControlParameterType, index: number) => void;
    onDelete: (index: number) => void;
    onAdd: () => void;
}

export function ParametersTable({ parameters, onEdit, onDelete, onAdd }: ParametersTableProps) {
    if (parameters.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p className="mb-3">No parameters have been created yet.</p>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onAdd}
                >
                    Create First Parameter
                </Button>
            </div>
        );
    }

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
                            <td>{index+1}</td>
                            <td>{param.parameter || '-'}</td>
                            <td>{param.unit || '-'}</td>
                            <td className={styles.value}>{param.value || '-'}</td>
                            <td>{param.standardDeviation || '-'}</td>
                            <td>{param.warningLimit || '-'}</td>
                            <td>{param.actionLimit || '-'}</td>
                            <td>
                                <div className={styles.actions}>
                                    <Button
                                        variant="light"
                                        size="sm"
                                        className={styles.actionButton}
                                        onClick={() => onEdit(param, index)}
                                    >
                                        <RiEditLine className="text-primary" />
                                    </Button>
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