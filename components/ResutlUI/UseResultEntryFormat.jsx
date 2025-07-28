import Barcode from 'react-barcode';

export default function UseResultEntryScientist({ validators, resultentry, enteredOn, resultsettings, lastupdatedon, patientid, billingid, ascensionid }) {
	const barcodeValue = billingid && ascensionid && patientid ? `${billingid}-${ascensionid}-${patientid}` : patientid || billingid || ascensionid;

	return (
		<div className="report-container">
			<div className="grid-30-30-30 text-sm">
				<span>Authenticated By:</span>
				<span> {resultentry}</span>
				<p>{new Date(enteredOn).toLocaleString()}</p>
			</div>
			<div className='d-flex justify-content-between '>
				{Array.isArray(validators) && validators.length > 0 && validators.map((validator) => (
					<div key={validator.employeeid} >
						<span className='text-uppercase fw-bold'>Validated By:</span><span> {validator.username}</span>
						<p>{new Date(lastupdatedon).toLocaleString()}</p>
					</div>
				))}
				{patientid && (
					<div >
						<Barcode value={barcodeValue} height={40} width={1.5} fontSize={12} displayValue={false} />
					</div>
				)}
			</div>
		</div>
	);
}
