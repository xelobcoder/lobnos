import { createContext, useState } from "react";


const defaultdata = {
  test: "",
  organization: "",
  clinician: "",
  paymentmode: "",
  paid: 0,
  discount: 0,
  cost: "",
  status: "normal",
  payable: 0,
  testcost: 0,
  type: "",
  taxIncluded: true,
  taxValue: 0,
  patientid: "",
  outstanding: 0,
  samplingCenter: "",
  testpanels: [],
  employeeid: "",
  appsettings: { taxIncluded: false, taxValue: 0 },
  cart: [],
  isFree: false,
  organizationData: [],
  clinicianData: [],
  hasOutstandingDebt: false,
  paymentmodeData: [],
};

export const BillingContext = createContext(defaultdata);
export const BillingProvider = BillingContext.Provider;

export function BillingPageContextProvider({ children }) {
  const [billingdata, setBillingdata] = useState(defaultdata);
  const updateBilling = (value) => {
    setBillingdata(value);
  };

  const recalculateTotalBill = function (billingdata) {
    const { discount, paid, appsettings, cart } = billingdata;
    const { includeTax, taxValue } = appsettings;
    const totalTest =
      cart.length > 0
        ? cart.reduce((a, b) => {
            return a + b.price;
          }, 0)
        : 0;
    let total = 0;
    if (includeTax == 1) {
      total = (taxValue / 100) * totalTest + totalTest;
    } else total = totalTest;
    const payable = total - discount;
    const outstanding = payable - paid;
    updateBilling((prev) => {
      const nw = {
        ...prev,
        payable: payable,
        outstanding,
        taxValue,
        testcost: totalTest,
        cost: total,
        taxIncluded: includeTax == 1 ? true : false,
      };
      return nw;
    });
  };
  return <BillingProvider value={{ billingdata, updateBilling, recalculateTotalBill }}>{children}</BillingProvider>;
}
