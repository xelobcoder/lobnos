import { useState } from "react"
import { useCallback } from "react"
import { customFetch, customPost } from "../Auth/customFetch"
import { useEffect } from "react"
import Loader from "../accessories/Loader"
import { useRouter } from "next/router"

export default function ContactPerson() {
  const router = useRouter();
  const organizationid = router.query.id
  const defaultData = { name: "", email: "", mobile: "" }
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)

  const contactDetails = useCallback(async () => {
    try {
      if (organizationid) {
        setLoading(true)
        const response = await customFetch(`organization/contactperson?id=${organizationid}`)
        const { status, statusCode, result } = response
        if (statusCode == 200 && status == "success" && result.length > 0) {
          setData(result[0])
        }
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
    }
  }, [organizationid])

  const handleChange = (event, target) => {
    const { value } = event.target
    setData({ ...data, [target]: value })
  }

  useEffect(() => {
    contactDetails()
  }, [organizationid, contactDetails])

  const handleSubmit = async function () {
    let postResponse = await customPost(`organization/update/contact`, "PUT", data)
    const { statusCode, status, message } = postResponse
    ;(statusCode === 200) & (status == "success") && alert(message)
  }

  const renderingContact = () => {
    if (loading) return <Loader />
    else {
      return (
        <div className="card">
          <div className="card-header d-flex justify-content-between bg-secondary text-white text-capitalize">
            <h4>update contact person</h4>
            <div>
              {organizationid && (
                <>
                  <button
                    disabled={!organizationid}
                    className="btn btn  btn-warning  btn-sm mx-1 "
                    onClick={(ev) => {
                      router.push(`/organization/${organizationid}/basicinfo`)
                    }}>
                    basic information
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
            <form>
              <div className="grid grid-50">
                <div className="form-row">
                  <label>contact person</label>
                  <input className="form-control" value={data.name} onChange={(event) => handleChange(event, "name")} />
                </div>
                <div className="form-row">
                  <label>email </label>
                  <input
                    label="Contact Person Email"
                    className="form-control"
                    value={data.email}
                    onChange={(event) => handleChange(event, "email")}
                  />
                </div>
                <div>
                  <label>mobile number</label>
                  <input
                    label="Contact Phone Number"
                    className="form-control"
                    value={data.mobile}
                    onChange={(event) => handleChange(event, "mobile")}
                  />
                </div>
                <div className="form-row mt-3">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm mt-2"
                    onClick={(ev) => {
                      handleSubmit()
                    }}>
                    save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )
    }
  }
  return <section>{renderingContact()}</section>
}
