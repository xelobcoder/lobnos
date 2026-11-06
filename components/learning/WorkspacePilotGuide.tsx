import type { WorkspacePilot } from '../../lib/workspaceLearning';
import styles from './WorkspacePilotGuide.module.css';

export default function WorkspacePilotGuide({pilot}: {pilot: WorkspacePilot}) {
    return <section className={styles.pilot} aria-label="Pilot training evidence">
        <header><p className={styles.eyebrow}>Enhanced training procedure · Reviewed {pilot.reviewedAt}</p><h4>{pilot.status}</h4>
        <p>Verification describes the checks completed for this edition. Reading this guide does not grant task permissions.</p></header>
        <div className={styles.evidence}><section><h5>Checks completed</h5><ul>{pilot.checked.map((text,i)=><li key={i}>{text}</li>)}</ul></section>
        <section><h5>Still to verify</h5><ul>{pilot.pending.map((text,i)=><li key={i}>{text}</li>)}</ul></section></div>
        {pilot.screenshots.map((shot,i)=><figure key={shot.file} className={styles.figure}>
            <a className={styles.image} href={`/manuals/pilots/${shot.file}`} target="_blank" rel="noopener noreferrer" aria-label={`Enlarge screenshot ${i+1}`}>
                {/* Original application screenshot: no reconstructed interface or patient data. */}
                <img src={`/manuals/pilots/${shot.file}`} alt={shot.caption} loading="lazy"/>
                {shot.callouts.map((point,n)=><span key={n} className={styles.marker} style={{left:`${point.x}%`,top:`${point.y}%`}} aria-hidden="true">{n+1}</span>)}
            </a><figcaption><strong>Figure {i+1}.</strong> {shot.caption} <span>Open the image to enlarge.</span></figcaption>
            {shot.callouts.length>0&&<ol>{shot.callouts.map((point,n)=><li key={n}>{point.label}</li>)}</ol>}
        </figure>)}
        <h4>Field rules and common mistakes</h4>
        <dl className={styles.fields}>{pilot.fields.map((field,i)=><div key={i}><dt>{field.name}</dt><dd>{field.rule}<p><strong>Check:</strong> {field.mistake}</p></dd></div>)}</dl>
        <aside className={styles.exercise}><h4>Independent practice and pass criteria</h4><p>{pilot.exercise}</p><p>Record the facility, branch, active role, date, saved references and observed outcome. Ask your trainer to review any unresolved check before working independently.</p></aside>
    </section>;
}
