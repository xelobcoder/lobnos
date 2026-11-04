import { createRoot } from "react-dom/client";
import NhisWorkspace from "../../../components/accounting/NhisWorkspace";
import AccountingWorkspaceNav from "../../../components/accounting/AccountingWorkspaceNav";
import styles from "../../../app/accounting/accounting.module.css";

createRoot(document.getElementById("root")!).render(<div className={styles.accountingModule}>
    <div className="alert alert-info m-3">Synthetic laboratory NHIS fixture only. No credentials, patients or backend connections.
        <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => { window.nhisFixture.failNext = true; }}>Reject next mutation</button>
        <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => { window.nhisFixture.loseNextResponse = true; }}>Lose next success response</button>
    </div><AccountingWorkspaceNav /><NhisWorkspace />
</div>);
