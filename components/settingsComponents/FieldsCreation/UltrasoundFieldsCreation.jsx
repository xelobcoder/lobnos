import { useState } from "react"

export default function UltrasoundFieldsCreation({ setField, field, handleCreateField, generalTestRule }) {

       return (
              <div>
                     <h4>Ultrasound Fields Creation</h4>
                     <hr />
                     <div className="mx-2">
                            <div className="grid-reg my-2 ">
                                   <label className="pls-label">Field Name</label>
                                   <input disabled={!generalTestRule.view} placeholder="Field name" className="custom-input"
                                          onChange={(ev) => {
                                                 setField({
                                                        ...field,
                                                        'name': ev.target.value
                                                 })
                                          }}
                                   />
                            </div>
                            {generalTestRule.view === "parameter" && <div className="grid-reg">
                                   <label className="pls-label">Data type</label>
                                   <select className="custom-select">
                                          <option>Number</option>
                                          <option>Text</option>
                                          <option>Long Text</option>
                                   </select>
                            </div>}
                            {generalTestRule.view === "parameter" && <div className="grid-reg my-2">
                                   <label className="pls-label">Expected Length</label>
                                   <input
                                          onChange={(ev) => {
                                                 setField({ ...field, 'ultrasoundField': ev.target.value })
                                          }}
                                          className="custom-input" defaultValue={'unknown'} />
                            </div>}
                            <div>
                                   <button onClick={handleCreateField} className="btn btn-success btn-sm" >
                                          create field
                                   </button>
                            </div>


                     </div>
              </div>
       )
}