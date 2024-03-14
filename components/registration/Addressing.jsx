import { getDataAndUpdateState, regions } from "../Auth/customFetch"
import IsRenderInput from "./CustomInput"
import { useEffect, useState } from "react"
import { submitFormData } from "../Auth/registerclient"
import Loader from "../accessories/Loader"
export default function Addressing({ defaultData, fields, patientid, expanded = true,toast }) {
  const [data, setData] = useState(defaultData)
  const [isloading, setLoading] = useState(true)

  useEffect(() => {
    if (patientid) {
      getDataAndUpdateState(setData, `register/addressingformation?patientid=${patientid}`, false, setLoading)
    }
  }, [patientid])

  const rendering = () => {
    if (isloading) return <Loader />
    else {
      return (
        <section>
          <div className={`${expanded === true ? "" : "grid-50 p-2"}`}>
            <div className="form-row">
              <IsRenderInput
                expanded={expanded}
                value={fields.area}
                displaylabel={true}
                label="Area"
                field={
                  <input
                    className="custom-input"
                    value={data.area}
                    onChange={(e) =>
                      setData({
                        ...data,
                        area: e.target.value,
                      })
                    }
                    placeholder="Area"
                    type="text"
                  />
                }
              />
            </div>
            <div className="form-row">
              <IsRenderInput
                expanded={expanded}
                value={fields.region}
                displaylabel={true}
                label="Region"
                field={
                  <select
                    className="custom-select"
                    value={data.region}
                    onChange={(e) =>
                      setData({
                        ...data,
                        region: e.target.value,
                      })
                    }>
                    <option>select region</option>
                    {regions.map((item, index) => {
                      return (
                        <option value={item} key={index}>
                          {item}
                        </option>
                      )
                    })}
                  </select>
                }
              />
            </div>
            <div className="form-row">
              <IsRenderInput
                expanded={expanded}
                value={fields.gpsLocation}
                displaylabel={true}
                label="GPS Location or Landmark"
                field={
                  <input
                    className="custom-input"
                    value={data.gpsLocation}
                    onChange={(e) =>
                      setData({
                        ...data,
                        gpsLocation: e.target.value,
                      })
                    }
                    placeholder="GPS Location"
                    type="text"
                  />
                }
              />
            </div>
            <div className="form-row">
              <IsRenderInput
                expanded={expanded}
                value={fields.address}
                displaylabel={true}
                label="Address"
                field={
                  <input
                    type="text"
                    className="custom-input"
                    id="address"
                    name="address"
                    value={data.address}
                    onChange={(e) => {
                      setData({ ...data, address: e.target.value })
                    }}
                  />
                }
              />
            </div>
          </div>
          <button
            onClick={(ev) => {
              submitFormData(`register/addressinginformation?patientid=${patientid}`, data,toast)
            }}
            className="mt-2 btn btn-primary  btn-sm mx-2">
            save changes
          </button>
        </section>
      )
    }
  }

  return <>{rendering()}</>
}
