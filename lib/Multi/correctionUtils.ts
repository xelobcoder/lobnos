// Utility for correctional adjustment calculations
import { MultiBillingData } from './MultiTypes';

export interface CorrectionalAdjustmentResult {
     previousPaid: number;
     newPayments: number;
     totalPaid: number;
     currentPayable: number;
     outstandingToWriteOff: number;
     isExcess: boolean;
}

export function calculateCorrectionalAdjustment(billingdata: MultiBillingData): CorrectionalAdjustmentResult {
     const previousPaid = Number(billingdata.previousRecordsSummary?.paid) || 0;
     const currentPayable = Number(billingdata.amountPayable) || 0;
     const newPayments = Array.isArray(billingdata.payments)
          ? billingdata.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
          : 0;
     const totalPaid = previousPaid + newPayments;
     let outstandingToWriteOff = 0;
     let isExcess = false;
     if (totalPaid > currentPayable) {
          outstandingToWriteOff = totalPaid - currentPayable;
          isExcess = true;
     } else if (totalPaid < currentPayable) {
          outstandingToWriteOff = currentPayable - totalPaid;
     }
     return {
          previousPaid,
          newPayments,
          totalPaid,
          currentPayable,
          outstandingToWriteOff,
          isExcess
     };
}
