export default function UseResultEntryScientist({ validators, resultentry, enteredOn, lastupdatedon }) {
	return (
		<div className="report-container">
			<div className="grid-30-30-30 text-sm">
				<span>Entry By:</span>
				<span> {resultentry}</span>
				<p>{new Date(enteredOn).toLocaleString()}</p>
			</div>
			{validators.map((validator) => (
				<div key={validator.employeeid} className="text-sm grid-30-30-30">
					<span>Validation By:</span>
					<span> {validator.username}</span>
					<p>{new Date(lastupdatedon).toLocaleString()}</p>
				</div>
			))}
		</div>
	);
}
