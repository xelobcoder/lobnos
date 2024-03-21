import React, { useCallback, useEffect, useState } from 'react';
import { regions, organizationDefaultBasicInfo, validateFormData, handleResponse, customFetch, getDataAndUpdateState, customPost } from '../Auth/customFetch';
import { useRouter } from 'next/router';
import Loader from "../accessories/Loader"

export default function OrganizationBasic({ titleshow = true }) {
  const [data, setData] = useState(organizationDefaultBasicInfo)
  const [message, setMessage] = useState("Add new organization")
  const router = useRouter()
  const organizationid = router.query.id
  const [isloading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setData({ ...data, [name]: value })
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!organizationid) {
      await validateFormData(data, false, ["name", "location", "street", "address", "region"], "new/organizations", handleResponse)
    } else {
      const updateInfo = await customPost("organization/update/basic", "PUT", data)
      alert(updateInfo?.message)
    }
  }

  const getOrganizationData = useCallback(() => {
    setLoading(true)
    customFetch(`organization/basic?id=${organizationid}`)
      .then((response) => {
        const { statusCode, status, result } = response
        statusCode === 200 && status == "success" && setData(result[0])
        setLoading(false)
      })
      .catch((err) => {
        setData(organizationDefaultBasicInfo)
        alert("error getting data;")
        setLoading(false)
      })
  }, [organizationid])

  useEffect(() => {
    if (organizationid) {
      setMessage("update organization basic information")
      getOrganizationData()
    }
  }, [organizationid, getOrganizationData])

  const renderingFormView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <form className="bg-white  grid-50">
          <div className="form-row">
            <label>organization name</label>
            <input
              className="custom-input"
              type="text"
              placeholder="organization name"
              name="name"
              value={data.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>location</label>
            <input
              className="custom-input"
              type="text"
              placeholder="location"
              name="location"
              value={data.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>street name</label>
            <input
              className="custom-input"
              type="text"
              placeholder="street name"
              name="street"
              value={data.street}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>mobile number</label>
            <input
              className="custom-input"
              type="tel"
              inputMode="tel"
              placeholder="0595964565"
              maxLength={10}
              minLength={10}
              name="mobile"
              value={data.mobile}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>address</label>
            <input
              className="custom-input"
              type="text"
              placeholder="kalpohin lowcost 30A"
              name="address"
              value={data.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Email address</label>
            <input
              className="custom-input"
              type="email"
              placeholder="mylab@ymail.com"
              name="email"
              value={data.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>website</label>
            <input
              className="custom-input"
              type="text"
              placeholder="mylab.com"
              name="website"
              value={data.website}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>Gps Address</label>
            <input
              className="custom-input"
              type="text"
              placeholder="NS-1004-383"
              name="gpsmapping"
              value={data.gpsmapping}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label>region</label>
            <select className="custom-input" name="region" value={data.region} onChange={handleChange}>
              <option>select a region</option>
              {regions.map((item, index) => {
                return (
                  <option key={index} value={item}>
                    {item}
                  </option>
                )
              })}
            </select>
          </div>
        </form>
      )
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header d-flex justify-content-between text-capitalize bg-secondary text-white">
          <h5>{message}</h5>
          <div>
            <button
              onClick={(ev) => {
                router.push(`/organization`)
              }}
              className="btn btn-dark btn-sm">
              organization list
            </button>
            {organizationid && (
              <>
                <button
                  disabled={!organizationid}
                  className="btn btn  btn-warning  btn-sm mx-1 "
                  onClick={(ev) => {
                    router.push(`/organization/${organizationid}/contactperson`)
                  }}>
                  contact person
                </button>
                <button
                  disabled={!organizationid}
                  className="btn btn  btn-warning  btn-sm mx-1 "
                  onClick={(ev) => {
                    router.push(`/organization/${organizationid}/payment`)
                  }}>
                  payment modules
                </button>
              </>
            )}
          </div>
        </div>
        <div className="card-body">
          {renderingFormView()}
          <button type="button" className="mt-3 btn btn-primary btn-sm" onClick={handleSubmit}>
            save organization
          </button>
        </div>
      </div>
    </>
  )
}
