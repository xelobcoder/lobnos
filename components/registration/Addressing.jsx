import { regions } from "../Auth/customFetch"
import IsRenderInput from "./CustomInput"
import { useState } from "react"
export default function Addressing({ defaultData, fields }) {
  const [data, setData] = useState(defaultData)
  return (
    <>
      <div>
        <div className="form-row">
          <IsRenderInput
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
                    addressingInformation: { ...data, area: e.target.value },
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
                    addressingInformation: { ...data, region: e.target.value },
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
                    addressingInformation: { ...data, gpsLocation: e.target.value },
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
              <input
                type="text"
                className="custom-input"
                id="address"
                name="address"
                value={data.address}
                onChange={(e) => {
                  setData({ ...data, addressingInformation: { ...data, address: e.target.value } })
                }}
              />
            }
          />
        </div>
        <button className="mt-2 btn btn-primary  btn-sm">save changes</button>
      </div>
    </>
  )
}
