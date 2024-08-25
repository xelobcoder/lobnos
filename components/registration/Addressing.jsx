import { getDataAndUpdateState, regions } from "../Auth/customFetch"
import IsRenderInput from "./CustomInput"
import { useState, useEffect } from "react"
import { submitFormData } from "../Auth/registerclient"


export default function Addressing({ defaultData, fields, patientid,toast }) {
  const [data, setData] = useState(defaultData)
  const [isloading, setLoading] = useState(false)



  const clearForm = () => {
    setData(defaultData);
  };

  useEffect(() => {
    if (patientid) {
      getDataAndUpdateState(setData, `register/addressingformation?patientid=${patientid}`, false, setLoading)
    } else {
      clearForm()
    }
  }, [patientid])


  return <>
    <section className="col-6">
      {isloading && <div>Loading data.........................</div>}
      <div>
        <div className="form-row">
          <IsRenderInput
            value={fields.region}
            displaylabel={true}
            label="Region"
            field={
              <select
                disabled={isloading}
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
            value={fields.region}
            displaylabel={true}
            label="district"
            field={
              <select
                disabled={isloading}
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
            value={fields.area}
            displaylabel={true}
            label="Area"
            field={
              <input
                disabled={isloading}
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
            value={fields.gpsLocation}
            displaylabel={true}
            label="GPS Location or Landmark"
            field={
              <input
                disabled={isloading}
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
            value={fields.address}
            displaylabel={true}
            label="Address"
            field={
              <textarea
                disabled={isloading}
                id="address"
                className="form-control"
                name="address"
                rows={5}
                value={data.address}
                onChange={(e) => {
                  setData({ ...data, address: e.target.value })
                }}
              ></textarea>
            }
          />
        </div>
      </div>
      <button
        onClick={(ev) => {
          submitFormData(`register/addressinginformation?patientid=${patientid}`, data, toast)
        }}
        className="btn mt-3 btn-success btn-sm text-capitalize">
        save current progress
      </button>
    </section>

  </>
}
