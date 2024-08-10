import MultipleChoiceSelectiionTestPanelCreation from "./MultipleChoiceSelection"
import ParameterGeneralLimitApplicable from "./ParameterGeneralLimitApplicable";
import ParameterPlainOption from "./ParameterPlainOptions";

export default function CustomParameterTypeSelection({ selection, field, setField }) {
    const rendering = (selection) => {
        if (typeof selection != "string") return;
        if (selection === "options") { return <MultipleChoiceSelectiionTestPanelCreation /> }
        else if (selection ===
            "plain"
        ) {
            return <ParameterPlainOption  field={field} setField={setField}/>
        } else if (selection === 'limits'){
            return <ParameterGeneralLimitApplicable setField={setField} field={field}/>
        } else {

        }
    }


    return <div>
        {rendering(selection)}
    </div>
}