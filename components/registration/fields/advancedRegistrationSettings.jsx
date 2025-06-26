import { Form } from "react-bootstrap"
export default function AdvancedRegistrationSettings() {
  return (
    <div className="mx-3 border  mt-2 bg-white p-3">
      <div className="mt-4 d-flex">
        <Form.Switch checked={true} style={{ fontSize: "25px" }} />
        <h6 className="mx-2 mt-2">Cluster Registration View</h6>
      </div>
      <div className="mt-4 d-flex">
        <Form.Switch checked={true} style={{ fontSize: "25px" }} />
        <h6 className="mx-2 mt-2">Proceed to billing after registration</h6>
      </div>
      <div className="mt-4 d-flex">
        <Form.Switch checked={true} style={{ fontSize: "25px" }} />
        <h6 className="mx-2 mt-2">Cluster Registration View</h6>
      </div>
    </div>
  )
}
