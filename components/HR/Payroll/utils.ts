export const currencyFormatter = new Intl.NumberFormat('en-GH', {
     style: 'currency',
     currency: 'GHS',
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
});

export const formatDate = (dateString: string): string => {
     return new Date(dateString).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
     });
};

export const formatDateInput = (dateString: string): string => {
     return new Date(dateString).toISOString().split('T')[0];
};

export const getPaymentMethodLabel = (method: string): string => {
     const labels: Record<string, string> = {
          bank_transfer: 'Bank Transfer',
          cash: 'Cash',
          cheque: 'Cheque',
          mobile_money: 'Mobile Money'
     };
     return labels[method] || method;
};

export const getPaymentFrequencyLabel = (frequency: string): string => {
     const labels: Record<string, string> = {
          monthly: 'Monthly',
          bi_weekly: 'Biweekly',
          weekly: 'Weekly',
          daily: 'Daily'
     };
     return labels[frequency] || frequency;
};

export const getCompensationTypeLabel = (type: string): string => {
     const labels: Record<string, string> = {
          salary: 'Salary',
          hourly: 'Hourly',
          commission: 'Commission',
          hybrid: 'Hybrid'
     };
     return labels[type] || type;
};
