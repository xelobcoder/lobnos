import { useCallback, useEffect, useState } from "react"
import { customFetch, customPost, defaultCreationRule, getSingleEditTest, handleChangeWithState } from "../../Auth/customFetch"
import { Form } from "react-bootstrap"
import TableDisplay from "../../accessories/TableDisplay"
import { ToastContainer, toast } from "react-toastify"
import Loader from "../../accessories/Loader"
export default function CreateTestFields({ testid, testname, minimize = false }) {
  const [testdata, setTestData] = useState(defaultCreationRule)
  const [isloading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [error, setError] = useState("")
  const [field, setField] = useState(defaultCreationRule)
  const [reorder, setReorder] = useState(true)

  const handleCreateField = async () => {
    setError("")
    if (field.name.toString().length == 0) {
      return setError("parameter or field name is required")
    }

    if (field.type.toString().length == 0) {
      return setError("Data type of field required")
    }

    if (field.hasoptions == true) {
      setField({ ...field, field: "select" })
    } else {
      setField({ ...field, field: "input" })
    }

    if (data.length === 0) {
      setData([field])
    } else {
      const dataset = [...data].filter((item, index) => item.name != field.name)
      setData([...dataset, field])
    }
    setField(defaultCreationRule)
  }

  const removeField = async (item) => {
    const { name } = item
    setData((prev) => {
      const filtered = prev.filter((a, index) => a.name != name)
      return filtered
    })
  }

  const renderLimitsValue = (row, limit) => {
    if (testdata.hasGenderVariation) {
      return (
        <div>
          <span>male: {row?.male?.[limit]}</span>
          <br />
          <span>female:{row?.female?.[limit]} </span>
        </div>
      )
    } else {
      return <div>{row?.[limit]}</div>
    }
  }

  const changeOrdering = (item, ev) => {
    const { value } = ev.target
    const { name } = item
    const clonedData = [...data]
    const filteredIndex = clonedData.findIndex((item, index) => item.name == name)
    clonedData[filteredIndex]["ordering"] = value
    setData(clonedData)
  }

  const columns = [
    { Header: "name", accessor: "name" },
    { Header: "type", accessor: "type" },
    {
      Header: "upperlimits",
      accessor: "upperlimit",
      Cell: ({ value, row }) => {
        return <div>{renderLimitsValue(row.original, "upperlimit")}</div>
      },
    },
    {
      Header: "lowerlimits",
      accessor: "lowerlimit",
      Cell: ({ value, row }) => {
        return <div>{renderLimitsValue(row.original, "lowerlimit")}</div>
      },
    },
    {
      Header: "actions",
      accessor: "",
      Cell: ({ value, row }) => {
        console.log(row.original)
        return (
          <div className="d-flex justify-content-between">
            <input
              type="number"
              className="custom-input"
              value={row.original?.ordering}
              onChange={(ev) => {
                changeOrdering(row.original, ev)
              }}
            />
            <button
              onClick={(ev) => {
                editField(row.original)
              }}
              className="btn btn-info btn-sm mx-2">
              Edit
            </button>
            <button
              onClick={(ev) => {
                removeField(row.original)
              }}
              className="btn btn-danger btn-sm">
              Remove
            </button>
          </div>
        )
      },
    },
  ]

  const getSinglePlusRules = useCallback(() => {
    if (testid) {
      getSingleEditTest(testid, setTestData, setLoading)
      customFetch(`testpanel/list/customtestrule?testid=${testid}`)
        .then((data) => {
          setData(data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [testid])

  useEffect(() => {
    getSinglePlusRules()
  }, [getSinglePlusRules])

  const handleGenderVariationLimit = (value, limit, gender) => {
    setField({
      ...field,
      hasGenderVariation: testdata.hasGenderVariation == 1,
      [gender]: {
        ...field[gender],
        [limit]: value,
      },
    })
  }

  const editField = (row) => {
    if (data.length == 0) return
    setField(row)
  }

  const createLimitFields = () => {
    if (field.haslimits && field.type == "number" && !field.hasoptions) {
      if (testdata.hasGenderVariation) {
        if (testdata.hasGenderVariation && testdata.hasChildrenLimit) {
          return (
            <div>
              <label>limits</label>
              {["male", "female", "children"].map((item, index) => {
                return (
                  <div key={index}>
                    <label>{item}</label>
                    <div className="d-flex justify-content-between">
                      <input
                        placeholder="upper limit"
                        type="number"
                        onChange={(ev) => {
                          handleGenderVariationLimit(ev.target.value, "upperlimit", item)
                        }}
                        value={field[item]?.upperlimit}
                        className="custom-input"
                      />
                      <input
                        placeholder="lower limit"
                        type="number"
                        onChange={(ev) => {
                          handleGenderVariationLimit(ev.target.value, "lowerlimit", item)
                        }}
                        value={field[item]?.lowerlimit}
                        className="custom-input mx-2"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        } else {
          return (
            <div>
              <label>limits</label>
              {["male", "female"].map((item, index) => {
                return (
                  <div key={index}>
                    <label>{item}</label>
                    <div className="d-flex justify-content-between">
                      <input
                        placeholder="upper limit"
                        type="number"
                        onChange={(ev) => {
                          handleGenderVariationLimit(ev.target.value, "upperlimit", item)
                        }}
                        value={field[item]?.upperlimit}
                        className="custom-input"
                      />
                      <input
                        placeholder="lower limit"
                        type="number"
                        onChange={(ev) => {
                          handleGenderVariationLimit(ev.target.value, "lowerlimit", item)
                        }}
                        value={field[item]?.lowerlimit}
                        className="custom-input mx-2"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }
      } else {
        return (
          <div>
            <label>limits</label>
            <div className="d-flex justify-content-between">
              <input
                placeholder="upper limit"
                type="number"
                onChange={(ev) => {
                  handleChangeWithState(ev, "upperlimit", setField, field)
                }}
                value={field.upperlimit}
                className="custom-input"
              />
              <input
                placeholder="lower limit"
                type="number"
                onChange={(ev) => {
                  handleChangeWithState(ev, "lowerlimit", setField, field)
                }}
                value={field.lowerlimit}
                className="custom-input mx-2"
              />
            </div>
          </div>
        )
      }
    }
  }

  const updateFieldsRules = async () => {
    if (data.length === 0) return
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i]["ordering"])) {
        data[i]["ordering"] = i
      }
    }
    let orderedData = data.sort((a, b, i) => a.ordering - b.ordering)
    const response = await customPost("testpanel/list/customtestrule", "PUT", { testid, data: orderedData })
    if (response.status === true) {
      toast.success("test fields updated successfully", { autoClose: 500 })
    } else {
      toast.error(response?.message || "test fields creation failed", { autoClose: 2000 })
    }
  }

  const finalRenderingView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div>
          <section className="mx-2 bg-white border border-secondary-subtle p-2">
            <h5>Parameter / field Creation</h5>
            <hr />
            <div>
              <div className={error.length > 0 ? "alert alert-danger" : ""}>{error}</div>
              <form className="grid grid-50">
                <div>
                  <div className="form-row">
                    <label>Field name</label>
                    <input
                      value={field?.name}
                      placeholder="name"
                      onChange={(ev) => {
                        handleChangeWithState(ev, "name", setField, field)
                      }}
                      className="custom-input"
                      type="text"
                    />
                  </div>
                  <div className="form-row">
                    <label>data type</label>
                    <select
                      value={field?.type}
                      placeholder=""
                      onChange={(ev) => {
                        handleChangeWithState(ev, "type", setField, field)
                      }}
                      className="custom-select"
                      type="text">
                      <option value="">select data type of field</option>
                      <option value="number">number</option>
                      <option value="text">text</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between">
                    <label>has options</label>
                    <Form.Switch
                      onChange={(ev) => {
                        const value = ev.target.checked
                        if (value === true) {
                          setField({ ...field, hasoptions: value, haslimits: false })
                        } else {
                          setField({ ...field, hasoptions: value })
                        }
                      }}
                      type="switch"
                      style={{ fontSize: "25px" }}
                      checked={field.options}
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    <label>has units</label>
                    <Form.Switch
                      onChange={(ev) => {
                        const value = ev.target.checked
                        setField({ ...field, hasunits: value })
                      }}
                      type="switch"
                      style={{ fontSize: "25px" }}
                      checked={field.hasunits}
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    <label>has limits</label>
                    <Form.Switch
                      onChange={(ev) => {
                        setField({ ...field, haslimits: ev.target.checked })
                      }}
                      type="switch"
                      style={{ fontSize: "25px" }}
                      checked={field.haslimits}
                    />
                  </div>
                  <div className="d-flex justify-content-between">
                    <label>use Plain</label>
                    <Form.Switch
                      onChange={(ev) => {
                        setField({ ...field, useplain: ev.target.checked })
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
                  <label>field units</label>
                  <input
                    onChange={(ev) => {
                      handleChangeWithState(ev, "units", setField, field)
                    }}
                    value={field.units}
                    multiple
                    className="custom-input"
                  />
                </div>
              )}
              {field.hasoptions && (
                <div>
                  <label>options(separate options using a comma delimiter)</label>
                  <input
                    onChange={(ev) => {
                      handleChangeWithState(ev, "options", setField, field)
                    }}
                    value={field.options}
                    multiple
                    className="custom-input"
                  />
                </div>
              )}
              {field.useplain && (
                <div>
                  <label>Reference field</label>
                  <textarea
                    value={field.plain}
                    className="form-control"
                    onChange={(ev) => {
                      handleChangeWithState(ev, "plain", setField, field)
                    }}></textarea>
                </div>
              )}

              <button
                onClick={(ev) => {
                  handleCreateField()
                }}
                className="btn btn-success btn-sm mt-2">
                create field
              </button>
            </div>
          </section>
          <section className="mx-2">
            {data.length == 0 ? (
              <h5 className="mt-4">No Fields created</h5>
            ) : (
              <div>
                <table className="ttable table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>type</th>
                      <th>Upper limits</th>
                      <th>Lower Limits</th>
                      <th className="d-flex justify-content-between align-items-center">
                        <span>Actions</span>
                        <span>
                          <button
                            onClick={(ev) => {
                              setReorder(!reorder)
                            }}
                            className="btn btn-secondary btn-sm">
                            Reorder Fields
                          </button>
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>{item?.name}</td>
                          <td>{item?.type}</td>
                          <td>{item?.upperlimit}</td>
                          <td>{item?.lowerlimit}</td>
                          <td>
                            <div className="d-flex justify-content-between">
                              <input
                                type="number"
                                className="custom-input"
                                value={item?.ordering}
                                disabled={reorder}
                                onChange={(ev) => {
                                  changeOrdering(item, ev)
                                }}
                              />
                              <button
                                onClick={(ev) => {
                                  editField(item)
                                }}
                                className="btn btn-info btn-sm mx-2">
                                Edit
                              </button>
                              <button
                                onClick={(ev) => {
                                  removeField(item)
                                }}
                                className="btn btn-danger btn-sm">
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {/* <TableDisplay initpageSize={30} column={columns} data={data} /> */}
                <div>
                  <button
                    onClick={(ev) => {
                      updateFieldsRules()
                    }}
                    className="btn btn-success btn-sm mt-2">
                    update fields
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )
    }
  }

  return (
    <>
      <ToastContainer />
      <h5 className="mx-2 text-capitalize">{testname}</h5>
      {finalRenderingView()}
    </>
  )
}
