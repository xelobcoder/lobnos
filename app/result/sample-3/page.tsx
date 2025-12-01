"use client";

import React from 'react';

export default function AsterLabsReport() {
     return (
          <>
               <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family:"times new roman", times, serif;
        }

        body {
          background: #fff;
        }

        .container {
          margin: 0 auto;
          background: #fff;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 2px solid #000;
        }

        .logo-section {
          flex: 1;
        }

        .logo-text {
          font-size: 32px;
          font-weight: bold;
          color: #0066cc;
        }

        .logo-labs {
          font-size: 24px;
          font-weight: bold;
          color: #00cc99;
        }

        .tagline {
          font-size: 12px;
          color: #666;
          font-style: italic;
          margin-top: 5px;
        }

        .cert-logo {
          width: 60px;
          height: 60px;
          border: 2px solid #0066cc;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .title-section {
          text-align: center;
          padding: 15px;
          background: #f5f5f5;
          border-bottom: 2px solid #000;
        }

        .report-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .patient-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 15px 20px;
          gap: 8px;
          font-size: 11px;
          border-bottom: 2px solid #000;
        }

        .info-row {
          display: flex;
          gap: 10px;
        }

        .info-label {
          font-weight: bold;
          min-width: 100px;
        }

        .info-value {
          flex: 1;
        }

        .barcode-section {
          position: absolute;
          right: 20px;
          top: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .barcode {
          width: 80px;
          height: 80px;
          background: repeating-linear-gradient(
            90deg,
            #000,
            #000 2px,
            #fff 2px,
            #fff 4px
          );
          border: 1px solid #000;
          margin-bottom: 5px;
        }

        .section-title {
          background: #e0e0e0;
          padding: 10px 20px;
          font-weight: bold;
          font-size: 14px;
          text-align: center;
        }

        .test-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .test-table thead {
          background: #f0f0f0;
        }

        .test-table th {
          padding: 10px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #ccc;
        }

        .test-table td {
          padding: 8px 10px;
          border: 1px solid #ccc;
        }

        .test-category {
          font-weight: bold;
          background: #f9f9f9;
        }

        .test-name {
          padding-left: 20px;
        }

        .test-method {
          font-size: 9px;
          color: #666;
          font-style: italic;
        }

        .footer {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 2px solid #000;
        }

        .verification {
          font-size: 10px;
        }

        .signature-section {
          text-align: right;
        }

        .signature-line {
          width: 150px;
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
        }

        .doctor-name {
          font-weight: bold;
          font-size: 12px;
        }

        .doctor-title {
          font-size: 10px;
          color: #666;
        }

        .address-footer {
          padding: 15px 20px;
          background: #f5f5f5;
          font-size: 9px;
          text-align: center;
          line-height: 1.5;
          border-top: 1px solid #ccc;
        }

        .page-number {
          text-align: right;
          padding: 5px 20px;
          font-size: 10px;
        }
      `}</style>
               <div className="container">
                    <div className="header">
                         <div className="logo-section">
                              <div>
                                   <span className="logo-text">Aster </span>
                                   <span className="logo-labs">LABS</span>
                              </div>
                              <div className="tagline">We'll Treat You Well</div>
                         </div>
                         <div className="cert-logo">🏥</div>
                    </div>

                    <div className="title-section">
                         <div className="report-title">TEST REPORT</div>
                    </div>

                    <div style={{ position: 'relative' }}>
                         <div className="patient-info-grid">
                              <div className="info-row">
                                   <span className="info-label">Lab. Id</span>
                                   <span className="info-value">: PM11245643</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Hosp. UHID</span>
                                   <span className="info-value">: 110301956</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Name</span>
                                   <span className="info-value">: MS. RANI BHRGOU</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Reg. Date</span>
                                   <span className="info-value">: 29-Jul-2022 / 16:15 PM</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Age/Gender</span>
                                   <span className="info-value">: 31Y / Female</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Collection</span>
                                   <span className="info-value">: 29-Jul-2022 / 17:35 PM</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Collected At</span>
                                   <span className="info-value">: Aster Prime Hospital</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Received</span>
                                   <span className="info-value">: 29-Jul-2022 / 17:35 PM</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Referral Dr</span>
                                   <span className="info-value">: Dr. Tanuja Paspuru</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Report Status</span>
                                   <span className="info-value">: Final</span>
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                   <div className="info-row">
                                        <span className="info-label"></span>
                                        <span className="info-value"></span>
                                   </div>
                              </div>
                              <div className="info-row">
                                   <span className="info-label"></span>
                                   <span className="info-value"></span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Report</span>
                                   <span className="info-value">: 29-Jul-2022 / 17:40 PM</span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label"></span>
                                   <span className="info-value"></span>
                              </div>
                              <div className="info-row">
                                   <span className="info-label">Print</span>
                                   <span className="info-value">:</span>
                              </div>
                         </div>
                         <div className="barcode-section">
                              <div className="barcode"></div>
                         </div>
                    </div>

                    <div className="section-title">Clinical Pathology</div>

                    <table className="test-table">
                         <thead>
                              <tr>
                                   <th>Investigation</th>
                                   <th>Result</th>
                                   <th>Unit</th>
                                   <th>Biological Ref. Interval</th>
                                   <th>Specimen</th>
                              </tr>
                         </thead>
                         <tbody>
                              <tr className="test-category">
                                   <td colSpan={5}>URINE ROUTINE EXAMINATION</td>
                              </tr>
                              <tr className="test-category">
                                   <td colSpan={5}>PHYSICAL EXAMINATION</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Volume (ml)</div>
                                        <div className="test-method">Method/Visual</div>
                                   </td>
                                   <td>15</td>
                                   <td>ml</td>
                                   <td></td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Color</div>
                                        <div className="test-method">Method/Visual</div>
                                   </td>
                                   <td>Pale yellow</td>
                                   <td></td>
                                   <td></td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Transparency</div>
                                        <div className="test-method">Method/Visual</div>
                                   </td>
                                   <td>Clear</td>
                                   <td></td>
                                   <td>Clear</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr className="test-category">
                                   <td colSpan={5}>CHEMICAL EXAMINATION</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>pH</div>
                                        <div className="test-method">Method/Litmus Indicator</div>
                                   </td>
                                   <td>7.0</td>
                                   <td></td>
                                   <td>5.0-8.0</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Specific Gravity Urine</div>
                                        <div className="test-method">Method/Pad Indicator</div>
                                   </td>
                                   <td>1.010</td>
                                   <td></td>
                                   <td>1.000-1.030</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Proteins</div>
                                        <div className="test-method">Method/Protein: error of Indicator</div>
                                        <div className="test-method">due to Alkaline pH/Drugs</div>
                                   </td>
                                   <td>Nil</td>
                                   <td></td>
                                   <td>Absent</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Glucose</div>
                                        <div className="test-method">Method/Glucose peroxidase</div>
                                   </td>
                                   <td>Nil</td>
                                   <td></td>
                                   <td>Absent</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Urobilinogen</div>
                                        <div className="test-method">Method/Pad Azo coupling reaction</div>
                                   </td>
                                   <td>0.2</td>
                                   <td>mg/dl</td>
                                   <td>0.2-1.0</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Ketones</div>
                                        <div className="test-method">Method/Nitroprusside & Acetoacetic acid</div>
                                   </td>
                                   <td>Negative</td>
                                   <td></td>
                                   <td>Negative</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>leukocytes</div>
                                        <div className="test-method">Method/Esterase</div>
                                   </td>
                                   <td>Negative</td>
                                   <td></td>
                                   <td>Negative</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Nitrite</div>
                                        <div className="test-method">Method/Azo coupling reaction</div>
                                   </td>
                                   <td>Negative</td>
                                   <td></td>
                                   <td>Negative</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Blood</div>
                                        <div className="test-method">Method/Haemostix</div>
                                   </td>
                                   <td>Negative</td>
                                   <td></td>
                                   <td>Negative</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Nitrite</div>
                                        <div className="test-method">Method/Sulfanilic c 1</div>
                                   </td>
                                   <td>Negative</td>
                                   <td></td>
                                   <td>Negative</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr className="test-category">
                                   <td colSpan={5}>MICROSCOPIC EXAMINATION</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Pus cells</div>
                                        <div className="test-method">Method/Microscopy</div>
                                   </td>
                                   <td>2-4</td>
                                   <td>/hpf</td>
                                   <td>0-3</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Epithelial cells</div>
                                        <div className="test-method">Method/Microscopy</div>
                                   </td>
                                   <td>2-3</td>
                                   <td>/hpf</td>
                                   <td>0-5</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>RBC</div>
                                        <div className="test-method">Method/Microscopy</div>
                                   </td>
                                   <td>Nil</td>
                                   <td>/hpf</td>
                                   <td>absent</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Casts</div>
                                        <div className="test-method">Method/Microscopy</div>
                                   </td>
                                   <td>Nil</td>
                                   <td></td>
                                   <td>absent</td>
                                   <td>Spot urine</td>
                              </tr>
                              <tr>
                                   <td className="test-name">
                                        <div>Crystals</div>
                                        <div className="test-method">Method/Microscopy</div>
                                   </td>
                                   <td>Nil</td>
                                   <td></td>
                                   <td>Absent</td>
                                   <td>Spot urine</td>
                              </tr>
                         </tbody>
                    </table>

                    <div className="footer">
                         <div className="verification">
                              <strong>Verified By:</strong> 127032
                         </div>
                         <div className="signature-section">
                              <div className="signature-line"></div>
                              <div style={{ fontStyle: 'italic', fontSize: '14px', marginBottom: '5px' }}>Ramadevi</div>
                              <div className="doctor-name">Dr. S. Rama Devi</div>
                              <div className="doctor-title">Sr. Consultant</div>
                              <div className="doctor-title">Pathologist</div>
                         </div>
                    </div>

                    <div className="address-footer">
                         <strong>Aster Labs, Aster prime Hospital, Plot No: 2 & 4, Opp. Passport Seva Kendra, Ameerpet, Hyderabad-500036<br />
                              Telangana, India. T +91-40-44569999/45594959</strong>
                    </div>

                    <div className="page-number">Page 1 Of 2</div>
               </div>
          </>
     );
}
