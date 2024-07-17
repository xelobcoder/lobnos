import { useState, useEffect } from "react"
import { customFetch, customPost, emailPreference, handleResponse } from "../../../components/Auth/customFetch"
import Loader from "../../../components/accessories/Loader"
import CustomFormSwitch from "../../accessories/CustomFormSwitch"
import { Form } from "react-bootstrap"
import { ToastContainer, toast } from "react-toastify"
export default function ApplicationEmailPreference() {
  const [preference, setPreference] = useState(emailPreference)
  const [loading, setLoading] = useState(true)
  const [activateAll, setActivateall] = useState(false)

  const handleSubmit = async (ev) => {
    const pushPreference = await customPost("applicationssettings/emailpreference", "POST", preference)
    handleResponse(pushPreference, toast)
  }

  async function getPreference() {
    try {
      setLoading(true)
      const response = await customFetch("applicationssettings/emailpreference")
      const { statusCode, status, message, result } = response
      if (statusCode === 200 && status === "success" && result) {
        if (Object.keys(result).length > 0) {
          setPreference(result)
        } else {
          setPreference(emailPreference)
        }
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
      toast.error("something wrong occured,defaulting to default settings")
    }
  }

  const handleChangeWithState = (key, value) => {
    setPreference({ ...preference, [key]: value })
  }

  const bulkActiva = (value) => {
    if (Object.keys(preference).length === 0) return
    const newdata = { ...preference }
    for (const [key, values] of Object.entries(preference)) {
      newdata[key] = value === true ? "Yes" : "No"
    }
    setActivateall(value)
    setPreference(newdata)
  }

  useEffect(() => {
    getPreference()
  }, [])

  const renderer = () => {
    if (loading) return <Loader />
    else {
       const keys = Object.keys(preference)
       return (
         <div className="grid-30-30-30">
           {keys.map((item, index) => {
             return (
               <CustomFormSwitch
                 key={index + 1}
                 title={item}
                 target={item}
                 variant="string"
                 value={preference[item]}
                 update={handleChangeWithState}
                 text={`Send an email notification when ${item} event occurs.This would be triggered automatically when it is activated.`}
               />
             )
           })}
         </div>
       )
    }
  }

  return (
    <main className="mx-2">
      <ToastContainer />
      <div className="d-flex">
        <Form.Check
          onChange={(ev) => {
            bulkActiva(ev.target.checked)
          }}
          type="switch"
          style={{ fontSize: "25px" }}
        />
        <div className="text-capitalize mt-2">{activateAll === false ? "activate all settings" : "Deactivate all settings"}</div>
      </div>
      <div className="alert alert-info mt-2">
        Send email notification when the following events occur. Toggle to activate or deactivate.
      </div>
      {renderer()}
      <button type="button" className="btn btn-primary mt-5 btn-sm mx-1" onClick={handleSubmit}>
        update preference
      </button>
    </main>
  )
}
