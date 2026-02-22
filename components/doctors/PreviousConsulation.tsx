import React, { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import { plsDecryption } from '../../lib/encryption';

export default function PreviousConsulation({ patientid }: { patientid: number }) {
     const [consulationRecords, setConsulationRecords] = useState<any[]>([]);
     const [loading, setLoading] = useState<boolean>(true);

     useEffect(() => {
          if (patientid) {
               setLoading(true);
               const patid = typeof patientid === 'string' ?
                    plsDecryption(patientid) : patientid;
               customFetch(`records/consulations/records?patientid=${patid}`)
                    .then((data) => {
                         if (Array.isArray(data) && data.length > 0) {
                              setConsulationRecords(data);
                         }
                    })
                    .catch((err) => console.log(err))
                    .finally(() => setLoading(false));
          }
     }, [patientid]);

     if (loading) return <h6 className="alert alert-info pls-color">Loading...</h6>;

     if (consulationRecords.length === 0)
          return <h6 className="alert alert-danger pls-color">No Previous consultation</h6>;

     return (
          <div>
               {consulationRecords.map((record, index) => (
                    <div key={index} style={{ marginBottom: "24px", border: "1px solid #ddd", borderRadius: "4px", padding: "12px", backgroundColor: "#f9f9f9" }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "8px" }}>
                              <div>
                                   <h6 style={{ marginBottom: "4px", fontSize: "0.95rem", fontWeight: "bold" }}>
                                        {new Date(record.created_at).toLocaleDateString(undefined, { 
                                             year: 'numeric', 
                                             month: 'long', 
                                             day: 'numeric',
                                             hour: '2-digit',
                                             minute: '2-digit'
                                        })}
                                   </h6>
                                   <p style={{ marginBottom: "0", fontSize: "0.85rem", color: "#666" }}>
                                        By: <strong>{record.consultationby || "Unknown"}</strong> | 
                                        Type: <span style={{ display: "inline-block", marginLeft: "4px" }}><span style={{ padding: "2px 6px", backgroundColor: "#0dcaf0", color: "white", borderRadius: "3px", fontSize: "0.75rem" }}>{record.record_type}</span></span>
                                   </p>
                              </div>
                         </div>
                         <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word", fontSize: "0.9rem", lineHeight: "1.6", fontFamily: "monospace", color: "#333" }}>
                              {record.consultation_notes || record.complaints || "No consultation notes recorded"}
                         </div>
                    </div>
               ))}
          </div>
     );
}
