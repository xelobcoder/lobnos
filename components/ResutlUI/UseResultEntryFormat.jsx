import Barcode from 'react-barcode';

export default function UseResultEntryScientist({ validators, resultentry, useIndividualValidation, enteredOn, resultsettings, lastupdatedon, patientid, billingid, ascensionid, showBarcode = true }) {
	const barcodeValue = billingid && ascensionid && patientid ? `${billingid}-${ascensionid}-${patientid}` : patientid || billingid || ascensionid;
	const includeBarcode = resultsettings?.includeBarcode;
	console.log({validators,useIndividualValidation})

	return (
		<div className="report-container">
			{useIndividualValidation && (
				<div>
					<div style={{ display: "grid", gridTemplateColumns: "25% 50% 25%" }}>
						<span>Result Entry By:</span>
						<span> {resultentry}</span>
						<p>{new Date(enteredOn ? enteredOn : lastupdatedon).toLocaleString()}</p>
					</div>
					<div >
						{Array.isArray(validators) && validators.length > 0 && validators.map((validator) => (
							<div key={validator.employeeid} style={{ display: "grid", gridTemplateColumns: "25% 50% 25%" }}>
								<span>Validated By:</span>
								<span> {validator.username}</span>
								<p>{new Date(lastupdatedon).toLocaleString()}</p>
							</div>
						))}
					</div>
				</div>
			)
			}
			<div>
				{patientid && includeBarcode && showBarcode && (
					<div className='d-flex justify-content-end'>
						<Barcode value={barcodeValue} height={40} width={1.5} fontSize={12} displayValue={false} />
					</div>
				)}
			</div>
		</div>
	);
}
