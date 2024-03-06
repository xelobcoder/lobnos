import { useState, useEffect } from "react"
import { customFetch, customPost } from "../../Auth/customFetch"
import { defaultApplicationSettings, getApplicationSettings } from "../../Auth/customFetch"
import CustomFormSwitch from "../../accessories/CustomFormSwitch"
export default function ApplicationSettingsComponent() {
  const [ApplicationSettings, setApplicationSettings] = useState(defaultApplicationSettings)
  const [branches, setBranch] = useState([])
  const [defaultBranch, setDefaultBranch] = useState("")

  // get list of all branches, set it in localstorage as default branch for the device
  const getData = async function (endpoint, storage) {
    const getResponse = await customFetch(endpoint)
    const { status, statusCode, result } = getResponse
    if (statusCode == 200 && status == "success") {
      storage(result)
    }
  }

  //   useEffect(() => {
  //     getData("branches", setBranch)
  //     setDefaultBranch(localStorage.getItem("deviceDefaultBranch"))
  //   }, [])

  //   const makeDefaultBranch = async function (e) {
  //     // note, the default branch is only limited to the p.c and hence not at the application level of the backend
  //     // the data would be sent with what is on the localstorage.
  //     const branchid = e.target.value
  //     const selected = branches.filter((e, i) => {
  //       return branchid == e.branchid
  //     })
  //     if (selected.length > 0) {
  //       const isActive = selected[0]["ACTIVATION"] == 0 ? true : false
  //       if (isActive) {
  //         alert("Activate branch in the branches page to continue")
  //       } else {
  //         localStorage.setItem("deviceDefaultBranch", `${selected[0]["name"]}-${selected[0]["branchid"]}`)
  //       }
  //     }
  //   }

  const get_our_data = async function () {
    const data = await getApplicationSettings()
    setApplicationSettings(data)
  }

  useEffect(() => {
    get_our_data()
  }, [])

  console.log(ApplicationSettings)

  const handleAppSettingsActivation = async function (target, value) {
    setApplicationSettings({ ...ApplicationSettings, [target]: value })
  }

  const updateSettings = async function (e) {
    let isError = 0

    for (const [key, value] of Object.entries(ApplicationSettings)) {
      if (value === "") {
        isError++
      }
    }

    if (isError == 0) {
      const pushSettings = await customPost("applicationsettings", "POST", ApplicationSettings)
      const { statusCode, status, message } = pushSettings
      if (statusCode == 200 && status == "success") {
        alert(message)
        get_our_data()
        setDefaultBranch(localStorage.getItem("deviceDefaultBranch"))
      }
    }
  }

  return (
    <div className="mx-2 rounded">
      <div className="grid-30-30-30">
        <CustomFormSwitch
          target="bulkregistration"
          variant="number"
          value={ApplicationSettings.bulkregistration == 1 ? true : false}
          update={handleAppSettingsActivation}
          title="Registration"
          text="Detail registration including the address of the client,personal information"
        />
        <CustomFormSwitch
          value={ApplicationSettings.DeactivateBilling24hrs == 1 ? true : false}
          target="DeactivateBilling24hrs"
          update={handleAppSettingsActivation}
          variant="number"
          title="Deactivation"
          text="Automatic deactivation of client after 24 hours of registration"
        />
        <CustomFormSwitch
          title="Billing"
          variant="number"
          value={ApplicationSettings.PaidBillsBeforeTransaction == 1 ? true : false}
          update={handleAppSettingsActivation}
          target="PaidBillsBeforeTransaction"
          text="Clear all bills before a new billing transaction can be initiated, meaning all bills needed to be cleared.Full payment must be made outright during registration before a transaction can be finalized"
        />
        <CustomFormSwitch
          title="Flow"
          value={ApplicationSettings.completeFlow == 1 ? true : false}
          target={"completeFlow"}
          update={handleAppSettingsActivation}
          variant="number"
          text="Complete laboratory flow from the registration following the full lifecycle of sampling and result processing.Read more at the instruction page"
        />
        <CustomFormSwitch
          update={handleAppSettingsActivation}
          value={ApplicationSettings.approvalbeforeprinting == 1 ? true : false}
          target={"approvalbeforeprinting"}
          title="Approval"
          variant="number"
          text="Result would need to be approved by quality manager or manager before printing or dispatching result could be done."
        />
        <CustomFormSwitch
          update={handleAppSettingsActivation}
          value={ApplicationSettings.emailNotification == 1 ? true : false}
          target={"emailNotification"}
          title="Email Notification"
          variant="number"
          text="Activate email notification for the application.Customize further at the email side"
        />
         <CustomFormSwitch
          update={handleAppSettingsActivation}
          value={ApplicationSettings.includeTax == 1 ? true : false}
          target={"includeTax"}
          title="Include Taxes in Billing"
          variant="number"
          text="Activated Taxes would be include the billing of clients"
        />
      </div>

      <div>
        <button
          className="btn btn-primary btn-sm mt-3"
          onClick={(e) => {
            updateSettings(e)
          }}>
          update settings
        </button>
      </div>
    </div>
  )
}
