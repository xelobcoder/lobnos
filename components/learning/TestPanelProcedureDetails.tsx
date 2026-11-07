import type { WorkspaceArticle } from '../../lib/workspaceLearning';

type TestPanelProcedure = NonNullable<WorkspaceArticle['procedure']>;

const uiLabels = [
    'Save All Changes', 'Save Formula Version', 'Save Revised Version', 'Arrange parameters', 'Manage Test', 'Sample Container',
    'Sample Quantity', 'Cost of Test', 'Test Price', 'Report Title', 'Device Interface Mapping',
    'Sample Type', 'Test Details', 'Test Fields', 'Add Tests', 'Save Changes', 'Add Field',
    'Add Row', 'Field Name', 'Specific Config', 'Category', 'Instrumentation', 'Calculations',
    'Procedure Manual', 'Literature', 'Report Settings', 'Outsourcing', 'Critical-value actions',
    'Apply order', 'Calculate preview', 'Revert to General', 'TAT Count', 'Pre Tat', 'Post Tat',
    'Configuration', 'Test Panels', 'Staff Access', 'View page', 'Manage tests', 'Save',
    'Preview', 'Plan', 'Units', 'Req?', 'Add', 'new test', 'Operations', 'Laboratory',
    'Effective from', 'Formula History', 'Active', 'Scheduled', 'Historical', 'Inactive', 'Legacy',
    'Test Name', 'Unit', 'Short Text', 'Method', 'Description', 'Has Manual', 'Show Trend',
    'Has Varied Gender', 'Has Children Limit', 'Outsourced Test', 'Use Drugs', 'Use Literature',
    'Require QC', 'Procedure Code', 'Dropdown', 'Text', 'Reference', 'Range (M/F/Child/Neonate)',
    'Fetal Biometry (Hadlock)', 'Compare (<=/>=)', 'Compare', 'Text Area', 'Time', 'Ultrasound',
    'Date & Time', 'Date', 'Male', 'Female', 'Children', 'Neonate', 'Reset order',
    'Alt+Arrow Up/Down', 'General', 'Company Info', 'Report Options', 'Comments',
    'Configure thresholds and condition rules', 'Condition Name', 'Create Condition',
    'Parameter selection', 'Constraints', 'Value to target', 'Create a Validator',
    'Added Constraints', 'update Information', 'Require acknowledgement',
    'Require clinician communication record', 'Hold final report printing',
    'Hold electronic delivery and portal release', 'Require supervisor clearance',
    'Reason for policy change', 'Save actions for this rule', 'Conditions Updated Successfully',
    'Critical actions saved', 'Yes',
];

function renderStep(text: string) {
    const labels = [...uiLabels].sort((a, b) => b.length - a.length);
    const escaped = labels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const matcher = new RegExp(`(${escaped})`, 'g');
    return text.split(matcher).map((part, index) =>
        labels.includes(part) ? <strong key={index}>{part}</strong> : part
    );
}

export default function TestPanelProcedureDetails({
    procedure,
    purpose,
    navigation,
    prerequisites,
    steps,
    expectedResult,
    sections,
}: {
    procedure: TestPanelProcedure;
    purpose: string;
    navigation: string;
    prerequisites: string[];
    steps: string[];
    expectedResult: string;
    sections: WorkspaceArticle['sections'];
}) {
    return <section aria-labelledby={`${procedure.id}-heading`}>
        <h3 id={`${procedure.id}-heading`}>{procedure.id} · Create and configure a test panel</h3>
        <p><strong>Purpose:</strong> {purpose}</p>

        <h3>Who can do this?</h3>
        <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
                <thead><tr><th scope="col">Role</th><th scope="col">What you can do</th></tr></thead>
                <tbody>{procedure.roles.map(row => <tr key={row.role}>
                    <th scope="row">{row.role}</th><td>{row.permissions}</td>
                </tr>)}</tbody>
            </table>
        </div>

        <h3>Before you begin</h3>
        <ul>{prerequisites.map((item, index) => <li key={index}>{item}</li>)}</ul>

        <h3>Where to go</h3>
        <p>{navigation}</p>

        <h3>Important</h3>
        <ul>{procedure.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>

        <h3>Steps</h3>
        <ol>{steps.map((step, index) => <li key={index}>{renderStep(step)}</li>)}</ol>

        <h3>Fields</h3>
        <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
                <thead><tr>
                    <th scope="col">Field</th><th scope="col">Required?</th>
                    <th scope="col">What to enter</th><th scope="col">Validation / dependencies</th>
                </tr></thead>
                <tbody>{procedure.fields.map(row => <tr key={row.field}>
                    <th scope="row">{row.field}</th><td>{row.required}</td>
                    <td>{row.entry}</td><td>{row.validation}</td>
                </tr>)}</tbody>
            </table>
        </div>

        <h3>Expected result</h3>
        <p>{expectedResult}</p>

        <h3>Other ways to proceed</h3>
        <ul>{procedure.alternatives.length
            ? procedure.alternatives.map((item, index) => <li key={index}>{item}</li>)
            : <li>None.</li>}</ul>

        <h3>Common problems</h3>
        <div className="table-responsive">
            <table className="table table-sm table-bordered align-middle">
                <thead><tr>
                    <th scope="col">Message or symptom</th><th scope="col">Cause</th><th scope="col">What to do</th>
                </tr></thead>
                <tbody>{procedure.commonErrors.map(error => <tr key={error.symptom}>
                    <th scope="row">{error.symptom}</th><td>{error.cause}</td><td>{error.fix}</td>
                </tr>)}</tbody>
            </table>
        </div>

        <h3>Related procedures</h3>
        <ul>{procedure.related.length
            ? procedure.related.map((item, index) => <li key={index}>{item}</li>)
            : <li>None.</li>}</ul>

        <h3>Figures</h3>
        <ul>{procedure.screenshotsPending.map(figure => <li key={figure.figure}>
            [{figure.figure} pending: {figure.screen}; {figure.state} {figure.dataNeeded}]
        </li>)}</ul>

        {sections?.map((section, index) => <section key={section.title} id={`topic-test-panel-${index + 1}`}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph, index) => <p key={index}>{renderStep(paragraph)}</p>)}
            {!!section.steps?.length && <ol>{section.steps.map((step, index) => <li key={index}>{renderStep(step)}</li>)}</ol>}
            {section.tables?.map(table => <div className="table-responsive" key={table.caption}>
                <table className="table table-sm table-bordered align-middle">
                    <caption>{table.caption}</caption>
                    <thead><tr>{table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
                    <tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => cellIndex === 0
                            ? <th key={cellIndex} scope="row">{renderStep(cell)}</th>
                            : <td key={cellIndex}>{renderStep(cell)}</td>)}
                    </tr>)}</tbody>
                </table>
            </div>)}
            {!!section.checklist?.length && <ul>{section.checklist.map((item, index) => <li key={index}>{renderStep(item)}</li>)}</ul>}
        </section>)}
    </section>;
}
