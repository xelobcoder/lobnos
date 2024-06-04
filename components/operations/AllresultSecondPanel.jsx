import { useCallback, useContext, useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";
import OperationsContext from "./OperationsContext";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { getTestComponent } from "../LabTestForms/ComponentsTestFormsList.js";

export default function AllresultSecondPanel() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  let Component = operationsKey?.test && getTestComponent(operationsKey?.test.toLowerCase());
  const [datapool, setDatapool] = useState([]);
  const [active, setActive] = useState(null);

  const getPreview = useCallback(
    async function () {
      if (typeof operationsKey == "object" && operationsKey?.billingid) {
        const billingid = operationsKey?.billingid;
        const response = await customFetch(`operations/test/result?billingid=${billingid}`);
        setDatapool(response?.result);
      }
    },
    [operationsKey]
  );

  const handleResult = async function (index) {
    const item = datapool[index];
    const { testid, billingid, NAME } = item;
    // we want to update the context to display test component so that the user can enter the result
    // replace space in theNAME with underscore
    let testname = NAME.replace(/\s/g, "_").toLowerCase();
    if (testname.includes("(") && testname.includes(")")) {
      testname = testname.slice(0, NAME.indexOf("("));
    }
    active != null && updateOperations({ ...operationsKey, testid, billingid, display: true, test: testname });
  };

  return (
    <>
      <Tabs
        onSelect={(eventKey) => {
          setActive(eventKey);
        }}
        defaultActiveKey={0}
        id="result-entry-archive-tab"
        className="my-2 mx-2">
        {datapool.length > 0 &&
          datapool.map((item, index) => (
            <Tab title={item.NAME} eventKey={index} key={index}>
              <div>{operationsKey?.display && <Component employeeid={operationsKey?.employeeid} clientdata={operationsKey} />}</div>
            </Tab>
          ))}
      </Tabs>
    </>
  );
}
