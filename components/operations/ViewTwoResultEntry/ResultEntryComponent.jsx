import { getTestComponent } from "../../LabTestForms/ComponentsTestFormsList";

export default function ResultEntryComponent({ operations }) {
  console.log(operations)
  let Component = getTestComponent();
  const { uiLayout, testid } = operations;
  return (<div>
    {uiLayout == 3 && testid && <Component clientdata={operations} />}
  </div>);
}
