import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SidebarFrontPage from "../../components/frontpagesidebar";
import UpdatePersonal from "../../components/Billing/updatePersonal";
import TestProfileBilling from "../../components/Billing/testprofile";
import SamplingInformation from "../../components/Billing/samplingInformation";
import { ClientContextProvider } from "../../components/Billing/cxtProvider";
import { customFetch } from "../../components/Auth/customFetch";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
export default function Updatebilling() {
  const [clientDetails, setClientDetails] = useState([]);
  const [updateViewer, setUpdateViewer] = useState(false);

  // pick infromation from the database
  const billid = useRouter().query.billingid;

  useEffect(() => {
    try {
     async  function getData() {
        const { result, statusCode } = await customFetch(`billing?billingid=${billid}`)
        statusCode === 200 && setClientDetails(result)
      }
      getData()
    } catch (error) {
      throw error;
    }
  }, [billid]);


  // this would change the state of the updateViewer to true if the button [update test] in the persomal details is clicked
  const updateTestButton = () => setUpdateViewer(true);
  return (
    <SettingsLayout sidebar={<SidebarFrontPage/>}>
      <div className="update-billing-wrapper">
      <div >
        {clientDetails.length > 0 && (
          <>
            <ClientContextProvider value={clientDetails}>
              <UpdatePersonal handleview={updateTestButton} />
              <SamplingInformation source={clientDetails} />
              {updateViewer && (
                <TestProfileBilling />
              )}
            </ClientContextProvider>
          </>
        )}
      </div>
    </div>
    </SettingsLayout>
  );
}
