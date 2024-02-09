import { Form } from "react-bootstrap"
import { useEffect, useState } from "react"
export default function CustomFormSwitch({ title, target, update, text, value, variant = "boolean" }) {
  const [state, setState] = useState(true)

  const handleChange = (ev, target) => {
    setState(ev.target.checked)
    if (variant == "number") {
      update(target, ev.target.checked == false ? 0 : 1)
    } else {
      update(target, ev.target.checked)
    }
  }

  useEffect(() => {
    if (variant === "number") {
      setState(value == 1 ? true : false)
    } else {
      setState(value)
    }
  }, [variant, value])

  return (
    <div className="border mt-2 border-secondary p-1">
      <div className="d-flex border-bottom">
        <span>
          <Form.Check checked={state} onChange={(ev) => handleChange(ev, target)} type="switch" style={{ fontSize: "25px" }} />
        </span>
        <h6 className="fw-bold d-flex my-2">{title}</h6>
      </div>
      <div className="switch-body  text-secondary text-sm">{text}</div>
    </div>
  )
}
