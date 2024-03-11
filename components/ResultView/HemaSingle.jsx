import Malaria from "../ResutlUI/Malaria"
import BloodGrouping from "../ResutlUI/BloodGrouping"
import PregnancyTestUI from "../ResutlUI/PregnancyTestUI"
import UrinalysisUI from "../ResutlUI/UrinalysisUI"
import HepatitisBProfileUI from "../ResutlUI/HepatitisBProfile"
import EsrResultUI from "../ResutlUI/Esr"
import HepatitisBResultUi from "../ResutlUI/HepatitisBResultUi"
import Widal from "../ResutlUI/Widal"
import HelicobacterUI from "../ResutlUI/HelicobacterUI"
import UseCustomResultTemplating from "../ResutlUI/useCustomResultTemplating"

export default function HemaSingle({ result, testname }) {
  const testTemplates = {
    malaria: <Malaria result={result} testname={testname} />,
    blood_grouping: <BloodGrouping result={result} testname={testname} />,
    pregnancy_test: <PregnancyTestUI result={result} testname={testname} />,
    urinalysis: <UrinalysisUI result={result} testname={testname} />,
    hepatitis_b_profile: <HepatitisBProfileUI result={result} testname={testname} />,
    esr: <EsrResultUI result={result} testname={testname} />,
    hepatitis_b: <HepatitisBResultUi result={result} testname={"Hepatitis B test"} />,
    widal: <Widal result={result} testname={testname} />,
    helicobacter_pylori: <HelicobacterUI result={result} testname={"Helicobacter pylori"} />,
    hepatitis_c: <HepatitisBResultUi result={result} testname={"Hepatitis C test Report "} />,
  }

  return <section className="mt-2">{<UseCustomResultTemplating result={result} testname={testname} />}</section>
}
