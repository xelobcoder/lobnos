import { getDataAndUpdateState } from "../Auth/customFetch"
import IsRenderInput from "./CustomInput"
import { submitFormData } from "../Auth/registerclient"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
export default function EmmergencyContactInformation({ defaultData, fields,expanded = true, toast }) {
  const [data, setData] = useState(defaultData)
  const [isloading, setLoading] = useState(true)
  const patientid = useSearchParams().get("patientid");


  const clearForm = () => {
    setData(defaultData);
  };
  
  useEffect(() => {
    if (patientid) {
      getDataAndUpdateState(setData, `register/emmergencycontactinformation?patientid=${patientid}`, false, setLoading)
    } else {
      clearForm();
    }
  }, [patientid])

  return (
    <>
      <div className="col-6">
        <div className="form-row">
          <IsRenderInput
            value={fields.emmergencyContactName}
            label={"Emergency Contact Name"}
            field={
              <input
                type="text"
                className="custom-input"
                id="emergencyName"
                name="emergencyName"
                value={data.emmergencyContactName}
                onChange={(e) =>
                  setData({
                    ...data,
                    emmergencyContactName: e.target.value,
                  })
                }
              />
            }
          />
        </div>
        <div className="form-row">
          <IsRenderInput
            value={fields.relationship}
            label={"Relationship"}
            field={
              <select
                className="custom-select"
                id="relationship"
                name="relationship"
                value={data.relationship}
                onChange={(e) =>
                  setData({
                    ...data,
                    relationship: e.target.value,
                  })
                }>
                <option value="">Select Relationship</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Spouse">Spouse</option>
                <option value="Friend">Friend</option>
              </select>
            }
          />
        </div>
        <div className="form-row">
          <IsRenderInput
            value={fields.emmergencyContactNumber}
            label={"Emergency Contact Number"}
            field={
              <input
                type="tel"
                inputMode="tel"
                className="custom-input"
                minLength={10}
                maxLength={10}
                id="emergencyContactNumber"
                name="emergencyContactNumber"
                value={data.emmergencyContactNumber}
                onChange={(e) =>
                  setData({
                    ...data,
                    emmergencyContactNumber: e.target.value,
                  })
                }
              />
            }
          />
        </div>
        <div className="form-row">
          <IsRenderInput
            value={fields.address}
            label={"Address"}
            field={
              <input
                type="text"
                className="custom-input"
                id="address"
                name="address"
                value={data.address}
                onChange={(e) =>
                  setData({
                    ...data,
                    address: e.target.value,
                  })
                }
              />
            }
          />
        </div>
        <div className="form-row">
          <IsRenderInput
            value={fields.occupation}
            label={"Occupation"}
            field={
              <input
                type="text"
                className="custom-input"
                id="occupation"
                name="occupation"
                value={data.occupation}
                onChange={(e) =>
                  setData({
                    ...data,
                    occupation: e.target.value,
                  })
                }
              />
            }
          />
        </div>
        <button
          onClick={(ev) => {
            submitFormData(`register/emmergencycontactinformation?patientid=${patientid}`, data, toast)
          }}
          className="btn mt-3 btn-success btn-sm text-capitalize">
          save current progress
        </button>
      </div>
    </>
  )
}
