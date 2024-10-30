import ResultEntryHtmlGenerator from "../Auth/ResultEntryHtmlGenerator";
import CommentSection from "./commentSection";
import ResultEntryDrugsForm from "./ResultEntryDrugsForm";

export default function ResultEntryMainEntryBase({ handlestate, handleCreateFields, rule = [], handleSubmit, setComments, comments, handleComments, isPinUsed, hasDrugs }) {
       return (
              <section>

                     <table theme='dark' className="table billing-cart-table ttable table-bordered ">
                            <thead>
                                   <tr>
                                          <th className="fw-bold text-capitalize">Parameter</th>
                                          <th className="fw-bold text-capitalize" >Value</th>
                                          <th className="fw-bold text-capitalize">Unit</th>
                                          <th className="fw-bold text-capitalize">Reference Range</th>
                                          <th className="fw-bold text-capitalize pls-d-none">Mode</th>
                                          <th className="fw-bold text-capitalize pls-d-none">contraints</th>
                                   </tr>
                            </thead>
                            <tbody>
                                   {rule.length > 0 ? rule.map((item, index) => {
                                          return <ResultEntryHtmlGenerator key={index} statehandler={handlestate}
                                                 index={index} item={item} />
                                   }) : <td className="text-danger p-3" colSpan={5}>No data found.Ensure fields were created. <button onClick={(ev) => { handleCreateFields(ev) }} className="btn btn-outline-primary btn-sm border-2">create fields</button></td>}
                            </tbody>
                     </table>
                     {hasDrugs && <ResultEntryDrugsForm />}
                     <CommentSection datafunction={setComments} getcomment={handleComments} datasource={comments} target={'comments'} value={comments.comments} />
                     <div className="d-flex justify-content-between mt-2">
                            {isPinUsed
                                   &&
                                   (<div className="">
                                          <input className="custom-input" type="password" placeholder="Enter pin here" />
                                   </div>)}
                            <div>
                                   <button
                                          onClick={(ev) => { handleSubmit(ev) }} className="btn btn-primary btn-sm my-2 mx-1">
                                          save changes
                                   </button>
                            </div>
                     </div>
              </section>
       )
}