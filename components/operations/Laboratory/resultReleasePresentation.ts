type ResultWorkflowItem = {
     availableForPrinting?: boolean;
     clientstatus?: unknown;
     explicitReleaseRequired?: boolean;
     paymentstatus?: unknown;
     releaseStatus?: string;
     released?: boolean;
     releasedBy?: number;
     releasedByName?: string;
     tests?: ResultWorkflowItem[];
};

export function isReleasedResult(item: ResultWorkflowItem) {
     return item?.releaseStatus === 'released' || item?.released === true;
}

export function isPrintableResult(item: ResultWorkflowItem) {
     return isReleasedResult(item) || item?.availableForPrinting === true;
}

export function releaseStatusLabel(item: ResultWorkflowItem) {
     if (isReleasedResult(item)) return `Released by ${item.releasedByName || 'staff #' + item.releasedBy}`;
     if (item?.releaseStatus === 'awaiting_manager_approval') return 'Awaiting manager approval';
     if (item?.releaseStatus === 'awaiting_different_validator') return 'Different validator required';
     if (item?.availableForPrinting && item?.explicitReleaseRequired === false) return 'Available for printing (sign-off optional)';
     if (item?.releaseStatus === 'release_optional') return 'Sign-off optional';
     return 'Awaiting sign-off and release';
}

export function printBlockedReason(item: ResultWorkflowItem, allowPrintingUnpaid: unknown) {
     const printableItems = Array.isArray(item?.tests) ? item.tests : [item];
     if (!printableItems.some(isPrintableResult)) {
          if (printableItems.some(result => result?.releaseStatus === 'awaiting_manager_approval')) return 'manager';
          if (printableItems.some(result => ['awaiting_validation', 'awaiting_different_validator'].includes(result?.releaseStatus || ''))) return 'validation';
          return printableItems.every(result => result?.explicitReleaseRequired === false || result?.releaseStatus === 'release_optional')
               ? 'not_available' : 'release';
     }
     const hasPaidPrintableResult = printableItems.some(result => {
          const paymentStatus = result?.paymentstatus ?? result?.clientstatus;
          return isPrintableResult(result) && String(paymentStatus || '').trim().toLowerCase() === 'paid';
     });
     if (Number(allowPrintingUnpaid) === 1 || hasPaidPrintableResult) return null;
     return 'unpaid';
}
