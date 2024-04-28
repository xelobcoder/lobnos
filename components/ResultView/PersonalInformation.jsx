import { useState, useEffect } from "react";
import Loader from "../accessories/Loader";
import { customFetch } from "../Auth/customFetch";

export default function PersonalInformation({ patientid,billingid}) {
  const [data, setData] = useState({})
  const [isloading, setLoading] = useState(true)
  const { firstname, lastname, middlename, gender, age, ageType, clinician} = data

  useEffect(() => {
    if (patientid) {
      setLoading(true)
      customFetch(`register/personalinformation?patientid=${patientid}`)
        .then((data) => {
          setData(data?.result)
          setLoading(false)
        })
        .catch((err) => {
          setLoading(false)
          setData({})
        })
    }
  }, [patientid])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div>
          <h6 className="result-section-header fw-bold mt-2 mb-1">Personal Information</h6>
          <div className="grid-50 text-uppercase">
            <div className="left">
              <div className="result-sampling-details ">
                <div className="left">patient id: </div>
                <div className="right">{patientid}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">full name: </div>
                <div className="right">{firstname}{" "}{middlename} {" "}{lastname}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">gender: </div>
                <div className="right">{gender}</div>
              </div>
            </div>
            <div className="right">
              <div className="result-sampling-details">
                <div className="left">billing id: </div>
                <div className="right">{billingid}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">age: </div>
                <div className="right">{age} {ageType}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">referer: </div>
                <div className="right">{clinician}</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  return <>{renderingView()}</>
}
