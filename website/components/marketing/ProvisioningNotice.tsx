import { provisioning } from "../../data/content";

export function ProvisioningNotice() {
  return (
    <aside className="provisioning-notice" aria-label="Fast software provisioning">
      <div className="provisioning-time" aria-hidden="true"><strong>5</strong><span>MINUTES</span></div>
      <div>
        <span className="eyebrow">FAST SOFTWARE PROVISIONING</span>
        <h3>{provisioning.title}</h3>
        <p>{provisioning.description}</p>
        <ol className="provisioning-sequence" aria-label="Provisioning prerequisites and access">
          <li>Request approved</li><li>Payment confirmed</li><li>Workspace online</li>
        </ol>
        <p className="provisioning-note">{provisioning.note}</p>
      </div>
    </aside>
  );
}
