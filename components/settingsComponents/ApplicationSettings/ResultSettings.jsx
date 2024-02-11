import { useEffect, useState } from "react"
import CustomFormSwitch from "./CustomFormSwitch"
import { customFetch, customPost } from "../../Auth/customFetch"
import { ToastContainer, toast } from "react-toastify"
export default function ApplicationResultSettings() {
  const defaultSetings = {
    literatureReview: 1,
    letterHeading: 1,
    passwordonResult: 1,
    DepartmentEntry: 1,
  }
  const [result, setResult] = useState(defaultSetings)
  const [isloading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    customFetch("applicationsetting/resultsettings")
      .then((data) => {
        setResult(data)
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
      })
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
