import Barcode from "react-barcode"
export default function UseDisclaimer({ patientid }) {
  return (
    <>
      <div className="d-flex justify-content-end">
        <Barcode  displayValue={false} fontSize={13} height={50} value={patientid} />
      </div>
      <div style={{ fontFamily: "monospace" }}>
        PLEASE NOTE:
        <br />
        This modality has its own limitations and the impression should be considered only as a professional opinion and correlated with
        clinical and other relevant patient data.
      </div>
    </>
  )
}
