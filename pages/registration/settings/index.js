import { useContext } from "react";
import RegistrationFieldsView from "../../../components/registration/fields/RegistrationField";
import AuthContext from "../../../components/Auth/useAuthentification";
import Headers from '../../../components/header';
import { Tabs, Tab } from 'react-bootstrap';
import AdvancedRegistrationSettings from "../../../components/registration/fields/advancedRegistrationSettings";
export default function RegistrationFormFields() {
   const { auth } = useContext(AuthContext);
   return (
      <>
         <Headers />
         <Tabs className="d-flex justify-content-end">
            <Tab eventKey='fields' title='fields'>
               <RegistrationFieldsView employeeid={auth?.employeeid} />
            </Tab>
            <Tab eventKey='views' title='advanced settings'>
               <AdvancedRegistrationSettings employeeid={auth?.employeeid} />
            </Tab>
         </Tabs>
      </>
   )
}