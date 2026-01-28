'use client'
import { RiPlayFill, RiRefreshFill, RiSettings2Fill } from '@remixicon/react'
import React from 'react'
import { Card, CardBody, CardHeader } from 'react-bootstrap'
import style from '../../../../../styles/SmsTemplateList.module.css'

export default function OperationsModuleVersionTwo() {
     const [activePatient, setActivePatient] = React.useState<number | null>(null);
     const [activeStudy, setActiveStudy] = React.useState<number | null>(null);
     const [activeSeries, setActiveSeries] = React.useState<number | null>(null);
     const [activeImage, setActiveImage] = React.useState<number | null>(null);

     // Sample data for patients (based on screenshot, with calculated ages where possible)
     const patients = [
          { id: 1, name: 'ALHASSAN, ANIFA', gender: 'F', age: '', telephone: '059601867' },
          { id: 2, name: 'BIMOM, SEIDU', gender: 'M', age: '', telephone: '0552339430' },
          { id: 3, name: 'GIDISU, BEATRICE', gender: 'F', age: '', telephone: '' },
          { id: 4, name: 'TIIFU, HAMZA', gender: 'F', age: '33', telephone: '' }, // Age calculated from 1993/01/01 to 2026
     ];

     // Sample data for sampling/studies (conditional on active patient)
     const studies = [
          { id: 1, date: '2026/01/20 12:48.55', accession: '2026/01/20 12:36:31', description: '', referring: '', diagnosed: 'N' },
     ];

     // Sample data for series/records
     const series = [
          { id: 1, number: '1', modality: 'OT', description: '', bodypart: '', size: '1' },
          { id: 2, number: '2', modality: 'OT', description: '', bodypart: '', size: '1' },
          { id: 3, number: '1', modality: 'DX', description: '', bodypart: 'CHEST', size: '1' },
          { id: 4, number: '2', modality: 'DX', description: '', bodypart: 'CHEST', size: '1' },
     ];

     // Sample data for images/records
     const images = [
          { id: 1, number: '1', date: '2026/01/20 12:43:54' },
          { id: 2, number: '1', date: '2026/01/20 12:43:48' },
          { id: 3, number: '1', date: '' },
          { id: 4, number: '1', date: '' },
     ];

     return (
          <div style={{ display: "grid", gridTemplateColumns: "50% 50%", gridGap: "10px", padding: "10px", backgroundColor: "#f8f9fa" }}>
               <Card style={{ border: "1px solid #dee2e6", borderRadius: "5px", overflow: "hidden" }}>
                    <CardHeader style={{ backgroundColor: "#c9e0fc" }}>
                         <div className='d-flex justify-content-between align-items-center'>
                              <div style={{ fontWeight: "bold" }}>
                                   Patients Record({patients.length})
                              </div>
                              <div className='d-flex'>
                                   <input type="date" className="form-control form-control-sm" style={{ width: "120px" }} />
                                   <input type="date" className="form-control form-control-sm mx-1" style={{ width: "120px" }} />
                              </div>
                              <div className='d-flex'>
                                   <RiRefreshFill style={{ cursor: "pointer", marginRight: "10px" }} />
                                   <RiSettings2Fill style={{ cursor: "pointer" }} />
                              </div>
                         </div>
                    </CardHeader>
                    <CardBody style={{ padding: "0" }}>
                         <div style={{ overflowX: "auto" }}>
                              <table >
                                   <thead style={{ backgroundColor: "#c9e0fc" }}>
                                        <tr>
                                             <th style={{ width: "80px" }}>Action</th>
                                             <th>Name</th>
                                             <th style={{ width: "120px" }}>Gender</th>
                                             <th style={{ width: "80px" }}>Age</th>
                                             <th>Telephone Number</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        <tr>
                                             <td></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Name" /></td>
                                             <td>
                                                  <select className="form-control form-control-sm">
                                                       <option value="">Select Gender</option>
                                                       <option value="Male">Male</option>
                                                       <option value="Female">Female</option>
                                                  </select>
                                             </td>
                                             <td><input type="number" className="form-control form-control-sm" placeholder="Age" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Telephone Number" /></td>
                                        </tr>
                                        {patients.map((patient) => (
                                             <tr key={patient.id} style={{ backgroundColor: activePatient === patient.id ? "#ffc107" : "inherit" }}>
                                                  <td><RiPlayFill style={{ cursor: "pointer" }} onClick={() => setActivePatient(patient.id)} /></td>
                                                  <td>{patient.name}</td>
                                                  <td>{patient.gender}</td>
                                                  <td>{patient.age}</td>
                                                  <td>{patient.telephone}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </CardBody>
               </Card>
               <Card style={{ border: "1px solid #dee2e6", borderRadius: "5px", overflow: "hidden" }}>
                    <CardHeader style={{ backgroundColor: "#c9e0fc" }}>
                         <div className='d-flex justify-content-between align-items-center'>
                              <div style={{ fontWeight: "bold" }}>
                                   Sampling({studies.length})
                              </div>
                              <div className='d-flex'>
                                   <RiRefreshFill style={{ cursor: "pointer", marginRight: "10px" }} />
                                   <RiSettings2Fill style={{ cursor: "pointer" }} />
                              </div>
                         </div>
                    </CardHeader>
                    <CardBody style={{ padding: "0" }}>
                         <div style={{ overflowX: "auto" }}>
                              <table >
                                   <thead style={{ backgroundColor: "#c9e0fc" }}>
                                        <tr>
                                             <th style={{ width: "80px" }}>Action</th>
                                             <th>Date</th>
                                             <th>Accession Number</th>
                                             <th>Description</th>
                                             <th>Referring Physician</th>
                                             <th style={{ width: "100px" }}>Diagnosed</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        <tr>
                                             <td></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Date" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Accession" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Description" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Physician" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Diagnosed" /></td>
                                        </tr>
                                        {studies.map((study) => (
                                             <tr key={study.id} style={{ backgroundColor: activeStudy === study.id ? "#ffc107" : "inherit", display: activePatient ? "table-row" : "none" }}>
                                                  <td><RiPlayFill style={{ cursor: "pointer" }} onClick={() => setActiveStudy(study.id)} /></td>
                                                  <td>{study.date}</td>
                                                  <td>{study.accession}</td>
                                                  <td>{study.description}</td>
                                                  <td>{study.referring}</td>
                                                  <td>{study.diagnosed}</td>
                                             </tr>
                                        ))}
                                        {!activePatient && (
                                             <tr>
                                                  <td colSpan={6} style={{ textAlign: "center" }}>Select a patient to view studies</td>
                                             </tr>
                                        )}
                                   </tbody>
                              </table>
                         </div>
                    </CardBody>
               </Card>
               <Card style={{ border: "1px solid #dee2e6", borderRadius: "5px", overflow: "hidden" }}>
                    <CardHeader style={{ backgroundColor: "#c9e0fc" }}>
                         <div className='d-flex justify-content-between align-items-center'>
                              <div style={{ fontWeight: "bold" }}>
                                   Series Records({series.length})
                              </div>
                              <div className='d-flex'>
                                   <RiRefreshFill style={{ cursor: "pointer", marginRight: "10px" }} />
                                   <RiSettings2Fill style={{ cursor: "pointer" }} />
                              </div>
                         </div>
                    </CardHeader>
                    <CardBody style={{ padding: "0" }}>
                         <div style={{ overflowX: "auto" }}>
                              <table >
                                   <thead style={{ backgroundColor: "#c9e0fc" }}>
                                        <tr>
                                             <th style={{ width: "80px" }}>Action</th>
                                             <th>Number</th>
                                             <th>Modality</th>
                                             <th>Description</th>
                                             <th>Body Part Examined</th>
                                             <th style={{ width: "80px" }}>Size</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        <tr>
                                             <td></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Number" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Modality" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Description" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Body Part" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Size" /></td>
                                        </tr>
                                        {series.map((serie) => (
                                             <tr key={serie.id} style={{ backgroundColor: activeSeries === serie.id ? "#ffc107" : "inherit", display: activeStudy ? "table-row" : "none" }}>
                                                  <td><RiPlayFill style={{ cursor: "pointer" }} onClick={() => setActiveSeries(serie.id)} /></td>
                                                  <td>{serie.number}</td>
                                                  <td>{serie.modality}</td>
                                                  <td>{serie.description}</td>
                                                  <td>{serie.bodypart}</td>
                                                  <td>{serie.size}</td>
                                             </tr>
                                        ))}
                                        {!activeStudy && (
                                             <tr>
                                                  <td colSpan={6} style={{ textAlign: "center" }}>Select a study to view series</td>
                                             </tr>
                                        )}
                                   </tbody>
                              </table>
                         </div>
                    </CardBody>
               </Card>
               <Card style={{ border: "1px solid #dee2e6", borderRadius: "5px", overflow: "hidden" }}>
                    <CardHeader style={{ backgroundColor: "#c9e0fc" }}>
                         <div className='d-flex justify-content-between align-items-center'>
                              <div style={{ fontWeight: "bold" }}>
                                   Image Records({images.length})
                              </div>
                              <div className='d-flex'>
                                   <RiRefreshFill style={{ cursor: "pointer", marginRight: "10px" }} />
                                   <RiSettings2Fill style={{ cursor: "pointer" }} />
                              </div>
                         </div>
                    </CardHeader>
                    <CardBody style={{ padding: "0" }}>
                         <div style={{ overflowX: "auto" }}>
                              <table >
                                   <thead style={{ backgroundColor: "#f8f9fa" }}>
                                        <tr>
                                             <th style={{ width: "80px" }}>Action</th>
                                             <th>Number</th>
                                             <th>Date</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        <tr>
                                             <td></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Number" /></td>
                                             <td><input type="text" className="form-control form-control-sm" placeholder="Date" /></td>
                                        </tr>
                                        {images.map((image) => (
                                             <tr key={image.id} style={{ backgroundColor: activeImage === image.id ? "#ffc107" : "inherit", display: activeSeries ? "table-row" : "none" }}>
                                                  <td><RiPlayFill style={{ cursor: "pointer" }} onClick={() => setActiveImage(image.id)} /></td>
                                                  <td>{image.number}</td>
                                                  <td>{image.date}</td>
                                             </tr>
                                        ))}
                                        {!activeSeries && (
                                             <tr>
                                                  <td colSpan={3} style={{ textAlign: "center" }}>Select a series to view images</td>
                                             </tr>
                                        )}
                                   </tbody>
                              </table>
                         </div>
                    </CardBody>
               </Card>
          </div >
     )
}