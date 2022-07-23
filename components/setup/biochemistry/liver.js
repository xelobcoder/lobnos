import { useState } from 'react';
const new_parameter = () => {
  return (
    <div className='col-12 p-2' id='create-param-view'>
      <div>
         <div className='create-param-form-d'>
            <label htmlFor='paramter_name'>paramater name</label>
            <input type='text' placeholder='parameter name' className='form-control' id='paramter_name' />
         </div>
         <div className='create-param-form-d'>
            <label htmlFor='lower_limit'>lower limit</label>
            <input type='number'  className='form-control' id='lower_limit' />
         </div>
         <div  className='create-param-form-d'>
            <label htmlFor='upper_limit'>upper limit</label>
            <input type='number'  className='form-control' id='upper_limit' />
          </div>
          <div className='create-param-form-d'>
            <div></div>
            <button className='btn btn-primary btn-block mt-3'>
              <i className='fa fa-plus'></i>
              add
           </button>
          </div>
      </div> 
    </div>
  )
}


const parameter_list = (data) => {
  return (
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
        {data.map((list) => {
          ;<tr>
            <td>{list.testname}</td>
            <td>{list.unit}</td>
            <td>{list.upper_limit}</td>
            <td>{list.lower_limit}</td>
          </tr>
        })}
      </tbody>
    </div>
  )
}

const createparameterHandler = function () {
  let pname = document.getElementById('name')
  let ll = document.getElementById('ll')
  let ul = document.getElementById('ul')

  if (
    (username.value != '') & (ll.value != '') ||
    0 & typeof (ll.value == 'number') & (ul.value != '') ||
    0 & typeof (ul.value == 'number')
  ) {
    return {
      pname,
      lower_limit: ll,
      upper_limit: up,
    }
  }
}

const setParameters = () => {
  return (
    <div className='col-12'>
      <div className='card col-12'>
        <div className='card-header' id='grid-2'>
          <h5 className='card-title'>setup paramaters</h5>
          <div className='d-flex justify-content-between' >
               <input placeholder='enter unit' type='text' id="unit"></input>
               <button type='button' className='btn btn-primary btn-sm'>save</button>
          </div>
        </div>
        <div className='card-body'>
          <div className='row'>
            <div className='col-10'>
              <div className='form-group panel-grid'>
                <label htmlFor='name'>albumin</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='albumin_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='albumin_upper_limit' />
                </div>
              </div>
              {/* total protein */}
              <div className='form-group panel-grid'>
                <label htmlFor='total protein'>total protein</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='total_protein_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='total_protein_upper_limit' />
                </div>
              </div>
              {/* alp*/}
              <div className='form-group panel-grid'>
                <label htmlFor='alp'>alp</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='alp_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='alp_upper_limit' />
                </div>
              </div>
              {/* ast */}
              <div className='form-group panel-grid'>
                <label htmlFor='ast'>ast</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='ast_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='ast_upper_limit' />
                </div>
              </div>
              {/* alt */}
              <div className='form-group panel-grid'>
                <label htmlFor='alt'>alt</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='alt_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='alt_upper_limit' />
                </div>
              </div>
              {/* bun */}
              <div className='form-group panel-grid'>
                <label htmlFor='bun'>bun</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='bun_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='bun_upper_limit' />
                </div>
              </div>
              {/* creatinine */}
              <div className='form-group panel-grid'>
                <label htmlFor='creatinine'>creatinine</label>
                <div className='panel-grid-form'>
                  <input type='number' placeholder='lower limit' className='form-control ' id='creatinine_lower_limit' />
                  <input type='number' placeholder='upper limit' className='form-control' id='creatinine_upper_limit' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const message = function (color, messageNote) {
  return <div className={color}>{messageNote}</div>
}
function LiverPanel() {
  const [list, lists] = useState(true)
  const [create, created] = useState(false)
  const [setup, afterset] = useState(false)
  const [msg, setMsg] = useState(false)

  return (
    <div>
      <div>
        {/* {msg ? message('alert alert-success ', 'successfully added') : message('alert alert-danger mt-4 col-8 border-danger','error occured during data insertion')} */}
      </div>
      <tab className='panel-tabs mb-3'>
        <div className='panel-tab-group'>
          <ul className='panel-tab-group-child'>
            <div>
              <button className='btn btn-outline-success btn-sm'>parameter list</button>
              <button className='btn btn-outline-primary btn-sm'>create parameter</button>
              <button className='btn btn-outline-danger btn-sm'>delete parameter</button>
              <button className='btn btn-primary btn-sm'>set up params</button>
            </div>
          </ul>
        </div>
      </tab>
      <main>
         <div  className='list-create p-2'>
            {
              setParameters()
            }
         </div>
      </main>
    </div>
  )
}

export default LiverPanel
