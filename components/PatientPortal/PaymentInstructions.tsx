import { RiBankCardLine } from '@remixicon/react';
import { formatMoney } from '../../lib/patientPortal';
import styles from './PortalShell.module.css';

/** Manual payment guidance (there is no online gateway); always paired with the amount owed. */
export default function PaymentInstructions({ instructions, outstanding, compact = false }: {
    instructions: string | null | undefined;
    outstanding?: number | null;
    compact?: boolean;
}) {
    const owed = Number(outstanding) || 0;
    if (owed <= 0 && compact) return null;
    return (
        <aside className={`${styles.paymentNotice} ${compact ? styles.paymentNoticeCompact : ''}`} aria-label="How to pay">
            <RiBankCardLine size={20} aria-hidden="true" />
            <div>
                {owed > 0 && <strong>Amount due: {formatMoney(owed)}</strong>}
                <p className="mb-0">{instructions?.trim()
                    ? instructions
                    : 'Please pay at the facility reception. Results that need payment are released once your payment is recorded.'}</p>
            </div>
        </aside>
    );
}
