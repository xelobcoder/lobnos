import { constraintsFormatting } from "../../settingsComponents/FieldsCreation/data/testUtil";

export default function LimitViewHtmlGenerator({ fieldItem, statehandler, index }) {
    const { name, value, upperlimit, lowerlimit, units, entrymode = 'manual', fieldConstraints } = fieldItem;


    const determineTableColor = (value, upperlimit, lowerlimit) => {
        if (!isNaN(value) && value != "" && !isNaN(upperlimit) && !isNaN(lowerlimit)) {
            value = parseFloat(value);
            upperlimit = parseFloat(upperlimit);
            lowerlimit = parseFloat(lowerlimit);
            return (value > upperlimit || value < lowerlimit) ? "table-danger" :
                "table-success"
        }
    }


    return (<tr className={determineTableColor(value, upperlimit, lowerlimit)}>
        <td>{name}</td>
        <td>
            <input onChange={(ev) => { statehandler(ev, index) }} className="custom-input" value={value} />
        </td>
        <td>
            {units}
        </td>
        <td>
            {lowerlimit}~{upperlimit}
        </td>
        <td className="pls-d-none">
            {entrymode}
        </td>
        <td className="pls-d-none">
            {constraintsFormatting(fieldConstraints)}
        </td>
    </tr>)
}