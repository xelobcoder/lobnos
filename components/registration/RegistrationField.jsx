import { useEffect, useState } from "react"
import { getRegistrationFields } from "./Util"
import { Form } from "react-bootstrap"
import { customPost } from "../Auth/customFetch"
import { ToastContainer, toast } from "react-toastify"

export default function RegistrationFieldsView({ employeeid }) {
  const [fields, setFields] = useState([])

  useEffect(() => {
    getRegistrationFields(setFields, toast)
  }, [])

  const renderingView = () => {}

  const handleSubmit = async () => {
    const isObjFields = fields.some((item, index) => Object.keys(item.fields).length === 0)
    if (isObjFields) return
    const response = await customPost("applicationsettings/registration/fields", "POST", { fields, employeeid })
    const { status, message } = response
    if (status == "success") return toast.success(message, { autoClose: 500 })
    else toast.error(message, { autoClose: 2000 })
  }

  const handleChange = (ev, index, name) => {
    setFields((prev) => {
      const n = [...prev]
      n[index]["fields"][name] = ev.target.checked
      return n
    })
  }

  console.log(fields)

  return (
    <>
      <ToastContainer />
      <div className="mx-5">
        <div className="grid-30-30-30">
          {fields.map((single, index) => {
            return (
              <div key={index}>
                <h5 className="text-capitalize">{single.title}</h5>
                <span>
                  {Object.keys(single.fields).map((item, i) => {
                    return (
                      <div className="d-flex justify-content-between bg-white border-bottom p-1 br-5" key={i}>
                        <span className="text-capitalize mt-2 px-2 text-primary">{item}</span>
                        <span>
                          {" "}
                          <Form.Switch
                            type="switch"
                            name={item}
                            checked={fields[index]["fields"][item]}
                            onChange={(ev) => {
                              handleChange(ev, index, item)
                            }}
                            variant="primary"
                            style={{ fontSize: "25px" }}
                          />
                        </span>
                      </div>
                    )
                  })}
                </span>
              </div>
            )
          })}
        </div>
        <button className="btn btn-sm btn-success mt-3" onClick={handleSubmit}>
          save changes
        </button>
      </div>
    </>
  )
}
