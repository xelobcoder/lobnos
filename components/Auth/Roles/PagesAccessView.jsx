import { Form } from "react-bootstrap"
export default function PagesAccessView({ data, changeEvent, target, handler, pageAcesshandler, role }) {
  return (
    <>
      <div className="row mx-2 mb-4">
        <h5>Actions</h5>
        <hr/>
        {Object.entries(data).map((item, index) => {
          const [header, value] = item
          if (!["username", "role", "pageAccess", "pageaccess", "permissions"].includes(header)) {
            return (
              <div key={index} className="col-12 text-capitalize">
                <input
                  type="checkbox"
                  name={header}
                  style={{fontSize:'20px',marginRight:'10px'}}
                  onChange={(ev) => handler(ev, target, changeEvent)}
                  value={data[header]}
                  checked={data[header]}
                  className="form-check-input"
                />{" "}
                {header}
              </div>
            )
          }
        })}
      </div>
      <div className="row mx-2">
        <h5>Page Access</h5>
        <hr />
        {data?.pageAccess &&
          Object.entries(data?.pageAccess).map((item, index) => {
            const [keys, value] = item
            return (
              <div className="col-12 d-flex justify-content-between list-group-item p-2" key={index}>
                <h6 className="text-capitalize">{keys}</h6>
                <Form.Switch
                  name={keys}
                  onChange={(ev) => pageAcesshandler(ev, target, changeEvent)}
                  checked={data.pageAccess[keys]}
                  type="switch"
                  style={{ fontSize: "25px" }}
                />
              </div>
            )
          })}
      </div>
    </>
  )
}
