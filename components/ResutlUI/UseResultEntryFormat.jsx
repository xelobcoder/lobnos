import Barcode from 'react-barcode';

export default function UseResultEntryScientist({ validators, resultentry, useIndividualValidation, enteredOn, resultsettings, lastupdatedon, patientid, billingid, ascensionid, showBarcode = true }) {
	const barcodeValue = billingid && ascensionid && patientid ? `${billingid}-${ascensionid}-${patientid}` : patientid || billingid || ascensionid;
	const includeBarcode = resultsettings?.includeBarcode;

	const validatorWhoEnteredResult = Array.isArray(validators) && validators.length > 0
		? validators.find(validator => validator.username === resultentry)
		: null;

	const otherValidators = Array.isArray(validators) && validators.length > 0
		? validators.filter(validator => validator.username !== resultentry)
		: [];

	return (
		<div className="report-container">
			{useIndividualValidation && (
				<div style={{ fontSize: '0.75rem', lineHeight: '1.2'}}>
					{validatorWhoEnteredResult ? (
						<div style={{ display: "grid", gridTemplateColumns: "25% 50% 25%", gap: '2px', marginBottom: '4px' }}>
							<span>Result Entered & Validated By:</span>
							<span> {resultentry}</span>
							<p style={{ margin: 0 }}>{new Date(lastupdatedon).toLocaleString()}</p>
						</div>
					) : (
						<div style={{ display: "grid", gridTemplateColumns: "25% 50% 25%", gap: '2px', marginBottom: '4px' }}>
							<span>Result Entry By:</span>
							<span> {resultentry}</span>
							<p style={{ margin: 0 }}>{new Date(enteredOn ? enteredOn : lastupdatedon).toLocaleString()}</p>
						</div>
					)}
					<div>
						{otherValidators.length > 0 && otherValidators.map((validator) => (
							<div key={validator.employeeid} style={{ display: "grid", gridTemplateColumns: "25% 50% 25%", gap: '2px', marginBottom: '4px' }}>
								<span>Validated By:</span>
								<span> {validator.username}</span>
								<p style={{ margin: 0 }}>{new Date(lastupdatedon).toLocaleString()}</p>
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
