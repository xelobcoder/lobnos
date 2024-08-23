import { constraintsFormatting, textReferenceFormating } from "../../settingsComponents/FieldsCreation/data/testUtil";

export default function TextReferenceViewHtmlGenerator({ fieldItem, statehandler, index }) {
    const { name, units, value, fieldConstraints, entrymode, textReference } = fieldItem;

    return <tr>
        <td>{name}</td>
        <td><input value={value} type="text" onChange={(ev) => { statehandler(ev, index) }} className="custom-input" /></td>
        <td>{units}</td>
        <td>{textReferenceFormating(textReference)}</td>
        <td>
            {entrymode}
        </td>
        <td>
            {constraintsFormatting(fieldConstraints)}
        </td>
    </tr>
}