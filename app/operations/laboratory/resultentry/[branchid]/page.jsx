import PatientResultEntryFormComponentNew from "../../../../../components/operations/ViewTwoResultEntry/PatientResultEntryFormNew";
import { customFetch } from "../../../../../components/Auth/customFetch";
import BillingPagePatientInformation from "../../../../../components/Billing/BillingContextComponents/PersonalInfoView";
import PrimeBreadcrumb from "../../../../../components/accessories/PrimeBreadCrumb";

export default async function ResultEntry({ searchParams, params }) {
   const { ptid, csvid } = await searchParams;
   const { branchid } = await params

   let test = await customFetch(`result/entry/record/collection?csvid=${csvid}&&ptid=${ptid}&&target=${[70, 50].join(",")}&&branchid=${branchid}`)
   let patient_data = await customFetch(`register/personalinformation?patientid=${ptid.slice(50)}`);

   // const billingid = csvid ? parseInt(csvid.toString().slice(70)) : csvid
   // const patientid = ptid ? parseInt(ptid.toString().slice(50)) : ptid


   const data = await Promise.all([test, patient_data]);
   test = data[0];
   patient_data = data[1];

   let contextInfo = {
      viewDetails: false,
      loadtest: true,
      minifyClientInfo: true,
      patientInfo: {},
      patientid: ptid,
      showSlideRightIcon: true,
      showSlideLeftIcon: true,
      employeeid: null,
      testid: null,
      billingid: csvid,
      isInitLoading: true,
      testList: [],
      uiLayout: 2,
      showPatientData: true,
      showTestCollection: true,
      showPreviousRecords: false,
      showPrevTcount: false,
   };


   contextInfo.patientInfo = patient_data?.result || {};
   contextInfo.testList = test?.test || [];

   return (
      <>
         <PrimeBreadcrumb links={[{ label: 'Back To Completed Test', href: "/operations/laboratory/completed" }]} />
         <BillingPagePatientInformation data={contextInfo.patientInfo} />
         <hr />
         <PatientResultEntryFormComponentNew operations={contextInfo} />
      </>
   )
}