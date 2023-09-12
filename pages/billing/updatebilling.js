import React, { useState, useEffect } from "react";
import Header from "../../components/header";
import { useRouter } from "next/router";
import SidebarFrontPage from "../../components/frontpagesidebar";
import UpdatePersonal from "../../components/Billing/updatePersonal";
import TestProfileBilling from "../../components/Billing/testprofile";
import SamplingInformation from "../../components/Billing/samplingInformation";
import { ClientContextProvider } from "../../components/Billing/cxtProvider";
import { customFetch } from "../../components/Auth/customFetch";
export default function Updatebilling() {
  const [clientDetails, setClientDetails] = React.useState([]);
  const [updateViewer, setUpdateViewer] = React.useState(false);


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
  );
}
// Updatebilling.getLayout = function (page) {
//   return (
//     <>
//       <Header />
//       <div className="wrapper">
//         <div className="side">
//           <SidebarFrontPage />
//         </div>
//         <div className="main" id="page-main-view">
//           {page}
//         </div>
//       </div>
//     </>
//   );
// };
