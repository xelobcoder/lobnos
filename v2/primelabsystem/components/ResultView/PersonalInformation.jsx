
export default function PersonalInformation({ PersonalInformation ,billingid}) {
	const { firstname, lastname, middlename, gender, age, ageType, clinician,patientid } = PersonalInformation


	return (<div className="border-bottom border-secondary border-2" >
		<h6 className="result-section-header border-bottom border-2 border-secondary fw-bold mt-2 mb-1 text-center">Personal Information</h6>
		<div className="grid-50 text-uppercase">
			<div className="left">
				<div className="result-sampling-details">
					<div className="left">full name: </div>
					<div className="right">
						{firstname} {middlename} {lastname}
					</div>
				</div>
				<div className="result-sampling-details">
					<div className="left">gender: </div>
					<div className="right">{gender}</div>
				</div>
				<div className="result-sampling-details">
					<div className="left">age: </div>
					<div className="right">
						{age} {ageType}
					</div>
				</div>
			</div>
			<div className="right">
				<div className="result-sampling-details ">
					<div className="left">patient id: </div>
					<div className="right">{patientid}</div>
				</div>

				<div className="result-sampling-details">
					<div className="left">billing id: </div>
					<div className="right">{billingid}</div>
				</div>

				<div className="result-sampling-details">
					<div className="left">Report Date: </div>
					<div className="right">{new Date().toLocaleString()}</div>
				</div>
			</div>
		</div>
	</div >)
}
