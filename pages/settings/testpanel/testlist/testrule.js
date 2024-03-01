import { useState, useEffect } from "react";
import { fieldDeterminer } from "../../../../components/Auth/creator"
import { customFetch, handleComments } from "../../../../components/Auth/customFetch";
import Indicator from "../../../../components/accessories/Reports/indicator";
import CommentSection from "../../../../components/LabTestForms/commentSection";

export default function CreateTestRule({ clientdata }) {
   const { testid, test, patientid, billingid, employeeid } = clientdata;
   const [comments, setComments] = useState({ comments: '' })
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


   console.log(comments)
   return (
      <section className="card mx-2">
         <div className="card-header">
            <div className="mx-2">
               <h5>{test}</h5>
               <Indicator resultEntered={false} />
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
               <button className="btn btn-primary btn-sm my-2 mx-1">save changes</button>
            </div>
         </div>
      </section>
   )
}