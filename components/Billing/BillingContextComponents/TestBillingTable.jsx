import { Clear } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { customFetch } from "../../Auth/customFetch";
import { BillingContext } from "./BillingContext";
import TrTable from "./TableTr";

export default function TestBillingTable() {
  const { billingdata, updateBilling } = useContext(BillingContext);
  const [appsettings, setAppsettings] = useState({});
  const router = useRouter();
  const patientid = useSearchParams().get("patientid");
  const cart = billingdata?.cart;

  const getAllNecessaryData = async function () {
    try {
      const panels = await customFetch("testpanel/list/bulk");
      const organization = await customFetch("organization");
      const clinician = await customFetch("clinicians");
      const paymentModes = await customFetch("paymentmodes");
      const myprops = await Promise.all([panels, organization, clinician, paymentModes]);
      updateBilling({
        ...billingdata,
        organizationData: myprops[1]?.result,
        clinicianData: myprops[2]?.result,
        paymentmodeData: myprops[3]?.data,
        testpanels: myprops[0]?.data,
        appsettings,
      });
    } catch (err) {
      toast.error("something wrong occured", { autoClose: 3000 });
    }
  };

  const getOustandingBill = async () => {
    if (patientid) {
      customFetch(`billing/client/bulk/outstanding?patientid=${patientid}`)
        .then((data) => {
          const outstandingDebt = data?.result[0]?.outstanding;
          if (outstandingDebt > 0) {
            router.push(`/billing/payment/update/${patientid}`);
          } else {
            getAllNecessaryData();
          }
        })
        .catch((err) => {
          toast.error("something wrong occured", { autoClose: 500 });
        });
    }
  };

  function getAppSet() {
    customFetch(`applicationsettings/billing`)
      .then((data) => {
        const { PaidBillsBeforeTransaction } = data;
        setAppsettings(data);
        if (PaidBillsBeforeTransaction === 1) {
          getOustandingBill();
        } else {
          getAllNecessaryData();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    if (patientid) {
      customFetch(`billing/caninitialbill?patientid=${patientid}`)
        .then((data) => {
          const { canInitiateBill } = data;
          if (canInitiateBill === false) {
            toast.warn(`Billing cannot be initiated for client today.Kindly update previous billing`, { autoClose: 5000 });
          } else {
            getAppSet();
          }
          console.log("h");
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientid]);

  return (
    <Table striped hover className="table">
      <thead className="text-capitalize">
        <tr style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%" }}>
          <th>test</th>
          <th>quantity</th>
          <th>Price</th>
          <th>action</th>
        </tr>
      </thead>
      <tbody>
        {cart.length > 0 &&
          cart.map((item, index) => {
            return (
              <tr key={index} style={{ display: "grid", gridTemplateColumns: "40% 20% 20% 20%" }}>
                <td>{item.name}</td>
                <td>{item.quantity || 1}</td>
                <td>{item.price}</td>
                <td>
                  <Clear color="error" />
                </td>
              </tr>
            );
          })}
        <TrTable />
      </tbody>
    </Table>
  );
}
