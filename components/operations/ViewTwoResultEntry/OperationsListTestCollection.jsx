import { useContext } from "react";
import { useOperation } from "./ContextOperations/useOperation";

export default function OperationsListTestCollection() {
  const { operations, updateContext } = useContext(useOperation);
  const { testList, testid, initDataLoading ,uiLayout,showTestCollection} = operations;

  if (testList.length == 0 && initDataLoading == false) {
    return <div className="alert alert-danger ui p-3 border-danger border-2">No test found for transaction</div>;
  }

  if (testList.length == 0 && initDataLoading == true) {
    return <div>Loading</div>;
  }

  return (
    <div>
      {showTestCollection && testList.map((item, index) => {
        return (
          <div
            key={index}
            className={`ui d-flex bg-white justify-content-between br-5 pointer border shadow p-3 my-2 
            ${testid == item.testid && "border-primary border-2"}`}>
            <span>{item.name}</span>
            <span>
              <button
                type="button"
                onClick={(ev) => {
                  updateContext({ ...operations, minifyClientInfo: true, testid: item.testid,uiLayout: 3 });
                }}
                className={`btn btn-sm ${testid == item.testid ? "btn-primary" : "btn-light"}`}>
                result
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
