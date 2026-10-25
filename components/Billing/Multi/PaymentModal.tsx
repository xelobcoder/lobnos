import React from "react";
import { Modal, Button } from "react-bootstrap";
import { MultiBillingData } from "../../../lib/Multi/MultiTypes";
import { customPost, customFetch } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';

interface PaymentModeOption {
     value: string | number;
     label: string;
}

interface PaymentEntry {
     mode: string | number;
     amount: number;
}

interface PaymentModalProps {
     renderPayment?: (model: any) => React.ReactNode;
     inline?: boolean;
     show: boolean;
     onHide: () => void;
     payments: PaymentEntry[];
     paymentModes?: PaymentModeOption[];
     availableModes: PaymentModeOption[];
     newPayment?: { mode: string | number; amount: string };
     validationError?: string;
     payable: number;
     currentTotal?: number;
     handleAdd?: () => void;
     handleAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
     setNewPayment: React.Dispatch<React.SetStateAction<{ mode: string | number; amount: string }>>;
     setBillingData: (data: any) => void;
     billingdata: any;
     handlesubmit?: (data: MultiBillingData) => Promise<{ status: boolean, message?: string, billingid?: number | string } | undefined>;
}


const InlinePaymentContainer = ({children}:any) => <section className="modern-inline-payment" aria-label="Payment details">{children}</section>;

