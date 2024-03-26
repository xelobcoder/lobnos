import { useContext, useEffect, useState } from "react";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import { useSearchParams } from "next/navigation";
import AuthContext from "../../../components/Auth/useAuthentification";
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from "../../../components/accessories/Loader";

export default function RejectedSampleHistory() {
     const [isLoading, setLoading] = useState(false);
     const [logs, setLogs] = useState([]);
     const ascensionid = useSearchParams().get('ascensionid');
     const { auth } = useContext(AuthContext);
     const employeeid = auth?.employeeid;

     useEffect(() => {
          async function getLogs() {
               if (employeeid && ascensionid) {
                    try {
                         setLoading(true);
                         const data = await customFetch(`sample/disputed/log/single?ascensionid=${ascensionid}`);
                         if (Array.isArray(data)) {
                              setLogs(data)
                         } else {
                              setLogs([])
                         }
                         setLoading(false);
                    } catch (err) {
                         setLoading(false);
                    }
               }
          }
          getLogs();
     }, [employeeid, ascensionid])



     const renderingView = () => {
          if (isLoading) return <Loader />
          else {
               if (logs.length == 0) return <div className="alert alert-info">No dispute logged</div>
               else
                    return (
                         <div className="list-group">
                              {logs.map((item, index) => {
                                   return <div key={index + 1} className="list-group-item" style={{ display: 'grid', gridTemplateColumns: '10% 20% 60%' }}>
                                        <span>{index + 1}. {''}{new Date(item.disputedon).toLocaleDateString()}</span>
                                        <span>{item.username}</span>
                                        <span>{item.disputereason}</span>
                                   </div>
                              })}
                         </div>
                    )
          }
     }
     return (
          <LaboratoryLayout>
               <form className="mx-2">
                    <h6>Note Your View</h6>
                    <textarea rows={5} cols={12} className="form-control" />
                    <button type="button" className="btn btn-success btn-sm my-2">dispute</button>
               </form>
               <section>
                    {renderingView()}
               </section>
          </LaboratoryLayout>
     )
}