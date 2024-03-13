import { useEffect, useState } from "react"
import { customFetch } from "../Auth/customFetch"
import Loader from "../accessories/Loader"

export default function SamplingInformationResult({ billingid, testid }) {
  const [data, setData] = useState({})
  const [isloading, setLoading] = useState(true)
  const {
    inspectionTime,
    processing_date,
    collection_time,
    processing_time,
    ready_time,
    ascensionid,
    collection_date,
    ready_date,
    phelobotomist,
    urgency,
    samplingCenter,
  } = data

  useEffect(() => {
    if (billingid && testid) {
      customFetch(`phelobotomy/ascension/getsamplinginfo?billingid=${parseInt(billingid)}}&&testid=${parseInt(testid)}`)
        .then((data) => {
          setData(data)
          setLoading(false)
        })
        .catch((err) => {
          setData({})
          setLoading(false)
        })
    }
  }, [billingid, testid])

  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <section>
          <h6 className="result-section-header fw-bold">Sampling Information</h6>
          <div className="sampling-result">
            <div className="left-panel">
              <div className="result-sampling-details">
                <div className="left">ascensionid:</div>
                <div className="right">{ascensionid}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">collection:</div>
                <div className="right">
                  {collection_date} {collection_time}
                </div>
              </div>
              <div className="result-sampling-details">
                <div className="left">processing:</div>
                <div className="right">
                  {processing_date} {processing_time}
                </div>
              </div>
              <div className="result-sampling-details">
                <div className="left">result ready:</div>
                <div className="right">
                  {ready_date} {ready_time}
                </div>
              </div>
            </div>
            <div className="right-panel">
              <div className="result-sampling-details">
                <div className="left">sampling center:</div>
                <div className="right">{samplingCenter}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">urgency:</div>
                <div className="right">{urgency}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">Phelobotomist:</div>
                <div className="right">{phelobotomist != null ? phelobotomist : "N.A"}</div>
              </div>
              <div className="result-sampling-details">
                <div className="left">inspection Time:</div>
                <div className="right">{inspectionTime}</div>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  return <>{renderingView()}</>
}
