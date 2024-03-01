import { useState, useEffect } from "react";
import { fieldDeterminer } from "../../../../components/Auth/creator"
import { customFetch, customPost, handleComments } from "../../../../components/Auth/customFetch";
import Indicator from "../../../../components/accessories/Reports/indicator";
import CommentSection from "../../../../components/LabTestForms/commentSection";
import { ToastContainer, toast } from 'react-toastify';

export default function CreateTestRule({ clientdata }) {
   const { testid, test, patientid, billingid, employeeid } = clientdata;
   const [comments, setComments] = useState({ comments: '' })
   const [resultEntered, setResultEntered] = useState(false);
   const [rule, setRule] = useState([]);
   useEffect(() => {
      if (testid) {
         customFetch(`testpanel/list/customtestrule?testid=${testid}`)
            .then((data) => {
               setRule(data);
            }).catch((err) => {
               console.log(err);
            })
      }
   }, [testid])



   const handlestate = async (name, ev, index) => {
      const value = ev.target.value;
      const newRule = [...rule];
      newRule[index]['value'] = value;
      setRule(newRule);
   }

   const handleSubmit = async (ev) => {
      const transformed = rule.map((item, index) => { return { field: item?.name, value: item?.value } })
      const allHasValues = transformed.some((a, i) => a.value == "");
      if (allHasValues) {
         toast.error('some fields are empty', { autoClose: 2000 });
      }
      const data = { fields: transformed, billingid, employeeid, patientid, comments: comments.comments };
      const response = await customPost('result/entry/customtest', resultEntered ? 'PUT' : "POST", data);
      console.log(response);
   }

   return (
      <div>
         <ToastContainer />
         <section className="card mx-2">
         <div className="card-header">
            <div className="mx-2">
               <h5>{test}</h5>
                  <Indicator resultEntered={resultEntered} />
            </div>
         </div>
         <div className="card-body">
            <table className="table">
               <thead>
                  <tr>
                     <th>Parameter</th>
                     <th>value</th>
                     <th>unit</th>
                     <th>reference range</th>
                  </tr>
               </thead>
               <tbody>
                  {rule.map((item, index) => fieldDeterminer(item, handlestate, index))}
               </tbody>
            </table>
            <CommentSection datafunction={setComments} getcomment={handleComments} datasource={comments} target={'comments'} value={comments.comments} />
            <div>
                  <button onClick={(ev) => { handleSubmit(ev) }} className="btn btn-primary btn-sm my-2 mx-1">save changes</button>
            </div>
         </div>
      </section>
      </div>
   )
}