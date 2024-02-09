import { useState, useEffect } from "react"
import { Table } from "react-bootstrap"
import { customFetch, customPost } from "../../Auth/customFetch"
import { defaultApplicationSettings, getApplicationSettings } from "../../Auth/customFetch"
import CustomFormSwitch from "./CustomFormSwitch"
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

  console.log(ApplicationSettings)
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
          text="Clear all bills before a new billing transaction can be initiated, meaning all bills needed to be cleared."
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
      </div>
      <Table>
        <tbody>
          <tr>
            <td className="text-capitalize">Detail registration</td>
            <td>{ApplicationSettings?.bulkregistration == 0 ? "deactivated" : "Activated"}</td>
            <td>
              <button
                className={ApplicationSettings?.bulkregistration == 0 ? "btn btn-success btn-sm p-1" : "btn btn-danger btn-sm p-1"}
                onClick={(e) => {
                  handleAppSettingsActivation("bulkregistration", ApplicationSettings?.bulkregistration == 0 ? 1 : 0)
                }}>
                {ApplicationSettings?.bulkregistration == 0 ? "activate" : "deactivate"}
              </button>
            </td>
          </tr>
          {/* deactivate after 24 hrs */}
          <tr>
            <td className="text-capitalize">deactivate client after 24 hrs</td>
            <td>{ApplicationSettings?.DeactivateBilling24hrs == 0 ? "Deactivated" : "Activated"}</td>
            <td>
              <button
                className={ApplicationSettings?.DeactivateBilling24hrs == 0 ? "btn btn-success btn-sm p-1" : " btn btn-danger btn-sm p-1"}
                onClick={(e) => {
                  handleAppSettingsActivation("DeactivateBilling24hrs", ApplicationSettings?.DeactivateBilling24hrs == 0 ? 1 : 0)
                }}>
                {ApplicationSettings?.DeactivateBilling24hrs == 0 ? "Activate" : " Deactivate"}
              </button>
            </td>
          </tr>
          {/* clear all bills before new transaction */}
          <tr>
            <td className="text-capitalize">clear all bills before new transaction</td>
            <td>{ApplicationSettings?.PaidBillsBeforeTransaction == 0 ? "Deactivated" : "Activated"}</td>
            <td>
              <button
                className={
                  ApplicationSettings?.PaidBillsBeforeTransaction == 0 ? "btn btn-success btn-sm p-1" : "btn btn-danger btn-sm p-1"
                }
                onClick={(e) => {
                  handleAppSettingsActivation("PaidBillsBeforeTransaction", ApplicationSettings?.PaidBillsBeforeTransaction == 0 ? 1 : 0)
                }}>
                {ApplicationSettings?.PaidBillsBeforeTransaction == 0 ? "Activate" : " Deactivate"}
              </button>
            </td>
          </tr>
          <tr>
            <td className="text-capitalize">complete laboratory flow</td>
            <td>{ApplicationSettings?.completeFlow == 0 ? "Deactivated" : "Activated"}</td>
            <td>
              <button
                className={ApplicationSettings?.completeFlow == 0 ? "btn btn-success btn-sm p-1" : "btn btn-danger btn-sm p-1"}
                onClick={(e) => {
                  handleAppSettingsActivation("completeFlow", ApplicationSettings?.completeFlow == 0 ? 1 : 0)
                }}>
                {ApplicationSettings?.completeFlow == 0 ? "Activate" : " Deactivate"}
              </button>
            </td>
          </tr>
          <tr>
            <td className="text-capitalize">approval before result printing</td>
            <td>{ApplicationSettings?.approvalbeforeprinting == 0 ? "Deactivated" : "Activated"}</td>
            <td>
              <button
                className={ApplicationSettings?.approvalbeforeprinting == 0 ? "btn btn-success btn-sm p-1" : "btn btn-danger btn-sm p-1"}
                onClick={(e) => {
                  handleAppSettingsActivation("approvalbeforeprinting", ApplicationSettings?.approvalbeforeprinting == 0 ? 1 : 0)
                }}>
                {ApplicationSettings?.approvalbeforeprinting == 0 ? "Activate" : " Deactivate"}
              </button>
            </td>
          </tr>
          <tr>
            <td>Email Notifications</td>
            <td>{ApplicationSettings?.emailNotification == 0 ? "Deactivated" : "Activated"}</td>
            <td>
              <button
                className={ApplicationSettings?.emailNotification == 0 ? "btn btn-success btn-sm p-1" : "btn btn-danger btn-sm p-1"}
                onClick={(e) => {
                  handleAppSettingsActivation("emailNotification", ApplicationSettings?.emailNotification == 0 ? 1 : 0)
                }}>
                {ApplicationSettings?.emailNotification == 0 ? "Activate" : " Deactivate"}
              </button>
            </td>
          </tr>
        </tbody>
      </Table>
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
