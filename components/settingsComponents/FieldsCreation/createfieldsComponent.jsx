import { useCallback, useEffect, useState } from "react";
import { customFetch, customPost, defaultCreationRule, getSingleEditTest, handleChangeWithState } from "../../Auth/customFetch";
import { ToastContainer, toast } from "react-toastify";
import Loader from "../../accessories/Loader";
import RenderTestCreationParameters from "./RenderTestCreationParametersTable";
import { handleCreationMasterRUle, updateFieldsRules } from "./data/testUtil";


export default function CreateTestFields({ testid, testname, minimize = false }) {
  const [generalTestRule, setgeneralTestRule] = useState(defaultCreationRule);
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
    if (generalTestRule.hasGenderVariation) {
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
      getSingleEditTest(testid, setgeneralTestRule, setLoading);
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
      hasGenderVariation: generalTestRule.hasGenderVariation === 1,
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
      if (generalTestRule.hasGenderVariation && generalTestRule.hasChildrenLimit) {
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
                    className="custom-input"
                  />
                  <input
                    placeholder="Lower limit"
                    type="number"
                    onChange={(ev) => {
                      handleGenderVariationLimit(ev.target.value, "lowerlimit", item);
                    }}
                    value={field[item]?.lowerlimit}
                    className="custom-input mx-2"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      } else if (generalTestRule.hasGenderVariation && !generalTestRule.hasChildrenLimit) {
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
                    className="custom-input"
                  />
                  <input
                    placeholder="Lower limit"
                    type="number"
                    onChange={(ev) => {
                      handleGenderVariationLimit(ev.target.value, "lowerlimit", item);
                    }}
                    value={field[item]?.lowerlimit}
                    className="custom-input mx-2"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      } else {
        return (
          <div >
            <label>Upper Limit</label>
            <div className="d-flex justify-content-between">
              <input
                placeholder="Upper limit"
                type="number"
                onChange={(ev) => {
                  setField({ ...field, upperlimit: ev.target.value })
                }}
                value={field.upperlimit}
                className="custom-input"
              />
              <input
                placeholder="Lower limit"
                type="number"
                onChange={(ev) => {
                  setField({ ...field, lowerlimit: ev.target.value })
                }}
                value={field?.lowerlimit}
                className="custom-input mx-2"
              />
            </div>
          </div>
        )
      }
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
            <form className="">
              <div className="d-flex grid-30-30-30">
                <div className="form-row">
                  <label>Field name</label>
                  <input
                    value={field?.name}
                    placeholder="Name"
                    onChange={(ev) => handleChangeWithState(ev, "name", setField, field)}
                    className="custom-input"
                    type="text"
                  />
                </div>
                
                <div className="form-row mx-2">
                  <label>method</label>
                  <select onChange={(ev) => { const fields = handleCreationMasterRUle(ev, field); setField(fields) }} className="custom-select">
                    <option >select an option</option>
                    <option value='options'>dropdown</option>
                    <option value='plain'>use plain text field for reference range</option>
                    <option value='limits'>use reference ranges</option>
                    <option value='input'>use a field input for text or numbers</option>
                  </select>
                </div>
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

                <div className="form-row mx-2">
                  <label>has units</label>
                  <select value={`${field.hasunits}`} onChange={(ev) => { setField({ ...field, hasunits: ev.target.value === "true" ? true : false }) }} className="custom-select">
                    <option >select an option</option>
                    <option value='true'>Yes</option>
                    <option value='false'>No</option>
                  </select>
                </div>
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
              </div>
              {/* <div>
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
              </div> */}
            </form>
            {createLimitFields()}



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
              <RenderTestCreationParameters data={data} reorder={reorder} setReorder={setReorder} changeOrdering={changeOrdering} editField={editField} removeField={removeField} />
              <div>
                  <button onClick={(ev) => { updateFieldsRules (data,toast)}} className="btn btn-success mt-2">
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
