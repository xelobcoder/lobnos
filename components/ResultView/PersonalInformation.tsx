interface PersonalInformationProps {
	PersonalInformation: {
		firstname?: string;
		lastname?: string;
		middlename?: string;
		gender?: string;
		age?: number;
		agetype?: string;
		fullpatientid: string;
		clinician?: string;
		patientid?: string;
		// Add missing fields from the PatientInformation interface
		email?: string;
		dob?: string;
		marital_status?: string;
		mobile_number?: string;
		occupation?: string;
		date?: string;
		activation_status?: string;
		organization?: string;
		contactpointer?: string;
		whatAppcontact?: string;
		designation?: string;
	};
	billingid?: string | number;
}

export default function PersonalInformation({ PersonalInformation, billingid }: PersonalInformationProps) {
	if (!PersonalInformation || !billingid) return null
	const { firstname, lastname, middlename, gender, age, agetype, clinician, patientid, fullpatientid } = PersonalInformation

	return (<div className="border-bottom border-secondary border-2" >
		<h6 className="result-section-header border-bottom border-2 border-secondary fw-bold mt-2 mb-1 text-center">Personal Information</h6>
		<div className="grid-50 text-uppercase " style={{fontSize:'0.9rem'}}>
			<div className="left" > 
				<div style={{display:'flex',gridTemplateColumns:'auto auto'}}>
					<div className="left" style={{fontWeight:500}}> full name: </div>
					<div className="right mx-2">
						{firstname} {middlename} {lastname}
					</div>
				</div>
				<div style={{display:'flex',gridTemplateColumns:'auto auto'}}>
					<div className="left" style={{fontWeight:500}}> Age(gender): </div>
					<div className="right mx-2"> {age} {agetype} ({gender})</div>
				</div>

			</div>
			<div className="right">
				<div style={{display:'flex',gridTemplateColumns:'auto auto'}}>
					<div className="left" style={{fontWeight:500}}> patient id/BillId: </div>
					<div className="right mx-2">{fullpatientid}({billingid})</div>
				</div>

				<div style={{display:'flex',gridTemplateColumns:'auto auto'}}>
					<div className="left" style={{fontWeight:500}}> Report Date: </div>
					<div className="right mx-2">{new Date().toLocaleString()}</div>
				</div>
			</div>
		</div>
	</div >)
}
