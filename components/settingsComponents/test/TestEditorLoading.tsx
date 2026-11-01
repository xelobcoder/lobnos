import ui from '../../Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './TestEditorLoading.module.css';

export default function TestEditorLoading({label='Loading test configuration'}: {label?:string}) {
    return (
        <section className={`${ui.workspace} ${ui.panel}`} aria-busy={true} aria-label={label}>
            <p className={ui.muted} role="status">{label}...</p>
            <div className={styles.skeleton} aria-hidden="true">
                <div className={styles.title}/>
                <div className={styles.grid}>{Array.from({length:6},(_,index)=><div className={styles.field} key={index}><span/><div/></div>)}</div>
                <div className={styles.title}/>
            </div>
        </section>
    );
}
