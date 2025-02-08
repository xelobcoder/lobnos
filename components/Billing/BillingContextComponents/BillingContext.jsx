import { createContext, useState } from "react";
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
     if (taxIncluded === 1 || taxIncluded === true) {
          return (taxValue / 100) * servicePlusTestCost;
     }
     return 0;
}

function calculateDiscount(cart) {
     if (Array.isArray(cart)) {
          if (cart.length === 0) return 0;
          const discount = cart.reduce((sum, item) => {
               return sum + parseFloat(item.discount.toString());
          }, 0);
          return discount;
     }
     return 0;
}

function parsePaidAmount(paid) {
     return !isNaN(paid) && paid > 0 ? parseFloat(paid) : 0;
}

function applyNightAdjustment(cart, nightAdjustmentMode, nightAdjustmentValue) {
     return cart.map(item => {
          item.originalValue = item.discountedValue
          item.nightAdjustmentMode = nightAdjustmentMode
          item.nightAdjustmentValue = nightAdjustmentValue
          let adjustmentDetails = {
               adjustedValue: item.price
          }

          if (nightAdjustmentMode === "absolute") {
               adjustmentDetails.adjustedValue += nightAdjustmentValue;
          } else if (nightAdjustmentMode === "percentage") {
               adjustmentDetails.adjustedValue += (nightAdjustmentValue / 100) * item.discountedValue;
          }

          item.discountedValue = adjustmentDetails.adjustedValue;
          return item;
     });
}

export function BillingPageContextProvider({ children }) {
     const [billingdata, setBillingdata] = useState(Billingdefaultdata);

     const updateBilling = (value) => {
          setBillingdata(value);
     };

     const recalculateTotalBill = (billingdata) => {
          const currentDate = new Date();
          const currentHour = currentDate.getHours();

          const {
               paid = 0,
               appsettings,
               cart,
               nightAdjustmentValue,
               nightAdjustmentMode,
               nightStart,
               nightEnd,
               hasNightAdjustment,
               totalCostOfServices = 0,
          } = billingdata;

          const { taxIncluded, taxValue } = appsettings;

          const isNightTime = currentHour >= nightStart || currentHour < nightEnd;

          if (hasNightAdjustment && isNightTime) {
               billingdata.cart = applyNightAdjustment(cart, nightAdjustmentMode, nightAdjustmentValue);
          }

          const totalTest = cart.length > 0 ? calculateTotalTestCost(billingdata.cart) : 0;

          const servicePlusTestCost = calculateServicePlusTestCost(totalTest, totalCostOfServices);

          let amountIncurredDueTax = parseFloat(
               calculateTax(servicePlusTestCost, taxIncluded, taxValue).toFixed(2)
          );

          let total = parseFloat((servicePlusTestCost + (servicePlusTestCost > 0 ? amountIncurredDueTax : 0)).toFixed(2));

          const discount = parseFloat(calculateDiscount(billingdata.cart).toFixed(2));

          let parsedPaid = parseFloat(parsePaidAmount(paid).toFixed(2));

          const payable = parseFloat((total - discount).toFixed(2));

          let outstanding = parseFloat((payable - parsedPaid).toFixed(2));

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

     return (
          <BillingProvider value={{ billingdata, updateBilling, recalculateTotalBill }}>
               {children}
          </BillingProvider>
     );
}
