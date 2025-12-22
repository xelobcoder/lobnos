import { constraintsFormatting, textReferenceFormating } from "../../settingsComponents/FieldsCreation/data/testUtil";

export default function TextReferenceViewHtmlGenerator({ fieldItem, statehandler, index }) {
    const { name, units, value, fieldConstraints, entrymode, textReference } = fieldItem;

    return <tr>
        <td>{name}</td>
        <td><input value={value} type="text" onChange={(ev) => { statehandler(ev, index) }} className="custom-input" style={{ backgroundColor: 'var(--bs-body-bg)', color: 'var(--bs-body-color)', borderColor: 'var(--bs-border-color)' }} /></td>
        <td>{units}</td>
        <td>{textReferenceFormating(textReference)}</td>
        <td className="pls-d-none">
            {entrymode}
        </td>
        <td className="pls-d-none">
            {constraintsFormatting(fieldConstraints)}
        </td>
    </tr>
}