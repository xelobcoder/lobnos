import LimitViewHtmlGenerator from "./ResultEntryOptions/LimitsView";
import OptionsViewHtmlGenerator from "./ResultEntryOptions/OptionsView";
import PlainViewHtmlGenerator from "./ResultEntryOptions/Plain";
import TextReferenceViewHtmlGenerator from "./ResultEntryOptions/textReferenceOption";

export default function ResultEntryHtmlGenerator({ item, statehandler, index,isDisabled }) {
    const { plan } = item;
    if (plan === 'limits') return <LimitViewHtmlGenerator index={index}
    isDisabled={isDisabled}    statehandler={statehandler} fieldItem={item} />
    else if (plan === "options") return <OptionsViewHtmlGenerator isDisabled={isDisabled} index={index} statehandler={statehandler} fieldItem={item} />
    else if (plan === "textReference") return <TextReferenceViewHtmlGenerator isDisabled={isDisabled} index={index} statehandler={statehandler} fieldItem={item} />
    return <PlainViewHtmlGenerator index={index} isDisabled={isDisabled} statehandler={statehandler} fieldItem={item} />
}