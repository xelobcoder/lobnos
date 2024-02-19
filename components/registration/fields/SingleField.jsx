import { Form } from "react-bootstrap"
export default function SingleFieldList({ handleChange, fields, _fields, index }) {
  const rendering = (item) => {
    if (fields[index]["fields"][item] === "compulsory") {
      return (
         <div className="mx-2 p-2">
            compulsory
        </div>
      )
    } else {
      return (
        <Form.Switch
          type="switch"
          name={item}
          checked={fields[index]["fields"][item]}
          onChange={(ev) => {
            handleChange(ev, index, item)
          }}
          variant="primary"
          style={{ fontSize: "25px" }}
        />
      )
    }
  }
  return (
    <span>
      {_fields.map((item, i) => {
        return (
          <div
            className={`d-flex justify-content-between bg-white border-bottom br-5`}
            key={i}>
            <span className="text-capitalize mt-2 px-2 text-secondary">{item}</span>
            <span>{rendering(item)}</span>
          </div>
        )
      })}
    </span>
  )
}
