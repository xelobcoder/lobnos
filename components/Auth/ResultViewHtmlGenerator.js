import LimitViewHtmlGeneratorResultView from "../ResutlUI/hasLimitsReference";
import OptionsResultViewHtmlGenerator from "../ResutlUI/hasOptionsResultView";
import HasTextReferenceOptionsResultView from "../ResutlUI/hasTextReferenceOptions";
import PlainResultPrintingViewHtmlGenerator from "../ResutlUI/PlainResultViewHtml";
import GreaterLessResultView  from '../ResutlUI/GreaterLessResultView';
import InputResultViewGenerator from '../ResutlUI/InputResultViewGenerator'

export default function ResultViewHtmlGenerator({ field, index, resultsettings }) {
    const { plan } = field;
    if (plan === 'limits') return <LimitViewHtmlGeneratorResultView resultsettings={resultsettings} index={index} fieldItem={field} />
    else if (plan === "greaterLess") return <GreaterLessResultView resultsettings={resultsettings} index={index} fieldItem={field} />
    else if (plan === "options") return <OptionsResultViewHtmlGenerator resultsettings={resultsettings}  index={index} fieldItem={field} />
    else if (plan === "textReference") return < HasTextReferenceOptionsResultView resultsettings={resultsettings}  index={index} fieldItem={field} />
else if (plan === "input") return <InputResultViewGenerator resultsettings={resultsettings}  index={index} fieldItem={field} />
    else return <PlainResultPrintingViewHtmlGenerator index={index} resultsettings={resultsettings}  fieldItem={field} />
}

