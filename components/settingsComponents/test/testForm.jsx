import { useEffect, useState, useCallback, useContext } from "react";
import { Form } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import AuthContext from "../../Auth/useAuthentification";
import Loader from "../../accessories/Loader";
import {
  getDepartment,
  getSampleTypeList,
  defaultTestEditValues,
  handleChangeWithState,
  customPost,
  getSingleEditTest
} from "../../Auth/customFetch";
import { Add } from "@mui/icons-material";

export default function TestForm({ method, customtest, testid, router }) {
  const { auth } = useContext(AuthContext);
  const employeeid = auth?.employeeid;
  const [sampleType, setSample] = useState([]);
  const [category, setCategory] = useState([]);
  const [data, setTestData] = useState({ ...defaultTestEditValues, iscustom: customtest });
  const [isLoading, setLoading] = useState(true);

  const getTestParams = useCallback(async () => {
    getSingleEditTest(testid, setTestData, setLoading);
  }, [testid]);

  useEffect(() => {
    if (testid) {
      getTestParams();
    }
  }, [getTestParams, testid]);

  useEffect(() => {
    getDepartment(setCategory);
    getSampleTypeList(setSample);
  }, []);

  const handleSwitch = (event, target) => {
    if (!target) return;
    setTestData({ ...data, [target]: event.target.checked === true ? 1 : 0 });
  };

  const handleForm = async (ev) => {
    ev.preventDefault();
    const { category, sample_container, sample, name, testprice } = data;

    if (sample === "" || sample_container === "" || name === "" || category === 0 || sample === 0) {
      toast.error("Sample type, container, and category are required", { autoClose: 2000 });
      return;
    }

    if (parseInt(testprice) < 0) {
      toast.error("Test price must be 0 or more", { autoClose: 2000 });
      return;
    }

    const response = await customPost(`testpanel/list`, method, { ...data, employeeid });

    if (response.status === "success") {
      toast.success("Test panel updated successfully", { autoClose: 500 });
    } else {
      toast.error("Test panel not updated", { autoClose: 500 });
    }
  };

  const renderingView = () => {
    if (isLoading) return <Loader />;
    else {
      return (
        <>
          <div className="mx-2 d-flex justify-content-between">
            <h5 className="text-capitalize">{data?.name}</h5>
            <div >
              <button
                onClick={(ev) => {
                  router.push(`/settings/testpanel/testlist/${testid}/outsourcingList?testname=${data.name}`);
                }}
                className="btn btn-primary mb-1"
              >
               <Add/> Add outsourcing Organizations
              </button>
              <button
                onClick={(ev) => {
                  router.push(`/settings/testpanel/testlist/createfields?testid=${testid}&&testname=${data.name}`);
                }}
                className="btn btn-light btn-sm mb-1 mx-2"
              >
                Test Fields
              </button>
            </div>
          </div>

          <div className="border bg-white border-secondary-subtle mx-2 p-2">
            <form className="mx-4">
              <h5>Basic </h5>
              <hr />
              <div className="form-row grid-reg mt-2">
                <label>Category</label>
                <select
                  required
                  className="custom-select"
                  value={data.category}
                  onChange={(ev) => {
                    handleChangeWithState(ev, "category", setTestData, data);
                  }}
                >
                  <option value="">Select a category</option>
                  {category.map((a, i) => (
                    <option key={i} value={a.id}>
                      {a.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Sample Type</label>
                <select
                  required
                  className="custom-select"
                  value={data.sample}
                  onChange={(ev) => {
                    handleChangeWithState(ev, "sample", setTestData, data);
                  }}
                >
                  <option value="">Select a sample type</option>
                  {sampleType.map((b, index) => (
                    <option value={b.id} key={index}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Sample Container</label>
                <input
                  onChange={(ev) => handleChangeWithState(ev, "sample_container", setTestData, data)}
                  type="text"
                  className="custom-input"
                  value={data.sample_container}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Unit</label>
                <input
                  onChange={(ev) => handleChangeWithState(ev, "unit", setTestData, data)}
                  type="text"
                  className="custom-input"
                  value={data.unit}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Sample Quantity</label>
                <input
                  onChange={(ev) => handleChangeWithState(ev, "qty_required", setTestData, data)}
                  type="number"
                  className="custom-input"
                  value={data.qty_required}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Short Text</label>
                <input
                  type="text"
                  value={data.shorttext}
                  onChange={(ev) => handleChangeWithState(ev, "shorttext", setTestData, data)}
                  className="custom-input"
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Cost of Test</label>
                <input
                  type="number"
                  onChange={(ev) => handleChangeWithState(ev, "testcost", setTestData, data)}
                  className="custom-input"
                  value={data.testcost}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Test Price</label>
                <input
                  type="number"
                  onChange={(ev) => handleChangeWithState(ev, "testprice", setTestData, data)}
                  className="custom-input"
                  value={data.testprice}
                />
              </div>
              <hr />
              <h5>Description</h5>
              <div className="form-row mt-2">
                <Form.Control
                  as="textarea"
                  rows={5}
                  onChange={(ev) => handleChangeWithState(ev, "description", setTestData, data)}
                  value={data.description}
                  placeholder="Type test description here"
                />
              </div>
              <hr />
              <h5>Configurations</h5>
              <hr />
              <div className="form-row grid-reg mt-2">
                <label>Has Manual</label>
                <Form.Switch
                  onChange={(ev) => {
                    handleSwitch(ev, "hasManual");
                  }}
                  checked={data.hasManual === 1}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Show Trend</label>
                <Form.Switch
                  onChange={(ev) => {
                    handleSwitch(ev, "showtrend");
                  }}
                  checked={data.showtrend === 1}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Has Varied Gender</label>
                <Form.Switch
                  checked={data.hasGenderVariation === 1}
                  onChange={(ev) => {
                    handleSwitch(ev, "hasGenderVariation");
                  }}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Has Children Limit</label>
                <Form.Switch
                  checked={data.hasChildrenLimit === 1}
                  onChange={(ev) => {
                    handleSwitch(ev, "hasChildrenLimit");
                  }}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Outsourced Test</label>
                <Form.Switch
                  checked={data.isoutsourced === 1}
                  onChange={(ev) => {
                    handleSwitch(ev, "isoutsourced");
                  }}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Use Drugs <br /><small className="text-sm text-danger">(For culture and sensitivity test)</small></label>
                <Form.Switch
                  checked={data.hasDrugs === 1}
                  onChange={(ev) => {
                    handleSwitch(ev, "hasDrugs");
                  }}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              <div className="form-row grid-reg mt-2">
                <label>Use Literature</label>
                <Form.Switch
                  checked={data.useLiterature === 1}
                  onChange={(ev) => {
                    handleSwitch(ev, "useLiterature");
                  }}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
              {data.hasManual === 1 && (
                <div className="form-row grid-reg mt-2">
                  <label>Procedure Code</label>
                  <input
                    type="text"
                    onChange={(ev) => {
                      handleChangeWithState(ev, "procedureCode", setTestData, data);
                    }}
                    className="custom-input"
                    value={data.procedureCode}
                  />
                </div>
              )}
              <hr />
              <h5>Tat(Turn Around Time) Set Up</h5>
              <div className="form-row grid-reg d-flex justify-content-between">
                <input
                  type="number"
                  onChange={(ev) => handleChangeWithState(ev, "tatCount", setTestData, data)}
                  className="custom-input"
                  value={data.tatCount}
                  placeholder="Count of test to use"
                />
                <input
                  type="number"
                  onChange={(ev) => handleChangeWithState(ev, "pre_Tat", setTestData, data)}
                  className="custom-input"
                  value={data.pre_Tat}
                  placeholder="Pre Tat value"
                />
                <input
                  type="number"
                  onChange={(ev) => handleChangeWithState(ev, "tat", setTestData, data)}
                  className="custom-input"
                  value={data.tat}
                  placeholder="Tat Value"
                />
                <input
                  onChange={(ev) => handleChangeWithState(ev, "post_Tat", setTestData, data)}
                  type="number"
                  className="custom-input"
                  value={data.post_Tat}
                  placeholder="Post Tat Value"
                />
              </div>
              <hr />
              <div>
                <button
                  type="button"
                  className="btn btn-success btn-sm mt-2"
                  onClick={(ev) => {
                    handleForm(ev);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      );
    }
  };

  return (
    <div>
      <ToastContainer />
      {renderingView()}
    </div>
  );
}
