import { useEffect, useState } from 'react';
import { Table } from 'react-bootstrap';
import { BillingAudit } from './BillingStrategyTypes';


export default function AuditLogTable() {
    const [audits, setAudits] = useState<BillingAudit[]>([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/audit')
            .then(res => res.json())
            .then(data => setAudits(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="p-4">
            <h2 className="mb-4">Audit Log</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Entity Type</th>
                        <th>Test Panel ID</th>
                        <th>Base Price</th>
                        <th>Final Price</th>
                        <th>Strategy ID</th>
                        <th>Promo Code ID</th>
                        <th>Conditions Applied</th>
                        <th>Calculated At</th>
                    </tr>
                </thead>
                <tbody>
                    {audits.map(audit => (
                        <tr key={audit.id}>
                            <td>{audit.id}</td>
                            <td>{audit.entity_type}</td>
                            <td>{audit.test_panel_id}</td>
                            <td>{audit.base_price.toFixed(2)}</td>
                            <td>{audit.final_price.toFixed(2)}</td>
                            <td>{audit.strategy_id || 'N/A'}</td>
                            <td>{audit.promo_code_id || 'N/A'}</td>
                            <td>{audit.conditions_applied ? audit.conditions_applied.join(', ') : 'N/A'}</td>
                            <td>{new Date(audit.calculated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}