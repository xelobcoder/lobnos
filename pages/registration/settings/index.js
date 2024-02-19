import { useContext } from "react";
import RegistrationFieldsView from "../../../components/registration/RegistrationField";
import AuthContext from "../../../components/Auth/useAuthentification";
import Headers from '../../../components/header';
export default function RegistrationFormFields() {
   const { auth } = useContext(AuthContext);
   return (
      <>
         <Headers />
         <RegistrationFieldsView employeeid={auth?.employeeid} />
      </>
   )
}