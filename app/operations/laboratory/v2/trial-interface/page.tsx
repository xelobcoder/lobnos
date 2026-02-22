'use client'
import React, { useState, useEffect } from 'react'
import { customFetch } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';

export default function OperationsLaboratoryMainComponentV2() {
     const { applicationsettings } = useApplicationSettings();
     const { branchid } = applicationsettings;

     const [dates, setDates] = useState<string[]>([]);
     const [selectedDate, setSelectedDate] = useState<string>("");
     const [patients, setPatients] = useState<any[]>([]);
     const [selectedPatient, setSelectedPatient] = useState<any>(null);
     const [tests, setTests] = useState<any[]>([]);
     const [loadingPatients, setLoadingPatients] = useState(false);
     const [loadingTests, setLoadingTests] = useState(false);
     const [useDummyData, setUseDummyData] = useState(false);
     const [dateSelectionMode, setDateSelectionMode] = useState<'quick' | 'custom' | 'range'>('quick');
     const [customSingleDate, setCustomSingleDate] = useState<string>("");
     const [dateRangeFrom, setDateRangeFrom] = useState<string>("");
     const [dateRangeTo, setDateRangeTo] = useState<string>("");
     const [patientSearch, setPatientSearch] = useState<string>("");

     // Dummy patients data
     const dummyPatients = [
          { patientid: 1, firstname: "John", lastname: "Doe", fullpatientid: "PAT-001", age: 45, gender: "M" },
          { patientid: 2, firstname: "Mary", lastname: "Johnson", fullpatientid: "PAT-002", age: 32, gender: "F" },
          { patientid: 3, firstname: "James", lastname: "Smith", fullpatientid: "PAT-003", age: 58, gender: "M" },
          { patientid: 4, firstname: "Sarah", lastname: "Williams", fullpatientid: "PAT-004", age: 27, gender: "F" },
          { patientid: 11, firstname: "Michael", lastname: "Brown", fullpatientid: "PAT-0011", age: 39, gender: "M" },
          { patientid: 6, firstname: "Emma", lastname: "Davis", fullpatientid: "PAT-006", age: 51, gender: "F" },
          { patientid: 1, firstname: "John", lastname: "Doe", fullpatientid: "PAT-001", age: 45, gender: "M" },
          { patientid: 2, firstname: "Mary", lastname: "Johnson", fullpatientid: "PAT-002", age: 32, gender: "F" },
          { patientid: 3, firstname: "James", lastname: "Smith", fullpatientid: "PAT-003", age: 58, gender: "M" },
          { patientid: 4, firstname: "Sarah", lastname: "Williams", fullpatientid: "PAT-004", age: 27, gender: "F" },
          { patientid: 5, firstname: "Michael", lastname: "Brown", fullpatientid: "PAT-005", age: 39, gender: "M" },
          { patientid: 6, firstname: "Emma", lastname: "Davis", fullpatientid: "PAT-006", age: 51, gender: "F" },
          { patientid: 1, firstname: "John", lastname: "Doe", fullpatientid: "PAT-001", age: 45, gender: "M" },
          { patientid: 2, firstname: "Mary", lastname: "Johnson", fullpatientid: "PAT-002", age: 32, gender: "F" },
          { patientid: 3, firstname: "James", lastname: "Smith", fullpatientid: "PAT-003", age: 58, gender: "M" },
          { patientid: 4, firstname: "Sarah", lastname: "Williams", fullpatientid: "PAT-004", age: 27, gender: "F" },
          { patientid: 5, firstname: "Michael", lastname: "Brown", fullpatientid: "PAT-005", age: 39, gender: "M" },
          { patientid: 6, firstname: "Emma", lastname: "Davis", fullpatientid: "PAT-006", age: 51, gender: "F" },
          { patientid: 1, firstname: "John", lastname: "Doe", fullpatientid: "PAT-001", age: 45, gender: "M" },
          { patientid: 2, firstname: "Mary", lastname: "Johnson", fullpatientid: "PAT-002", age: 32, gender: "F" },
          { patientid: 3, firstname: "James", lastname: "Smith", fullpatientid: "PAT-003", age: 58, gender: "M" },
          { patientid: 4, firstname: "Sarah", lastname: "Williams", fullpatientid: "PAT-004", age: 27, gender: "F" },
          { patientid: 5, firstname: "Michael", lastname: "Brown", fullpatientid: "PAT-005", age: 39, gender: "M" },
          { patientid: 6, firstname: "Emma", lastname: "Davis", fullpatientid: "PAT-006", age: 51, gender: "F" },
     ];

     // Dummy tests data
     const dummyTests: Record<number, any[]> = {
          1: [
               { sampleid: "S-001", testname: "Complete Blood Count", status: "collected", is_collected: true, is_validated: false, is_processed: false, result_entered: false, is_completed: false, test_panel: "CBC" },
               { sampleid: "S-002", testname: "Blood Sugar", status: "validated", is_collected: true, is_validated: true, is_processed: false, result_entered: false, is_completed: false, test_panel: "Glucose" },
          ],
          2: [
               { sampleid: "S-003", testname: "Lipid Panel", status: "processed", is_collected: true, is_validated: true, is_processed: true, result_entered: false, is_completed: false, test_panel: "Lipids" },
               { sampleid: "S-004", testname: "Liver Function", status: "result_entered", is_collected: true, is_validated: true, is_processed: true, result_entered: true, is_completed: false, test_panel: "LFT" },
          ],
          3: [
               { sampleid: "S-005", testname: "Kidney Function", status: "completed", is_collected: true, is_validated: true, is_processed: true, result_entered: true, is_completed: true, test_panel: "RFT" },
          ],
          4: [
               { sampleid: "S-006", testname: "Thyroid Profile", status: "collected", is_collected: true, is_validated: false, is_processed: false, result_entered: false, is_completed: false, test_panel: "TSH" },
          ],
          5: [
               { sampleid: "S-007", testname: "COVID-19 Test", status: "validated", is_collected: true, is_validated: true, is_processed: false, result_entered: false, is_completed: false, test_panel: "COVID" },
               { sampleid: "S-008", testname: "Urinalysis", status: "pending", is_collected: false, is_validated: false, is_processed: false, result_entered: false, is_completed: false, test_panel: "UA" },
          ],
          6: [
               { sampleid: "S-009", testname: "Chest X-Ray", status: "completed", is_collected: true, is_validated: true, is_processed: true, result_entered: true, is_completed: true, test_panel: "IMG" },
          ],
     };

     // Generate dates: today and 10 days behind
     useEffect(() => {
          const dateArray: string[] = [];
          for (let i = 0; i < 11; i++) {
               const date = new Date();
               date.setDate(date.getDate() - i);
               dateArray.push(date.toISOString().split('T')[0]);
          }
          setDates(dateArray);
          if (dateArray.length > 0) {
               setSelectedDate(dateArray[0]);
          }
     }, []);

     // Fetch patients when date is selected
     useEffect(() => {
          if (selectedDate) {
               setLoadingPatients(true);

               // Check if it's a date range
               if (selectedDate.includes('_')) {
                    const [fromDate, toDate] = selectedDate.split('_');
                    // For date range, we'll fetch for each date and combine results
                    // For now, using single date approach - you can enhance this
                    customFetch(`registrations?registrationdate=${fromDate}&branchid=${branchid}`)
                         .then((data) => {
                              const patientData = Array.isArray(data) ? data : data?.result || [];
                              if (patientData.length > 0) {
                                   setPatients(patientData);
                                   setUseDummyData(false);
                              } else {
                                   setPatients(dummyPatients);
                                   setUseDummyData(true);
                              }
                              setSelectedPatient(null);
                              setTests([]);
                         })
                         .catch(() => {
                              setPatients(dummyPatients);
                              setUseDummyData(true);
                         })
                         .finally(() => setLoadingPatients(false));
               } else {
                    customFetch(`registrations?registrationdate=${selectedDate}&branchid=${branchid}`)
                         .then((data) => {
                              const patientData = Array.isArray(data) ? data : data?.result || [];
                              if (patientData.length > 0) {
                                   setPatients(patientData);
                                   setUseDummyData(false);
                              } else {
                                   setPatients(dummyPatients);
                                   setUseDummyData(true);
                              }
                              setSelectedPatient(null);
                              setTests([]);
                         })
                         .catch(() => {
                              setPatients(dummyPatients);
                              setUseDummyData(true);
                         })
                         .finally(() => setLoadingPatients(false));
               }
          }
     }, [selectedDate, branchid]);

     // Fetch tests when patient is selected
     useEffect(() => {
          if (selectedPatient?.patientid) {
               setLoadingTests(true);
               if (useDummyData) {
                    // Use dummy tests data
                    setTests(dummyTests[selectedPatient.patientid] || []);
                    setLoadingTests(false);
               } else {
                    customFetch(`samples?patientid=${selectedPatient.patientid}`)
                         .then((data) => {
                              const testData = Array.isArray(data) ? data : data?.result || [];
                              if (testData.length > 0) {
                                   setTests(testData);
                              } else {
                                   // Fallback to dummy data if no real data
                                   setTests(dummyTests[selectedPatient.patientid] || []);
                              }
                         })
                         .catch(() => {
                              // Use dummy data on error
                              setTests(dummyTests[selectedPatient.patientid] || []);
                         })
                         .finally(() => setLoadingTests(false));
               }
          }
     }, [selectedPatient, useDummyData]);

     const formatDate = (dateStr: string) => {
          const date = new Date(dateStr + 'T00:00:00');
          return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
     };

     const getStatusBadge = (status: string) => {
          const statusStyle: Record<string, { bg: string; color: string }> = {
               'collected': { bg: '#28a745', color: '#fff' },
               'validated': { bg: '#0dcaf0', color: '#000' },
               'processed': { bg: '#ffc107', color: '#000' },
               'result_entered': { bg: '#00a3e0', color: '#fff' },
               'completed': { bg: '#6f42c1', color: '#fff' },
               'pending': { bg: '#6c757d', color: '#fff' },
          };
          const style = statusStyle[status?.toLowerCase()] || { bg: '#e9ecef', color: '#000' };
          return (
               <span style={{ padding: '4px 8px', backgroundColor: style.bg, color: style.color, borderRadius: '3px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block' }}>
                    {status || 'Unknown'}
               </span>
          );
     };

     return (
          <div style={{ display: 'flex', height: '100vh', gap: '0', backgroundColor: '#fff', margin: 0, padding: 0 }}>

               {/* Column 1: Dates */}
               <div style={{ width: '15%', borderRight: '1px solid #ddd', padding: '16px', backgroundColor: '#f9f9f9' }}>
                    <h6 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>Select Date</h6>
                    {/* Mode Selection Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                         <button
                              onClick={() => setDateSelectionMode('quick')}
                              style={{
                                   flex: 1,
                                   padding: '6px',
                                   fontSize: '0.75rem',
                                   fontWeight: 'bold',
                                   border: dateSelectionMode === 'quick' ? '2px solid #0066cc' : '1px solid #bbb',
                                   backgroundColor: dateSelectionMode === 'quick' ? '#e6f0ff' : '#fff',
                                   borderRadius: '3px',
                                   cursor: 'pointer',
                                   color: '#333',
                              }}
                         >
                              Quick
                         </button>
                         <button
                              onClick={() => setDateSelectionMode('custom')}
                              style={{
                                   flex: 1,
                                   padding: '6px',
                                   fontSize: '0.75rem',
                                   fontWeight: 'bold',
                                   border: dateSelectionMode === 'custom' ? '2px solid #0066cc' : '1px solid #bbb',
                                   backgroundColor: dateSelectionMode === 'custom' ? '#e6f0ff' : '#fff',
                                   borderRadius: '3px',
                                   cursor: 'pointer',
                                   color: '#333',
                              }}
                         >
                              Custom
                         </button>
                         <button
                              onClick={() => setDateSelectionMode('range')}
                              style={{
                                   flex: 1,
                                   padding: '6px',
                                   fontSize: '0.75rem',
                                   fontWeight: 'bold',
                                   border: dateSelectionMode === 'range' ? '2px solid #0066cc' : '1px solid #bbb',
                                   backgroundColor: dateSelectionMode === 'range' ? '#e6f0ff' : '#fff',
                                   borderRadius: '3px',
                                   cursor: 'pointer',
                                   color: '#333',
                              }}
                         >
                              Range
                         </button>
                    </div>

                    {/* Quick Select - Box */}
                    {dateSelectionMode === 'quick' && (
                         <div style={{ marginTop: '12px', border: '1px solid #bbb', borderRadius: '4px', backgroundColor: '#fff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                              {dates.map((date) => (
                                   <div
                                        key={date}
                                        onClick={() => setSelectedDate(date)}
                                        style={{
                                             padding: '6px 8px',
                                             backgroundColor: selectedDate === date ? '#0066cc' : '#fff',
                                             color: selectedDate === date ? '#fff' : '#000',
                                             cursor: 'pointer',
                                             fontSize: '0.85rem',
                                             userSelect: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                             if (selectedDate !== date) {
                                                  e.currentTarget.style.backgroundColor = '#4d94ff';
                                                  e.currentTarget.style.color = '#fff';
                                             }
                                        }}
                                        onMouseLeave={(e) => {
                                             if (selectedDate !== date) {
                                                  e.currentTarget.style.backgroundColor = '#fff';
                                                  e.currentTarget.style.color = '#000';
                                             }
                                        }}
                                   >
                                        {formatDate(date)}
                                   </div>
                              ))}
                         </div>
                    )}

                    {/* Custom Single Date Input */}
                    {dateSelectionMode === 'custom' && (
                         <div style={{ marginTop: '12px' }}>
                              <input
                                   type="date"
                                   value={customSingleDate}
                                   onChange={(e) => {
                                        setCustomSingleDate(e.target.value);
                                        setSelectedDate(e.target.value);
                                   }}
                                   style={{ width: '100%', padding: '8px', border: '1px solid #bbb', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
                              />
                              {customSingleDate && (
                                   <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                        Selected: {formatDate(customSingleDate)}
                                   </p>
                              )}
                         </div>
                    )}

                    {/* Date Range Selection */}
                    {dateSelectionMode === 'range' && (
                         <div style={{ marginTop: '12px' }}>
                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>
                                   From:
                              </label>
                              <input
                                   type="date"
                                   value={dateRangeFrom}
                                   onChange={(e) => setDateRangeFrom(e.target.value)}
                                   style={{ width: '100%', padding: '8px', border: '1px solid #bbb', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
                              />

                              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>
                                   To:
                              </label>
                              <input
                                   type="date"
                                   value={dateRangeTo}
                                   onChange={(e) => setDateRangeTo(e.target.value)}
                                   style={{ width: '100%', padding: '8px', border: '1px solid #bbb', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit' }}
                              />

                              {dateRangeFrom && dateRangeTo && (
                                   <button
                                        onClick={() => setSelectedDate(`${dateRangeFrom}_${dateRangeTo}`)}
                                        style={{
                                             width: '100%',
                                             padding: '8px',
                                             backgroundColor: '#0066cc',
                                             color: '#fff',
                                             border: 'none',
                                             borderRadius: '4px',
                                             fontSize: '0.85rem',
                                             fontWeight: 'bold',
                                             cursor: 'pointer',
                                        }}
                                   >
                                        Apply Range
                                   </button>
                              )}

                              {dateRangeFrom && dateRangeTo && (
                                   <p style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {formatDate(dateRangeFrom)} to {formatDate(dateRangeTo)}
                                   </p>
                              )}
                         </div>
                    )}
               </div>

               {/* Column 2: Patients */}
               <div style={{ width: '25%', borderRight: '1px solid #ddd', padding: '16px', backgroundColor: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h6 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, color: '#333' }}>Patients</h6>
                         {useDummyData && <span style={{ fontSize: '0.7rem', backgroundColor: '#ffc107', color: '#000', padding: '2px 4px', borderRadius: '2px', fontWeight: 'bold' }}>Demo</span>}
                    </div>
                    {loadingPatients ? (
                         <p style={{ fontSize: '0.85rem', color: '#999' }}>Loading...</p>
                    ) : patients.length === 0 ? (
                         <p style={{ fontSize: '0.85rem', color: '#999' }}>No patients registered</p>
                    ) : (
                         <>
                              <input
                                   type="text"
                                   placeholder="Search patient..."
                                   value={patientSearch}
                                   onChange={(e) => setPatientSearch(e.target.value)}
                                   style={{ width: '100%', padding: '8px', border: '1px solid #bbb', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'inherit', marginBottom: '8px' }}
                              />
                              <div style={{ border: '1px solid #bbb', borderRadius: '4px', backgroundColor: '#fff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                                   {patients
                                        .filter((patient) =>
                                             `${patient.firstname} ${patient.lastname} ${patient.fullpatientid}`.toLowerCase().includes(patientSearch.toLowerCase())
                                        )
                                        .map((patient) => (
                                             <div
                                                  key={patient.patientid}
                                                  onClick={() => setSelectedPatient(patient)}
                                                  style={{
                                                       padding: '6px 8px',
                                                       backgroundColor: selectedPatient?.patientid === patient.patientid ? '#0066cc' : '#fff',
                                                       color: selectedPatient?.patientid === patient.patientid ? '#fff' : '#000',
                                                       cursor: 'pointer',
                                                       fontSize: '0.85rem',
                                                       userSelect: 'none',
                                                  }}
                                                  onMouseEnter={(e) => {
                                                       if (selectedPatient?.patientid !== patient.patientid) {
                                                            e.currentTarget.style.backgroundColor = '#4d94ff';
                                                            e.currentTarget.style.color = '#fff';
                                                       }
                                                  }}
                                                  onMouseLeave={(e) => {
                                                       if (selectedPatient?.patientid !== patient.patientid) {
                                                            e.currentTarget.style.backgroundColor = '#fff';
                                                            e.currentTarget.style.color = '#000';
                                                       }
                                                  }}
                                             >
                                                  {patient.firstname} {patient.lastname} ({patient.fullpatientid})
                                             </div>
                                        ))}
                              </div>
                         </>
                    )}
               </div>

               {/* Column 3: Tests/Samples */}
               <div style={{ flex: 1, padding: '16px' }}>
                    {!selectedPatient ? (
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                              <p style={{ fontSize: '0.9rem' }}>Select a patient to view tests</p>
                         </div>
                    ) : (
                         <div>
                              <div style={{ paddingBottom: '12px', borderBottom: '2px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                   <div>
                                        <h5 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
                                             {selectedPatient.firstname} {selectedPatient.lastname}
                                        </h5>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                                             ID: {selectedPatient.fullpatientid}
                                        </p>
                                   </div>
                                   {useDummyData && <span style={{ fontSize: '0.7rem', backgroundColor: '#ffc107', color: '#000', padding: '2px 4px', borderRadius: '2px', fontWeight: 'bold' }}>Demo</span>}
                              </div>

                              {loadingTests ? (
                                   <p style={{ fontSize: '0.85rem', color: '#999' }}>Loading tests...</p>
                              ) : tests.length === 0 ? (
                                   <p style={{ fontSize: '0.85rem', color: '#999' }}>No tests registered</p>
                              ) : (
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {tests.map((test, idx) => (
                                             <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', backgroundColor: '#fafafa' }}>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                       <div>
                                                            <h6 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
                                                                 {test.testname || test.test_name || 'Test'}
                                                            </h6>
                                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                                                                 Sample ID: {test.sampleid || test.sample_id || 'N/A'}
                                                            </p>
                                                       </div>
                                                  </div>

                                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                                                       <div>
                                                            <span style={{ fontWeight: 'bold', color: '#555' }}>Status: </span>
                                                            {getStatusBadge(test.status || test.sample_status)}
                                                       </div>
                                                       <div>
                                                            <span style={{ fontWeight: 'bold', color: '#555' }}>Collection: </span>
                                                            {test.is_collected ? 'Yes' : 'No'}
                                                       </div>
                                                       <div>
                                                            <span style={{ fontWeight: 'bold', color: '#555' }}>Validated: </span>
                                                            {test.is_validated ? 'Yes' : 'No'}
                                                       </div>
                                                       <div>
                                                            <span style={{ fontWeight: 'bold', color: '#555' }}>Processed: </span>
                                                            {test.is_processed ? 'Yes' : 'No'}
                                                       </div>
                                                       <div>
                                                            <span style={{ fontWeight: 'bold', color: '#555' }}>Result Entered: </span>
                                                            {test.result_entered ? 'Yes' : 'No'}
                                                       </div>
                                                       <div>
                                                            <span style={{ fontWeight: 'bold', color: '#555' }}>Completed: </span>
                                                            {test.is_completed ? 'Yes' : 'No'}
                                                       </div>
                                                  </div>

                                                  {test.test_panel && (
                                                       <div style={{ paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '0.8rem', color: '#666' }}>
                                                            Panel: {test.test_panel}
                                                       </div>
                                                  )}
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </div>
                    )}
               </div>
          </div>
     );
}
