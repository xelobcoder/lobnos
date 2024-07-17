import { useState, useEffect } from "react"
import {
  customPost,
  getDataAndUpdateState,
  handleChangeWithState,
} from "../../components/Auth/customFetch"
import Loader from "../accessories/Loader"
export default function BasicInformationClinician({ method, toast, editing, editid,reset,updateItem}) {
  const [OrganizationList, setOrganization] = useState([])
  const [isloading, setLoading] = useState(false)

  const defaultData = {
    id: editid,
    name: "",
    phone: "",
    email: "",
    organization: 0,
    location: "",
    address: "",
    occupation: "",
  }

  const [data, setData] = useState(defaultData)
  const getClientForEdit = (originaldata) => {
    setData(originaldata)
  }

  const setDefault = () => {
    setData(defaultData)
  }

  const handleSubmit = async () => {
    const handleResponse = function (response) {
      const { statusCode, status, message } = response
      if (statusCode == 200 && status == "success") {
        toast.success(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 })
        updateItem(data,3)
        setDefault();
      } else {
        toast.error(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 })
      }
    }
    const response = await customPost("clinicians", method, data)
    handleResponse(response);
    reset();
  }

  useEffect(() => {
    if (editing == true && editid) {
      setLoading(true)
      getDataAndUpdateState(setData, `clinicians/getclinician?id=${editid}`, true)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            getClientForEdit(data[0])
            setLoading(false)
          }
        })
        .catch((err) => {
          setLoading(false)
          console.log(err)
        })
    }
  }, [editid, editing])

  useEffect(() => {
    getDataAndUpdateState(setOrganization, "organization")
  }, [])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <form autoComplete="off">
          <div className="grid-50 grid">
            <div>
              <label htmlFor="name" className="form-label">
                Clinician Name
              </label>
              <input
                type="text"
                className="custom-input"
                id="name"
                placeholder="Enter Clinician Name"
                value={data.name}
                style={{ width: "100%" }}
                size="sm"
                onChange={(event) => handleChangeWithState(event, "name", setData, data)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                className="custom-input"
                id="phone"
                placeholder="Enter Phone Number"
                value={data.phone}
                onChange={(event) => handleChangeWithState(event, "phone", setData, data)}
                maxLength={10}
                minLength={10}
                style={{ width: "100%" }}
                size="sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="custom-input"
                id="email"
                placeholder="Enter Email"
                style={{ width: "100%" }}
                size="sm"
                value={data.email}
                onChange={(event) => handleChangeWithState(event, "email", setData, data)}
              />
            </div>
            <div>
              <label htmlFor="organization" className="form-label">
                Organization
              </label>
              <select
                className="custom-select"
                id="organization"
                style={{ width: "100%" }}
                onChange={(event) => {
                  if (Array.isArray(OrganizationList) && OrganizationList.length > 0) {
                    setData({ ...data, organization: event.target.value })
                  }
                }}>
                <option value="">Organization</option>
                {OrganizationList.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="form-label">
                Location
              </label>
              <input
                type="text"
                className="custom-input"
                id="location"
                onChange={(event) => handleChangeWithState(event, "location", setData, data)}
                placeholder="Enter Location"
                style={{ width: "100%" }}
                size="sm"
                value={data.location}
              />
            </div>
            <div>
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <input
                type="text"
                className="custom-input"
                id="address"
                placeholder="Enter Address"
                value={data.address}
                onChange={(event) => handleChangeWithState(event, "address", setData, data)}
                style={{ width: "100%" }}
                size="sm"
              />
            </div>
            <div>
              <label htmlFor="occupation" className="form-label">
                Occupation
              </label>
              <select
                className="custom-select"
                id="occupation"
                style={{ width: "100%" }}
                value={data.occupation}
                onChange={(event) => handleChangeWithState(event, "occupation", setData, data)}
                size="sm">
                <option value="">Select occupation</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="therapist">Therapist</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-sm mt-2" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      )
    }
  }

  return <>{renderingView()}</>
}
