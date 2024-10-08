import { ToastContainer } from "react-toastify";
import ApplicationHeader from "../../../components/Layout/HeaderNav";
import UseOperationContext from "../../../components/operations/ViewTwoResultEntry/ContextOperations/useOperation";
import PatientResultEntryFormComponentNew from "../../../components/operations/ViewTwoResultEntry/PatientResultEntryFormNew";

export default function ResultEntry() {
   return (
      <>
         <ApplicationHeader />
         <UseOperationContext>
            <ToastContainer position="top-center" autoClose={2000} draggable={true} theme="colored" className="text-sm" />
            {/* <ResultEntryPanelSecondView /> */}
            <PatientResultEntryFormComponentNew />
         </UseOperationContext>
      </>
   )
}