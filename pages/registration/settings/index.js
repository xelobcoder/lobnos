import RegistrationFieldsView from "../../../components/registration/fields/RegistrationField";
import { Tabs, Tab } from 'react-bootstrap';
import AdvancedRegistrationSettings from "../../../components/registration/fields/advancedRegistrationSettings";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";

export default function RegistrationFormFields() {
   const { user } = useApplicationSettings().applicationsettings;
   const employeeid = user?.employeeid;
   return (
      <>
         <FrontDeskLayout>
            <Tabs className="d-flex justify-content-end">
               <Tab eventKey='fields' title='fields'>
                  <RegistrationFieldsView employeeid={employeeid} />
               </Tab>
               <Tab eventKey='views' title='advanced settings'>
                  <AdvancedRegistrationSettings employeeid={employeeid} />
               </Tab>
            </Tabs>
         </FrontDeskLayout>
      </>
   )
}