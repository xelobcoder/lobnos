import { createContext, useState } from "react";
import { Billingdefaultdata } from "../../../lib/billingLib";

export const BillingContext = createContext(billingdata);
export const BillingProvider = BillingContext.Provider;

function calculateTotalTestCost(cart) {
     if (cart.length === 0) return 0;
     return cart.reduce((sum, item) => sum + item.discountedValue, 0);
}

function calculateServicePlusTestCost(totalTest, totalCostOfServices) {
     return parseFloat(totalTest) + parseFloat(totalCostOfServices);
}

function calculateTax(servicePlusTestCost, taxIncluded, taxValue) {
     console.log('Calculating tax:',
          taxIncluded)
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
     console.log('Applying time-based adjustment:', nightAdjustmentMode, nightAdjustmentValue);
     return cart.map(item => {
          let adjustedValue = 0;
          if (!item.originalValue) {
               item.originalValue = item.discountedValue
               adjustedValue = item.discountedValue;
          } else {
               adjustedValue = item.originalValue;
          }

          item.nightAdjustmentMode = nightAdjustmentMode
          item.nightAdjustmentValue = nightAdjustmentValue

          if (nightAdjustmentMode === "absolute") {
               adjustedValue += nightAdjustmentValue;
          } else if (nightAdjustmentMode === "percentage") {
               adjustedValue += (nightAdjustmentValue / 100) * item.originalValue;
          }

          item.discountedValue = adjustedValue;
          item.hasNightAdjustment = true;
          return item;
     });
}

function convertTo24Hour(hour, period) {
     if (typeof hour !== 'number') return 0;
     if (hour > 23) return hour % 24;
     if (period?.toLowerCase() === 'pm') {
          return hour === 12 ? 12 : hour + 12;
     } else if (period?.toLowerCase() === 'am') {
          return hour === 12 ? 0 : hour;
     }
     return hour;
}

function isNightTime(currentHour, startHour, endHour) {
     currentHour = currentHour % 24;
     startHour = startHour % 24;
     endHour = endHour % 24;
     if (startHour > endHour) {
          return currentHour >= startHour || currentHour < endHour;
     }
     return currentHour >= startHour && currentHour < endHour;
}

export function BillingPageContextProvider({ children }) {
     const [billingdata, setBillingdata] = useState(Billingdefaultdata);

     const updateBilling = (value) => {
          setBillingdata(value);
     };

     const recalculateTotalBill = (billingdata) => {
          const currentHour = new Date().getHours();

          const {
               nightStart,
               nightEnd,
               nightStartPeriod,
               nightEndPeriod,
               hasNightAdjustment,
               nightAdjustmentMode,
               nightAdjustmentValue,
               cart,
               totalCostOfServices = 0,
               taxIncluded,
               taxValue,
               paid,
               totalServiceDiscount = 0
          } = billingdata;

          const normalizedNightStart = convertTo24Hour(nightStart, nightStartPeriod);
          const normalizedNightEnd = convertTo24Hour(nightEnd, nightEndPeriod);
          const isWithinAdjustmentPeriod = isNightTime(currentHour, normalizedNightStart, normalizedNightEnd);

          if (hasNightAdjustment && isWithinAdjustmentPeriod) {
               billingdata.cart = applyNightAdjustment(cart, nightAdjustmentMode, nightAdjustmentValue);
          } else {
               billingdata.cart = cart.map((item) => ({
                    ...item,
                    hasNightAdjustment: false,
                    nightAdjustmentMode: 'none',
                    nightAdjustmentValue: 0,
                    discountedValue: item.originalValue || item.discountedValue
               }));
          }

          const totalTest = cart.length > 0 ? calculateTotalTestCost(billingdata.cart) : 0;
          const servicePlusTestCost = calculateServicePlusTestCost(totalTest, totalCostOfServices);
          let amountIncurredDueTax = parseFloat(
               calculateTax(servicePlusTestCost, taxIncluded, taxValue).toFixed(2)
          );
          let total = parseFloat((servicePlusTestCost + (servicePlusTestCost > 0 ? amountIncurredDueTax : 0)).toFixed(2));
          const totalTestDiscount = parseFloat(calculateDiscount(billingdata.cart).toFixed(2))
          const discount = parseFloat(totalServiceDiscount || 0) + parseFloat(totalTestDiscount || 0)
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
               totalTestDiscount,
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
