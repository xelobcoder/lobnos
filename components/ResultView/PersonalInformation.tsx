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
  const { firstname, lastname, middlename, gender, age, agetype, clinician, patientid,fullpatientid } = PersonalInformation

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
            {age} {agetype}
          </div>
        </div>
      </div>
      <div className="right">
        <div className="result-sampling-details ">
          <div className="left">patient id: </div>
          <div className="right">{fullpatientid}</div>
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