const PaymentModal: React.FC<PaymentModalProps> = ({
     show,
     inline = false,
     renderPayment,
     onHide,
     payments,
     availableModes,
     payable,
     handlesubmit,
     setNewPayment,
     setBillingData,
     billingdata
}) => {
     const validatePaymentAmount = (inputValue: string, idx: number, payAllPayments: PaymentEntry[], payable: number) => {
          let val = Number(inputValue);
          const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) =>
               i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
          const maxAllowed = Math.max(0, payable - otherPaymentsTotal);
          if (val > payable) val = payable;
          if (val > maxAllowed) val = maxAllowed;
          return val;
     };

     const isNHISBilling = Number(billingdata?.source) === 4 || Number(billingdata?.billingsource) === 4 || Number(billingdata?.billingSource) === 4 || String(billingdata?.entityType).toLowerCase() === 'nhis';
     console.log('Billing Source Check:', {
          source: billingdata?.source,
          billingsource: billingdata?.billingsource,
          billingSource: billingdata?.billingSource,
          entityType: billingdata?.entityType,
          isNHISBilling
     });
     const benefitPatientId=billingdata?.patientId||(renderPayment?billingdata?.patientid:undefined);
     const [paymentMode, setPaymentMode] = React.useState<'all' | 'items' | 'free' | 'nhis' | 'foc'>(isNHISBilling ? 'nhis' : 'all');
     const [paySelected, setPaySelected] = React.useState(false);
     const [selectedAmount, setSelectedAmount] = React.useState('');
     const [bulkPerTestMode, setBulkPerTestMode] = React.useState('');
     const [payAllPayments, setPayAllPayments] = React.useState<PaymentEntry[]>(payments.length ? payments : [{ mode: '', amount: 0 }]);
     const [payAllError, setPayAllError] = React.useState('');
     const [isSyncing, setIsSyncing] = React.useState(false);
     const [isValueSynchronized, setIsValueSynchronized] = React.useState(false);

     // Staff FOC states
     const [focAccounts, setFocAccounts] = React.useState<any[]>([]);
     const [selectedFocStaffId, setSelectedFocStaffId] = React.useState<string>('');
     const [focReason, setFocReason] = React.useState('Staff Medical Benefit');
     const [focValidationResult, setFocValidationResult] = React.useState<any>(null);
     const [isValidatingFoc, setIsValidatingFoc] = React.useState(false);

     // Free service request states
     const [freeServiceRequestId, setFreeServiceRequestId] = React.useState<number | null>(null);
     const [freeServiceRequestStatus, setFreeServiceRequestStatus] = React.useState<'idle' | 'requesting' | 'approved' | 'rejected'>('idle');
     const [freeServiceRequestError, setFreeServiceRequestError] = React.useState('');
     const [requesterReason, setRequesterReason] = React.useState('');
     const [pollInterval, setPollInterval] = React.useState<NodeJS.Timeout | null>(null);

     // Get employee details from application context
     const { applicationsettings } = useApplicationSettings();
     const employeeid = applicationsettings?.user?.employeeid;

     const tests = isValueSynchronized ? (billingdata?.finalCart || []) : (billingdata?.cart || []);
     const services = isValueSynchronized ? (billingdata?.finalServicesList || []) : (billingdata?.servicesProvided || []);

     const items = [
          ...tests.map(test => ({
               type: 'test',
               id: test.id,
               name: test.name,
               maxAmount: test.totalpayable ?? 0,
               paymentType: null,
               amountPaid: test.paidamount ?? test.amountPaid ?? 0,
               status: test.paymentstatus ?? test.status ?? 'pending',
          })),
          ...services.map(service => ({
               type: 'service',
               id: service.keyid,
               name: service.serviceName,
               maxAmount: service.totalpayable ?? 0,
               paymentType: null,
               amountPaid: service.paidamount ?? service.amountPaid ?? 0,
               status: service.paymentstatus ?? service.status ?? 'pending',
          }))
     ];



     const [perItemPayments, setPerItemPayments] = React.useState(() =>
          items.map(item => ({
               itemType: item.type,
               itemId: item.id,
               amount: '',
               mode: '',
               paymentId: ''
          }))
     );
     const [selectedItems, setSelectedItems] = React.useState(() => items.map(() => false));
     const [selectedPayments, setSelectedPayments] = React.useState(() =>
          items.map(item => ({
               itemType: item.type,
               itemId: item.id,
               amount: '',
               mode: '',
               paymentId: ''
          }))
     );






     const localTotalPaid = selectedPayments.reduce((sum, p, idx) => selectedItems[idx] ? sum + Number(p.amount || 0) : sum, 0);

     function allocateAmount(amount: number, itemMaxes: number[]): number[] {
          let remaining = amount;
          return itemMaxes.map(max => {
               const alloc = Math.min(max, remaining);
               remaining -= alloc;
               return alloc;
          });
     }



     const handlePaymentModalReset = () => {
          setPaymentMode('all');
          setIsSyncing(false);
          setPaySelected(false);
          setSelectedAmount('');
          setBulkPerTestMode('');
          setPerItemPayments(items.map(item => ({
               itemType: item.type,
               itemId: item.id,
               amount: '',
               mode: '',
               paymentId: ''
          })));
          setSelectedItems(items.map(() => false));
          setSelectedPayments(items.map(item => ({
               itemType: item.type,
               itemId: item.id,
               amount: '',
               mode: '',
               paymentId: ''
          })));
          setNewPayment({ mode: '', amount: '' });
          setPayAllPayments([{ mode: '', amount: 0 }]);
          setPayAllError('');
          setIsValueSynchronized(false);

          const resetCart = (billingdata?.finalCart || []).map(item => ({
               ...item,
               paidamount: 0,
               paymentstatus: 'pending',
          }));

          const resetServices = (billingdata?.finalServicesList || []).map(item => ({
               ...item,
               paidamount: 0,
               paymentstatus: 'pending',
          }));
          setBillingData({
               ...billingdata,
               payments: [],
               paid: 0,
               balance: payable,
               finalCart: resetCart,
               finalServicesList: resetServices,
          });
     }


     React.useEffect(() => {
          if (paySelected && selectedAmount && !isNaN(Number(selectedAmount))) {
               let maxTarget = payable;
               let remaining = Math.min(Number(selectedAmount), maxTarget);
               let newSelectedPayments = items.map((item, idx) => {
                    if (remaining > 0) {
                         const amt = Math.min(item.maxAmount, remaining);
                         remaining -= amt;
                         return {
                              ...selectedPayments[idx],
                              amount: amt > 0 ? String(amt) : '',
                         };
                    }
                    return {
                         ...selectedPayments[idx],
                         amount: '',
                    };
               });
               setSelectedPayments(newSelectedPayments);
          }
          if (paySelected && (!selectedAmount || isNaN(Number(selectedAmount)))) {
               setSelectedPayments(items.map((item, idx) => ({ ...selectedPayments[idx], amount: '' })));
          }
     }, [selectedAmount, paySelected]);

     React.useEffect(() => {
          if (paymentMode === 'free' || paymentMode === 'nhis' || paymentMode === 'foc') {
               setPayAllPayments([{ mode: '', amount: 0 }]);
               setSelectedAmount('');
               setBulkPerTestMode('');
               setSelectedItems(items.map(() => false));
          }
     }, [paymentMode]);

     React.useEffect(() => {
          if (show) {
               customFetch('foc/accounts?count=100').then((res) => {
                    if (res?.result?.accounts && Array.isArray(res.result.accounts)) {
                         setFocAccounts(res.result.accounts);
                    }
               }).catch(() => { });
          }
     }, [show]);

     React.useEffect(() => {
          if (paymentMode === 'foc' && selectedFocStaffId && benefitPatientId) {
               setIsValidatingFoc(true);
               customPost('foc/validate', 'POST', {
                    employeeid: Number(selectedFocStaffId),
                    patientid: Number(benefitPatientId),
                    grossAmount: payable,
               }).then((res) => {
                    if (res?.result) {
                         setFocValidationResult(res.result);
                    }
               }).catch(() => { }).finally(() => setIsValidatingFoc(false));
          }
     }, [paymentMode, selectedFocStaffId, payable, benefitPatientId]);

     React.useEffect(() => {
          if (paymentMode === 'all') {
               setPayAllPayments(prev => {
                    if (prev.length === 1 && prev[0].amount === 0) {
                         const outstanding = payable - (billingdata?.paid || 0);
                         return [{ mode: prev[0].mode, amount: outstanding }];
                    }
                    return prev;
               });
          }
     }, [paymentMode, payable, billingdata?.paid]);


     const handleBulkPaymentMode = (mode) => {
          setSelectedPayments(payments => payments.map((p, i) => selectedItems[i] ? { ...p, mode } : p));
     };






     const paymentSummaryHtml = (() => {
          const paid = billingdata?.paid || 0;
          const remaining = payable - paid;
          if (remaining !== 0) {
               return (
                    <div className="text-danger fw-bold">
                         Remaining: {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
               );
          }
          return null;
     })();



     const isSkipPaymentDisabled = (() => {
          if (paymentMode === 'free' || paymentMode === 'nhis') return true;
          if (paymentMode === 'all') {
               return payAllPayments.some(p => p.mode !== '' || Number(p.amount) > 0);
          }
          if (paymentMode === 'items') {
               return selectedAmount !== '' || selectedItems.some(Boolean) || bulkPerTestMode !== '';
          }
          return false;
     })();

     const handlePaymentSyncing = async () => {
          setIsSyncing(true);

          if (paymentMode === 'foc') {
               if (!selectedFocStaffId || !focValidationResult?.eligible || isValidatingFoc) {
                    setPayAllError('Please select an eligible staff member for FOC benefit.');
                    setIsSyncing(false);
                    return;
               }

               const focCoverage = focValidationResult?.focCoverage || 0;
               const patientPayable = focValidationResult?.patientPayable || 0;

               const updatedCart = tests.map((test) => ({
                    ...test,
                    paidamount: 0,
                    paymentstatus: 'pending',
               }));

               const updatedServices = services.map((service) => ({
                    ...service,
                    paidamount: 0,
                    paymentstatus: 'pending',
               }));

               const newCurrentData = {
                    ...billingdata,
                    finalCart: updatedCart,
                    finalServicesList: updatedServices,
                    paid: 0,
                    focStaffId: Number(selectedFocStaffId),
                    focReason: focReason || 'Staff Medical Benefit',
                    focCoverage,
                    paymentDetails: {
                         mode: 'foc',
                         focStaffId: Number(selectedFocStaffId),
                         focReason: focReason || 'Staff Medical Benefit',
                         amount: 0,
                    },
                    payments: [],
                    balance: 0,
                    outstanding: payable,
                    openPaymentModal: 0,
               };

               setBillingData(newCurrentData);
               if (handlesubmit) {
                    const result = await handlesubmit(newCurrentData);
                    if (result?.status === true) {
                         setIsValueSynchronized(true);
                         setIsSyncing(false);
                    } else {
                         setIsSyncing(false);
                    }
               } else {
                    setIsValueSynchronized(true);
                    setIsSyncing(false);
               }
               return;
          }

          if (paymentMode === 'free') {
               const updatedCart = tests.map((test) => {
                    const originalPrice = test.price || test.actualPrice || test.originalPrice || 0;
                    return {
                         ...test,
                         discount: originalPrice,
                         discountedValue: originalPrice,
                         totalpayable: 0,
                         paidamount: 0,
                         paymentstatus: 'Paid',
                    };
               });

               const updatedServices = services.map((service) => {
                    const originalPrice = service.servicePrice || 0;
                    return {
                         ...service,
                         discount: originalPrice,
                         discountedValue: originalPrice,
                         totalpayable: 0,
                         paidamount: 0,
                         paymentstatus: 'Paid',
                    };
               });

               const newCurrentData = {
                    ...billingdata,
                    finalCart: updatedCart,
                    finalServicesList: updatedServices,
                    paid: 0,
                    amountPayable: 0,
                    payments: [],
                    paymentDetails: { mode: 'free', amount: 0 },
                    balance: 0,
                    openPaymentModal: 0,
               };

               setBillingData(newCurrentData);
               if (handlesubmit) {
                    const result = await handlesubmit(newCurrentData);
                    if (result?.status === true) {
                         setIsValueSynchronized(true);
                         setIsSyncing(false);
                    } else {
                         setIsSyncing(false);
                    }
               } else {
                    setIsValueSynchronized(true);
                    setIsSyncing(false);
               }
               return;
          }

          if (paymentMode === 'nhis') {
               const nhisPaymentMode = availableModes.find(mode =>
                    String(mode.label).toLowerCase() === 'nhis' ||
                    String(mode.label).toLowerCase().includes('nhis')
               );
               const nhisModeValue = nhisPaymentMode ? nhisPaymentMode.value : 'nhis';

               const updatedCart = tests.map((test) => {
                    return {
                         ...test,
                         paidamount: 0,
                         paymentstatus: 'pending',
                    };
               });

               const updatedServices = services.map((service) => {
                    return {
                         ...service,
                         paidamount: 0,
                         paymentstatus: 'pending',
                    };
               });

               const newCurrentData = {
                    ...billingdata,
                    finalCart: updatedCart,
                    finalServicesList: updatedServices,
                    paid: 0,
                    amountPayable: payable,
                    payments: [],
                    paymentDetails: { mode: 'nhis', amount: 0 },
                    balance: payable,
                    outstanding: payable,
                    openPaymentModal: 0,
               };

               setBillingData(newCurrentData);
               if (handlesubmit) {
                    const result = await handlesubmit(newCurrentData);
                    if (result?.status === true) {
                         setIsValueSynchronized(true);
                         setIsSyncing(false);
                    } else {
                         setIsSyncing(false);
                    }
               } else {
                    setIsValueSynchronized(true);
                    setIsSyncing(false);
               }
               return;
          }

          if (paymentMode === 'all') {
               const hasFreePayment = payAllPayments.some(p => String(p.mode).toLowerCase() === 'free');

               const total = payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
               if (!hasFreePayment && total !== payable) {
                    setPayAllError(`Total payment must equal exactly ${payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
                    setIsSyncing(false);
                    return;
               }
               if (payAllPayments.some(p => !p.mode)) {
                    setPayAllError('Please select payment mode for all entries.');
                    setIsSyncing(false);
                    return;
               }
               setPayAllError('');

               const itemMaxes = items.map(i => i.maxAmount);
               let paidPerItem: number[] = hasFreePayment ? items.map(() => 0) : allocateAmount(total, itemMaxes);

               const updatedCart = tests.map((test) => {
                    const itemIdx = items.findIndex(i => i.type === 'test' && i.id === test.id);
                    if (itemIdx === -1) return {
                         ...test,
                         paidamount: test.amountPaid ?? 0,
                         paymentstatus: test.status ?? 'pending',
                    };

                    // For free payments, apply 100% discount
                    if (hasFreePayment) {
                         const originalPrice = test.price || test.actualPrice || test.originalPrice || 0;
                         return {
                              ...test,
                              discount: originalPrice,
                              discountedValue: originalPrice,
                              totalpayable: 0,
                              paidamount: 0,
                              paymentstatus: 'Paid',
                         };
                    }

                    let paid = paidPerItem[itemIdx];
                    let paymentstatus = 'pending';
                    if ((test.totalpayable ?? 0) === 0) {
                         paid = test.totalpayable ?? paid;
                         paymentstatus = 'Paid';
                    } else if (paid >= (test.totalpayable ?? 0) && (test.totalpayable ?? 0) > 0) {
                         paid = test.totalpayable ?? paid;
                         paymentstatus = 'Paid';
                    } else if (paid > 0) {
                         paymentstatus = 'partial';
                    }
                    return {
                         ...test,
                         paidamount: paid,
                         paymentstatus,
                    };
               });
               const updatedServices = services.map((service) => {
                    const itemIdx = items.findIndex(i => i.type === 'service' && i.id === service.keyid);
                    if (itemIdx === -1) return {
                         ...service,
                         paidamount: service.amountPaid ?? 0,
                         paymentstatus: service.status ?? 'pending',
                    };

                    if (hasFreePayment) {
                         const originalPrice = service.servicePrice || 0;
                         return {
                              ...service,
                              discount: originalPrice,
                              discountedValue: originalPrice,
                              totalpayable: 0,
                              paidamount: 0,
                              paymentstatus: 'Paid',
                         };
                    }

                    let paid = paidPerItem[itemIdx];
                    let paymentstatus = 'pending';
                    if ((service.totalpayable ?? 0) === 0) {
                         paid = service.totalpayable ?? paid;
                         paymentstatus = 'Paid';
                    } else if (paid >= (service.totalpayable ?? 0) && (service.totalpayable ?? 0) > 0) {
                         paid = service.totalpayable ?? paid;
                         paymentstatus = 'Paid';
                    } else if (paid > 0) {
                         paymentstatus = 'partial';
                    }
                    return {
                         ...service,
                         paidamount: paid,
                         paymentstatus,
                    };
               });
               const actualTotalPaid = updatedCart.reduce((sum, test) => sum + (test.paidamount || 0), 0) +
                    updatedServices.reduce((sum, service) => sum + (service.paidamount || 0), 0);

               const actualTotalPayable = hasFreePayment ? 0 :
                    (updatedCart.reduce((sum, test) => sum + (test.totalpayable || 0), 0) +
                         updatedServices.reduce((sum, service) => service + (service.totalpayable || 0), 0));

               const newCurrentData = {
                    ...billingdata,
                    finalCart: updatedCart,
                    finalServicesList: updatedServices,
                    paid: actualTotalPaid,
                    amountPayable: hasFreePayment ? 0 : billingdata.amountPayable,
                    payments: [...(billingdata.payments || []), ...payAllPayments],
                    balance: hasFreePayment ? 0 : Math.max(0, payable - actualTotalPaid),
                    openPaymentModal: 0,
               }
               setBillingData(newCurrentData);
               if (handlesubmit) {
                    const result = await handlesubmit(newCurrentData);
                    if (result?.status === true) {
                         setIsValueSynchronized(true);
                         setIsSyncing(false)
                    }
               } else {
                    setIsValueSynchronized(true);
                    setIsSyncing(false)
               }
          } else {
               if (!selectedItems.some(Boolean)) {
                    alert('Please select at least one item to pay.');
                    return;
               }
               if (!selectedAmount || Number(selectedAmount) <= 0) {
                    alert('Please enter a valid payment amount.');
                    return;
               }
               if (!bulkPerTestMode) {
                    alert('Please select a payment mode.');
                    return;
               }
               const selectedItemsRemainingAmounts = items.map((item, idx) => {
                    if (!selectedItems[idx]) return 0;
                    const actualPaid = item.amountPaid;
                    const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                    return Math.max(0, item.maxAmount - effectivePaid);
               });
               const selectedRemainingFiltered = selectedItemsRemainingAmounts.filter(amt => amt > 0);
               const paymentAmount = Number(selectedAmount);
               const allocatedSelected = allocateAmount(paymentAmount, selectedRemainingFiltered);
               let allocIdx = 0;
               const allocatedAmounts = selectedItemsRemainingAmounts.map(remaining => {
                    if (remaining === 0) return 0;
                    return allocatedSelected[allocIdx++] || 0;
               });
               const updatedCart = tests.map((test) => {
                    const itemIdx = items.findIndex(i => i.type === 'test' && i.id === test.id);
                    if (itemIdx === -1 || !selectedItems[itemIdx]) return {
                         ...test,
                         paidamount: test.amountPaid ?? 0,
                         paymentstatus: test.status ?? 'pending',
                    };
                    const actualPaid = test.paidamount ?? test.amountPaid ?? 0;
                    let paid = actualPaid + allocatedAmounts[itemIdx];
                    let paymentstatus = 'pending';
                    if ((test.totalpayable ?? 0) === 0) paymentstatus = 'Paid';
                    else if (paid >= (test.totalpayable ?? 0) && (test.totalpayable ?? 0) > 0) paymentstatus = 'Paid';
                    else if (paid > 0) paymentstatus = 'partial';
                    return {
                         ...test,
                         paidamount: paid,
                         paymentstatus,
                    };
               });
               const updatedServices = services.map((service) => {
                    const itemIdx = items.findIndex(i => i.type === 'service' && i.id === service.keyid);
                    if (itemIdx === -1 || !selectedItems[itemIdx]) return {
                         ...service,
                         paidamount: service.amountPaid ?? 0,
                         paymentstatus: service.status ?? 'pending',
                    };
                    const actualPaid = service.paidamount ?? service.amountPaid ?? 0;
                    let paid = actualPaid + allocatedAmounts[itemIdx];
                    let paymentstatus = 'pending';
                    if ((service.totalpayable ?? 0) === 0) paymentstatus = 'Paid';
                    else if (paid >= (service.totalpayable ?? 0) && (service.totalpayable ?? 0) > 0) paymentstatus = 'Paid';
                    else if (paid > 0) paymentstatus = 'partial';
                    return {
                         ...service,
                         paidamount: paid,
                         paymentstatus,
                    };
               });
               const currentTotalPaid = updatedCart.reduce((sum, test) => sum + (test.paidamount || 0), 0) +
                    updatedServices.reduce((sum, service) => sum + (service.paidamount || 0), 0);

               const newCurrentData = {
                    ...billingdata,
                    paid: currentTotalPaid,
                    finalCart: updatedCart,
                    finalServicesList: updatedServices,
                    payments: [...(billingdata.payments || []), { mode: bulkPerTestMode, amount: paymentAmount }],
                    balance: payable - currentTotalPaid,
                    openPaymentModal: 0,
               }
               setBillingData(newCurrentData);
               if (handlesubmit) {
                    const result = await handlesubmit(newCurrentData);
                    if (result?.status === true) {
                         setIsValueSynchronized(true);
                         setIsSyncing(false);
                    }
               } else {
                    setIsValueSynchronized(true);
                    setIsSyncing(false);
               }

          }
          setIsSyncing(false);
     }

     // Request free services authorization
     const handleRequestFreeServiceAuth = async () => {
          if (!requesterReason.trim()) {
               setFreeServiceRequestError('Please provide a reason for the request');
               return;
          }
          if (!employeeid) {
               setFreeServiceRequestError('Employee information not available');
               return;
          }

          setFreeServiceRequestStatus('requesting');
          setFreeServiceRequestError('');

          try {
               const requestItems = items.map(item => ({
                    service_id: item.id,
                    service_name: item.name,
                    original_price: item.maxAmount
               }));

               const response = await customPost('billing/free-services/request', 'POST', {
                    requester_id: employeeid,
                    reason: requesterReason,
                    items: requestItems,
                    requester_name: applicationsettings?.user?.username || 'Unknown',
                    billing_id: billingdata?.id,
               });

               if (response?.status === 'success' || response?.statusCode === 201 || response?.statusCode === 200) {
                    const backendRequestId = response?.data?.requestId;
                    if (backendRequestId) {
                         setFreeServiceRequestId(backendRequestId);
                         setFreeServiceRequestStatus('requesting');
                         startPollingForApproval(backendRequestId);
                    } else {
                         setFreeServiceRequestStatus('rejected');
                         setFreeServiceRequestError('No request ID returned from server');
                    }
               } else {
                    setFreeServiceRequestStatus('rejected');
                    setFreeServiceRequestError(response?.message || 'Failed to submit request');
               }
          } catch (error) {
               console.error('Request submission error:', error);
               setFreeServiceRequestStatus('rejected');
               setFreeServiceRequestError('Error submitting request');
          }
     }

     // Poll for request approval
     const startPollingForApproval = (requestId: number) => {
          const interval = setInterval(async () => {
               try {
                    const response = await customFetch(`billing/free-services/status/${requestId}`);

                    const requestStatus = response?.data?.status;

                    if (requestStatus === 'APPROVED') {
                         setFreeServiceRequestStatus('approved');
                         if (interval) clearInterval(interval);
                    } else if (requestStatus === 'REJECTED') {
                         setFreeServiceRequestStatus('rejected');
                         setFreeServiceRequestError(response?.message || 'Request was rejected');
                         if (interval) clearInterval(interval);
                    } else if (requestStatus === 'PENDING') {
                         // Still waiting, continue polling
                    }
               } catch (error) {
                    console.error('Poll error:', error);
               }
          }, 2000); // Poll every 2 seconds

          setPollInterval(interval);
     }

     // Cleanup polling on unmount
     React.useEffect(() => {
          return () => {
               if (pollInterval) clearInterval(pollInterval);
          };
     }, [pollInterval]);


     if (renderPayment) return <>{renderPayment({
          payable, billingdata, items, availableModes, isNHISBilling,
          paymentMode, setPaymentMode, payAllPayments, setPayAllPayments,
          payAllError, isSyncing, isValueSynchronized,
          selectedItems, setSelectedItems, selectedAmount, setSelectedAmount,
          bulkPerTestMode, setBulkPerTestMode, setSelectedPayments, setPaySelected, setIsValueSynchronized,
          focAccounts, selectedFocStaffId, setSelectedFocStaffId, focReason, setFocReason,
          focValidationResult, setFocValidationResult, isValidatingFoc,
          freeServiceRequestStatus, freeServiceRequestError, freeServiceRequestId,
          requesterReason, setRequesterReason, handleRequestFreeServiceAuth,
          reset: handlePaymentModalReset, submit: handlePaymentSyncing,
          skipDisabled: isSkipPaymentDisabled, skip: () => handlesubmit?.(billingdata),
     })}</>;
     const PaymentContainer = inline ? InlinePaymentContainer : Modal;
     return (
          <>
               <PaymentContainer show={show} onHide={onHide} size={isNHISBilling ? "sm" : "lg"} backdrop="static" keyboard={false}>
                    <Modal.Header closeButton={!inline}>
                         <Modal.Title className="d-flex align-items-center gap-2">
                              <span>💳</span>
                              <span>Payment</span>
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {billingdata.outstanding == 0 && (
                              <div className="alert alert-info" role="alert">
                                   No outstanding amount to pay.
                              </div>
                         )}
                         {billingdata.outstanding > 0 && (
                              <div>
                                   <div className="mb-3 p-3 bg-light rounded">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                             <span className="fw-semibold">Amount Due:</span>
                                             <span className="fs-4 fw-bold text-primary">
                                                  {(paymentMode === 'free' || paymentMode === 'nhis' ? 0 : payable).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                             </span>
                                        </div>
                                        {paymentMode !== 'free' && paymentMode !== 'nhis' && paymentSummaryHtml}
                                        {paymentMode === 'free' && (
                                             <div className="text-success fw-semibold small">
                                                  ✓ Free Service
                                             </div>
                                        )}
                                        {paymentMode === 'nhis' && (
                                             <div className="text-info fw-semibold small">
                                                  ✓ Insurance Claim (NHIS)
                                             </div>
                                        )}
                                   </div>

                                   <div className="btn-group btn-group-sm w-100 mb-3" role="group">
                                        {isNHISBilling ? (
                                             <>
                                                  <input type="radio" className="btn-check" name="paymentMode" id="payNHIS" checked={paymentMode === 'nhis'} onChange={() => setPaymentMode('nhis')} />
                                                  <label className="btn btn-outline-info" htmlFor="payNHIS">NHIS Insurance Claim</label>
                                             </>
                                        ) : (
                                             <>
                                                  <input type="radio" className="btn-check" name="paymentMode" id="payAll" checked={paymentMode === 'all'} onChange={() => setPaymentMode('all')} />
                                                  <label className="btn btn-outline-primary" htmlFor="payAll">Pay All</label>

                                                  <input type="radio" className="btn-check" name="paymentMode" id="paySome" checked={paymentMode === 'items'} onChange={() => setPaymentMode('items')} />
                                                  <label className="btn btn-outline-primary" htmlFor="paySome">Partial Payment</label>

                                                  <input type="radio" className="btn-check" name="paymentMode" id="payFOC" checked={paymentMode === 'foc'} onChange={() => setPaymentMode('foc')} />
                                                  <label className="btn btn-outline-info" htmlFor="payFOC">Staff FOC Benefit</label>

                                                  {/* <input type="radio" className="btn-check" name="paymentMode" id="payFree" checked={paymentMode === 'free'} onChange={() => setPaymentMode('free')} />
                                                  <label className="btn btn-outline-success" htmlFor="payFree">Free Service</label> */}
                                             </>
                                        )}
                                   </div>

                                   {paymentMode === 'foc' && (
                                        <div className="card border-0 bg-light-subtle rounded-3 p-3 mb-3 border-start border-4 border-info shadow-sm">
                                             <h6 className="fw-bold mb-2 text-info d-flex align-items-center gap-2">
                                                  <span>🏥</span>
                                                  <span>Staff Free-of-Charge (FOC) Benefit</span>
                                             </h6>
                                             <p className="text-muted text-xs mb-3">
                                                  Services will be covered by the staff members annual medical benefit allowance.
                                             </p>

                                             <div className="row g-3 mb-3">
                                                  <div className="col-md-12">
                                                       <label htmlFor="focStaffSelect" className="form-label text-xs fw-semibold text-uppercase text-muted mb-1">
                                                            Select Staff Beneficiary <span className="text-danger">*</span>
                                                       </label>
                                                       <select
                                                            id="focStaffSelect"
                                                            className="form-select form-select-sm"
                                                            value={selectedFocStaffId}
                                                            onChange={(e) => setSelectedFocStaffId(e.target.value)}
                                                       >
                                                            <option value="">-- Select Staff Member --</option>
                                                            {focAccounts.map((acc: any) => (
                                                                 <option key={acc.employeeid} value={acc.employeeid}>
                                                                      {acc.staff_name || `Staff #${acc.employeeid}`} ({acc.staff_role || 'Staff'}) — Remaining: ₵{Number(acc.remaining_amount || 0).toFixed(2)}
                                                                 </option>
                                                            ))}
                                                       </select>
                                                  </div>

                                                  <div className="col-md-12">
                                                       <label htmlFor="focReasonInput" className="form-label text-xs fw-semibold text-uppercase text-muted mb-1">
                                                            Reason / Benefit Remarks
                                                       </label>
                                                       <input
                                                            id="focReasonInput"
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={focReason}
                                                            onChange={(e) => setFocReason(e.target.value)}
                                                            placeholder="e.g. Staff Annual Medical Screening"
                                                       />
                                                  </div>
                                             </div>

                                             {isValidatingFoc && (
                                                  <div className="text-muted text-xs d-flex align-items-center gap-2">
                                                       <span className="spinner-border spinner-border-sm" role="status"></span>
                                                       <span>Validating FOC coverage with server...</span>
                                                  </div>
                                             )}

                                             {focValidationResult && !isValidatingFoc && (
                                                  <div className="card border-0 bg-white p-3 rounded-3 shadow-xs">
                                                       <div className="d-flex justify-content-between align-items-center mb-1 text-xs">
                                                            <span className="text-muted">Annual FOC Allowance:</span>
                                                            <span className="fw-semibold">₵{Number(focValidationResult.currentLimit || 0).toFixed(2)}</span>
                                                       </div>
                                                       <div className="d-flex justify-content-between align-items-center mb-1 text-xs">
                                                            <span className="text-muted">FOC Used This Year:</span>
                                                            <span className="fw-semibold">₵{Number(focValidationResult.usedAmount || 0).toFixed(2)}</span>
                                                       </div>
                                                       <div className="d-flex justify-content-between align-items-center mb-1 text-xs">
                                                            <span className="text-muted">Remaining Balance:</span>
                                                            <span className="fw-bold text-success">₵{Number(focValidationResult.remainingAmount || 0).toFixed(2)}</span>
                                                       </div>
                                                       <hr className="my-2" />
                                                       <div className="d-flex justify-content-between align-items-center mb-1 text-xs">
                                                            <span className="fw-semibold text-primary">FOC Benefit Coverage:</span>
                                                            <span className="fw-bold text-primary">₵{Number(focValidationResult.focCoverage || 0).toFixed(2)}</span>
                                                       </div>
                                                       <div className="d-flex justify-content-between align-items-center text-xs">
                                                            <span className="fw-semibold text-dark">Patient Payable Portion:</span>
                                                            <span className={`fw-bold ${focValidationResult.patientPayable > 0 ? 'text-danger' : 'text-success'}`}>
                                                                 ₵{Number(focValidationResult.patientPayable || 0).toFixed(2)}
                                                            </span>
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                   )}

                                   {paymentMode === 'free' && (
                                        <div>
                                             <div className="alert alert-success mb-3">
                                                  <strong>✓ Free Service</strong> - All items marked as 100% discounted
                                             </div>

                                             {freeServiceRequestStatus === 'idle' && (
                                                  <div className="bg-light p-3 rounded mb-3">
                                                       <h6 className="mb-3 fw-semibold">Request Free Service Authorization</h6>
                                                       <div className="mb-3">
                                                            <label className="form-label small mb-1">Reason for Request <span className="text-danger">*</span></label>
                                                            <textarea
                                                                 className="form-control form-control-sm"
                                                                 rows={3}
                                                                 value={requesterReason}
                                                                 onChange={e => setRequesterReason(e.target.value)}
                                                                 placeholder="e.g., Patient financial hardship, community outreach program, etc."
                                                            />
                                                       </div>
                                                       {freeServiceRequestError && (
                                                            <div className="alert alert-danger alert-sm py-2 mb-2">{freeServiceRequestError}</div>
                                                       )}
                                                       <button
                                                            className="btn btn-sm btn-primary w-100"
                                                            onClick={handleRequestFreeServiceAuth}
                                                            disabled={!requesterReason.trim()}
                                                       >
                                                            <span className="me-2">📋</span>
                                                            Submit Request
                                                       </button>
                                                  </div>
                                             )}

                                             {freeServiceRequestStatus === 'requesting' && (
                                                  <div className="alert alert-info mb-3">
                                                       <div className="d-flex align-items-center gap-2 mb-2">
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                            <strong>Request Pending</strong>
                                                       </div>
                                                       <div className="small">
                                                            <p className="mb-1">Request ID: <code>{freeServiceRequestId}</code></p>
                                                            <p className="mb-0">Waiting for authorization approval...</p>
                                                       </div>
                                                  </div>
                                             )}

                                             {freeServiceRequestStatus === 'approved' && (
                                                  <div className="alert alert-success mb-3">
                                                       <div className="d-flex align-items-center gap-2 mb-2">
                                                            <strong>✓ Request Approved</strong>
                                                       </div>
                                                       <div className="small">
                                                            <p className="mb-1">Request ID: <code>{freeServiceRequestId}</code></p>
                                                            <p className="mb-0">Your free service request has been approved. You can now proceed.</p>
                                                       </div>
                                                  </div>
                                             )}

                                             {freeServiceRequestStatus === 'rejected' && (
                                                  <div className="alert alert-danger mb-3">
                                                       <div className="d-flex align-items-center gap-2 mb-2">
                                                            <strong>✗ Request Rejected</strong>
                                                       </div>
                                                       <div className="small mb-2">
                                                            <p className="mb-1">{freeServiceRequestError}</p>
                                                            <p className="mb-0">Request ID: <code>{freeServiceRequestId}</code></p>
                                                       </div>
                                                       <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => {
                                                                 setFreeServiceRequestStatus('idle');
                                                                 setFreeServiceRequestId(null);
                                                                 setRequesterReason('');
                                                                 setFreeServiceRequestError('');
                                                            }}
                                                       >
                                                            Try Again
                                                       </button>
                                                  </div>
                                             )}
                                        </div>
                                   )}

                                   {paymentMode === 'nhis' && (
                                        <div className="alert alert-info mb-3">
                                             <strong>✓ NHIS Insurance Claim</strong> - Items will be marked as insurance claims with outstanding balance to be paid by NHIS
                                        </div>
                                   )}

                                   {!isNHISBilling && paymentMode === 'all' && (
                                        <div>
                                             <table className="table table-sm align-middle">
                                                  <thead>
                                                       <tr>
                                                            <th style={{ width: 40 }}>#</th>
                                                            <th>Mode</th>
                                                            <th style={{ width: 140 }}>Amount</th>
                                                            <th style={{ width: 60 }}></th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {payAllPayments.map((p, idx) => (
                                                            <tr key={idx}>
                                                                 <td>{idx + 1}</td>
                                                                 <td>
                                                                      <select
                                                                           className="form-select form-select-sm"
                                                                           value={p.mode}
                                                                           onChange={e => {
                                                                                const arr = [...payAllPayments];
                                                                                arr[idx].mode = e.target.value;
                                                                                setPayAllPayments(arr);
                                                                           }}
                                                                           disabled={availableModes.length === 0}
                                                                      >
                                                                           <option value="">Select mode</option>
                                                                           {availableModes.filter(opt => String(opt.label).toLowerCase() !== 'free').map(opt => (
                                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                           ))}
                                                                      </select>
                                                                 </td>
                                                                 <td>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           value={p.amount}
                                                                           min={0}
                                                                           step="0.01"
                                                                           max={(() => {
                                                                                const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) =>
                                                                                     i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
                                                                                return Math.max(0, payable - otherPaymentsTotal);
                                                                           })()}
                                                                           onChange={e => {
                                                                                let val = Number(e.target.value);
                                                                                const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) =>
                                                                                     i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
                                                                                const maxAllowed = Math.max(0, payable - otherPaymentsTotal);
                                                                                if (val > payable) val = payable;
                                                                                if (val > maxAllowed) val = maxAllowed;
                                                                                const arr = [...payAllPayments];
                                                                                arr[idx].amount = Number(val.toFixed(2));
                                                                                setPayAllPayments(arr);
                                                                           }}
                                                                           placeholder={(() => {
                                                                                const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) =>
                                                                                     i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
                                                                                const maxAllowed = Math.max(0, payable - otherPaymentsTotal);
                                                                                return `Max: ${maxAllowed.toFixed(2)}`;
                                                                           })()}
                                                                      />
                                                                 </td>
                                                                 <td>
                                                                      {payAllPayments.length > 1 && (
                                                                           <Button variant="outline-danger" size="sm" onClick={() => {
                                                                                setPayAllPayments(arr => arr.filter((_, i) => i !== idx));
                                                                           }}>✕</Button>
                                                                      )}
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                             <div className="d-flex justify-content-between align-items-center mb-2">
                                                  <Button
                                                       variant="outline-secondary"
                                                       size="sm"
                                                       disabled={payAllPayments.length === 1 && Number(payAllPayments[0].amount) >= (payable - (billingdata?.paid || 0))}
                                                       onClick={() => setPayAllPayments(arr => [...arr, { mode: '', amount: 0 }])}
                                                  >
                                                       Add Another Payment Method
                                                  </Button>
                                                  <div className="small">
                                                       <span className="text-muted">Total: </span>
                                                       <span className="fw-bold">{payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                       <span className="text-muted"> / {payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                  </div>
                                             </div>
                                             {payAllError && <div className="alert alert-danger alert-sm py-2 mb-2">{payAllError}</div>}
                                        </div>
                                   )}

                                   {paymentMode === 'items' && (
                                        <div>
                                             <div className="table-responsive mb-3">
                                                  <table className="table table-sm table-hover align-middle">
                                                       <thead>
                                                            <tr>
                                                                 <th style={{ width: 50 }}>Select</th>
                                                                 <th>Item</th>
                                                                 <th style={{ width: 100 }}>Amount</th>
                                                                 <th style={{ width: 90 }}>Status</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {Array.isArray(items) && items.length > 0 && items.map((item, idx) => {
                                                                 const checked = selectedItems[idx];
                                                                 let paid = Number(selectedPayments[idx]?.amount || 0);
                                                                 const actualPaid = item.amountPaid;
                                                                 const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                                 let stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                                 let status = 'pending';
                                                                 if (item.maxAmount === 0) status = 'paid';
                                                                 else if (actualPaid >= item.maxAmount && item.maxAmount > 0) status = 'paid';
                                                                 else if (actualPaid > 0) status = 'partial';
                                                                 else if (paid >= item.maxAmount && item.maxAmount > 0) status = 'paid';
                                                                 else if (paid > 0) status = 'partial';
                                                                 return (
                                                                      <tr key={item.itemType + '-' + item.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                                           <td style={{ textAlign: 'center' }}>
                                                                                <input
                                                                                     type="checkbox"
                                                                                     checked={checked}
                                                                                     onChange={e => {
                                                                                          const arr = [...selectedItems];
                                                                                          arr[idx] = e.target.checked;
                                                                                          setSelectedItems(arr);
                                                                                     }}
                                                                                     disabled={stillNeeded === 0}
                                                                                />
                                                                           </td>
                                                                           <td>
                                                                                <div>{item.name}</div>
                                                                           </td>
                                                                           <td>
                                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                                     {item.maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                                </div>
                                                                           </td>
                                                                           <td>
                                                                                <span style={{ color: stillNeeded > 0 ? '#f57c00' : '#2e7d32', fontWeight: 600 }}>
                                                                                     {stillNeeded.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                                </span>
                                                                           </td>
                                                                           <td style={{ textAlign: 'center' }}>
                                                                                <span className={`badge ${status === 'paid' ? 'bg-success' : status === 'partial' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                                                     {status === 'paid' ? '✓ Paid' : status === 'partial' ? '⏳ Partial' : '⏸ Pending'}
                                                                                </span>
                                                                           </td>
                                                                      </tr>
                                                                 );
                                                            })}
                                                       </tbody>
                                                  </table>
                                             </div>
                                             {/* Payment input section */}
                                             {selectedItems.some(Boolean) && (
                                                  <div className="bg-light p-3 rounded mt-3">
                                                       <div className="row g-3">
                                                            <div className="col-md-6">
                                                                 <label className="form-label small mb-1">Amount <span className="text-muted">(Max: {items.reduce((sum, item, idx) => {
                                                                      if (!selectedItems[idx]) return sum;
                                                                      const actualPaid = item.amountPaid;
                                                                      const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                                      const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                                      return sum + stillNeeded;
                                                                 }, 0).toFixed(2)})</span></label>
                                                                 <input
                                                                      type="number"
                                                                      className="form-control form-control-sm"
                                                                      value={selectedAmount}
                                                                      min={0}
                                                                      step="0.01"
                                                                      max={items.reduce((sum, item, idx) => {
                                                                           if (!selectedItems[idx]) return sum;
                                                                           const actualPaid = item.amountPaid;
                                                                           const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                                           const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                                           return sum + stillNeeded;
                                                                      }, 0)}
                                                                      onChange={e => {
                                                                           setIsValueSynchronized(false);
                                                                           let val = e.target.value;
                                                                           let maxTarget = items.reduce((sum, item, idx) => {
                                                                                if (!selectedItems[idx]) return sum;
                                                                                const actualPaid = item.amountPaid;
                                                                                const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                                                const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                                                return sum + stillNeeded;
                                                                           }, 0);
                                                                           if (Number(val) > payable) {
                                                                                val = payable.toFixed(2);
                                                                           }
                                                                           if (Number(val) > maxTarget) {
                                                                                val = maxTarget.toFixed(2);
                                                                           }
                                                                           setSelectedAmount(val);
                                                                      }}
                                                                      placeholder="Enter amount"
                                                                 />
                                                            </div>
                                                            <div className="col-md-6">
                                                                 <label className="form-label small mb-1">Payment Mode</label>
                                                                 <select
                                                                      className="form-select form-select-sm"
                                                                      value={bulkPerTestMode}
                                                                      onChange={e => {
                                                                           const mode = e.target.value;
                                                                           setBulkPerTestMode(mode);
                                                                           setSelectedPayments(payments => payments.map((p, i) => selectedItems[i] ? { ...p, mode } : p));
                                                                      }}
                                                                      disabled={availableModes.length === 0}
                                                                 >
                                                                      <option value="">Select mode</option>
                                                                      {availableModes.filter(opt => String(opt.label).toLowerCase() !== 'free').map(opt => (
                                                                           <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                      ))}
                                                                 </select>
                                                            </div>
                                                       </div>
                                                  </div>
                                             )}
                                             {/* Validation */}
                                             {selectedItems.some(Boolean) && (!selectedAmount || !bulkPerTestMode || Number(selectedAmount) > items.reduce((sum, item, idx) => {
                                                  if (!selectedItems[idx]) return sum;
                                                  const actualPaid = item.amountPaid;
                                                  const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                  const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                  return sum + stillNeeded;
                                             }, 0)) && (
                                                       <div className="alert alert-warning small mb-0 mt-2">
                                                            {!selectedAmount ? 'Enter payment amount' : !bulkPerTestMode ? 'Select payment mode' : 'Amount exceeds total'}
                                                       </div>
                                                  )}
                                        </div>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer className="d-flex justify-content-end gap-2">
                         <Button variant="outline-secondary" size="sm" onClick={() => { handlePaymentModalReset(); }}>
                              Reset
                         </Button>
                         <Button
                              onClick={() => { handlesubmit ? handlesubmit(billingdata) : null }}
                              variant="outline-primary"
                              size="sm"
                              disabled={isSkipPaymentDisabled}
                         >
                              Skip Payment
                         </Button>
                         {!inline && (<Button
                              size="sm"
                              variant="outline-info"
                         >
                              Result Delivery Configutation
                         </Button>)}
                         <Button
                              variant="primary"
                              size="sm"
                              disabled={
                                   isValueSynchronized ||
                                   isSyncing ||
                                   (paymentMode === 'free' && freeServiceRequestStatus !== 'approved')
                              }
                              onClick={handlePaymentSyncing}
                         >
                              {isSyncing ? 'Processing...' : 'Submit Payment'}
                         </Button>
                    </Modal.Footer>
               </PaymentContainer >
          </>
     );
};

export default PaymentModal;
