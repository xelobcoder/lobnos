
export default function GreaterLessViewHtmlGenerator({ fieldItem, statehandler, index }) {
     const { name, units, value, fieldConstraints, entrymode, textReference } = fieldItem;

     return <tr>
          <td>{name}</td>
          <td><input value={value} type="number" step={0.1} min={0.0} onChange={(ev) => { statehandler(ev, index) }} className="custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} /></td>
          <td>{units}</td>
          <td>{textReference}</td>
          <td className="pls-d-none">
               {entrymode}
          </td>
          <td className="pls-d-none">

          </td>
     </tr>
}
