import React from 'react';

const styles = {
     container: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          fontFamily: 'sans-serif',
     },
     header: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
     },
     headerLeft: {
          display: 'flex',
          alignItems: 'center',
     },
     backButton: {
          marginRight: '1rem',
          fontSize: '1.2rem',
          cursor: 'pointer',
     },
     title: {
          fontSize: '1.5rem',
          fontWeight: 'bold',
     },
     patientInfo: {
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '1rem',
     },
     patientName: {
          fontSize: '1.2rem',
          fontWeight: 'bold',
     },
     patientDetails: {
          fontSize: '0.9rem',
          color: '#888',
     },
     testResults: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridGap: '1rem',
          marginBottom: '1rem',
     },
     testResult: {
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '5px',
     },
     testName: {
          fontSize: '1rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
     },
     testDetails: {
          fontSize: '0.9rem',
     },
     actions: {
          display: 'flex',
          justifyContent: 'flex-end',
     },
     button: {
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
     },
};

const PatientDetails = () => {
     return (
          <div style={styles.container}>
               <div style={styles.header}>
                    <div style={styles.headerLeft}>
                         <span style={styles.backButton}>&lt; Back</span>
                         <span style={styles.title}>Critical(0) Bleeding Time (Bt) & Clotting Time (Ct)</span>
                    </div>
                    <div>
                         <span style={styles.text}>With Letterhead</span>
                         <span style={styles.text}>PDF preview</span>
                    </div>
               </div>
               <div style={styles.patientInfo}>
                    <span style={styles.patientName}>Baronson Tiifu (F-27 years)</span>
                    <span style={styles.patientDetails}>Accession Date: 16th Jul 2023 12:01 am</span>
               </div>
               <div style={styles.testResults}>
                    <div style={styles.testResult}>
                         <span style={styles.testName}>Bleeding Time</span>
                         <div style={styles.testDetails}>
                              <span>Value/Unit: 5 Mins</span>
                              <span>Reference Range: 1-5</span>
                              <span>Ordered By: Bal Dute</span>
                              <span>Date: 16th Jul, 2023 12:01 am</span>
                         </div>
                    </div>
                    <div style={styles.testResult}>
                         <span style={styles.testName}>Clotting Time</span>
                         <div style={styles.testDetails}>
                              <span>Value/Unit: 5 Mins</span>
                              <span>Reference Range: 3-10</span>
                              <span>Ordered By: Billed fly</span>
                              <span>Bill ID: ID</span>
                         </div>
                    </div>
               </div>
               <div style={styles.testResults}>
                    <div style={styles.testResult}>
                         <span style={styles.testName}>Culture Sensitivity-Blood</span>
                         <div style={styles.testDetails}>
                              <span>Value/Unit: Pending</span>
                              <span>Reference Range: N/A</span>
                              <span>Ordered By: Bal Dute</span>
                              <span>Date: 16th Jul, 2023 12:01 am</span>
                         </div>
                    </div>
                    {/* Add more test results here as needed */}
               </div>
               <div style={styles.actions}>
                    <button style={styles.button}>Print</button>
               </div>
          </div>
     );
};

export default PatientDetails;

