import LimitViewHtmlGenerator from "./ResultEntryOptions/LimitsView";
import OptionsViewHtmlGenerator from "./ResultEntryOptions/OptionsView";
import PlainViewHtmlGenerator from "./ResultEntryOptions/Plain";

export default function ResultEntryHtmlGenerator({ item, statehandler, index }) {
    const { plan } = item;
    if (plan === 'limits') return <LimitViewHtmlGenerator index={index} statehandler={statehandler} fieldItem={item} />
    if (plan === "options") return <OptionsViewHtmlGenerator index={index} statehandler={statehandler} fieldItem={item} />
    return <PlainViewHtmlGenerator index={index} statehandler={statehandler} fieldItem={item} />
}