
export default function TopComponentBillingButton() {
  return (
    <>
      <div className="mx-1 my-1">
        <div className="d-flex justify-content-end">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={(e) => {
              window.open("/organization")
            }}>
            organization
          </button>
          <button
            className="btn btn-outline-secondary btn-sm mx-2"
            onClick={(e) => {
              window.open("/clinician")
            }}>
            clinician
          </button>
        </div>
      </div>
    </>
  )
}
