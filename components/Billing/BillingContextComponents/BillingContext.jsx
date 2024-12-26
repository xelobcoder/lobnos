import { createContext, useEffect, useState } from "react";
import { Billingdefaultdata } from "../../../lib/billingLib";

export const BillingContext = createContext(Billingdefaultdata);
export const BillingProvider = BillingContext.Provider;

function calculateTotalTestCost(cart) {
     if (cart.length === 0) return 0;
     return cart.reduce((sum, item) => sum + item.discountedValue, 0);
}

function calculateServicePlusTestCost(totalTest, totalCostOfServices) {
     return parseFloat(totalTest) + parseFloat(totalCostOfServices);
}

function calculateTax(servicePlusTestCost, taxIncluded, taxValue) {
     if (taxIncluded === 1 || taxIncluded ===  true) {
          return (taxValue / 100) * servicePlusTestCost;
     }
     return 0;
}

function calculateDiscount(cart) {
     if (Array.isArray(cart)) {
          if (cart.length === 0) return 0;
          const discount = cart.reduce((sum, item) => sum + item.discount, 0);
          return !isNaN(discount) && discount > 0 ? parseFloat(discount) : 0;
     }
     return 0;
}

function parsePaidAmount(paid) {
     return !isNaN(paid) && paid > 0 ? parseFloat(paid) : 0;
}

export function BillingPageContextProvider({ children }) {
     const [billingdata, setBillingdata] = useState(Billingdefaultdata);

     const updateBilling = (value) => {
          setBillingdata(value);
     };

     const recalculateTotalBill = (billingdata) => {
          const { paid = 0, appsettings, cart, totalCostOfServices = 0 } = billingdata;
          const { taxIncluded, taxValue } = appsettings;

          let totalTest = 0;
          if (cart.length > 0) {
               totalTest = calculateTotalTestCost(cart);
          }
          const servicePlusTestCost = calculateServicePlusTestCost(totalTest, totalCostOfServices);
          const amountIncurredDueTax = calculateTax(servicePlusTestCost, taxIncluded, taxValue);
          const total = servicePlusTestCost + amountIncurredDueTax;

          const discount = calculateDiscount(cart);
          const parsedPaid = parsePaidAmount(paid);

          const payable = total - discount;
          const outstanding = payable - parsedPaid;

          updateBilling({
               ...billingdata,
               payable,
               outstanding,
               taxValue,
               paid: parsedPaid,
               testcost: totalTest,
               discount,
               cost: total,
               amountIncurredDueTax,
               taxIncluded: taxIncluded === 1,
          });
     };

     // useEffect(() => {
     //      recalculateTotalBill(billingdata);
     // }, [billingdata.cart, billingdata.discount, billingdata.servicesProvided, billingdata.paid]);

     return (
          <BillingProvider value={{ billingdata, updateBilling, recalculateTotalBill }}>
               {children}
          </BillingProvider>
     );
}
