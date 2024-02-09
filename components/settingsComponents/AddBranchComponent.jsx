import React, { useState, useEffect } from 'react'
import { customPost, getInstitutionUsers, handleChangeWithState } from '../Auth/customFetch'

export default function AddBranchComponent({ update, isEdit = false, editdata = {}, resetform }) {
  const defaultBranchData = { name: "", managerid: "", email: "", contact: "", address: "" }
  const [employees, setEmployees] = useState([])
  const [data, setData] = useState(defaultBranchData)
  // get emeployess
  useEffect(() => {
    getInstitutionUsers(setEmployees)
  }, [])

  const handleSubmit = async function () {
    let response = await customPost("branches", isEdit ? "PUT" : "POST", data)
    const { status, message } = response
    if (status == "success") {
      update(data, message, status, isEdit)
    } else {
      update(null, message, status, isEdit)
    }
  }

  useEffect(() => {
    if (isEdit && Object.keys(editdata).length > 0) setData(editdata)
  }, [isEdit, editdata])

  return (
    <form className="grid-50">
      <div className="form-row">
        <label className="text-primary">branch name</label>
        <input
          type="text"
          onChange={(ev) => handleChangeWithState(ev, "name", setData, data)}
          value={data?.name}
          className="custom-input"
          required
          placeholder="eg. Buipe Branch"
        />
      </div>

      {/* tel */}
      <div className="form-row">
        <label className="text-primary">contact</label>
        <input
          multiple
          type="tel"
          onChange={(ev) => handleChangeWithState(ev, "contact", setData, data)}
          value={data?.contact}
          className="custom-input"
          required
          placeholder="eg.02400000000"
          maxLength={10}
          minLength={10}
        />
      </div>

      <div className="form-row">
        <label className="text-primary">Email</label>
        <input
          type="email"
          onChange={(ev) => handleChangeWithState(ev, "email", setData, data)}
          className="custom-input"
          value={data?.email}
          required
          placeholder="eg.tiifuofficial@gmail.com"
        />
      </div>

      <div className="form-row">
        <label className="text-primary">Branch Manager</label>
        <select className="custom-input" onChange={(ev) => handleChangeWithState(ev, "managerid", setData, data)} value={data?.managerid}>
          <option>select Branch Manager</option>
          {employees.map((item, index) => {
            return (
              <option key={index} value={item?.employeeid}>
                {item?.username}
              </option>
            )
          })}
        </select>
      </div>
      {/* address */}
      <div className="form-row">
        <label className="text-primary">Address</label>
        <input
          rows={5}
          className="custom-input"
          onChange={(ev) => handleChangeWithState(ev, "address", setData, data)}
          value={data?.address}
          placeholder="eg. Tamale Kalpohin Lowcost 30A opposite Jolly Friends Bar"
        />
      </div>
      <div className="form-row mt-3">
        <button type="button" className="btn btn-primary btn-sm mt-1" onClick={(ev) => handleSubmit(ev)}>
          save information{" "}
        </button>
        {isEdit === true && (
          <button
            type="button"
            onClick={(ev) => {
              setData(defaultBranchData)
              resetform()
            }}
            className="btn btn-danger btn-sm mt-1 mx-2">
            stop editing
          </button>
        )}
      </div>
    </form>
  )
}
