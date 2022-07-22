import { useState } from 'react'
const new_parameter = () => {
  return (
    <div>
      <div>
        <input
          placeholder="name"
          className="form-control"
          id="name"
          type="text"
        ></input>
        <input
          placeholder="lower-limit"
          className="form-control"
          id="ll"
          type="number"
        ></input>
        <input
          placeholder="upper-limit"
          className="form-control"
          id="ul"
          type="number"
        ></input>
      </div>
      <div>
        <button type="button" className="btn btn-success btn-sm">
          save
        </button>
      </div>
    </div>
  )
}

const data = [
  {
    testname: 'albumin',
    unit: 'mg/dl',
    lower_limit: 783.67,
    upper_limit: 73390.93,
  },
]

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
    <div>
      <table className="table">
        <thead className="thead">
          <tr>
            <th>
              <input type="checkbox" id="all-check"></input>
            </th>
            <th>paramater</th>
            <th>upper limit</th>
            <th>lower limit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="checkbox" id="test-check"></input>
            </td>
            <td>bun</td>
            <td>
              <input type="number" className="form-control" id="bunul" />
            </td>
            <td>
              <input type="number" className="form-control" id="bunll" />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" id="test-check"></input>
            </td>
            <td>total protein</td>
            <td>
              <input type="number" className="form-control" id="ttproteinup" />
            </td>
            <td>
              <input type="number" className="form-control" id="ttproteinll" />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" id="test-check"></input>
            </td>
            <td>albumin</td>
            <td>
              <input type="number" className="form-control" id="albuminup" />
            </td>
            <td>
              <input type="number" className="form-control" id="albuminll" />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" id="test-check"></input>
            </td>
            <td>alt</td>
            <td>
              <input type="number" className="form-control" id="altup" />
            </td>
            <td>
              <input type="number" className="form-control" id="altll" />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" id="test-check"></input>
            </td>
            <td>ast</td>
            <td>
              <input type="number" className="form-control" id="astup" />
            </td>
            <td>
              <input type="number" className="form-control" id="astll" />
            </td>
          </tr>
          <tr>
            <td>
              <input type="checkbox" id="test-check"></input>
            </td>
            <td>alp</td>
            <td>
              <input type="number" className="form-control" id="alpup" />
            </td>
            <td>
              <input type="number" className="form-control" id="alpll" />
            </td>
          </tr>
        </tbody>
      </table>
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
        {msg ? setMsg('alert alert-success', 'successfully added') : ''}
      </div>
      <tab>
        <div>
          <ul>
            <li>parameter list</li>
            <li>create parameter</li>
            <li>delete parameter</li>
            <li>set up params</li>
          </ul>
        </div>
      </tab>
      <div>{list ? new_parameter() : false}</div>
      <div>
        {
          // setParameters()
        }
      </div>
      <div></div>
    </div>
  )
}

export default LiverPanel
