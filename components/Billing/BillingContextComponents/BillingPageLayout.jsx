import { BillingPageContextProvider } from "./BillingContext";
import PatientFiltered from "../../accessories/CustomerFiltering";
import RenderingWithPatientIdProvided from "./RenderingWithPatientIdProvided";
import { useSearchParams, useRouter } from "next/navigation";
import BillingSourceDeterminer from "./BillingOptionsSource";


export default function BillingPageLayout() {
  const patientid = useSearchParams().get('patientid');
  const router = useRouter();

  const filteredPatient = (options) => {
    const hasPatientid = typeof options == "object" && options.hasOwnProperty('patientid');
    if (!hasPatientid) return;
    const { patientid } = options;
    router.push(`/billing/patientid?patientid=${patientid}`)
  }

  if (!patientid) {
    return (
      <div className="col-3 my-3 mx-2">
        <PatientFiltered getSelectedPatient={filteredPatient} />
      </div>
    )
  }

  return (
    <BillingPageContextProvider>
      <BillingSourceDeterminer patientid={patientid} />
      <RenderingWithPatientIdProvided patientid={patientid} />
    </BillingPageContextProvider>
  );
}
