"use client";

import React from 'react';

export default function MedicalReport() {
     return (
          <>
               <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          background: #fff;
          padding: 20px;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          border: 1px solid #000;
        }

        .header {
          background: #E94E3D;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #000;
        }

        .labs {
          font-size: 28px;
          color: #000;
          font-weight: bold;
          border: 2px solid #000;
          padding: 2px 8px;
        }

        .trust-info {
          text-align: right;
          color: #fff;
          font-size: 12px;
        }

        .trust-info div {
          margin-bottom: 3px;
        }

        .company-info {
          padding: 10px 20px;
          font-size: 11px;
          line-height: 1.6;
        }

        .company-name {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 3px;
        }

        .patient-info {
          margin: 15px 20px;
          border: 2px solid #000;
          padding: 0;
        }

        .patient-info table {
          width: 100%;
          border-collapse: collapse;
        }

        .patient-info td {
          padding: 8px 12px;
          font-size: 11px;
          border: 1px solid #000;
        }

        .patient-info td:nth-child(odd) {
          font-weight: bold;
          width: 15%;
        }

        .patient-info td:nth-child(even) {
          width: 35%;
        }

        .barcode {
          text-align: center;
          padding: 10px 0;
          font-size: 24px;
          letter-spacing: 2px;
        }

        .section-title {
          background: #f0f0f0;
          text-align: center;
          padding: 10px;
          font-weight: bold;
          font-size: 14px;
          margin: 20px 20px 0 20px;
        }

        .test-header {
          background: #f0f0f0;
          text-align: center;
          padding: 8px;
          font-weight: bold;
          font-size: 12px;
          margin: 10px 20px 0 20px;
        }

        .results-table {
          margin: 0 20px 20px 20px;
          width: calc(100% - 40px);
          border-collapse: collapse;
          font-size: 11px;
        }

        .results-table th {
          background: #fff;
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #000;
          font-weight: bold;
        }

        .results-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #ddd;
        }

        .results-table tr.category {
          font-weight: bold;
          background: #f9f9f9;
        }

        .results-table tr.subcategory {
          background: #f5f5f5;
          font-weight: bold;
        }

        .watermark {
          position: relative;
        }

        .watermark::before {
          content: 'TATA 1mg Labs';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 60px;
          color: rgba(233, 78, 61, 0.1);
          font-weight: bold;
          white-space: nowrap;
          pointer-events: none;
        }

        .comments {
          margin: 10px 20px;
          padding: 10px;
          background: #f9f9f9;
          font-size: 10px;
        }

        .comments strong {
          display: block;
          margin-bottom: 5px;
        }

        .footer {
          margin: 20px;
          padding: 15px;
          border-top: 2px solid #000;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 10px;
        }

        .lab-location {
          flex: 1;
        }

        .lab-location div {
          margin-bottom: 3px;
        }

        .signature {
          text-align: center;
        }

        .qr-code {
          width: 80px;
          height: 80px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 8px;
        }

        .bottom-bar {
          background: #E94E3D;
          padding: 8px 20px;
          color: #fff;
          text-align: center;
          font-size: 10px;
        }
      `}</style>
               <div className="container">
                    <div className="header">
                         <div className="logo-section">
                              <span className="logo">TATA</span>
                              <span className="labs">1mg</span>
                              <span style={{ fontSize: '24px', marginLeft: '5px' }}>| Labs</span>
                         </div>
                         <div className="trust-info">
                              <div><strong>Most Trusted Brand</strong></div>
                              <div>40 lakhs+</div>
                              <div>satisfied customers</div>
                              <div>1 crore+</div>
                              <div>lab tests booked</div>
                         </div>
                    </div>

                    <div className="company-info">
                         <div className="company-name">Tata 1mg Technologies Private Limited</div>
                         <div><strong>Registered office:</strong> Level: 2 Videocon Tower, E1, Jhandewalan Extension, Sector 6 Vasant Kunj New Delhi 110070</div>
                         <div>🌐 www.1mg.com/labs &nbsp;&nbsp;📧 care@1mg.com &nbsp;&nbsp;📞 CIN: U74140DL2015PTC279229</div>
                         <div>ISO 9001:2015</div>
                    </div>

                    <div className="barcode">|||||||||||||||||||||||</div>

                    <div className="patient-info">
                         <table>
                              <tbody>
                                   <tr>
                                        <td>Name</td>
                                        <td>: Mr AABHASHTAIN</td>
                                        <td>Client Name</td>
                                        <td>: DC - WE CARE DIAGNOSTICS CENTRE P</td>
                                   </tr>
                                   <tr>
                                        <td>Age/Gender</td>
                                        <td>: 22 Y 0 M 0 D /Male</td>
                                        <td>Registration Date</td>
                                        <td>: 18-Feb-24 10:38 AM</td>
                                   </tr>
                                   <tr>
                                        <td>Patient ID</td>
                                        <td>: DC069637</td>
                                        <td>Collection Date</td>
                                        <td>: 18/Feb/2024 10:46AM</td>
                                   </tr>
                                   <tr>
                                        <td>Barcode ID/Order ID</td>
                                        <td>: 68D17521 /</td>
                                        <td>Sample Receive Date</td>
                                        <td>: 18/Feb/2024 04:11PM</td>
                                   </tr>
                                   <tr>
                                        <td>Referred By</td>
                                        <td>: SELF</td>
                                        <td>Report Status</td>
                                        <td>: Final Report</td>
                                   </tr>
                                   <tr>
                                        <td>Sample Type</td>
                                        <td>: Whole Blood-EDTA</td>
                                        <td>Report Date</td>
                                        <td>: 18/Feb/2024 04:38PM</td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>

                    <div className="section-title">HAEMATOLOGY</div>

                    <div className="test-header">Aayushya Health Checkup 1</div>

                    <div className="watermark">
                         <table className="results-table">
                              <thead>
                                   <tr>
                                        <th>Test Name</th>
                                        <th>Result</th>
                                        <th>Unit</th>
                                        <th>Bio. Ref. Interval</th>
                                        <th>Method</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   <tr className="category">
                                        <td colSpan={5}>Complete Blood Count</td>
                                   </tr>
                                   <tr>
                                        <td>Hemoglobin</td>
                                        <td>14.9</td>
                                        <td>g/dL</td>
                                        <td>13.0-17.0</td>
                                        <td>Spectrophotometry</td>
                                   </tr>
                                   <tr>
                                        <td>RBC</td>
                                        <td>4.87</td>
                                        <td>10^6/cu.mm</td>
                                        <td>4.5 - 5.5</td>
                                        <td>Impedance Variation</td>
                                   </tr>
                                   <tr>
                                        <td>HCT</td>
                                        <td>44.9</td>
                                        <td>%</td>
                                        <td>40 - 50</td>
                                        <td>Pulse Height Average</td>
                                   </tr>
                                   <tr>
                                        <td>MCV</td>
                                        <td>92.1</td>
                                        <td>fl</td>
                                        <td>83 - 101</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>MCH</td>
                                        <td>30.6</td>
                                        <td>pg</td>
                                        <td>27 - 32</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>MCHC</td>
                                        <td>33.2</td>
                                        <td>g/dL</td>
                                        <td>31.5 - 34.5</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>RDW-CV</td>
                                        <td>14.3</td>
                                        <td>%</td>
                                        <td>11.6-14</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>Total Leucocyte Count</td>
                                        <td>13.16</td>
                                        <td>10^3/μL</td>
                                        <td>4 - 10</td>
                                        <td>Impedance Variation</td>
                                   </tr>
                                   <tr className="subcategory">
                                        <td colSpan={5}>Differential Leucocyte Count</td>
                                   </tr>
                                   <tr>
                                        <td>Neutrophils</td>
                                        <td>71.5</td>
                                        <td>%</td>
                                        <td>40-80</td>
                                        <td>DHSS/Microscopy</td>
                                   </tr>
                                   <tr>
                                        <td>Lymphocytes</td>
                                        <td>24.7</td>
                                        <td>%</td>
                                        <td>20-40</td>
                                        <td>DHSS/Microscopy</td>
                                   </tr>
                                   <tr>
                                        <td>Monocytes</td>
                                        <td>2.4</td>
                                        <td>%</td>
                                        <td>2-10</td>
                                        <td>DHSS/Microscopy</td>
                                   </tr>
                                   <tr>
                                        <td>Eosinophils</td>
                                        <td>0.7</td>
                                        <td>%</td>
                                        <td>1-6</td>
                                        <td>DHSS/Microscopy</td>
                                   </tr>
                                   <tr>
                                        <td>Basophils</td>
                                        <td>0.7</td>
                                        <td>%</td>
                                        <td>0-2</td>
                                        <td>DHSS/Microscopy</td>
                                   </tr>
                                   <tr className="subcategory">
                                        <td colSpan={5}>Absolute Leucocyte Count</td>
                                   </tr>
                                   <tr>
                                        <td>Absolute Neutrophil Count</td>
                                        <td>9.41</td>
                                        <td>10^3/μL</td>
                                        <td>2-7</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>Absolute Lymphocyte Count</td>
                                        <td>3.25</td>
                                        <td>10^3/μL</td>
                                        <td>1-3</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>Absolute Monocyte Count</td>
                                        <td>0.32</td>
                                        <td>10^3/μL</td>
                                        <td>0.2-1</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>Absolute Eosinophil Count</td>
                                        <td>0.09</td>
                                        <td>10^3/μL</td>
                                        <td>0.02-0.5</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>Absolute Basophil Count</td>
                                        <td>0.09</td>
                                        <td>10^3/μL</td>
                                        <td>0.02-0.1</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>Platelet Count</td>
                                        <td>426</td>
                                        <td>10^3/μl</td>
                                        <td>150 - 410</td>
                                        <td>Impedance Variation/Microscopy</td>
                                   </tr>
                                   <tr>
                                        <td>MPV</td>
                                        <td>8.3</td>
                                        <td>fl</td>
                                        <td>6.5 - 12</td>
                                        <td>Calculated</td>
                                   </tr>
                                   <tr>
                                        <td>PDW</td>
                                        <td>14</td>
                                        <td>fl</td>
                                        <td>9 - 17</td>
                                        <td>Calculated</td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>

                    <div className="comments">
                         <strong>Comment:</strong>
                         • As per the recommendation of International council for Standardization in Hematology, the differential leucocyte counts are additionally being reported as absolute numbers of each cell in per unit volume of blood.
                    </div>

                    <div className="footer">
                         <div className="lab-location">
                              <div><strong>This test has been performed at</strong></div>
                              <div><strong>TATA 1MG DEHRADUN</strong></div>
                              <div><strong>Address:</strong> 2nd Floor, Building 1072, Ashirwad</div>
                              <div>Turner, Ballupur Road, Chakrata Rd, Indirar</div>
                              <div>Vihar, Dehradun, Uttarakhand 248001</div>
                         </div>
                         <div className="signature">
                              <div style={{ fontSize: '24px', marginBottom: '5px' }}>✓</div>
                              <div>Dr. Amit Goyal</div>
                              <div>MBBS, MD (A & I), DGO</div>
                              <div>Consultant Pathologist</div>
                              <div>Reg No: 27653</div>
                         </div>
                         <div className="qr-code">
                              QR CODE
                         </div>
                    </div>

                    <div style={{ textAlign: 'right', padding: '10px 20px', fontSize: '10px' }}>
                         Page 1 of 13
                    </div>

                    <div className="bottom-bar">
                         <strong>State-of-the-art Lab Facilities</strong><br />
                         Delhi • Gurgaon • Mumbai • Bangalore • Kolkata • Hyderabad • Chennai • Ahmedabad • Pune • Lucknow • Dehradun • Odisha
                    </div>
               </div>
          </>
     );
}
