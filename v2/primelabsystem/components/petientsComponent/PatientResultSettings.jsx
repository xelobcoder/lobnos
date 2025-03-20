import { useState } from "react"
import { customPost, handleChangeWithState } from "../Auth/customFetch"
import { useSearchParams } from "next/navigation"

export default function PatientResultSettings({ toast }) {
  const [settings, setSettings] = useState({ mode: "", method: "", notify: "" })
  const [error, setError] = useState("")
  const patientid = useSearchParams().get("patientid")

  const submitResponse = async function () {
    try {
      const response = await customPost(`patients/notifications`, "PUT", { ...settings, patientid })
      const { statusCode, status, message } = response
      if (statusCode == 404) {
        toast ? toast.error(message, { autoClose: 1000 }) : setError(message)
      } else {
        toast ? toast.success(message, { autoClose: 500 }) : alert(message)
        setError("")
      }
    } catch (err) {
      toast.error("something wrong occured")
    }
  }

  return (
    <>
      {error != "" && (
        <div className="mt-3">
          <span className="bg-danger p-2 text-white rounded">{error}</span>
        </div>
      )}
      <form method="POST">
        <div className="form-row">
          <label>mode of receiving result</label>
          <select
            className="form-control"
            onChange={(ev) => {
              handleChangeWithState(ev, "mode", setSettings, settings)
            }}>
            <option>select mode</option>
            <option value="hardcopy">hard copy </option>
            <option value="WhatApp">whatApp</option>
            <option value="Email">Email</option>
          </select>
        </div>
        <div className="form-row">
          <label>receive notification when result is ready</label>
          <br />
          <input
            id="notification"
            name="notification"
            type="radio"
            value="yes"
            onChange={(ev) => {
              handleChangeWithState(ev, "notify", setSettings, settings)
            }}
          />{" "}
          Yes <br />
          <input
            id="notoification"
            name="notification"
            type="radio"
            value="no"
            onChange={(ev) => {
              handleChangeWithState(ev, "notify", setSettings, settings)
            }}
          />{" "}
          No
        </div>
        <div className="form-row">
          <label>method of Notification</label>
          <select
            className="form-control"
            onChange={(ev) => {
              handleChangeWithState(ev, "method", setSettings, settings)
            }}>
            <option>select method</option>
            <option value="email">email</option>
            <option value="sms">sms</option>
            <option value={"whataspp"}>WhatApp</option>
          </select>
        </div>
        <div className="form-row">
          <button
            type="button"
            onClick={(ev) => {
              submitResponse()
            }}
            className="btn btn-primary mt-3">
            update settings
          </button>
        </div>
      </form>
    </>
  )
}
