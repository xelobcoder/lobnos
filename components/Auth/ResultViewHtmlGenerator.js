import LimitViewHtmlGeneratorResultView from "../ResutlUI/hasLimitsReference";
import OptionsResultViewHtmlGenerator from "../ResutlUI/hasOptionsResultView";
import HasTextReferenceOptionsResultView from "../ResutlUI/hasTextReferenceOptions";
import PlainResultPrintingViewHtmlGenerator from "../ResutlUI/PlainResultViewHtml";

export default function ResultViewHtmlGenerator({field,index}) {
    const { plan } = field;
    if (plan === 'limits') return <LimitViewHtmlGeneratorResultView index={index} fieldItem={field} />
    else if (plan === "options") return <OptionsResultViewHtmlGenerator  index={index} fieldItem={field} />
    else if (plan === "textReference") return < HasTextReferenceOptionsResultView index={index} fieldItem={field} />
    return <PlainResultPrintingViewHtmlGenerator index={index} fieldItem={field} />
}

