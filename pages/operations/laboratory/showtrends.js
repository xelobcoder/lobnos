import { useSearchParams } from "next/navigation";
import PatientTrendModalJsx from "../../../components/operations/PatientTrendModalJsx/PatientTrendModal";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";

export default function ShowPatientTestTrends() {
   const testid = useSearchParams().get('testid');
   const billingid = useSearchParams().get('billingid');
   const patientid = useSearchParams().get('patientid');
   const test = useSearchParams().get('test');
   const data = { testid, billingid, patientid, test };
   return (
      <LaboratoryLayout>
         <PatientTrendModalJsx data={data} />
      </LaboratoryLayout>
   )

}