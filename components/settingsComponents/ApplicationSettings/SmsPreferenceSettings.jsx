import { useState, useEffect } from "react"
import { customFetch, customPost, handleResponse, defaultSmsSettings } from "../../Auth/customFetch"
import Loader from "../../accessories/Loader"
import CustomFormSwitch from "./CustomFormSwitch"
import { ToastContainer, toast } from "react-toastify"
export default function SMS_SETTINGS() {
  const [data, setData] = useState({})
  const [isLoading, setLoading] = useState(true)

  const handleSubmit = async function () {
    const push = await customPost("applicationsettings/smsupdate", "PUT", data)
    handleResponse(push, toast)
  }
  const keys = Object.keys(data)

  const update = (target, value) => {
    setData({ ...data, [target]: value })
  }

  const renderer = () => {
    if (isLoading) return <Loader />
    else {
      if (keys.length === 0) return <h1>NULL</h1>
      else {
        return (
          <div>
            <div className="grid-30-30-30 mx-2">
              {keys.map((item, index) => {
                return (
                  <CustomFormSwitch
                    text={`A sms message will be sent if a ${item} event occurs.`}
                    title={item}
                    key={index + 1}
                    target={item}
                    variant="string"
                    value={data[item]}
                    update={update}
                  />
                )
              })}
            </div>
            <div className="mt-3 mx-2">
              <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
                save preference
              </button>
            </div>
          </div>
        )
      }
    }
  }
  const sms = async function () {
    try {
      setLoading(true)
      const data = await customFetch(`applicationsettings/smsupdate`)
      setData(data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setData(defaultSmsSettings)
    }
  }

  useEffect(() => {
    sms()
  }, [])

  return (
    <div>
      <ToastContainer />
      {renderer()}
    </div>
  )
}
