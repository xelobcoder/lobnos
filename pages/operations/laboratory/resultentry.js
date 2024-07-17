import { ToastContainer } from "react-toastify";
import ApplicationHeader from "../../../components/Layout/HeaderNav"
import UseOperationContext from "../../../components/operations/ViewTwoResultEntry/ContextOperations/useOperation"
import ResultEntryPanelSecondView from "../../../components/operations/ViewTwoResultEntry/ResultEntrySecondView";

export default function ResultEntry() {
   return (
      <>
         <ApplicationHeader />
         <UseOperationContext>
            <ToastContainer position="top-center" autoClose={2000} draggable={true} theme="colored" className="text-sm" />
            <ResultEntryPanelSecondView />
         </UseOperationContext>
      </>
   )
}