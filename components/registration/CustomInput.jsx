export default function IsRenderInput({ label, value, field, displaylabel = true, expanded = true }) {
  const rendering = () => {
    if (value === "compulsory") {
      return (
        <div className={expanded === true ? "grid-20-70 my-2" : ""}>
          {displaylabel && <label className="text-capitalize">{label}</label>}
          {field}
        </div>
      )
    } else {
      if (value === true) {
        return (
          <>
            <div className={expanded === true ? "grid-20-70 my-2" : ""}>
              {displaylabel && <label className="text-capitalize">{label}</label>}
              {field}
            </div>
          </>
        )
      }
      return
    }
  }
  return <>{rendering()}</>
}
