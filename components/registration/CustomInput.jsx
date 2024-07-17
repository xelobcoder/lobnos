export default function IsRenderInput({ label, value, field, displaylabel = true, expanded = true }) {
  const rendering = () => {
    if (value === "compulsory" || value === true) {
      return (
        <div className={expanded === true ? "mx-4" : ""}>
          <div className={expanded === true ? "grid-reg my-2" : ""}>
            {displaylabel && <label className="text-capitalize mb-2 mt-1">{label}</label>}
            <div className={`${expanded === true}`}>{field}</div>
          </div>
        </div>
      )
    } 
  }
  return <>{rendering()}</>
}
