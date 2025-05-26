import React, { useContext } from 'react';
// Adjust the path to where BillingContext.jsx is actually located.
// Assuming it's two levels up from MultiStepBilling, then into BillingContextComponents
import { BillingContext } from '../BillingContextComponents/BillingContext.jsx'; 
import BillableItemsStep from './BillableItemsStep';
import ReviewBillStep from './ReviewBillStep';
import PaymentStep from './PaymentStep';

const BillingStepper: React.FC = () => {
  const { currentStep, BILLING_STEPS } = useContext(BillingContext);

  switch (currentStep) {
    case BILLING_STEPS.ITEMS:
      return <BillableItemsStep />;
    case BILLING_STEPS.REVIEW:
      return <ReviewBillStep />;
    case BILLING_STEPS.PAYMENT:
      return <PaymentStep />;
    default:
      console.warn('Unknown billing step:', currentStep);
      return <div>Unknown billing step. Please try refreshing or contact support.</div>;
  }
};

export default BillingStepper;
