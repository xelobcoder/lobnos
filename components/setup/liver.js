import { useState } from "react"
const new_parameter = () => {
    return (
       <div>
        <div>
            <input placeholder="name" className="form-control" id="name" type='text'></input>
            <input placeholder="lower-limit" className="form-control" id="ll" type='number'></input>
            <input placeholder="upper-limit" className="form-control" id="ul" type='number'></input>
        </div>
        <div>
            <button type="button" className="btn btn-success btn-sm">save</button>
        </div>
      </div>
    )
}

const parameter_list = (data) => {
   <div>
      <table>
           <thead>
             <td>parameter</td>
             <td>unit</td>
             <td>lower limit</td>
             <td>upper limit</td>
           </thead>
      </table>
      <tbody>
        {
             data.map( (list) => {
                <tr>
                    <td>
                        {list.testname}
                    </td>
                    <td>
                        {list.unit}
                    </td>
                    <td>
                        {list.upper_limit}
                    </td>
                    <td>
                        {list.lower_limit}
                    </td>
                </tr>
            })
        }
      </tbody>
   </div>
}


const createparameterHandler = function() {
   let pname = document.getElementById('name');
   let ll = document.getElementById('ll');
   let ul = document.getElementById('ul');

   if (username.value != '' 
   & ll.value != '' || 0 & typeof(ll.value == 'number')
   & ul.value != '' || 0 & typeof(ul.value == 'number')) {
      return {
        pname,lower_limit: ll,upper_limit: up
      }
   }
}

const setParameters = () => {
    return (
        <div>
            
        </div>
    )
}

function LiverPanel() {
  const [list, lists] = useState(0)
    return(
        <div>
          <tab>

          </tab>
        </div>
    )
}


export default LiverPanel;