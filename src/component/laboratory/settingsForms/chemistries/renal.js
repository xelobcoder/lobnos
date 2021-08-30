import React from 'react';

export default function RenalFunctionTest() {
  return (
    <div>
         <form method="post" className="form">
               <table className="table">
                    <thead>
                          <th>#</th>
                          <th>parameter</th>
                          <th>unit</th>
                          <th>lower limit</th>
                          <th>upper limit</th>
                    </thead>
                    <tbody>
                        <tr>
                                 <td>1</td>
                                <td>sodium</td>
                                <td><input type="text" className="form-control" id="unit"/></td>
                                <td><input type="number" className="form-control" id="lowerlimit" /></td>
                                <td><input type="number" className="form-control" id="upper-limit" /></td>
                        </tr>
                        <tr>
                                 <td>2</td>
                                <td>potassium</td>
                                <td><input type="text" className="form-control" id="unit"/></td>
                                <td><input type="number" className="form-control" id="lowerlimit" /></td>
                                <td><input type="number" className="form-control" id="upper-limit" /></td>
                        </tr>
                        <tr>
                                 <td>3</td>
                                <td>chloride</td>
                                <td><input type="text" className="form-control" id="unit"/></td>
                                <td><input type="number" className="form-control" id="lowerlimit" /></td>
                                <td><input type="number" className="form-control" id="upper-limit" /></td>
                        </tr>
                        <tr>
                                 <td>4</td>
                                <td>bicarbonate</td>
                                <td><input type="text" className="form-control" id="unit"/></td>
                                <td><input type="number" className="form-control" id="lowerlimit" /></td>
                                <td><input type="number" className="form-control" id="upper-limit" /></td>
                        </tr>
                        <tr>
                                 <td>5</td>
                                <td>urea</td>
                                <td><input type="text" className="form-control" id="unit"/></td>
                                <td><input type="number" className="form-control" id="lowerlimit" /></td>
                                <td><input type="number" className="form-control" id="upper-limit" /></td>
                        </tr>
                        <tr>
                                 <td>6</td>
                                <td>creatinine</td>
                                <td><input type="text" className="form-control" id="unit"/></td>
                                <td><input type="number" className="form-control" id="lowerlimit" /></td>
                                <td><input type="number" className="form-control" id="upper-limit" /></td>
                        </tr>
                      
                    </tbody>
               </table>
         </form>
    </div>
  );
}
