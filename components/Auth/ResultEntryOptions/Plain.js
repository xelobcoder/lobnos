import { constraintsFormatting } from "../../settingsComponents/FieldsCreation/data/testUtil";

export default function PlainViewHtmlGenerator({ fieldItem,statehandler, isDisabled,index }) {
    const {  name,  units,value, fieldConstraints, entrymode } = fieldItem;

    return <tr>
        <td>{name}</td>
        <td><input disabled={isDisabled} value={value} type="text" onChange={(ev) => { statehandler( ev, index) }} className="custom-input" /></td>
        <td>{units}</td>
        <td></td>
        <td className="pls-d-none">
            {entrymode}
        </td>
        <td className="pls-d-none">
            {constraintsFormatting(fieldConstraints)}
        </td>
    </tr>
}