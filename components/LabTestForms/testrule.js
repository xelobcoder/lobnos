import { useState, useEffect } from "react";
import { fieldDeterminer } from "../Auth/creator"
import { customFetch, handleComments } from "../Auth/customFetch";
import { customPost } from "../Auth/customPost";
import Indicator from "../accessories/Reports/indicator";
import Link from 'next/link';
import CommentSection from "./commentSection";
import { toast } from 'react-toastify';
import Loader from "../accessories/Loader";

export default function CreateTestRule({ clientdata }) {
   const { testid, test, patientid, billingid, employeeid } = clientdata;
   const [comments, setComments] = useState({ comments: '' })
   const [testname, setTestname] = useState("")
   const [resultEntered, setResultEntered] = useState(false);
   const [isloading, setLoading] = useState(true);
   const [rule, setRule] = useState([]);

   useEffect(() => {
      const gettingFields = async function () {
         try {
            const commentsFetch = customFetch(
               `testpanel/list/customtestrule/previous/comments?testid=${testid}&&csvid=${billingid}&&ptid=${patientid}`
            );

            const testResultFetch = customFetch(
               `testpanel/list/customtestrule/previous?testid=${testid}&&ptid=${patientid}&&csvid=${billingid}`
            );

            const [resultResponse, commentsResponse] = await Promise.all([testResultFetch, commentsFetch]);

            function updatesResultForm(data) {
               const { testname, result } = data;
               if (result && Array.isArray(result)) {
                  setRule(result);
                  if (result.length === 0) return;
                  const hasAnyValueEntered = result.some((item, index) => item?.value != "");
                  setResultEntered(hasAnyValueEntered);
               }
               testname && setTestname(testname);
            }

            function updatesCommentsForm(data) {
               setComments({ comments: data.comments });
            }

            updatesResultForm(resultResponse);
            updatesCommentsForm(commentsResponse);
            setLoading(false);
         } catch (err) {
            setRule([]);
            setComments({ comments: "" });
         }
      };
      if (testid && billingid && patientid && employeeid) {
         gettingFields();
      }
   }, [testid, billingid, patientid, employeeid]);

   const handlestate = async (name, ev, index) => {
      const value = ev.target.value;
      const newRule = [...rule];
      newRule[index]["value"] = value;
      setRule(newRule);
   };

   const handleSubmit = async (ev) => {
      try {
         const transformed = rule.map((item, index) => {
            return { field: item?.name, value: item?.value };
         });
         const allHasValues = transformed.some((a, i) => a.value == "");
         if (allHasValues) {
            toast.error("some fields are empty", { autoClose: 2000 });
         }
         const data = { fields: transformed, csvid: billingid, employeeid, ptid: patientid, comments: comments.comments, test, testid };
         if (data.employeeid && data.csvid && data.fields.length > 0) {
            const response = await customPost("result/entry/customtest", "POST", data);
            const { message, statusCode, status } = response;
            if (status == "success" && statusCode == 200) {
               toast.success(message, { autoClose: 500 });
            } else {
               toast.error(message, { autoClose: 2000 });
            }
         }
      } catch (err) {
         toast.error("something wrong occured", { autoClose: 1000 });
      }
   };


   const handleCreateFields = (ev) => {
      if (testid) {
         window.open(`/settings/testpanel/testlist/createfields?testid=${testid}&&testname=${testname}`)
      }
   }



   const renderingView = () => {
      if (isloading) return <Loader />
      else {
         return (
            <section>
               <table className="table border ">
                  <thead>
                     <tr>
                        <th className="fw-bold text-capitalize">Parameter</th>
                        <th className="fw-bold text-capitalize" style={{ width: '250px' }}>Value</th>
                        <th className="fw-bold text-capitalize">Unit</th>
                        <th className="fw-bold text-capitalize">Reference Range</th>
                        <th className="fw-bold text-capitalize">Mode</th>

                     </tr>
                  </thead>
                  <tbody>

                     {rule.length > 0 ? rule.map((item, index) => fieldDeterminer(item, handlestate, index)) : <td className="text-danger p-3" colSpan={5}>No data found.Ensure fields were created. <button onClick={(ev) => { handleCreateFields(ev) }} className="btn btn-outline-primary btn-sm border-2">create fields</button></td>}
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
         <section className="card mx-2 ui">
            <div className="card-header">
               <div className="mx-2">
                  <h5 className="text-capitalize">{testname}</h5>
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