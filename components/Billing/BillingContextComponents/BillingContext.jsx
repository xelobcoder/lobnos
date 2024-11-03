import { createContext, useEffect, useState } from "react";
import { Billingdefaultdata } from "../../../lib/billingLib";



export const BillingContext = createContext(Billingdefaultdata);
export const BillingProvider = BillingContext.Provider;

export function BillingPageContextProvider({ children }) {
     const [billingdata, setBillingdata] = useState(Billingdefaultdata);
     const updateBilling = (value) => { setBillingdata(value) };


     const recalculateTotalBill = function (billingdata) {
          const { paid = 0, appsettings, cart, totalCostOfServices = 0 } = billingdata;
          const { taxIncluded, taxValue } = appsettings;
          if (cart.length === 0) return
          let totalTest = parseFloat(cart.reduce((a, b) => a + b.discountedValue, 0));

          let servicePlusTestCost = parseFloat(totalTest) + parseFloat(totalCostOfServices);

          let total = servicePlusTestCost;
          let amountIncurredDueTax = 0;
          if (taxIncluded == 1) {
               amountIncurredDueTax = (taxValue / 100) * servicePlusTestCost;
               total = amountIncurredDueTax + servicePlusTestCost
          }
          let discount = 0;
          discount = cart.reduce((a, b) => a + b.discount, 0);

          let parsedDiscount = !isNaN(discount) && discount > 0 ? parseFloat(discount) : 0;

          const parsedPaid = !isNaN(paid) && paid > 0 ? parseFloat(paid) : 0
          const payable = total - parsedDiscount;
          const outstanding = payable - parsedPaid;

          updateBilling((prev) => {
               const nw = {
                    ...prev,
                    payable: payable,
                    outstanding,
                    taxValue,
                    paid: parsedPaid,
                    testcost: totalTest,
                    discount: parsedDiscount,
                    cost: total,
                    amountIncurredDueTax,
                    taxIncluded: taxIncluded == 1 ? true : false
               };
               return nw;
          });
     };

     useEffect(() => {
          recalculateTotalBill(billingdata);
     }, [billingdata.cart, billingdata.discount, billingdata.servicesProvided, billingdata.paid]);

     return <BillingProvider value={{ billingdata, updateBilling, recalculateTotalBill }}>{children}</BillingProvider>;
}
