"use client";

import React from 'react';

export default function MedicalReport() {
     return (
          <>
               <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif;
          background: #e8e8e8;
          padding: 15px;
          line-height: 1.4;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          background: #fff;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 25px 30px 20px;
          background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%);
          border-bottom: 4px solid #0099cc;
        }

        .logo-section {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .main-logo {
          width: 95px;
          height: 95px;
          background: linear-gradient(135deg, #0088bb 0%, #00aadd 100%);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 28px;
          box-shadow: 0 4px 12px rgba(0, 153, 204, 0.3);
          letter-spacing: 1px;
          font-family: 'Roboto', sans-serif;
        }

        .main-logo div:first-child {
          font-size: 32px;
          line-height: 0.9;
        }

        .main-logo div:last-child {
          font-size: 26px;
          margin-top: 2px;
        }

        .badges {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .badge {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid #0099cc;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #0099cc;
          box-shadow: 0 2px 6px rgba(0, 153, 204, 0.2);
          font-family: 'Roboto', sans-serif;
        }

        .company-info {
          flex: 1;
          padding: 0 25px;
        }

        .company-name {
          color: #0099cc;
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 2px;
          font-family: 'Roboto', sans-serif;
          letter-spacing: 0.3px;
        }

        .company-name:last-of-type {
          margin-bottom: 6px;
        }

        .tagline {
          color: #0088bb;
          font-size: 10.5px;
          font-style: italic;
          margin-bottom: 10px;
          font-weight: 500;
        }

        .address {
          font-size: 9.5px;
          line-height: 1.5;
          margin-bottom: 3px;
          color: #333;
          font-weight: 400;
        }

        .address strong {
          font-weight: 600;
        }

        .confidential {
          color: #dc3545;
          font-size: 10.5px;
          font-weight: 700;
          margin-top: 8px;
          letter-spacing: 0.3px;
        }

        .certification-logos {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .cert-logo {
          background: white;
          border: 2px solid #333;
          border-radius: 4px;
          padding: 5px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .cert-logo:first-child {
          width: 70px;
          height: 35px;
        }

        .cert-logo:last-child {
          width: 80px;
          height: 28px;
        }

        .cert-text {
          font-size: 7.5px;
          text-align: center;
          color: #555;
          font-weight: 500;
          line-height: 1.3;
        }

        .patient-section {
          padding: 18px 30px;
          background: #f8f9fa;
          border-bottom: 3px solid #0099cc;
        }

        .patient-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px 20px;
          font-size: 10.5px;
        }

        .patient-field {
          display: flex;
          align-items: baseline;
        }

        .field-label {
          font-weight: 600;
          width: 145px;
          color: #2c3e50;
          flex-shrink: 0;
        }

        .field-value {
          flex: 1;
          color: #34495e;
          font-weight: 400;
        }

        .analyzer-info {
          grid-column: 2;
          font-size: 9px;
          color: #555;
          font-style: italic;
          padding-left: 5px;
        }

        .report-title {
          background: linear-gradient(135deg, #0099cc 0%, #0088bb 100%);
          color: white;
          text-align: center;
          padding: 12px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1px;
          font-family: 'Roboto', sans-serif;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .table-wrapper {
          position: relative;
          padding: 20px 30px;
        }

        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 140px;
          color: rgba(0, 153, 204, 0.03);
          font-weight: 900;
          pointer-events: none;
          z-index: 0;
          font-family: 'Roboto', sans-serif;
          letter-spacing: 8px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .results-table thead {
          background: linear-gradient(to bottom, #e8f4f8 0%, #d4ebf2 100%);
        }

        .results-table th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 700;
          border: 1px solid #bdd6dd;
          color: #2c3e50;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }

        .results-table td {
          padding: 10px;
          border: 1px solid #e0e0e0;
          background: white;
          color: #2c3e50;
          font-weight: 400;
        }

        .results-table tbody tr:hover {
          background: #f8f9fa !important;
        }

        .results-table tr.section-header td {
          background: linear-gradient(to right, #d9d9d9 0%, #e6e6e6 100%);
          font-weight: 700;
          padding: 8px 10px;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          color: #2c3e50;
        }

        .remark-low {
          color: #dc3545;
          font-weight: 700;
        }

        .remark-normal {
          color: #28a745;
          font-weight: 600;
        }

        .footer-section {
          padding: 25px 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          background: #f8f9fa;
        }

        .qr-code {
          width: 85px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-placeholder {
          width: 75px;
          height: 75px;
          background: repeating-linear-gradient(
            45deg,
            #333,
            #333 2px,
            #fff 2px,
            #fff 4px
          );
          border: 2px solid #333;
          margin-bottom: 5px;
        }

        .qr-text {
          font-size: 7.5px;
          text-align: center;
          color: #555;
          line-height: 1.3;
        }

        .signature-section {
          text-align: right;
        }

        .signature-line {
          width: 180px;
          border-bottom: 2px solid #333;
          margin: 40px 0 8px auto;
        }

        .signature-name {
          font-size: 12px;
          font-weight: 700;
          color: #2c3e50;
          font-family: 'Roboto', sans-serif;
        }

        .doctors-footer {
          background: linear-gradient(to bottom, #f0f2f5 0%, #e8eaed 100%);
          padding: 15px 20px;
          font-size: 8px;
          line-height: 1.4;
          border-top: 3px solid #0099cc;
        }

        .doctors-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 15px;
          margin-bottom: 10px;
        }

        .doctor-info {
          text-align: center;
        }

        .doctor-name {
          font-weight: 700;
          margin-bottom: 3px;
          color: #2c3e50;
          font-size: 8.5px;
        }

        .doctor-info div:not(.doctor-name) {
          font-size: 7.5px;
          color: #555;
          line-height: 1.3;
        }

        .additional-consultant {
          text-align: center;
          font-size: 7.5px;
          color: #555;
          padding-top: 8px;
          border-top: 1px solid #d0d0d0;
        }
      `}</style>
               <div className="container">
                    <div className="header">
                         <div className="logo-section">
                              <div className="main-logo">
                                   <div>WD</div>
                                   <div>ML</div>
                              </div>
                              <div className="badges">
                                   <div className="badge">PCR</div>
                                   <div className="badge">24hr</div>
                              </div>
                         </div>

                         <div className="company-info">
                              <div className="company-name">Wayamba Diagnostic</div>
                              <div className="company-name">Medical Laboratory (Pvt) Ltd.</div>
                              <div className="tagline">Member of The New Pharmacy Group of Companies</div>
                              <div className="address"><strong>No 120, Colombo Road, Kurunegala</strong></div>
                              <div className="address"><strong>Tel:</strong> 037 2229901-3 <strong>Fax:</strong> 037 2229904</div>
                              <div className="address"><strong>Web Site:</strong> www.wayambalab.com</div>
                              <div className="address">DSHP Registration L 101 / Business Registration PV 4251</div>
                              <div className="confidential">Confidential Medical Laboratory Report</div>
                         </div>

                         <div className="certification-logos">
                              <div className="cert-logo">SLAB<br />⚖</div>
                              <div className="cert-text">External Quality Assurance</div>
                              <div className="cert-logo">BIO-RAD</div>
                              <div className="cert-text">An Eqas Participant<br />BIORAD® SRI LANKA</div>
                         </div>
                    </div>

                    <div className="patient-section">
                         <div className="patient-grid">
                              <div className="patient-field">
                                   <span className="field-label">Patient Name</span>
                                   <span className="field-value">: Mrs. NIROSHANI</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Billing Date</span>
                                   <span className="field-value">: 2023-03-03 / 22:14</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Age</span>
                                   <span className="field-value">: 35 Y &nbsp;&nbsp; Gender : Female</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Sample Collected On</span>
                                   <span className="field-value">: 2023-03-03 / 22:14</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Specimen No</span>
                                   <span className="field-value">: KG627030</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Reporting Date</span>
                                   <span className="field-value">: 2023-03-03 / 22:47</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Ref. No</span>
                                   <span className="field-value">:</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Specimen</span>
                                   <span className="field-value">: Blood</span>
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Institute</span>
                                   <span className="field-value">: DR. K.A.P.R. KURUWITA MEDICAL CENTRE</span>
                              </div>
                              <div className="analyzer-info">
                                   Sysmex XS-500 i (Fully Automated Haematology Analyzer)
                              </div>
                              <div className="patient-field">
                                   <span className="field-label">Requested By</span>
                                   <span className="field-value">: DR. K.A.P.R. KURUWITA</span>
                              </div>
                         </div>
                    </div>

                    <div className="report-title">COMPLETE BLOOD COUNT (CBC)</div>

                    <div className="table-wrapper">
                         <div className="watermark">WDML</div>
                         <table className="results-table">
                              <thead>
                                   <tr>
                                        <th style={{ width: '28%' }}>DESCRIPTION</th>
                                        <th style={{ width: '15%' }}>RESULT</th>
                                        <th style={{ width: '17%' }}>UNITS</th>
                                        <th style={{ width: '20%' }}>REF RANGE</th>
                                        <th style={{ width: '20%' }}>REMARKS</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   <tr>
                                        <td>Hb</td>
                                        <td><strong>11.7</strong></td>
                                        <td>g/dl</td>
                                        <td>12.0 - 15.0</td>
                                        <td className="remark-low">Low</td>
                                   </tr>
                                   <tr>
                                        <td>RBC</td>
                                        <td><strong>4.15</strong></td>
                                        <td>x 10<sup>12</sup>/L</td>
                                        <td>3.8 - 4.8</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr>
                                        <td>PCV</td>
                                        <td><strong>34.7</strong></td>
                                        <td>%</td>
                                        <td>36.0 - 46.0</td>
                                        <td className="remark-low">Low</td>
                                   </tr>
                                   <tr>
                                        <td>MCV</td>
                                        <td><strong>83.6</strong></td>
                                        <td>fl</td>
                                        <td>83.0 - 101.0</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr>
                                        <td>MCH</td>
                                        <td><strong>28.2</strong></td>
                                        <td>Pg</td>
                                        <td>27.0 - 32.0</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr>
                                        <td>MCHC</td>
                                        <td><strong>33.7</strong></td>
                                        <td>g/dl</td>
                                        <td>31.5 - 34.5</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr>
                                        <td>PLATELET COUNT</td>
                                        <td><strong>241</strong></td>
                                        <td>x 10<sup>9</sup>/L</td>
                                        <td>150.0 - 410.0</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr>
                                        <td>RDW (CV)</td>
                                        <td><strong>12.2</strong></td>
                                        <td>%</td>
                                        <td>11.6 - 14.0</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr>
                                        <td>WBC</td>
                                        <td><strong>7.1</strong></td>
                                        <td>x 10<sup>9</sup>/L</td>
                                        <td>4.0 - 10.0</td>
                                        <td className="remark-normal">Normal</td>
                                   </tr>
                                   <tr className="section-header">
                                        <td colSpan={5}>DIFFERENTIAL COUNT</td>
                                   </tr>
                                   <tr>
                                        <td>NEUTROPHILS</td>
                                        <td><strong>52</strong></td>
                                        <td>%</td>
                                        <td>40 - 80</td>
                                        <td></td>
                                   </tr>
                                   <tr>
                                        <td>LYMPHOCYTES</td>
                                        <td><strong>39</strong></td>
                                        <td>%</td>
                                        <td>20 - 40</td>
                                        <td></td>
                                   </tr>
                                   <tr>
                                        <td>EOSINOPHILS</td>
                                        <td><strong>03</strong></td>
                                        <td>%</td>
                                        <td>1 - 6</td>
                                        <td></td>
                                   </tr>
                                   <tr>
                                        <td>MONOCYTES</td>
                                        <td><strong>06</strong></td>
                                        <td>%</td>
                                        <td>2 - 10</td>
                                        <td></td>
                                   </tr>
                                   <tr className="section-header">
                                        <td colSpan={5}>ABSOLUTE COUNT</td>
                                   </tr>
                                   <tr>
                                        <td>NEUTROPHILS.</td>
                                        <td><strong>3.69</strong></td>
                                        <td>x 10<sup>9</sup>/L</td>
                                        <td>2.0 - 7.0</td>
                                        <td></td>
                                   </tr>
                                   <tr>
                                        <td>LYMPHOCYTES.</td>
                                        <td><strong>2.77</strong></td>
                                        <td>x 10<sup>9</sup>/L</td>
                                        <td>1.0 - 3.0</td>
                                        <td></td>
                                   </tr>
                                   <tr>
                                        <td>EOSINOPHILS.</td>
                                        <td><strong>0.21</strong></td>
                                        <td>x 10<sup>9</sup>/L</td>
                                        <td>0.02 - 0.5</td>
                                        <td></td>
                                   </tr>
                                   <tr>
                                        <td>MONOCYTES.</td>
                                        <td><strong>0.43</strong></td>
                                        <td>x 10<sup>9</sup>/L</td>
                                        <td>0.2 - 1.0</td>
                                        <td></td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>

                    <div className="footer-section">
                         <div className="qr-code">
                              <div className="qr-placeholder"></div>
                              <div className="qr-text">Scan to view details<br />Downloaded from Website</div>
                         </div>
                         <div className="signature-section">
                              <div className="signature-line"></div>
                              <div className="signature-name">MLT</div>
                         </div>
                    </div>

                    <div className="doctors-footer">
                         <div className="doctors-grid">
                              <div className="doctor-info">
                                   <div className="doctor-name">Dr Jayantha Edirisooriya</div>
                                   <div>MBBS (Col), MD (Microbiol)</div>
                                   <div>Consultant Microbiologist</div>
                              </div>
                              <div className="doctor-info">
                                   <div className="doctor-name">Prof. Shamika M. Dassanayake</div>
                                   <div>MBBS, FCGP, MD (Col)</div>
                                   <div>Consultant Chemical Pathologist</div>
                              </div>
                              <div className="doctor-info">
                                   <div className="doctor-name">Dr. W.D.P. Vidyarathna</div>
                                   <div>MBBS (Col), MD (Histopath)</div>
                                   <div>Consultant Histopathologist</div>
                              </div>
                              <div className="doctor-info">
                                   <div className="doctor-name">Dr. Manel Rathnayaka</div>
                                   <div>MBBS (Col), MD (Microbiol)</div>
                                   <div>Consultant Microbiologist</div>
                              </div>
                              <div className="doctor-info">
                                   <div className="doctor-name">Dr. W. M. Abeykon</div>
                                   <div>MBBS (Col), MD (Histopath)</div>
                                   <div>Consultant Histopathologist</div>
                              </div>
                              <div className="doctor-info">
                                   <div className="doctor-name">Dr. Ayesha Samarasinghe</div>
                                   <div>MBBS (Col), MD (Chem Path)</div>
                                   <div>Consultant Chemical Pathologist</div>
                              </div>
                         </div>
                         <div className="additional-consultant">
                              <strong>Dr. Gayan A. Abeygunaratne</strong> - MBBS (Col), MS (Surgery) - Consultant Surgeon - Kurunegala
                         </div>
                    </div>
               </div>
          </>
     );
}
