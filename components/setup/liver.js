export default function LiverSet(){
 const create_parameters = function() {
   console.log('clicked')
 }

 const delete_parameter = function() {
   console.log('clicked')
}

const edit_parameter = function() {
   console.log('clicked')
   return (
      <div style={{backgroundColor:'whitesmoke'}}> 
          <div className="col-4">
              <table className="table table-striped">
                    <thead className="thead">
                       <tr className="text-capitalize">
                          <th scope="col"> <input  type='checkbox'/></th>
                          <th scope="col">test name</th>
                          <th scope="col">lower limit</th>
                          <th scope="col ">upper limit</th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr>
                          <td> <input type='checkbox'/></td>
                          <td>creatinine</td>
                          <td>
                                <input type="text" name="creatinine_lower" id="creatinine_lower" className="form-control" />
                          </td>
                          <td>
                                <input type="text" name="creatinine_upper" id="creatinine_upper" className="form-control" />
                          </td>
                       </tr>
                       <tr>
                          <td> <input type='checkbox'/></td>
                          <td>bilirubin</td>
                          <td>
                                <input type="text" name="bilirubin_lower" id="bilirubin_lower" className="form-control" />
                          </td>
                          <td>
                                <input type="text" name="bilirubin_upper" id="bilirubin_upper" className="form-control" />
                          </td>
                       </tr>
                       <tr>
                          <td> <input type='checkbox'/></td>
                          <td>total protein</td>
                          <td>
                                <input type="text" name="total_protein_lower" id="total_protein_lower" className="form-control" />
                          </td>
                          <td>
                                <input type="text" name="total_protein_upper" id="total_protein_upper" className="form-control" />
                          </td>
                       </tr>
                       <tr>
                          <td> <input type='checkbox'/></td>
                          <td>albumin</td>
                          <td>
                                <input type="text" name="albumin_lower" id="albumin_lower" className="form-control" />
                          </td>
                          <td>
                                <input type="text" name="albumin_upper" id="albumin_upper" className="form-control" />
                          </td>
                       </tr>
                       <tr>
                          <td> <input type='checkbox'/></td>
                          <td>globulin</td>
                          <td>
                                <input type="text" name="globulin_lower" id="globulin_lower" className="form-control" />
                          </td>
                          <td>
                                <input type="text" name="globulin_upper" id="globulin_upper" className="form-control" />
                          </td>
                       </tr>
                       <tr>
                          <td> <input type='checkbox'/></td>
                          <td>albuminuria</td>
                          <td>
                                <input type="text" name="albuminuria_lower" id="albuminuria_lower" className="form-control" />
                          </td>
                          <td>
                                <input type="text" name="albuminuria_upper" id="albuminuria_upper" className="form-control" />
                          </td>
                       </tr>
                    </tbody>
              </table>
          </div>
      </div>
   )
}

const tableGrid = function() {
   return(
      <div className="col-md-12">
         {/* table view for panel */}
         <div className="container">
            <div className="row">
            <table className="table col">
            <thead>
               <tr>
                  <th>test name</th>
                  <th>lower limit</th>
                  <th>upper limit</th>
                  <th>date added</th>
                  <th>date updated</th>
                  <th>added by</th>
               </tr>
            </thead>
            <tbody>
               <tr>
                  <td>creatinine</td>
                  <td>0.9</td>
                  <td>1.0</td>
                  <td>2020-01-01</td>
                  <td>2020-01-01</td>
                  <td>admin</td>
               </tr>
               <tr>
                  <td>bilirubin</td>
                  <td>0.9</td>
                  <td>1.0</td>
                  <td>2020-01-01</td>
                  <td>2020-01-01</td>
                  <td>admin</td>
               </tr>
               <tr>
                  <td>total protein</td>
                  <td>0.9</td>
                  <td>1.0</td>
                  <td>2020-01-01</td>
                  <td>2020-01-01</td>
                  <td>admin</td>
               </tr>
            </tbody>
         </table>
      </div>
    </div>
   </div>
   )
}
return (
   <>
      <div className="container wizard-bro">
            <div id="wizard-top">
                  <p>Select unit, unit runs for all parameters</p>
                  <select className="form-control col-4">
                     <option>Select</option>
                     <option>mg/dl</option>
                     <option>mmol/L</option>
                  </select>
            </div>
            <div className="btn-icon-top">
               <div className="next">
                  <button className="btn btn-primary btn-sm" type="button" onClick={create_parameters}>
                     create parameter
                  </button>
                  <button className="btn btn-danger btn-sm" type="button" onClick={delete_parameter}>
                     delete parameter
                  </button>
                  <button className="btn btn-light btn-sm"  type="button" onClick={edit_parameter}>
                        edit test panel
                  </button>
               </div>
            </div>
         </div>
         <hr></hr>
      <div className="col-12">
         {
            edit_parameter()
         }
      </div>
   </>
  )
}