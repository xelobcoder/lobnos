import React from "react";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import { reactSelectCustomStyles } from "../../Auth/customFetch";

interface PaymentModeOption {
     value: string | number;
     label: string;
}

interface PaymentEntry {
     mode: string | number;
     amount: number;
}

interface PaymentModalProps {
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
}


const PaymentModal: React.FC<PaymentModalProps> = ({
     show,
     onHide,
     payments,
     availableModes,
     payable,
     setNewPayment,
     setBillingData,
     billingdata
}) => {
// Helper function to validate and constrain payment amounts
const validatePaymentAmount = (inputValue: string, idx: number, payAllPayments: PaymentEntry[], payable: number) => {
     let val = Number(inputValue);
     const otherPaymentsTotal = payAllPayments.reduce((sum, payment, i) => 
          i !== idx ? sum + Number(payment.amount || 0) : sum, 0);
     const maxAllowed = Math.max(0, payable - otherPaymentsTotal);
     if (val > payable) val = payable;
     if (val > maxAllowed) val = maxAllowed;
     return val;
};

     // Payment mode: 'all' (Pay All) or 'items' (Pay for Individual Items)
     const [paymentMode, setPaymentMode] = React.useState<'all' | 'items'>('all');
     const [paySelected, setPaySelected] = React.useState(false); // legacy, for backward compat
     const [selectedAmount, setSelectedAmount] = React.useState('');
     const [bulkPerTestMode, setBulkPerTestMode] = React.useState('');
     // For Pay All mode: array of {mode, amount}
     const [payAllPayments, setPayAllPayments] = React.useState<PaymentEntry[]>(payments.length ? payments : [{ mode: '', amount: 0 }]);
     const [payAllError, setPayAllError] = React.useState('');
     const tests = billingdata?.cart || [];
     const services = billingdata?.servicesList || [];

     const items = [
          ...tests.map(test => ({
               type: 'test',
               id: test.id,
               name: test.name,
               maxAmount: test.discountedValue ?? 0,
               paymentType: null,
               amountPaid: test.paidamount ?? test.amountPaid ?? 0,
               status: test.paymentstatus ?? test.status ?? 'pending',
          })),
          ...services.map(service => ({
               type: 'service',
               id: service.keyid,
               name: service.serviceName,
               maxAmount: service.discountedValue ?? 0,
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

     // Helper: allocate an amount across items in order, returns array of allocated per item
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
          setBillingData({ ...billingdata, payments: [], paid: 0, balance: payable });
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


     const handleBulkPaymentMode = (mode) => {
          setSelectedPayments(payments => payments.map((p, i) => selectedItems[i] ? { ...p, mode } : p));
     };






     const paymentSummaryHtml = (() => {
          const remaining = payable - localTotalPaid;
          if (remaining !== 0) {
               return (
                    <div className="text-danger fw-bold">
                         Remaining: {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
               );
          }
          return null;
     })();

     return (
          <>
               <Modal show={show} onHide={onHide} size="xl" backdrop="static" keyboard={false}>
                    <Modal.Header closeButton>
                         <Modal.Title>
                              <span style={{ fontSize: 20, marginRight: 8 }}>💳</span>
                              Payment List (Valid for current Transaction)
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <div className="d-flex ">
                              <div className="card my-3 flex-fill" >
                                   <div className="card-header bg-white p-3 " style={{ fontWeight: 600, fontSize: '1em' }}>
                                        <span>
                                             Payment Summary
                                        </span>
                                   </div>
                                   <div className="card-body p-2">
                                        <div>
                                             <h4>
                                                  {(billingdata?.paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} / {payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                             </h4>
                                        </div>
                                        {paymentSummaryHtml}
                                   </div>
                              </div>
                         </div>

                         {/* Payment Mode Selector */}
                         <div style={{ margin: '16px 0', display: 'flex', gap: 24, alignItems: 'center' }}>
                              <label style={{ fontWeight: 500, cursor: 'pointer' }}>
                                   <input
                                        type="radio"
                                        name="paymentMode"
                                        checked={paymentMode === 'all'}
                                        onChange={() => setPaymentMode('all')}
                                        style={{ marginRight: 6 }}
                                   />
                                   Pay All
                              </label>
                              <label style={{ fontWeight: 500, cursor: 'pointer' }}>
                                   <input
                                        type="radio"
                                        name="paymentMode"
                                        checked={paymentMode === 'items'}
                                        onChange={() => setPaymentMode('items')}
                                        style={{ marginRight: 6 }}
                                   />
                                   Pay Some
                              </label>
                         </div>

                         {/* Pay All Mode UI */}
                         {paymentMode === 'all' && (
                              <div style={{ marginBottom: 16 }}>
                                   <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                        Add Payment(s):
                                   </div>
                                   <table className="table table-sm align-middle" style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', marginBottom: 8 }}>
                                        <thead style={{ background: '#f5f5f5', fontWeight: 600 }}>
                                             <tr>
                                                  <th style={{ width: 40 }}>#</th>
                                                  <th>Payment Mode</th>
                                                  <th style={{ width: 120 }}>Amount</th>
                                                  <th style={{ width: 60 }}></th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {payAllPayments.map((p, idx) => (
                                                  <tr key={idx}>
                                                       <td>{idx + 1}</td>
                                                       <td>
                                                            <Select
                                                                 className="react-select-container"
                                                                 classNamePrefix="react-select"
                                                                 value={availableModes.find(opt => opt.value === p.mode) || null}
                                                                 onChange={opt => {
                                                                      const arr = [...payAllPayments];
                                                                      arr[idx].mode = opt ? opt.value : '';
                                                                      setPayAllPayments(arr);
                                                                 }}
                                                                 options={availableModes}
                                                                 placeholder="Select mode"
                                                                 styles={reactSelectCustomStyles}
                                                                 isClearable
                                                                 menuPlacement="auto"
                                                                 menuPosition="fixed"
                                                                 maxMenuHeight={180}
                                                                 isDisabled={availableModes.length === 0}
                                                            />
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
                                   <Button variant="outline-primary" size="sm" onClick={() => setPayAllPayments(arr => [...arr, { mode: '', amount: 0 }])}>
                                        + Add Payment
                                   </Button>
                                   <div style={{ fontSize: 13, color: 'gray', marginTop: 8 }}>
                                        Total Entered: {payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} / {payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        <br />
                                        <span style={{ fontWeight: 600, color: payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) === payable ? '#28a745' : '#dc3545' }}>
                                             {payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0) === payable ? '✓ Full amount entered' : '⚠ Must pay full amount'}
                                        </span>
                                   </div>
                                   {payAllError && <div className="text-danger small">{payAllError}</div>}
                              </div>
                         )}

                         {/* Pay for Individual Items UI */}
                         {paymentMode === 'items' && (
                              <div style={{ marginBottom: 16 }}>
                                   <div style={{ marginBottom: 12, fontWeight: 500 }}>
                                        Step 1: Select Items to Pay
                                   </div>
                                   <table className="table table-sm align-middle" style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff' }}>
                                        <thead style={{ background: '#f5f5f5', fontWeight: 600 }}>
                                             <tr>
                                                  <th style={{ width: 60, textAlign: 'center' }}>Select</th>
                                                  <th>Item</th>
                                                  <th style={{ width: 120 }}>Max Amount</th>
                                                  <th style={{ width: 110 }}>Still Needed</th>
                                                  <th style={{ width: 110, textAlign: 'center' }}>Status</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {items.map((item, idx) => {
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
                                                                 <span style={{
                                                                      display: 'inline-block',
                                                                      padding: '2px 12px',
                                                                      borderRadius: 12,
                                                                      fontWeight: 600,
                                                                      fontSize: 13,
                                                                      background: status === 'paid' ? '#e8f5e8' : status === 'partial' ? '#fff3e0' : '#f5f5f5',
                                                                      color: status === 'paid' ? '#2e7d32' : status === 'partial' ? '#f57c00' : '#666',
                                                                      border: status === 'paid' ? '1px solid #2e7d32' : status === 'partial' ? '1px solid #f57c00' : '1px solid #ccc'
                                                                 }}>
                                                                      {status}
                                                                 </span>
                                                            </td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                   </table>
                                   {/* Step 2: Show total of selected items */}
                                   {selectedItems.some(Boolean) && (
                                        <div style={{ marginTop: 16, marginBottom: 16 }}>
                                             <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                                  Step 2: Selected Items Total - {items.reduce((sum, item, idx) => {
                                                       if (!selectedItems[idx]) return sum;
                                                       const actualPaid = item.amountPaid;
                                                       const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                       const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                       return sum + stillNeeded;
                                                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                             </div>
                                             <div style={{ marginBottom: 8, fontWeight: 500 }}>Step 3: Enter Payment Amount</div>
                                             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                  <input
                                                       type="number"
                                                       className="form-control form-control-sm"
                                                       style={{ width: 140 }}
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
                                                  <span style={{ color: '#888', fontSize: 13 }}>
                                                       (Max: {items.reduce((sum, item, idx) => {
                                                            if (!selectedItems[idx]) return sum;
                                                            const actualPaid = item.amountPaid;
                                                            const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                                            const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                                            return sum + stillNeeded;
                                                       }, 0).toFixed(2)})
                                                  </span>
                                             </div>
                                             {/* Step 4: Select Payment Mode for all selected items */}
                                             <div style={{ marginBottom: 8, fontWeight: 500 }}>Step 4: Select Payment Mode (applies to all selected items)</div>
                                             <div style={{ width: 250 }}>
                                                  <Select
                                                       className="react-select-container"
                                                       classNamePrefix="react-select"
                                                       value={availableModes.find(opt => opt.value === bulkPerTestMode) || null}
                                                       onChange={opt => {
                                                            const mode = opt ? String(opt.value) : '';
                                                            setBulkPerTestMode(mode);
                                                            setSelectedPayments(payments => payments.map((p, i) => selectedItems[i] ? { ...p, mode } : p));
                                                       }}
                                                       options={availableModes}
                                                       placeholder="Select payment mode"
                                                       styles={reactSelectCustomStyles}
                                                       isClearable
                                                       menuPlacement="auto"
                                                       menuPosition="fixed"
                                                       maxMenuHeight={180}
                                                       isDisabled={availableModes.length === 0}
                                                  />
                                             </div>
                                        </div>
                                   )}
                                   <div style={{ fontSize: 13, color: 'gray', marginTop: 8 }}>
                                        Payment Summary: {selectedAmount ? Number(selectedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'} will be applied to selected items
                                   </div>
                                   {/* Validation messages */}
                                   {selectedItems.some(Boolean) && !selectedAmount && (
                                        <div className="text-warning small">Please enter a payment amount for selected items.</div>
                                   )}
                                   {selectedItems.some(Boolean) && !bulkPerTestMode && (
                                        <div className="text-warning small">Please select a payment mode for selected items.</div>
                                   )}
                                   {Number(selectedAmount) > items.reduce((sum, item, idx) => {
                                        if (!selectedItems[idx]) return sum;
                                        const actualPaid = item.amountPaid;
                                        const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                        const stillNeeded = Math.max(0, item.maxAmount - effectivePaid);
                                        return sum + stillNeeded;
                                   }, 0) && (
                                        <div className="text-danger small">
                                             Payment amount exceeds total remaining amount for selected items.
                                        </div>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="outline-secondary" size="sm"
                              onClick={() => { handlePaymentModalReset(); }}
                         >
                              Reset All
                         </Button>
                         <Button variant="primary" size="sm" onClick={() => {
                              if (paymentMode === 'all') {
                                   // Validate that total payment equals the full payable amount
                                   const total = payAllPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
                                   if (total !== payable) {
                                        setPayAllError(`Total payment must equal exactly ${payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
                                        return;
                                   }
                                   // Validate that all payment modes are selected
                                   if (payAllPayments.some(p => !p.mode)) {
                                        setPayAllError('Please select payment mode for all entries.');
                                        return;
                                   }
                                   setPayAllError('');
                                   // Allocate payment to items in order, up to their max
                                   const itemMaxes = items.map(i => i.maxAmount);
                                   let paidPerItem: number[] = allocateAmount(total, itemMaxes);
                                   const updatedCart = tests.map((test) => {
                                        const itemIdx = items.findIndex(i => i.type === 'test' && i.id === test.id);
                                        if (itemIdx === -1) return {
                                             ...test,
                                             paidamount: test.amountPaid ?? 0,
                                             paymentstatus: test.status ?? 'pending',
                                        };
                                        let paid = paidPerItem[itemIdx];
                                        let paymentstatus = 'pending';
                                        if ((test.discountedValue ?? 0) === 0) paymentstatus = 'Paid';
                                        else if (paid >= (test.discountedValue ?? 0) && (test.discountedValue ?? 0) > 0) paymentstatus = 'Paid';
                                        else if (paid > 0) paymentstatus = 'partial';
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
                                        let paid = paidPerItem[itemIdx];
                                        let paymentstatus = 'pending';
                                        if ((service.discountedValue ?? 0) === 0) paymentstatus = 'Paid';
                                        else if (paid >= (service.discountedValue ?? 0) && (service.discountedValue ?? 0) > 0) paymentstatus = 'Paid';
                                        else if (paid > 0) paymentstatus = 'partial';
                                        return {
                                             ...service,
                                             paidamount: paid,
                                             paymentstatus,
                                        };
                                   });
                                   // Calculate actual total paid from the updated items
                                   const actualTotalPaid = updatedCart.reduce((sum, test) => sum + (test.paidamount || 0), 0) + 
                                                          updatedServices.reduce((sum, service) => sum + (service.paidamount || 0), 0);
                                   setBillingData({
                                        ...billingdata,
                                        cart: updatedCart,
                                        servicesList: updatedServices,
                                        paid: actualTotalPaid,
                                        payments: [...(billingdata.payments || []), ...payAllPayments],
                                        balance: Math.max(0, payable - actualTotalPaid),
                                   });
                              } else {
                                   // Pay Some mode validation
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
                                   // Allocate the payment amount across selected items proportionally
                                   const selectedItemsRemainingAmounts = items.map((item, idx) => {
                                        if (!selectedItems[idx]) return 0;
                                        const actualPaid = item.amountPaid;
                                        const effectivePaid = actualPaid > 0 ? actualPaid : 0;
                                        return Math.max(0, item.maxAmount - effectivePaid);
                                   });
                                   const selectedTotal = selectedItemsRemainingAmounts.reduce((sum, amt) => sum + amt, 0);
                                   const paymentAmount = Number(selectedAmount);
                                   // Calculate proportional allocation based on remaining amounts
                                   const allocatedAmounts = selectedItemsRemainingAmounts.map(remaining => {
                                        if (remaining === 0) return 0;
                                        return (remaining / selectedTotal) * paymentAmount;
                                   });
                                   // Update cart and services with allocated amounts
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
                                        if ((test.discountedValue ?? 0) === 0) paymentstatus = 'Paid';
                                        else if (paid >= (test.discountedValue ?? 0) && (test.discountedValue ?? 0) > 0) paymentstatus = 'Paid';
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
                                        if ((service.discountedValue ?? 0) === 0) paymentstatus = 'Paid';
                                        else if (paid >= (service.discountedValue ?? 0) && (service.discountedValue ?? 0) > 0) paymentstatus = 'Paid';
                                        else if (paid > 0) paymentstatus = 'partial';
                                        return {
                                             ...service,
                                             paidamount: paid,
                                             paymentstatus,
                                        };
                                   });
                                   // Calculate total paid including previous payments and current payments
                                   const currentTotalPaid = updatedCart.reduce((sum, test) => sum + (test.paidamount || 0), 0) + 
                                                          updatedServices.reduce((sum, service) => sum + (service.paidamount || 0), 0);
                                   setBillingData({
                                        ...billingdata,
                                        cart: updatedCart,
                                        servicesList: updatedServices,
                                        paid: currentTotalPaid,
                                        payments: [...(billingdata.payments || []), { mode: bulkPerTestMode, amount: paymentAmount }],
                                        balance: payable - currentTotalPaid,
                                   });
                              }
                         }}>
                              Sync Payments
                         </Button>
                    </Modal.Footer>
               </Modal>
          </>
     );
};

export default PaymentModal;
