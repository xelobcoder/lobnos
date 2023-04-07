import React, { use } from "react";
import Header from "../../components/header";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/router";
import SidebarFrontPage from "../../components/frontpagesidebar";
import UpdatePersonal from "../../components/Billing/updatePersonal";
import TestProfileBilling from "../../components/Billing/testprofile";
import SamplingInformation from "../../components/Billing/samplingInformation";
import { ClientContextProvider } from "../../components/Billing/cxtProvider";
import { customFetch } from "../../components/Auth/customFetch";
export default function Updatebilling() {
  const [clientDetails, setClientDetails] = React.useState([]);
  const [testsource, setTestSource] = React.useState([]);
  const [updateViewer, setUpdateViewer] = React.useState(false);


  // pick infromation from the database
  const billid = useRouter().query.billingid;

  React.useMemo(async () => {
    try {
      const {result,statusCode} = await customFetch(`billing?billingid=${billid}`)
     statusCode === 200 && setClientDetails(result)
     statusCode === 200 && setTestSource(result[0]?.TEST.split(','));

    } catch (error) {
      throw error;
    }
  }, [billid]);





  // this would change the state of the updateViewer to true if the button [update test] in the persomal details is clicked
  const updateTestButton = () => setUpdateViewer(true);
  console.log(clientDetails)
  return (
    <div className="update-billing-wrapper">
      <div >
        {clientDetails.length > 0 && (
          <>
            <ClientContextProvider value={clientDetails}>
              <UpdatePersonal handleview={updateTestButton} />
              <SamplingInformation source={clientDetails} />
              {updateViewer && (
                <TestProfileBilling test={testsource} />
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
