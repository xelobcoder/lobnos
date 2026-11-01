import { RiTestTubeLine } from '@remixicon/react';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from '../../../../components/operations/ClinicalWorkspace.module.css';

export default function LaboratoryTestPanelLayout({ children }: { children: React.ReactNode }) {
    return (
        <section className={ui.workspace}>
            <header className={ui.header}>
                <div className={ui.heading}>
                    <span className={ui.icon}><RiTestTubeLine size={24} /></span>
                    <div>
                        <span className={ui.eyebrow}>Laboratory configuration</span>
                        <h1>Manage test panels</h1>
                        <p>Configure tests, parameters, reference ranges and report settings.</p>
                    </div>
                </div>
            </header>
            <div className={styles.content}>{children}</div>
        </section>
    );
}
