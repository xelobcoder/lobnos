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
  previousRecords: [],
  servicesProvided: [],
  totalCostOfServices: 0,
  taxAppliedRecords: [],
  taxIncluded: true,
  taxValue: 0,
  patientid: "",
  outstanding: 0,
  samplingCenter: "",
  testpanels: [],
  employeeid: "",
  billingSource: 0,
  appsettings: { taxIncluded: false, taxValue: 0 },
  cart: [],
  isFree: false,
  cantIgnoreDebt: false,
  organizationData: [],
  clinicianData: [],
  amountIncurredDueTax: 0,
  hasOutstandingDebt: false,
  paymentmodeData: [],
};

export const BillingContext = createContext(defaultdata);
export const BillingProvider = BillingContext.Provider;

export function BillingPageContextProvider({ children }) {
  const [billingdata, setBillingdata] = useState(defaultdata);
  const updateBilling = (value) => { setBillingdata(value) };

  const recalculateTotalBill = function (billingdata) {
    const { discount, paid, appsettings, cart, billingSource } = billingdata;
    const { taxIncluded, taxValue } = appsettings;
    if (cart.length === 0) return
    let totalTest = 0;
    if (billingSource == 1) {
      totalTest = cart.reduce((a, b) => a + b.discountedValue, 0)
    }

    if (billingSource == 2 && cart.length > 0) {
      totalTest = cart.reduce((a, b) => a + b.discountedValue, 0)
    }

    let total = 0;
    if (taxIncluded == 1) {
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
        taxIncluded: taxIncluded == 1 ? true : false,
      };
      return nw;
    });
  };
  return <BillingProvider value={{ billingdata, updateBilling, recalculateTotalBill }}>{children}</BillingProvider>;
}
