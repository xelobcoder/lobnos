import { useSearchParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { currencyFormatter, customFetch, validateFormData } from "../../../components/Auth/customFetch.js";
import { toast } from "react-toastify";
import AuthContext from "../../../components/Auth/useAuthentification.js";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout.jsx";
import { BillingContext } from "../../../components/Billing/BillingContextComponents/BillingContext.jsx";
import BillingPageLayout from "../../../components/Billing/BillingContextComponents/BillingPageLayout.jsx";

export default function Billing({}) {
  const { auth } = useContext(AuthContext);
  const employeeid = auth?.employeeid;
  const branchid = auth?.branchid;
  const router = useRouter();
  const { billingdata ,updateBilling} = useContext(BillingContext);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [appsettings, setAppsettings] = useState({});



  return (
    <FrontDeskLayout>
      <BillingPageLayout></BillingPageLayout>
    </FrontDeskLayout>
  );
}
