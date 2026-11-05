import { useId } from 'react';
import Link from 'next/link';
import styles from './WorkspaceWorkflowFigure.module.css';

interface Stage { label: [string, string]; actor: string; description: string; guide: string }
const workflows: Record<string, { title: [string, string]; stages: Stage[] }> = {
    'sample-to-report': {
        title: ['One patient visit', 'From specimen to report'],
        stages: [
            { label: ['Collect', 'specimen'], actor: 'Collection team', description: 'Identify the patient and record collection for the requested service.', guide: 'sample-collection' },
            { label: ['Review', 'sample'], actor: 'Sample reviewer', description: 'Review whether the specimen is suitable for processing.', guide: 'sample-validation' },
            { label: ['Record', 'results'], actor: 'Result author', description: 'Enter the measured values for the correct service and revision.', guide: 'result-entry' },
            { label: ['Validate', 'revision'], actor: 'Validator', description: 'Review and approve the current result revision under the required release rules.', guide: 'result-validation' },
            { label: ['Deliver', 'report'], actor: 'Delivery team', description: 'Review report eligibility, deliver it and record the handoff.', guide: 'result-delivery' },
        ],
    },
    'patient-journey': {
        title: ['One patient identity', 'A connected service journey'],
        stages: [
            { label: ['Search', 'patient'], actor: 'Front desk', description: 'Search existing patients before beginning another registration.', guide: 'customers' },
            { label: ['Confirm', 'identity'], actor: 'Front desk', description: 'Use the patient identifier and relevant identity information to confirm the correct person.', guide: 'customers' },
            { label: ['Register', 'if needed'], actor: 'Registrar', description: 'Create a patient record when the identity is new, then verify its identifier.', guide: 'registration' },
            { label: ['Track', 'visit'], actor: 'CRM team', description: 'Review the active visit and its current service stage.', guide: 'queue' },
            { label: ['Hand over', 'for billing'], actor: 'CRM and billing teams', description: 'Carry the same patient and visit reference into service and payer selection.', guide: 'registration' },
        ],
    },
    'billing-to-receipt': {
        title: ['One bill reference', 'Charges, collection, receipt'],
        stages: [
            { label: ['Identify', 'patient / payer'], actor: 'Registrar', description: 'Confirm the patient and who is responsible for payment.', guide: 'prepare-bill' },
            { label: ['Review', 'services / prices'], actor: 'Billing desk', description: 'Select the intended services and check charges and adjustments.', guide: 'prepare-bill' },
            { label: ['Save', 'bill'], actor: 'Billing desk', description: 'Record the bill using the configured payment or cashier-handoff workflow.', guide: 'prepare-bill' },
            { label: ['Collect', 'payment'], actor: 'Cashier', description: 'Find the saved bill, review allocations and record the actual collection.', guide: 'collect-payment' },
            { label: ['Print', 'receipt'], actor: 'Cashier', description: 'Review the recorded payment and print or reprint its receipt.', guide: 'receipts' },
        ],
    },
    'department-custody': {
        title: ['One stock request', 'Trace custody and actual usage'],
        stages: [
            { label: ['Request', 'items'], actor: 'Department', description: 'Select the items and quantities needed by laboratory or imaging.', guide: 'department-stock' },
            { label: ['Approve', 'quantity'], actor: 'Stores', description: 'Review available stock and approve the appropriate quantity, above or below the request.', guide: 'department-stock' },
            { label: ['Issue', 'stock'], actor: 'Stores', description: 'Record the quantity sent to the requesting department.', guide: 'department-stock' },
            { label: ['Confirm', 'receipt'], actor: 'Receiving department', description: 'Count and record actual receipt. Investigate any unreceived quantity.', guide: 'department-stock' },
            { label: ['Record', 'consumption'], actor: 'Department', description: 'Record actual use against the received balance, with separate actions for loss, wastage and returns.', guide: 'history' },
        ],
    },
};

const point = (degrees: number) => ({ x: 360 + 180 * Math.cos(degrees * Math.PI / 180), y: 275 + 180 * Math.sin(degrees * Math.PI / 180) });
const labels = [
    { x: 360, y: 36, anchor: 'middle' }, { x: 580, y: 205, anchor: 'start' },
    { x: 490, y: 488, anchor: 'middle' }, { x: 230, y: 488, anchor: 'middle' },
    { x: 140, y: 205, anchor: 'end' },
] as const;

export default function WorkspaceWorkflowFigure({ slug, hrefForArticle, availableSlugs }: {
    slug: string; hrefForArticle: (slug: string) => string; availableSlugs: string[];
}) {
    const id = useId().replace(/:/g, '');
    const workflow = workflows[slug];
    if (!workflow) return null;
    return <figure className={styles.figure} aria-labelledby={`${id}-caption`}>
        <figcaption id={`${id}-caption`}>How the work moves between service points</figcaption>
        <svg viewBox="0 0 720 540" className={styles.diagram} aria-hidden="true" focusable="false">
            <defs><marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" className={styles.marker}/></marker></defs>
            <circle cx="360" cy="275" r="180" className={styles.track}/>
            {workflow.stages.slice(0, -1).map((stage, index) => {
                const from = point(-90 + index * 72 + 11), to = point(-90 + (index + 1) * 72 - 11);
                return <path key={stage.label.join(' ')} d={`M ${from.x} ${from.y} A 180 180 0 0 1 ${to.x} ${to.y}`} className={styles.connector} markerEnd={`url(#${id}-arrow)`}/>;
            })}
            <g className={styles.document}>
                <rect x="329" y="205" width="62" height="74" rx="8"/>
                <path d="M 342 224 H 378 M 342 239 H 378 M 342 254 H 365"/>
            </g>
            <text x="360" y="310" textAnchor="middle" className={styles.centerTitle}>{workflow.title[0]}</text>
            <text x="360" y="334" textAnchor="middle" className={styles.centerDetail}>{workflow.title[1]}</text>
            {workflow.stages.map((stage, index) => {
                const position = point(-90 + index * 72), label = labels[index];
                return <g key={stage.label.join(' ')}>
                    <circle cx={position.x} cy={position.y} r="28" className={styles.node}/>
                    <text x={position.x} y={position.y + 8} textAnchor="middle" className={styles.number}>{String(index + 1).padStart(2, '0')}</text>
                    <text x={label.x} y={label.y} textAnchor={label.anchor} className={styles.label}>
                        <tspan x={label.x}>{stage.label[0]}</tspan><tspan x={label.x} dy="23">{stage.label[1]}</tspan>
                    </text>
                </g>;
            })}
        </svg>
        <ol className={styles.stages}>
            {workflow.stages.map(stage => <li key={stage.label.join(' ')}>
                <strong>{stage.label.join(' ')} · {stage.actor}</strong>
                <p>{stage.description}</p>
                {availableSlugs.includes(stage.guide) && <Link href={hrefForArticle(stage.guide)}>Read the task guide</Link>}
            </li>)}
        </ol>
    </figure>;
}
