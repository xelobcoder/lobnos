import { createContext, useState } from "react";
import { Billingdefaultdata } from "../../../lib/billingLib";

// Define Step Types
export const BILLING_STEPS = {
  ITEMS: 'items',       // Step for selecting billable items
  REVIEW: 'review',     // Step for reviewing the pending bill
  PAYMENT: 'payment',   // Step for processing payment
};

export const BillingContext = createContext({
    ...Billingdefaultdata,
    currentStep: BILLING_STEPS.ITEMS,
    goToStep: (stepName) => {}, // Removed type annotation
    goToNextStep: () => {},
    goToPreviousStep: () => {},
    recalculateTotalBill: (data) => {}, // Removed type annotation
    updateBilling: (data) => {}, // Removed type annotation
    BILLING_STEPS,
});
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

export function BillingPageContextProvider({ children, initialBillingData }) { // Added initialBillingData prop
     const [billingdata, setBillingdata] = useState(initialBillingData || Billingdefaultdata); // Use initialBillingData or fallback
     const [currentStep, setCurrentStep] = useState(BILLING_STEPS.ITEMS);

     const updateBilling = (value) => {
          setBillingdata(value);
     };

     // Navigation Functions
     const goToStep = (stepName) => {
          if (Object.values(BILLING_STEPS).includes(stepName)) {
               setCurrentStep(stepName);
          } else {
               console.warn("Attempted to navigate to invalid billing step:", stepName);
          }
     };

     const goToNextStep = () => {
          if (currentStep === BILLING_STEPS.ITEMS) {
               setCurrentStep(BILLING_STEPS.REVIEW);
          } else if (currentStep === BILLING_STEPS.REVIEW) {
               setCurrentStep(BILLING_STEPS.PAYMENT);
          }
     };

     const goToPreviousStep = () => {
          if (currentStep === BILLING_STEPS.PAYMENT) {
               setCurrentStep(BILLING_STEPS.REVIEW);
          } else if (currentStep === BILLING_STEPS.REVIEW) {
               setCurrentStep(BILLING_STEPS.ITEMS);
          }
     };

     const recalculateTotalBill = (currentBillingDataInput) => { // Renamed to avoid conflict
          const dataToRecalculate = currentBillingDataInput || billingdata; // Use passed data or current state
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
               totalServiceDiscount,
               hasNightAdjustment, // This is the flag indicating if night adjustment *should* be considered
               totalCostOfServices = 0,
          } = dataToRecalculate;

          const { taxIncluded, taxValue: taxValFromSettings } = appsettings; // Renamed taxValue to avoid conflict
          
          const isWithinAdjustmentPeriod = nightStart > nightEnd
               ? (currentHour >= nightStart || currentHour < nightEnd)
               : (currentHour >= nightStart && currentHour < nightEnd);

          let processedCart = cart.map(item => {
            const originalVal = item.originalValue !== undefined ? item.originalValue : item.discountedValue;
            let currentDiscountedValue = originalVal;

            if (hasNightAdjustment && isWithinAdjustmentPeriod) {
                if (nightAdjustmentMode === "absolute") {
                    currentDiscountedValue = originalVal + nightAdjustmentValue;
                } else if (nightAdjustmentMode === "percentage") {
                    currentDiscountedValue = originalVal + (nightAdjustmentValue / 100) * originalVal;
                }
                return {
                    ...item,
                    originalValue: originalVal,
                    discountedValue: currentDiscountedValue,
                    // Retain nightAdjustmentMode and nightAdjustmentValue as set initially
                };
            } else {
                return {
                    ...item,
                    originalValue: originalVal,
                    discountedValue: originalVal, // Revert to original value
                    // Retain nightAdjustmentMode and nightAdjustmentValue
                };
            }
          });

          const totalTest = processedCart.length > 0 ? calculateTotalTestCost(processedCart) : 0;
          const servicePlusTestCost = calculateServicePlusTestCost(totalTest, totalCostOfServices);
          const amountIncurredDueTax = parseFloat(
               calculateTax(servicePlusTestCost, taxIncluded, taxValFromSettings).toFixed(2)
          );
          const total = parseFloat((servicePlusTestCost + (servicePlusTestCost > 0 ? amountIncurredDueTax : 0)).toFixed(2));
          const totalTestDiscount = parseFloat(calculateDiscount(processedCart).toFixed(2));
          const discount = parseFloat(totalServiceDiscount || 0) + parseFloat(totalTestDiscount || 0);
          const parsedPaid = parseFloat(parsePaidAmount(paid).toFixed(2));
          const payable = parseFloat((total - discount).toFixed(2));
          const outstanding = parseFloat((payable - parsedPaid).toFixed(2));

          setBillingdata({
               ...dataToRecalculate,
               cart: processedCart,
               payable,
               outstanding,
               taxValue: taxValFromSettings, // Use the value from appsettings
               paid: parsedPaid,
               testcost: totalTest,
               totalTestDiscount,
               discount,
               cost: total,
               amountIncurredDueTax,
               taxIncluded: taxIncluded === 1,
          });
     };
     
     const contextValue = {
          billingdata,
          updateBilling,
          recalculateTotalBill,
          currentStep,
          goToStep,
          goToNextStep,
          goToPreviousStep,
          BILLING_STEPS,
     };

     return (
          <BillingProvider value={contextValue}>
               {children}
          </BillingProvider>
     );
}
