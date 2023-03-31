import React, { use } from "react";
import Header from "../../components/header";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/router";
import SidebarFrontPage from "../../components/frontpagesidebar";
import UpdatePersonal from "../../components/Billing/updatePersonal";
import TestProfileBilling from "../../components/Billing/testprofile";
import SamplingInformation from "../../components/Billing/samplingInformation";
import { ClientContextProvider } from "../../components/Billing/cxtProvider";
export default function Updatebilling() {
  const [clientDetails, setClientDetails] = React.useState([]);
  const [testsource, setTestSource] = React.useState([]);
  const [updateViewer, setUpdateViewer] = React.useState(false);


  // pick infromation from the database
  const billid = useRouter().query.billingid;

  React.useMemo(() => {
    try {
      const fetchClientDetails = async () => {
        const res = await fetch(
          `${process.env.BASEURL}/billing?billingid=${billid}`
        );
        const data = await res.json();
        setClientDetails(data?.result);
        setTestSource(data?.result[0]?.TEST.split(','))
      };
      fetchClientDetails();
      // setInterval(() => {
      //   fetchClientDetails();
      // }, 60000)
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
            <ClientContextProvider value={clientDetails }>
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
Updatebilling.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main" id="page-main-view">
          {page}
        </div>
      </div>
    </>
  );
};
