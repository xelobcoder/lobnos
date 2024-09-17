import { createContext, useEffect, useState } from "react";


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
    const { discount = 0, paid = 0, appsettings, cart, totalCostOfServices = 0 } = billingdata;
    const { taxIncluded, taxValue } = appsettings;
    if (cart.length === 0) return
    let totalTest = parseFloat(cart.reduce((a, b) => a + b.discountedValue, 0))
    let servicePlusTestCost = parseFloat(totalTest) + parseFloat(totalCostOfServices);
    let total = servicePlusTestCost;
    let amountIncurredDueTax = 0;
    if (taxIncluded == 1) {
      amountIncurredDueTax = (taxValue / 100) * servicePlusTestCost;
      total = amountIncurredDueTax + servicePlusTestCost
    }
    const payable = total - parseFloat(discount)
    const outstanding = payable - paid;

    updateBilling((prev) => {
      const nw = {
        ...prev,
        payable: payable,
        outstanding,
        taxValue,
        testcost: totalTest,
        cost: total,
        amountIncurredDueTax,
        taxIncluded: taxIncluded == 1 ? true : false,
      };
      return nw;
    });
  };

  useEffect(() => {
    recalculateTotalBill(billingdata);
  }, [billingdata.cart, billingdata.discount, billingdata.servicesProvided,billingdata.paid])
  return <BillingProvider value={{ billingdata, updateBilling, recalculateTotalBill }}>{children}</BillingProvider>;
}
