import { useCallback, useEffect, useState } from "react";
import { customFetch, customPost, defaultCreationRule, getSingleEditTest, handleChangeWithState } from "../../Auth/customFetch";
import { Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../accessories/Loader";

export default function CreateTestFields({ testid, testname, minimize = false }) {
  const [testdata, setTestData] = useState(defaultCreationRule);
  const [isloading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [field, setField] = useState(defaultCreationRule);
  const [reorder, setReorder] = useState(true);

  const handleCreateField = async () => {
    setError("");
    if (field.name.toString().length === 0) {
      return setError("Parameter or field name is required");
    }

    if (field.type.toString().length === 0) {
      return setError("Data type of field required");
    }

    if (field.hasoptions) {
      setField({ ...field, field: "select" });
    } else {
      setField({ ...field, field: "input" });
    }

    if (data.length === 0) {
      setData([field]);
    } else {
      const dataset = [...data].filter((item) => item.name !== field.name);
      setData([...dataset, field]);
    }
    setField(defaultCreationRule);
  };

  const removeField = async (item) => {
    const { name } = item;
    setData((prev) => {
      const filtered = prev.filter((a) => a.name !== name);
      return filtered;
    });
  };

  const renderLimitsValue = (row, limit) => {
    if (testdata.hasGenderVariation) {
      return (
        <div>
          <span>male: {row?.male?.[limit]}</span>
          <br />
          <span>female:{row?.female?.[limit]} </span>
        </div>
      );
    } else {
      return <div>{row?.[limit]}</div>;
    }
  };

  const changeOrdering = (item, ev) => {
    const { value } = ev.target;
    const { name } = item;
    const clonedData = [...data];
    const filteredIndex = clonedData.findIndex((item) => item.name === name);
    clonedData[filteredIndex]["ordering"] = value;
    setData(clonedData);
  };

  const getSinglePlusRules = useCallback(() => {
    if (testid) {
      getSingleEditTest(testid, setTestData, setLoading);
      customFetch(`testpanel/list/customtestrule?testid=${testid}`)
        .then((data) => {
          setData(data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [testid]);

  useEffect(() => {
    getSinglePlusRules();
  }, [getSinglePlusRules]);

  const handleGenderVariationLimit = (value, limit, gender) => {
    setField({
      ...field,
      hasGenderVariation: testdata.hasGenderVariation === 1,
      [gender]: {
        ...field[gender],
        [limit]: value,
      },
    });
  };

  const editField = (row) => {
    if (data.length === 0) return;
    setField(row);
  };

  const createLimitFields = () => {
    if (field.haslimits && field.type === "number" && !field.hasoptions) {
      if (testdata.hasGenderVariation && testdata.hasChildrenLimit) {
        return (
          <div>
            <label>Limits</label>
            {["male", "female", "children"].map((item, index) => (
              <div key={index}>
                <label>{item}</label>
                <div className="d-flex justify-content-between">
                  <input
                    placeholder="Upper limit"
                    type="number"
                    onChange={(ev) => {
                      handleGenderVariationLimit(ev.target.value, "upperlimit", item);
                    }}
                    value={field[item]?.upperlimit}
                    className="form-control"
                  />
                  <input
                    placeholder="Lower limit"
                    type="number"
                    onChange={(ev) => {
                      handleGenderVariationLimit(ev.target.value, "lowerlimit", item);
                    }}
                    value={field[item]?.lowerlimit}
                    className="form-control mx-2"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div>
            <label>Limits</label>
            {["male", "female"].map((item, index) => (
              <div key={index}>
                <label>{item}</label>
                <div className="d-flex justify-content-between">
                  <input
                    placeholder="Upper limit"
                    type="number"
                    onChange={(ev) => {
                      handleGenderVariationLimit(ev.target.value, "upperlimit", item);
                    }}
                    value={field[item]?.upperlimit}
                    className="form-control"
                  />
                  <input
                    placeholder="Lower limit"
                    type="number"
                    onChange={(ev) => {
                      handleGenderVariationLimit(ev.target.value, "lowerlimit", item);
                    }}
                    value={field[item]?.lowerlimit}
                    className="form-control mx-2"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
  };

  const updateFieldsRules = async () => {
    if (data.length === 0) return;
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i]["ordering"])) {
        data[i]["ordering"] = i;
      }
    }
    let orderedData = data.sort((a, b) => a.ordering - b.ordering);
    const response = await customPost("testpanel/list/customtestrule", "PUT", { testid, data: orderedData });
    if (response.status === true) {
      toast.success("Test fields updated successfully", { autoClose: 500 });
    } else {
      toast.error(response?.message || "Test fields creation failed", { autoClose: 2000 });
    }
  };

  const finalRenderingView = () => {
    if (isloading) return <Loader />;
    return (
      <div>
        <section className="mx-2 bg-white border border-secondary-subtle p-2">
          <h5>Parameter / Field Creation</h5>
          <hr />
          <div>
            <div className={error.length > 0 ? "alert alert-danger" : ""}>{error}</div>
            <form className="grid grid-50">
              <div>
                <div className="form-row">
                  <label>Field name</label>
                  <input
                    value={field?.name}
                    placeholder="Name"
                    onChange={(ev) => handleChangeWithState(ev, "name", setField, field)}
                    className="form-control"
                    type="text"
                  />
                </div>
                <div className="form-row">
                  <label>Data type</label>
                  <select
                    value={field?.type}
                    onChange={(ev) => handleChangeWithState(ev, "type", setField, field)}
                    className="form-control"
                    type="text">
                    <option value="">Select data type of field</option>
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                  </select>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between">
                  <label>Has options</label>
                  <Form.Switch
                    onChange={(ev) => {
                      const value = ev.target.checked;
                      if (value) {
                        setField({ ...field, hasoptions: value, haslimits: false });
                      } else {
                        setField({ ...field, hasoptions: value });
                      }
                    }}
                    type="switch"
                    style={{ fontSize: "25px" }}
                    checked={field.hasoptions}
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <label>Has units</label>
                  <Form.Switch
                    onChange={(ev) => {
                      const value = ev.target.checked;
                      setField({ ...field, hasunits: value });
                    }}
                    type="switch"
                    style={{ fontSize: "25px" }}
                    checked={field.hasunits}
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <label>Has limits</label>
                  <Form.Switch
                    onChange={(ev) => {
                      setField({ ...field, haslimits: ev.target.checked });
                    }}
                    type="switch"
                    style={{ fontSize: "25px" }}
                    checked={field.haslimits}
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <label>Use Plain</label>
                  <Form.Switch
                    onChange={(ev) => {
                      setField({ ...field, useplain: ev.target.checked });
                    }}
                    type="switch"
                    style={{ fontSize: "25px" }}
                    checked={field.useplain}
                  />
                </div>
              </div>
            </form>
            {createLimitFields()}
            {field.hasunits && (
              <div>
                <label>Field units</label>
                <input
                  onChange={(ev) => handleChangeWithState(ev, "units", setField, field)}
                  value={field.units}
                  className="custom-input"
                />
              </div>
            )}
            {field.hasoptions && (
              <div>
                <label>Options (separate options using a comma delimiter)</label>
                <input
                  onChange={(ev) => handleChangeWithState(ev, "options", setField, field)}
                  value={field.options}
                  className="custom-input"
                />
              </div>
            )}
            {field.useplain && (
              <div>
                <label>Reference field</label>
                <textarea
                  value={field.plain}
                  className="custom-input"
                  onChange={(ev) => handleChangeWithState(ev, "plain", setField, field)}
                />
              </div>
            )}

            <button
              onClick={(ev) => {
                handleCreateField();
              }}
              className="btn btn-success mt-2">
              Create Field
            </button>
          </div>
        </section>
        <section className="mx-2">
          {data.length === 0 ? (
            <h5 className="mt-4">No fields created</h5>
          ) : (
            <div className="card-body">
              <table className="table table-responsive my-2 table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Upper Limits</th>
                    <th>Lower Limits</th>
                    <th className="d-flex justify-content-between align-items-center">
                      <span>Actions</span>
                      <span>
                        <button
                          onClick={() => {
                            setReorder(!reorder);
                          }}
                          className="btn btn-link">
                          Reorder Fields
                        </button>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.type}</td>
                      <td>{item.upperlimit}</td>
                      <td>{item.lowerlimit}</td>
                      <td>
                        <div className="d-flex justify-content-between">
                          <input
                            type="number"
                            className="form-control"
                            value={item.ordering}
                            disabled={reorder}
                            onChange={(ev) => changeOrdering(item, ev)}
                          />
                          <button onClick={() => editField(item)} className="btn btn-info mx-2">
                            Edit
                          </button>
                          <button onClick={() => removeField(item)} className="btn btn-danger">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <button onClick={updateFieldsRules} className="btn btn-success mt-2">
                  Update Fields
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <>
      <ToastContainer theme="colored" className="text-sm" position="top-center" />
      <h5 className="mx-2 text-capitalize">{testname}</h5>
      {finalRenderingView()}
    </>
  );
}
