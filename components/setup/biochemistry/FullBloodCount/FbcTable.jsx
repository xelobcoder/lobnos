import { onChangeUnit, onChangeLower, onChangeUpper } from "../../../LabTestForms/utilsetup"
export default function FullBloodCountTable({ fullbloodcount,setFullcount }) {
  return (
    <div className="wrapperx">
      <table className="table">
        <thead>
          <tr>
            <th>parameter name</th>
            <th>unit</th>
            <th>upper</th>
            <th>lower</th>
            <th>action </th>
          </tr>
        </thead>
        <tbody>
          {fullbloodcount.map((item, index) => {
            return (
              <tr key={index}>
                <td>
                  {index + 1}. {item.parameter}
                </td>
                <td>
                  <input className="custom-input" value={item.unit} type="text" onChange={(e) => onChangeUnit(e, index, setFullcount)} />
                </td>
                <td>
                  <input
                    className="custom-input"
                    value={item.upper}
                    type="number"
                    onChange={(e) => onChangeUpper(e, index, setFullcount)}
                  />
                </td>
                <td>
                  <input
                    className="custom-input"
                    value={item.lower}
                    type="number"
                    onChange={(e) => onChangeLower(e, index, setFullcount)}
                  />
                </td>
                <td>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item)}>
                    delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
