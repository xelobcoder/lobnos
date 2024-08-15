import { useContext } from "react";
import { getTestComponent } from "../../LabTestForms/ComponentsTestFormsList";
import { useOperation } from "./ContextOperations/useOperation";

export default function ResultEntryComponent() {
  let Component = getTestComponent();
  const { operations } = useContext(useOperation);
  const { uiLayout, testid } = operations;
  return (<div>
    {uiLayout == 3 && testid && <Component clientdata={operations} />}
  </div>);
}
