import { useContext, useState } from "react";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import DatePickerRange from '../../../components/accessories/DatePickerRange'
import { handleComments, customFetch, formatTest } from "../../../components/Auth/customFetch";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AuthContext from "../../../components/Auth/useAuthentification";

const DEFAULTVALUES = {
     billingid: "",
     patientid: "",
     fullname: "",
     from: null,
     to: null
}

export default function PatientArchivesPage() {
     const [query, setQuery] = useState(DEFAULTVALUES);
     const [collection, setCollection] = useState([]);
     const { auth } = useContext(AuthContext);
     const employeeid = auth?.employeeid;

     const getRange = (value) => {
          const [start, end] = value;
          setQuery({ ...query, from: start, to: end });
     }


     const submitData = async () => {
          const { from, to, billingid, patientid } = query;
          const response = await customFetch(`operations/collection/result?from=${from == null ? "" : from}&&to=${to == null ? "" : to}&&billingid=${billingid}&&patientid=${patientid}`);
          const { statusCode, status, result } = response;
          if (Array.isArray(result)) {
               setCollection(result);
          }
     }

     const clearFilters = () => {
          setQuery({ ...DEFAULTVALUES, from: null, end: null });
     }


     const renderNewTab = (item, patientid) => {
          const { name, billingid, testid } = item;
          console.log(item,patientid);
          window.open(`viewtwo/resultentry?testid=${parseInt(testid)}&&testname=${formatTest(name)}&&employeeid=${parseInt(employeeid)}&&billingid=${parseInt(billingid)}&&patientid=${parseInt(patientid)}&&view=single`)
     }

     const rendering = () => {
          if (collection.length == 0) {
               return <h5>No Data Available</h5>
          }
          if (collection.length > 0) {
               return (
                    <div className="responsive my-2 mx-2">
                         <table className="table">
                              <thead>
                                   <tr>
                                        <th className="fw-bold text-capitalize text-sm">Date</th>
                                        <th className="fw-bold text-capitalize text-sm" >Fullname</th>
                                        <th className="fw-bold text-capitalize text-sm" >test</th>
                                   </tr>
                              </thead>
                              <tbody className="hover">
                                   {collection.map((item, index) => {
                                        return (
                                             <tr key={index} className="pointer">
                                                  <td className="text-capitalize text-sm">{new Date(item?.billing_date).toLocaleDateString()}</td>
                                                  <td className="text-capitalize text-sm">
                                                       {item.fullname}
                                                       <br />
                                                       ({item.patientid})
                                                       {item.gender}
                                                  </td>
                                                  <td>
                                                       <div className="grid-5">
                                                            {
                                                                 Array.isArray(item.testMap) && item.testMap.length > 0 && (item.testMap.map((_item, index) => {
                                                                      return <span onClick={(ev) => { renderNewTab(_item, item.patientid) }} key={index} className="text-sm text-primary mx-1">{_item.name}
                                                                           <OpenInNewIcon /></span >
                                                                 }))
                                                            }
                                                       </div>
                                                  </td>
                                             </tr>
                                        )
                                   })}
                              </tbody>
                         </table>
                    </div>
               )
          }
     }


     return (
          <LaboratoryLayout>
               <section className="grid-5">
                    <div className="mx-2">
                         <input placeholder="Billing Id" className="custom-input" id="billingid" onChange={(e) => handleComments(e, query, "billingid", setQuery)} />
                    </div>
                    <div className="mx-2">
                         <input placeholder="Patient Id" className="custom-input" id="billingid" onChange={(e) => handleComments(e, query, "patientid", setQuery)} />
                    </div>
                    <div className="mx-2">
                         <input placeholder="Fullname" className="custom-input" id="billingid" onChange={(e) => handleComments(e, query, "patientid", setQuery)} />
                    </div>
                    <div>
                         <DatePickerRange getRange={getRange} start={query.from} end={query.to} />
                    </div>
                    <div>
                         <button className="btn btn-success btn-sm"
                              onClick={(e) => { submitData() }}>
                              search
                         </button>
                         <button onClick={(ev) => { clearFilters() }} className="btn mx-2 btn-secondary btn-sm">
                              clear filter
                         </button>
                    </div>
               </section>
               {rendering()}
          </LaboratoryLayout>
     )
}