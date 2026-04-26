import { getTestComponent } from "../../LabTestForms/ComponentsTestFormsList";

export default function ResultEntryComponent({ operations, onSaved, onNavigate }) {
  let Component = getTestComponent();
  const { uiLayout, testid } = operations;
  return (<div>
    {uiLayout == 3 && testid && <Component clientdata={operations} onSaved={onSaved} onNavigate={onNavigate} />}
  </div>);
}
