import { useContext } from "react";
import RegistrationFieldsView from "../../../components/registration/fields/RegistrationField";
import AuthContext from "../../../components/Auth/useAuthentification";
import { Tabs, Tab } from 'react-bootstrap';
import AdvancedRegistrationSettings from "../../../components/registration/fields/advancedRegistrationSettings";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";

export default function RegistrationFormFields() {
   const { auth } = useContext(AuthContext);
   return (
      <>
         <FrontDeskLayout>
            <Tabs className="d-flex justify-content-end">
               <Tab eventKey='fields' title='fields'>
                  <RegistrationFieldsView employeeid={auth?.employeeid} />
               </Tab>
               <Tab eventKey='views' title='advanced settings'>
                  <AdvancedRegistrationSettings employeeid={auth?.employeeid} />
               </Tab>
            </Tabs>
         </FrontDeskLayout>
      </>
   )
}