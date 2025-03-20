import MultipleChoiceSelectiionTestPanelCreation from "./MultipleChoiceSelection";
import ParameterGeneralLimitApplicable from "./ParameterGeneralLimitApplicable";
import ParameterPlainOption from "./ParameterPlainOptions";
import TextRReferenceOptions from "./TextRReferenceOptions";
import UltrasoundFieldsCreation from "./UltrasoundFieldsCreation";

export default function CustomParameterTypeSelection({ selection, field, setField }) {
    const renderComponent = (selection) => {
        switch (selection) {
            case "options":
                const hasChildren = field.options.includes(",");
                const defaultOptions = hasChildren ? field.options.split(",") : [];
                return <MultipleChoiceSelectiionTestPanelCreation defaultOptions={defaultOptions} field={field} setField={setField} />;
            case "plain":
                return <ParameterPlainOption field={field} setField={setField} />;
            case "limits":
                return <ParameterGeneralLimitApplicable setField={setField} field={field} />;
            case "textReference":
                return <TextRReferenceOptions setField={setField} field={field} />
            case "ultrasoundFields":
                return <UltrasoundFieldsCreation setField={setField} field={field} />
            default:
                return null;
        }
    };

    return <div>{renderComponent(selection)}</div>;
}
