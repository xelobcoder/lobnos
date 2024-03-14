import { useState } from "react"
import PatientCredentialsUpdate from "../../petientsComponent/PatientCredentialsUpdate"
import { customPost } from "../../Auth/customFetch"
export default function PatientCredentialsInformation({ patientid, toast }) {
  const [credentials, setCredentials] = useState({
    username: parseInt(patientid),
    npassword: "",
    nppassword: "",
    opassword: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = function () {
    let errorCount = 0
    const { nppassword, npassword } = credentials
    if (nppassword !== npassword) {
      setError("New Password mismatch")
      errorCount++
    }

    if (Object.values(credentials).includes("")) {
      setError("All fields are required")
      errorCount++
    }

    if (errorCount == 0) {
      setError("")
      customPost("patients/updatecredentials", "POST", credentials)
        .then((response) => {
          const { statusCode, status, message } = response
          if (statusCode == 404) {
            toast.error(message, { autoClose: 500 })
          }
        })
        .catch((err) => console.log(err))
    }
  }
  return (
    <>
      <h5> Add credentials</h5>
      <PatientCredentialsUpdate data={credentials} setData={setCredentials} />
      <div>
        <button
          type="button"
          onClick={(ev) => {
            handleSubmit()
          }}
          className="mt-3 btn btn-primary">
          update credentials
        </button>
      </div>
    </>
  )
}
