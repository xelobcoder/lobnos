export default function IsRenderInput({ label, value, field }) {
  return (
    <div className="grid-30-70 mt-2">
      <label className="text-capitalize mb-2 mt-1 pls-label">{label}</label>
      <div >{field}</div>
    </div>
  )
}
