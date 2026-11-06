const navigationGroups = [
  { title: "WORKSPACE", items: ["Home"] },
  { title: "OPERATIONS", items: ["Registration", "Samples", "Results", "Home collection"] },
  { title: "BUSINESS", items: ["Billing", "Accounting", "Inventory", "Quality control"] },
];

export function DashboardMockup() {
  return (
    <div className="dashboard-frame" role="img" aria-label="Illustrative PLS-style specimen workflow screen with synthetic sample codes, tests and statuses. Not a live screenshot or facility data.">
      <div className="dashboard-topbar">
        <div className="dashboard-brand"><span className="mini-mark">P</span><span>Facility workspace<small>PLS LABORATORY SYSTEM</small></span></div>
        <div className="dash-toolbar"><span>Workspace</span><span className="avatar">••</span></div>
      </div>
      <div className="dashboard-body">
        <aside className="dashboard-side">{navigationGroups.map((group) => <div className="dashboard-nav-group" key={group.title}><small>{group.title}</small>{group.items.map((item) => <span className={item === "Samples" ? "side-active" : ""} key={item}><i aria-hidden="true">{["⌂","＋","▤","◉","↗","₵","⌁","▦","✓"][navigationGroups.flatMap((section) => section.items).indexOf(item)]}</i><b>{item}</b></span>)}</div>)}</aside>
        <div className="dashboard-content workspace-home">
          <div className="workspace-context"><small>PLS WORKSPACE / SPECIMEN OPERATIONS</small><span>Samples</span></div>
          <div className="dashboard-module-heading"><div><span>PHYSICAL SAMPLE WORKFLOW</span><h2>Specimen reception</h2></div><button type="button" tabIndex={-1}>Barcode lookup</button></div>
          <div className="dashboard-sample-filters"><span className="dashboard-sample-search">⌕ &nbsp; Search barcode or sample ID</span><span>All statuses⌄</span></div>
          <div className="dashboard-sample-table-wrap"><table className="dashboard-sample-table"><thead><tr><th>BARCODE / SAMPLE</th><th>TEST PANEL</th><th>COLLECTION</th><th>STATUS</th></tr></thead><tbody>
            <tr><td><b>SYN-0261-014</b><small>SYNTHETIC SAMPLE</small></td><td>Full blood count</td><td>Facility</td><td><i className="sample-status sample-status-green">Received</i></td></tr>
            <tr><td><b>SYN-0261-015</b><small>SYNTHETIC SAMPLE</small></td><td>Malaria rapid test</td><td>Home collection</td><td><i className="sample-status sample-status-blue">Collected</i></td></tr>
            <tr><td><b>SYN-0261-016</b><small>SYNTHETIC SAMPLE</small></td><td>Urinalysis</td><td>Facility</td><td><i className="sample-status sample-status-amber">Review</i></td></tr>
          </tbody></table></div>
          <div className="dash-disclaimer">Illustrative PLS-style workflow · Synthetic sample IDs/statuses · Not live facility data</div>
        </div>
      </div>
    </div>
  );
}
