import LimitViewHtmlGenerator from "./ResultEntryOptions/LimitsView";
import OptionsViewHtmlGenerator from "./ResultEntryOptions/OptionsView";
import PlainViewHtmlGenerator from "./ResultEntryOptions/Plain";
import TextReferenceViewHtmlGenerator from "./ResultEntryOptions/textReferenceOption";
import GreaterLessViewHtmlGenerator from './ResultEntryOptions/GreaterLessViewHtmlGenerator'

export default function ResultEntryHtmlGenerator({ item, statehandler, index, isDisabled }) {
    const { plan } = item;
    if (plan === 'limits') return <LimitViewHtmlGenerator index={index}
        statehandler={statehandler} fieldItem={item} />
    else if (plan === "greaterLess") return <GreaterLessViewHtmlGenerator index={index}
        statehandler={statehandler} fieldItem={item} />
    else if (plan === "options") return <OptionsViewHtmlGenerator index={index} statehandler={statehandler} fieldItem={item} />
    else if (plan === "textReference") return <TextReferenceViewHtmlGenerator index={index} statehandler={statehandler} fieldItem={item} />
    return <PlainViewHtmlGenerator index={index} statehandler={statehandler} fieldItem={item} />
}