import { useState, useEffect } from "react";
import { fieldDeterminer } from "../Auth/creator"
import { customFetch, customPost, handleComments } from "../Auth/customFetch";
import Indicator from "../accessories/Reports/indicator";
import Link from 'next/link';
import CommentSection from "./commentSection";
import { ToastContainer, toast } from 'react-toastify';
import Loader from "../accessories/Loader";

export default function CreateTestRule({ clientdata }) {
   const { testid = null, test = null, patientid = null, billingid = null, employeeid = null } = clientdata;
   const [comments, setComments] = useState({ comments: '' })
   const [resultEntered, setResultEntered] = useState(false);
   const [isloading, setLoading] = useState(true);
   const [rule, setRule] = useState([]);

   useEffect(() => {
      if (testid && test && billingid && patientid) {
         setLoading(true);
         customFetch(`testpanel/list/customtestrule/previous?testid=${testid}&&testname=${test}&&patientid=${patientid}&&billingid=${billingid}`)
            .then((data) => {
               setRule(data);
            }).catch((err) => {
               console.log(err);
            })

         customFetch(`testpanel/list/customtestrule/previous/comments?testid=${testid}&&billingid=${billingid}`)
            .then((data) => {
               setComments({ comments: data.comments });
               if (data.comments != "") {
                  setResultEntered(true);
               }
            }).catch((err) => {
               setComments({ comments: '' })
            })
         setLoading(false);
      }
   }, [testid, test, billingid, patientid])




   const handlestate = async (name, ev, index) => {
      const value = ev.target.value;
      const newRule = [...rule];
      newRule[index]['value'] = value;
      setRule(newRule);
   }

   const handleSubmit = async (ev) => {
      try {
         const transformed = rule.map((item, index) => { return { field: item?.name, value: item?.value } })
         const allHasValues = transformed.some((a, i) => a.value == "");
         if (allHasValues) {
            toast.error('some fields are empty', { autoClose: 2000 });
         }
         const data = { fields: transformed, billingid: parseInt(billingid), employeeid, patientid: parseInt(patientid), comments: comments.comments, test, testid };
         const response = await customPost('result/entry/customtest', 'POST', data);
         const { message, statusCode, status } = response;
         if (status == "success" && statusCode == 200) {
            toast.success(message, { autoClose: 500 });
         } else {
            toast.error(message, { autoClose: 2000 });
         }
      } catch (err) {
         toast.error('something wrong occured', { autoClose: 1000 })
      }
   }



   const renderingView = () => {
      if (isloading) return <Loader />
      else {
         return (
            <section>
               <table className="table border">
                  <thead>
                     <tr>
                        <th className="fw-bold text-capitalize">Parameter</th>
                        <th className="fw-bold text-capitalize">value</th>
                        <th className="fw-bold text-capitalize">unit</th>
                        <th className="fw-bold text-capitalize">reference range</th>
                     </tr>
                  </thead>
                  <tbody>
                     {rule.length > 0 && rule.map((item, index) => fieldDeterminer(item, handlestate, index))}
                  </tbody>
               </table>
               <CommentSection datafunction={setComments} getcomment={handleComments} datasource={comments} target={'comments'} value={comments.comments} />
               <div className="d-flex justify-content-between">
                  <button
                     onClick={(ev) => { handleSubmit(ev) }} className="btn btn-primary btn-sm my-2 mx-1">
                     save changes
                  </button>
                  <Link href={`/operations/viewtwo/showtrends?billingid=${billingid}&&patientid=${patientid}&&test=${test}&&testid=${testid}`}>
                     <button className="btn btn-dark btn-sm mx-1 my-2">
                        show trend
                     </button>
                  </Link>
               </div>
            </section>
         )
      }
   }

   return (
      <div>
         <ToastContainer />
         <section className="card mx-2">
            <div className="card-header">
               <div className="mx-2">
                  <h5 className="text-capitalize">{test.split('_').join(" ")}</h5>
                  <Indicator resultEntered={resultEntered} />
               </div>
            </div>
            <div className="card-body">
               {renderingView()}
            </div>
         </section>
      </div>
   )
}