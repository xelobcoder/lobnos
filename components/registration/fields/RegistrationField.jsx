import { useEffect, useState } from "react"
import { getRegistrationFields } from "./Util"
import { customPost } from "../../Auth/customFetch"
import { ToastContainer, toast } from "react-toastify"
import Loader from "../../accessories/Loader"
import SingleFieldList from "./SingleField"

export default function RegistrationFieldsView({ employeeid }) {
  const [fields, setFields] = useState([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      await getRegistrationFields(setFields, toast)
      setLoading(false)
    }
    loadData()
  }, [])

  const renderingView = () => {
    if (isLoading) return <Loader />
    else {
      return (
        <div className="mx-5">
          <h4>1.Registration Form Fields</h4>
          <div className="grid-30-30-30 border  br-5 p-2">
            {fields.map((single, index) => {
              const _fields = Object.keys(single.fields)
              return (
                <div key={index}>
                  <h6 className="text-capitalize">{single.title}</h6>
                  <SingleFieldList fields={fields} index={index} _fields={_fields} handleChange={handleChange} />
                </div>
              )
            })}
          </div>
          <button className="btn btn-sm btn-success mt-3" onClick={handleSubmit}>
            save changes
          </button>
        </div>
      )
    }
  }

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

  return (
    <>
      <ToastContainer />
      {renderingView()}
    </>
  )
}
