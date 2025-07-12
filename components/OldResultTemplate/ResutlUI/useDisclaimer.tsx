
interface UseDisclaimerProps {
  patientid: string;
}

export default function UseDisclaimer({ patientid }: UseDisclaimerProps) {
  return (
    <>
      <div className="d-flex ui justify-content-between align-content-center w-100">
        <div className="text-capitalize fw-bold mt-3">
          <span>SIGNATURE:.............................</span>
        </div>
        <span>
          {/* <Barcode displayValue={false} fontSize={13} height={40} value={patientid} /> */}
        </span>
      </div>
      <div style={{ fontSize: "13px" }}>
        PLEASE NOTE:
        <br />
        This modality has its own limitations and the impression should be considered only as a professional opinion and correlated with
        clinical and other relevant patient data.
      </div>
    </>
  )
}