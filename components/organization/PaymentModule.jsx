import { useState, useEffect, useCallback } from "react"
import { customFetch, customPost, handleChangeWithState, organizationPaymentDefault } from "../Auth/customFetch"
import { useRouter } from "next/router"
import Loader from "../accessories/Loader"
import { ToastContainer, toast } from "react-toastify"

export default function PaymentModule() {
  const [data, setData] = useState(organizationPaymentDefault)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const organizationid = router.query.id

  const getPaymentData = useCallback(async (organizationid) => {
    if (organizationid) {
      const response = await customFetch(`organization/payment?id=${organizationid}`)
      const { statusCode, status, result } = response
      if (statusCode === 200 && status == "success" && result.length > 0) {
        setData(result[0])
      }
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (organizationid) {
      getPaymentData(organizationid)
    }
  }, [organizationid, getPaymentData])

  const handleSubmit = async () => {
    let pushResponse = await customPost(`organization/update/payment`, "PUT", { organizationid, ...data })
    const { status, statusCode, message } = pushResponse
    if (status == "success" && statusCode == 200) {
      toast.success(message, { autoClose: 500,position:'top-center' })
    } else {
      toast.error(message, { autoClose: 3000,position:'top-center' })
    }
  }

  const renderingPayment = () => {
    if (loading) return <Loader />
    else {
      return (
        <section>
          <div className="card">
            <div className="card-header bg-secondary text-white text-capitalize d-flex justify-content-between">
              <h4>Update Payment information</h4>
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
                        router.push(`/organization/${organizationid}/contactperson`)
                      }}>
                      contact person
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="card-body">
              <form className="grid grid-50 ">
                <div className="form-row">
                  <label>payment method</label>
                  <select
                    className="custom-input"
                    value={data.module}
                    onChange={(event) => handleChangeWithState(event, "module", setData, data)}>
                    <option>select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank transfer</option>
                    <option value="momo">Mobile Money</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>
                    commission <span className="label-helper">in percentage(eg.10%)</span>
                  </label>
                  <input
                    className="custom-input"
                    type="number"
                    value={data.commission}
                    onChange={(event) => handleChangeWithState(event, "commission", setData, data)}
                  />
                </div>
                {data.module == "momo" && (
                  <>
                    <div className="form-row">
                      <label>momo account number</label>
                      <input
                        className="custom-input"
                        value={data.momo}
                        type="tel"
                        minLength={10}
                        maxLength={10}
                        required
                        inputMode="tel"
                        onChange={(event) => handleChangeWithState(event, "momo", setData, data)}
                      />
                    </div>
                    <div className="form-row">
                      <label>momo account Name</label>
                      <input
                        className="custom-input"
                        value={data.momoname}
                        type="text"
                        required
                        inputMode="text"
                        onChange={(event) => handleChangeWithState(event, "momoname", setData, data)}
                      />
                    </div>
                  </>
                )}
                {data.module == "bank" && (
                  <>
                    <div className="form-row">
                      <label>account number</label>
                      <input
                        type="number"
                        className="custom-input"
                        value={data.account}
                        onChange={(event) => handleChangeWithState(event, "account", setData, data)}
                      />
                    </div>
                    <div className="form-row">
                      <label>Bank name</label>
                      <input
                        className="custom-input"
                        value={data.bankname}
                        onChange={(event) => handleChangeWithState(event, "bankname", setData, data)}
                        type="text"
                      />
                    </div>
                    <div className="form-row">
                      <label>branch </label>
                      <input
                        type="text"
                        className="custom-input"
                        value={data.branch}
                        onChange={(event) => handleChangeWithState(event, "branch", setData, data)}
                      />
                    </div>
                    <div className="form-row">
                      <label>account name</label>
                      <input
                        type="text"
                        className="custom-input"
                        value={data.accountname}
                        onChange={(event) => handleChangeWithState(event, "accountname", setData, data)}
                      />
                    </div>
                  </>
                )}
              </form>
              <button type="button" className="btn btn-primary btn-sm mt-3 " onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </section>
      )
    }
  }

  return (
    <div>
      <ToastContainer  theme="colored"/>
      {renderingPayment()}
    </div>
  )
}
