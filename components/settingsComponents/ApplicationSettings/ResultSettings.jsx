import { useEffect, useState } from "react"
import CustomFormSwitch from "../../accessories/CustomFormSwitch"
import {  customPost, defaultResultSettings, getResultSettings } from "../../Auth/customFetch"
import { ToastContainer, toast } from "react-toastify"
export default function ApplicationResultSettings() {

  const [result, setResult] = useState(defaultResultSettings)
  const [isloading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getResultSettings(setResult, setLoading);
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    customPost("applicationsetting/resultsettings", "PUT", { data: result })
      .then((data) => {
        const { status, message } = data
        if (status == "success") {
          toast.success(message, { autoClose: 500 })
        } else {
          toast.error(message, { autoClose: 500 })
        }
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        toast.error("something wrong occured", { autoClose: 500 })
      })
  }
  const update = (target, value) => {
    setResult({ ...result, [target]: value })
  }

  const rendering = () => {
    if (isloading) {
      return <h5>Loading settings please...........</h5>
    } else {
      return (
        <div>
          <div className="grid-30-30-30 mx-2">
            <CustomFormSwitch
              text="literature review text added in test setup would be included in the result printout."
              target="literatureReview"
              title="Literature Review"
              value={result.literatureReview}
              variant="number"
              update={update}
            />
            <CustomFormSwitch
              text="Include letter headings in the result print before dispatching result"
              title="Letter Heading"
              value={result.letterHeading}
              variant="number"
              update={update}
              target="letterHeading"
            />
            <CustomFormSwitch
              text="This determine whether lab scientist would need to enter password before result could be save or not"
              title="Password on Result Entry"
              value={result.passwordonResult}
              variant="number"
              target="passwordonResult"
              update={update}
            />
            <CustomFormSwitch
              value={result.DepartmentEntry}
              target="DepartmentEntry"
              update={update}
              variant="number"
              title="Result Entry"
              text="Ensure result entry is done according departments created. Toggle to activate it or view by patient"
            />
             <CustomFormSwitch
              value={result.samplingInformation}
              target="samplingInformation"
              update={update}
              variant="number"
              title="Sampling Information"
              text="This include sampking information in the final result print out. Toggle to activate or deactivate setting"
            />
          </div>
          <div>
            <button type="button" onClick={handleSubmit} className="btn btn-primary btn-sm mx-2 my-3">
              update result settings
            </button>
          </div>
        </div>
      )
    }
  }
  return (
    <div>
      <ToastContainer />
      {rendering()}
    </div>
  )
}
