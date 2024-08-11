import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { customFetch, defaultCreationRule, getSingleEditTest } from "../../Auth/customFetch";
import Loader from "../../accessories/Loader";
import AlertInmportantInformation from "./AlertImportantInformation";
import CustomParameterTypeSelection from "./CustomParameterTypeSelection";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { updateFieldsRules } from "./data/testUtil";
import ParamCreationGForm from "./ParamCreationForm";
import MultiFieldSelectConditions from "./MultiFieldConditions";

export default function CreateTestFields({ testid, testname, minimize = false }) {
  const [generalTestRule, setGeneralTestRule] = useState(defaultCreationRule);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [field, setField] = useState(defaultCreationRule);
  const [reorder, setReorder] = useState(true);


  const handleCreateField = async () => {
    setError("");
    if (!field.name) {
      return setError("Parameter or field name is required");
    }


    if (data.length === 0) {
      setData([field]);
    } else {
      const updatedData = data.filter(item => item.name !== field.name);
      setData([...updatedData, field]);
    }
    setField(defaultCreationRule);
  };

  const removeField = async (item) => {
    const { name } = item;
    setData(prevData => prevData.filter(a => a.name !== name));
  };


  const changeOrdering = (item, ev) => {
    const { value } = ev.target;
    const { name } = item;
    const updatedData = [...data];
    const index = updatedData.findIndex(item => item.name === name);
    updatedData[index]["ordering"] = value;
    setData(updatedData);
  };

  const getSinglePlusRules = useCallback(() => {
    if (testid) {
      getSingleEditTest(testid, setGeneralTestRule, setLoading);
      customFetch(`testpanel/list/customtestrule?testid=${testid}`)
        .then(data => setData(data))
        .catch(err => console.error(err));
    }
  }, [testid]);

  useEffect(() => {
    getSinglePlusRules();
  }, [getSinglePlusRules]);

  const editField = (row) => {
    if (data.length > 0) {
      setField(row);
    }
  };

  const finalRenderingView = () => {
    if (isLoading) {
      return <Loader />
    } else {
      return (
        <div>
          <AlertInmportantInformation />
          <div>
            <div>
              {error && <div className="alert alert-danger">{error}</div>}
            </div>
            <div className="card">
              <div className="card-header">
                <h5>Parameter / Field Creation</h5>
              </div>
              <div className="card-body">
                <ParamCreationGForm field={field} setField={setField} generalTestRule={generalTestRule} />
                <CustomParameterTypeSelection selection={field.plan} field={field} setField={setField} />
              </div>
              <div className="card-footer">
                <button
                  onClick={handleCreateField}
                  className="btn btn-success mt-2"
                >
                  Create Field
                </button>
              </div>
            </div>
          </div>

          {/* fields card */}
          <div className="card mt-3">
            <div className="card-header">
              Fields
            </div>
            <div className="card-body">
              {data.length === 0 ? (
                <h5 className="mt-4">No fields created</h5>
              ) :
                (<RenderTestCreationParameters
                  data={data}
                  reorder={reorder}
                  setReorder={setReorder}
                  changeOrdering={changeOrdering}
                  editField={editField}
                  removeField={removeField}
                />)}
            </div>
            <div className="card-footer">
              <button onClick={() => updateFieldsRules(data, toast, testid)}
                className="btn btn-success mt-2">
                Update Fields
              </button>
            </div>
          </div>
          <div className="card my-4">
            <div className="card-header">
              Multiple Field Conditions
            </div>
            <div className="card-body">
              <MultiFieldSelectConditions fields={data} />
            </div>
            <div className="card-footer">
              <button
                className="btn btn-success mt-2">
                Update Fields
              </button>
            </div>
          </div>
          {/* multiple field conditions */}

        </div>
      );
    }

  };

  return (
    <>
      <ToastContainer theme="colored" className="text-sm" position="top-center" />
      <h5 className="mx-2 text-capitalize">{testname}</h5>
      {finalRenderingView()}
    </>
  );
}
