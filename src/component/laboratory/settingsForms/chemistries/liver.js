import React from 'react';

export default function LiverFunctionTest(props) {
  return (
    <div>
         <section>
             <form method="post" >
                   <table className="table ">
                       <thead >
                           <tr>
                               <th>#</th>
                               <th>parameter</th>
                               <th>unit</th>
                               <th>lower limit</th>
                               <th>upper limit</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr>
                                <td>1</td>
                               <td>alt</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/*ast input field  */}
                           <tr>
                                <td>2</td>
                               <td>ast</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"  id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"  id="altupperlimit"></input></td>
                           </tr>
                           {/* AST/ALP RATIO */}
                           <tr>
                               <td>3</td>
                               <td>AST/ALP</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* alp */}
                           <tr>
                               <td>4</td>
                               <td>alp</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* ggt */}
                           <tr>
                               <td>5</td>
                               <td>ggt</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control" id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control" id="altupperlimit"></input></td>
                           </tr>
                           {/* total protein */}
                           <tr>
                               <td>6</td>
                               <td>total protein</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* albumen */}
                           <tr>
                               <td>7</td>
                               <td>albumen</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* globulin */}
                           <tr>
                               <td>8</td>
                               <td>globulin</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* alb/glo */}
                           <tr>
                               <td>9</td>
                               <td>alb/glo</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* total bilirubin */}
                           <tr>
                               <td>10</td>
                               <td>total bilirubin</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* direct bilirubin */}
                           <tr>
                               <td>11</td>
                               <td>direct bilirubin</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                           {/* indirect bilirubin */}
                           <tr>
                               <td>12</td>
                               <td>indirect bilirubin</td>
                               <td><input type="text" className="form-control" id="unit"  /></td>
                               <td><input type="number" className="form-control"   id="alt-lowerlimit"></input></td>
                               <td><input type="number" className="form-control"   id="altupperlimit"></input></td>
                           </tr>
                       </tbody>
                   </table>
             </form>
         </section>
    </div>
  );
}
