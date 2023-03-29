import React, { use } from "react";
import Header from "../../components/header";
import PersonIcon from "@mui/icons-material/Person";
import { useRouter } from "next/router";
import SidebarFrontPage from "../../components/frontpagesidebar";
import UpdatePersonal from "../../components/Billing/updatePersonal";
import TestProfileBilling from "../../components/Billing/testprofile";
export default function Updatebilling() {
  const [clientDetails, setClientDetails] = React.useState([]);
  const [testsource, setTestSource] = React.useState([]);

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
    } catch (error) {
      console.log(error);
    }
  }, [billid]);




  return (
    <div>
      <div>
        {clientDetails.length > 0 && (
          <>
            <UpdatePersonal clientDetails={clientDetails} />
            <TestProfileBilling test={testsource} />
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
