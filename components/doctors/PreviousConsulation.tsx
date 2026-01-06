import React, { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import Link from 'next/link';

export default function PreviousConsulation({ patientid }: { patientid: number }) {
     const [consulationRecords, setConsulationRecords] = useState<any[]>([]);
     const [loading, setLoading] = useState<boolean>(true);

     useEffect(() => {
          if (patientid) {
               setLoading(true);
               customFetch(`records/consulations/records`)
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
               <ul>
                    {consulationRecords.map((item, index) => (
                         <li
                              key={index}
                              className="d-flex p-0 justify-content-between text-sm border-bottom border-secondary text-capitalize"
                         >
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                              <span>{item.consultationby}</span>
                              <span>
                                   <Link className='btn btn-primary btn-sm' href={`/doctor/consultation/${patientid}?consultationid=${item.id}`}>
                                        Edit/view
                                   </Link>
                              </span>
                              
                         </li>
                    ))}
               </ul>
          </div>
     );
}
