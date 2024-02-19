export default function IsRenderInput({ label, value, field, displaylabel = true }) {
  const rendering = () => {
    if (value === "compulsory") {
      return (
        <div>
          {displaylabel && <label className="text-capitalize">{label}</label>}
          {field}
        </div>
      )
    } else {
      if (value === true) {
        return (
          <>
            {displaylabel && <label className="text-capitalize">{label}</label>}
            {field}
          </>
        )
      }
      return
    }
  }
  return <>{rendering()}</>
}
