import React, { useRef, useEffect } from 'react';

// Sample Data
const data = {
     "companyInfo": {
          "name": "VITALSCAN DIAGNOSTIC AND LABORATORY",
          "email": "vitalscandiagnostic@gmail.com",
          "motto": "Your Health is Vital to Us",
          "phonenumber": 373119220,
          "address": "Opposite West Hospital Main Along the Picorna Road",
          "website": "vitalscan@health.com",
          "street": "Picorna Road",
          "alternativenumber": 733737377
     },
     "patientInformation": {
          "designation": "Mr.",
          "firstname": "tiifu",
          "lastname": "hamza",
          "middlename": "hamza kojo",
          "dob": "1990-11-05T23:00:00.000Z",
          "age": 33,
          "gender": "female",
          "mobile_number": "0595964565",
          "email": "hamzatiifu45@gmail.com"
     },
     "records": [
          {
               "name": "TOTAL CHOLESTEROL",
               "value": "444",
               "units": "mmol/L",
               "upperlimit": "5.20",
               "lowerlimit": "1.00"
          },
          {
               "name": "PARASITE COUNT",
               "value": "44",
               "units": "MLS",
          },
          {
               "name": "TRIGLYCERIDES",
               "value": "4",
               "units": "mmol/L",
               "upperlimit": "1.70",
               "lowerlimit": "0.31"
          },
          {
               "name": "HDL CHOL",
               "value": "44",
               "units": "mmol/L",
               "upperlimit": "1.55",
               "lowerlimit": "1.00"
          },
          {
               "name": "LDL-CHOL",
               "value": "4",
               "units": "mmol/L",
               "upperlimit": "3.50",
               "lowerlimit": "0.10"
          },
          {
               "name": "VLDL CHOL",
               "value": "4",
               "units": "mmol/L",
               "upperlimit": "1.70",
               "lowerlimit": "0.10"
          },
          {
               "name": "CARDIAC RISK",
               "value": "4",
               "units": "mls",
          },
          {
               "name": "TIIFU",
               "value": "4",
               "units": "MLS",
               "upperlimit": "500",
               "lowerlimit": "300"
          }
     ],
     "validators": [
          {
               "username": "TIIFU HAMZA",
               "employeeid": 3,
               "role": "admin"
          },
          {
               "username": "DR. KARIM YUSSIF WEIBADUA",
               "employeeid": 45,
               "role": "admin"
          }
     ],
     "comments": "<p>44</p>",
     "testname": "Lipid Profile"
};

const MedicalReport = React.forwardRef((props, ref) => {
     return (
          <div ref={ref} className="container mt-4">
               <header className="text-center border-bottom pb-4 mb-4">
                    <h1>{data.companyInfo.name}</h1>
                    <p>{data.companyInfo.motto}</p>
                    <p><strong>Email:</strong> {data.companyInfo.email} | <strong>Phone:</strong> {data.companyInfo.phonenumber}</p>
                    <p><strong>Address:</strong> {data.companyInfo.address}</p>
               </header>

               <section className="patient-info">
                    <h3>Patient Information</h3>
                    <div className="row">
                         <div className="col-md-6">
                              <p><strong>Name:</strong> {data.patientInformation.firstname} {data.patientInformation.middlename} {data.patientInformation.lastname}</p>
                              <p><strong>Gender:</strong> {data.patientInformation.gender}</p>
                              <p><strong>Age:</strong> {data.patientInformation.age} years</p>
                         </div>
                         <div className="col-md-6">
                              <p><strong>Contact:</strong> {data.patientInformation.mobile_number}</p>
                              <p><strong>Email:</strong> {data.patientInformation.email}</p>
                         </div>
                    </div>
               </section>

               <section className="test-results mt-4">
                    <h3>Test Results: {data.testname}</h3>
                    <table className="table table-bordered mt-3">
                         <thead>
                              <tr>
                                   <th>Test</th>
                                   <th>Value</th>
                                   <th>Units</th>
                                   <th>Limits</th>
                              </tr>
                         </thead>
                         <tbody>
                              {data.records.map((record, index) => (
                                   <tr key={index}>
                                        <td>{record.name}</td>
                                        <td>{record.value}</td>
                                        <td>{record.units}</td>
                                        <td>
                                             {record.upperlimit && record.lowerlimit
                                                  ? `${record.lowerlimit} - ${record.upperlimit}`
                                                  : 'N/A'}
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </section>

               <section className="comments mt-4">
                    <h3>Comments</h3>
                    <div dangerouslySetInnerHTML={{ __html: data.comments }} />
               </section>

               <footer className="text-center mt-4 pt-4 border-top">
                    <p>Validated by: {data.validators.map(validator => `${validator.username}`).join(', ')}</p>
               </footer>
          </div>
     );
});

const App = () => {
     const componentRef = useRef();

     const printReport = () => {
          window.print();
     };

     return (
          <div>
               <button onClick={printReport} className="btn btn-primary mt-4">Print Report</button>
               <MedicalReport ref={componentRef} />
          </div>
     );
};

export default App;
