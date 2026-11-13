'use client';
import Link from 'next/link';
import { Offcanvas } from 'react-bootstrap';
import { RiMenuLine, RiArrowRightSLine } from '@remixicon/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import PharmacyPaymentFields,{usePharmacyDocument,usePharmacyPayment} from '../components/PharmacyPaymentFields';
import { printPharmacyReceipt } from '../../../lib/pharmacy/receipt';
import styles from './pos.module.css';
import InvoiceCollectionPanel from '../components/InvoiceCollectionPanel';

type PriceType='retail'|'wholesale';
type Medicine={inventoryItemId:string;name:string;sku:string;salePrice:number;wholesalePrice?:number;availableStock:number;dispensableStock?:number;barcodes?:string[];requiresPrescription?:boolean;unavailable?:boolean};
type Line=Medicine&{quantity:number};
type StockAlert = { inventoryItemId: string; name: string; availableStock: number; minimumStock: number; unit?: string };
const money=(value:number)=>'GHS '+Number(value).toFixed(2);
const unitPrice=(item:Medicine,type:PriceType)=>Number(type==='wholesale'?item.wholesalePrice||0:item.salePrice);
const lineTotal=(item:Line,type:PriceType)=>Math.round(Math.round(unitPrice(item,type)*100)*Math.round(item.quantity*1000)/1000)/100;
// Keep unavailable lines visible until the attendant explicitly removes or replaces them.
function recoveryIssue(line:Line,priceType:PriceType):string {
     if(line.unavailable)return 'Unavailable in this branch. Remove or replace this line.';
     if(line.requiresPrescription)return 'Requires a prescription. Remove and use the prescription queue.';
     if(Number(priceType==='wholesale'?line.wholesalePrice||0:line.salePrice)<=0)return 'Current price unavailable. Configure a price or remove this line.';
     if(line.quantity>(line.dispensableStock??line.availableStock))return 'Insufficient unexpired stock. Reduce quantity or remove this line.';
     return '';
}
export default function PharmacySellPage(){
     const app=useApplication() as any,payment=usePharmacyPayment('pos'),suspension=usePharmacyDocument('pos-suspend'),counterRequest=usePharmacyDocument('counter-invoice');
     const [counterMode,setCounterMode]=useState<string|null>(null),[invoice,setInvoice]=useState<any>(null);
     const recoveryRequest=usePharmacyDocument('counter-recovery');
     const separate=counterMode==='separate_cashier';
     useEffect(()=>{customFetch('pharmacy/counter/settings').then(r=>{if(!r?.success)throw Error(r?.error?.message||'Unable to load checkout mode');setCounterMode(r.data.mode)}).catch(e=>setError(e.message));},[]);
     const [quantityDraft,setQuantityDraft]=useState<Record<string,string>>({}),[scanning,setScanning]=useState(0);
     const explicitSelection=useRef(false);
     const scanQueue=useRef(Promise.resolve()),scanCount=useRef(0),addLatest=useRef<(item:Medicine)=>void>(()=>{}),cartRef=useRef<Line[]>([]);
     const [search,setSearch]=useState(''),[items,setItems]=useState<Medicine[]>([]),[cart,setCart]=useState<Line[]>([]),[priceType,setPriceType]=useState<PriceType>('retail');
     const [accounts,setAccounts]=useState<any[]>([]),[accountId,setAccountId]=useState(''),[accountError,setAccountError]=useState(''),[accountsLoading,setAccountsLoading]=useState(true),[accountRetry,setAccountRetry]=useState(0),[split,setSplit]=useState<Record<string,{amount:string;received:string;reference:string}>>({cash:{amount:'',received:'',reference:''},mobile_money:{amount:'',received:'',reference:''},card:{amount:'',received:'',reference:''}});
     const [customerDraft,setCustomer]=useState(''),[method,setMethod]=useState('cash'),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
     const [receipt,setReceipt]=useState<any>(null),[held,setHeld]=useState<any[]>([]),[heldId,setHeldId]=useState<string|null>(null),[showHeld,setShowHeld]=useState(false),[loading,setLoading]=useState(false),[active,setActive]=useState(0);
     const [showMenu,setShowMenu]=useState(false);
     const [showInvoice, setShowInvoice] = useState(false);
     const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
     const [stockAlertError, setStockAlertError] = useState('');
     const [stockLoading, setStockLoading] = useState(true);
     const [stockAlertTotal, setStockAlertTotal] = useState(0);
     const [stockPaused, setStockPaused] = useState(false);
     const [stockRetry, setStockRetry] = useState(0);
     useEffect(() => {
          let active = true;
          setStockAlerts([]);
          setStockLoading(true);
          setStockAlertError('');
          const refreshStock = async () => {
               try {
                    const response = await customFetch('pharmacy/stock?filter=low&count=100');
                    if (!response?.success || !Array.isArray(response.data?.items)) throw new Error('Stock alerts unavailable');
                    if (active) {
                         setStockAlerts(response.data.items);
                         setStockAlertTotal(Number(response.data.total) || response.data.items.length);
                         setStockAlertError('');
                    }
               } catch { if (active) setStockAlertError('Stock alerts unavailable'); }
               finally { if (active) setStockLoading(false); }
          };
          void refreshStock();
          const timer = window.setInterval(refreshStock, 60000);
          window.addEventListener('focus', refreshStock);
          return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refreshStock); };
     }, [app?.user?.branch, app?.user?.tenantId, receipt?.receiptNumber, stockRetry]);
     const [collectionSearch,setCollectionSearch]=useState(''),[showCollection,setShowCollection]=useState(false),[collectionBusy,setCollectionBusy]=useState(false);
     const [collectionLookup,setCollectionLookup]=useState<{value:string;key:number}>();
     const collectionRequestKey=useRef(0);
     const focusAmountOnOpen = useRef(false);
     const searchInput=useRef<HTMLInputElement>(null),payPanel=useRef<HTMLDivElement>(null),generation=useRef(0),resultsFor=useRef(''),busyRef=useRef(false);
     const [recoveryReview,setRecoveryReview]=useState<any>(null),[recoverySourceId,setRecoverySourceId]=useState<string|null>(null),[patientId,setPatientId]=useState<number|null>(null),[recoveryReason,setRecoveryReason]=useState(''),[reviewLoading,setReviewLoading]=useState(false),[recoveryCustomer,setRecoveryCustomer]=useState('');
     const customer=recoverySourceId?recoveryCustomer:customerDraft;
     // Query navigation is read-only. Cancellation always requires an explicit confirmation.
     useEffect(()=>{const id=new URLSearchParams(window.location.search).get('recover');if(!id)return;let active=true;setReviewLoading(true);
          customFetch(`pharmacy/counter/invoices/${encodeURIComponent(id)}/review`).then(r=>{if(!r?.success)throw Error(r?.error?.message||'Unable to review invoice');if(active)setRecoveryReview(r.data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setReviewLoading(false);});return()=>{active=false;};
     },[]);
     cartRef.current=cart;
     const locked=busy||reviewLoading||!!payment.pending||!!suspension.pending||!!counterRequest.pending||!!recoveryRequest.pending,total=cart.reduce((sum,line)=>sum+Math.round(lineTotal(line,priceType)*100),0)/100;
     const recoveryProblems=recoverySourceId?cart.map(line=>({line,issue:recoveryIssue(line,priceType)})).filter(entry=>entry.issue):[];
     const recoverBasket=async()=>{
          if(busyRef.current||payment.pending||suspension.pending||counterRequest.pending||scanning)return;
          if(!recoveryRequest.pending&&!window.confirm('Cancel the original unpaid invoice and recover its basket at current prices? No payment will be taken. Any current basket will be replaced.'))return;
          busyRef.current=true;setBusy(true);setError('');
          try{const id=recoveryReview?.invoice.id;const r=await recoveryRequest.execute(`pharmacy/counter/invoices/${id}/recover`,{reason:recoveryReason});
               if(!r?.success)throw Error(r?.error?.message||'Basket recovery needs confirmation. Retry the original request.');
               const source=r.data.invoice;setRecoverySourceId(source.id);setPatientId(source.details.patientId);setRecoveryCustomer(source.details.customerName);setCustomer(source.details.customerName);setPriceType(source.details.priceType);setCart(r.data.lines);setQuantityDraft({});setHeldId(null);setReceipt(null);setInvoice(null);setSearch('');setAccountId('');payment.setAmount('');payment.setReference('');setRecoveryReview(null);
               setNotice('Original invoice cancelled. Basket recovered with current prices and stock, including unavailable lines. Review every line, remove or edit problems, then explicitly create a replacement invoice. No stock is reserved.');
          }catch(e){setError(e instanceof Error?e.message:'Unable to recover basket');}finally{busyRef.current=false;setBusy(false);}
     };
     useEffect(()=>{let active=true;setAccountsLoading(true);customFetch('pharmacy/credit/accounts').then(r=>{if(!r?.success)throw new Error(r?.error?.message||'Unable to load patient credit accounts.');if(active){setAccounts(r.data||[]);setAccountError('');}}).catch(e=>{if(active){setAccounts([]);setAccountError(e instanceof Error?e.message:'Unable to load patient credit accounts.');}}).finally(()=>{if(active)setAccountsLoading(false);});return()=>{active=false;};},[accountRetry]);
     const focusSearch=()=>requestAnimationFrame(()=>searchInput.current?.focus());
     const loadHeld=useCallback(async()=>{const r=await customFetch('pharmacy/sales/held?count=100');if(!r?.success)throw new Error(r?.error?.message||'Unable to load suspended sales');setHeld(r.data.sales||[]);},[]);
     useEffect(()=>{loadHeld().catch(e=>setError(e.message));},[loadHeld]);
     const lookup=useCallback(async(term:string)=>{
          const token=++generation.current;if(!term.trim()){setItems([]);setLoading(false);resultsFor.current='';return [];}
          setLoading(true);
          try{const r=await customFetch('pharmacy/catalogue?sellableOnly=true&count=20&search='+encodeURIComponent(term.trim()));if(!r?.success)throw new Error(r?.error?.message||'Unable to search medicines');if(token!==generation.current)return [];
               const rows:Medicine[]=r.data.items||[];setItems(rows);resultsFor.current=term.trim();setActive(0);return rows;
          }catch(e){if(token===generation.current){setItems([]);setError(e instanceof Error?e.message:'Medicine search failed');}return [];}finally{if(token===generation.current)setLoading(false);}
     },[]);
     useEffect(()=>{const timer=setTimeout(()=>lookup(search),140);return()=>{clearTimeout(timer);generation.current++;};},[search,lookup]);
     const add=(item:Medicine)=>{
          if(locked||busyRef.current)return;
          if(item.requiresPrescription){setError('This medicine requires a prescription. Dispense it from the prescription queue.');return;}
          if(unitPrice(item,priceType)<=0){setError('Configure a '+priceType+' price for '+item.name+' before selling it.');return;}
          const existing=cartRef.current.find(line=>line.inventoryItemId===item.inventoryItemId),next=Math.round(((existing?.quantity||0)+1)*1000)/1000,available=item.dispensableStock??item.availableStock;
          if(next>available){setError('Only '+available+' unexpired units of '+item.name+' are available.');return;}
          const updated=existing?cartRef.current.map(line=>line.inventoryItemId===item.inventoryItemId?{...line,...item,quantity:next}:line):[...cartRef.current,{...item,quantity:1}];cartRef.current=updated;setCart(updated);
          setError('');setNotice(item.name+' added');setReceipt(null);payment.setAmount('');setSearch('');setItems([]);generation.current++;focusSearch();
     };
     addLatest.current=add;
     const enqueueScan=(term:string,cached:Medicine[],chosen:number|null)=>{
          scanCount.current++;setScanning(scanCount.current);setSearch('');setItems([]);generation.current++;
          scanQueue.current=scanQueue.current.then(async()=>{
               let rows=cached;
               if(!rows.length){const r=await customFetch('pharmacy/catalogue?sellableOnly=true&count=20&search='+encodeURIComponent(term));if(!r?.success)throw new Error(r?.error?.message||'Unable to look up scanned medicine');rows=r.data.items||[];}
               const item=rows.find(item=>(item.sku?.toLowerCase()===term.toLowerCase()||item.barcodes?.some(code=>code.toLowerCase()===term.toLowerCase()))) || (chosen!==null?cached[chosen]:undefined);
               if(!item)throw new Error('No exact medicine code found for '+term+'. Select a medicine from the search results to add it.');addLatest.current(item);
          }).catch(error=>setError(error instanceof Error?error.message:'Unable to add scanned medicine')).finally(()=>{scanCount.current--;setScanning(scanCount.current);});
     };
     const setQuantity=(id:string,value:number)=>{
          if(locked||!Number.isFinite(value))return;
          if (value <= 0) {
               setCart(rows => rows.filter(line => line.inventoryItemId !== id));
               setQuantityDraft(draft => {const next = {...draft};delete next[id];return next;});
               payment.setAmount('');
               setNotice('');
               setError('');
               return;
          }
          const line=cart.find(line=>line.inventoryItemId===id);if(!line)return;
          if(value>(line.dispensableStock??line.availableStock)){setError('Insufficient unexpired stock for '+line.name+'. Refresh or reduce the quantity.');return;}
          setCart(rows=>rows.map(row=>row.inventoryItemId===id?{...row,quantity:Math.round(value*1000)/1000}:row));payment.setAmount('');setError('');
     };
     const choosePrice=(type:PriceType)=>{
          if(recoverySourceId){setError('A recovered invoice keeps its original retail/wholesale pricing mode.');return;}
          if(locked||type===priceType)return;
          const missing=cart.filter(item=>unitPrice(item,type)<=0);if(missing.length){setError('Set a '+type+' price for '+missing.map(item=>item.name).join(', ')+' before changing this transaction.');return;}
          setPriceType(type);payment.setAmount('');setError('');setNotice('All items now use '+type+' prices.');focusSearch();
     };
     const clear=()=>{if(locked)return;if(cart.length&&!window.confirm('Clear the current basket? A recalled suspended sale or cancelled source invoice will remain saved.'))return;setRecoverySourceId(null);setPatientId(null);setCart([]);setQuantityDraft({});setHeldId(null);setCustomer('');setSearch('');setAccountId('');setSplit({cash:{amount:'',received:'',reference:''},mobile_money:{amount:'',received:'',reference:''},card:{amount:'',received:'',reference:''}});payment.setAmount('');setNotice('');setError('');focusSearch();};
     const checkout=async(event?:FormEvent)=>{
          if(recoveryRequest.pending||reviewLoading){event?.preventDefault();return;}
          if(recoverySourceId&&!separate){event?.preventDefault();setError('This recovered basket requires separate-cashier mode. Ask a manager to review checkout settings.');return;}
          event?.preventDefault();if(!counterMode){setError('Checkout settings are loading. Reload the page before continuing.');return;}if(separate&&!payment.pending){await generateInvoice();return;}if(scanCount.current||busyRef.current||suspension.pending||(!cart.length&&!payment.pending))return;
          busyRef.current=true;setBusy(true);setError('');
          try{const r=await payment.execute(heldId?'pharmacy/sales/held/'+heldId+'/complete':'pharmacy/sales',{priceType,customerName:customer||'Walk-in customer',paymentMethod:method,expectedTotal:total,...(['credit','split'].includes(method)?{customerAccountId:accountId?Number(accountId):undefined,patientId:accountId?Number(accounts.find(a=>Number(a.id)===Number(accountId))?.patient_id):undefined,tenders:method==='split'?Object.entries(split).filter(([,leg])=>Number(leg.amount)>0).map(([method,leg])=>({method,amount:Number(leg.amount),received:leg.received?Number(leg.received):Number(leg.amount),reference:leg.reference})):undefined}:{}),lines:cart.map(line=>({inventoryItemId:line.inventoryItemId,quantity:line.quantity,priceType}))});if(!r?.success)throw new Error(r?.error?.message||'Checkout needs confirmation. Retry the original request.');
               setReceipt(r.data);setShowInvoice(false);setCart([]);setQuantityDraft({});setHeldId(null);setCustomer('');setSearch('');setAccountId('');setSplit({cash:{amount:'',received:'',reference:''},mobile_money:{amount:'',received:'',reference:''},card:{amount:'',received:'',reference:''}});payment.setAmount('');payment.setReference('');setNotice('');await loadHeld();focusSearch();
          }catch(e){setError(e instanceof Error?e.message:'Unable to confirm checkout');}finally{busyRef.current=false;setBusy(false);}
     };
     const generateInvoice=async()=>{
          if(busyRef.current||scanning||reviewLoading||recoveryRequest.pending||payment.pending||suspension.pending||(!cart.length&&!counterRequest.pending))return;
          if(!counterRequest.pending&&recoveryProblems.length){setError('Remove or edit the unavailable basket lines before creating a replacement invoice.');return;}
          busyRef.current=true;setBusy(true);setError('');
          try{const r=await counterRequest.execute('pharmacy/counter/invoices',{recoverySourceId:recoverySourceId||undefined,patientId:patientId||undefined,heldSaleId:heldId||undefined,priceType,customerName:customer||'Walk-in customer',expectedTotal:total,lines:cart.map(line=>({inventoryItemId:line.inventoryItemId,quantity:line.quantity,priceType}))});
               if(!r?.success)throw Error(r?.error?.message||'Invoice creation needs confirmation. Retry the original request.');
               setInvoice(r.data);setShowInvoice(false);setRecoverySourceId(null);setPatientId(null);setRecoveryReview(null);setCart([]);setQuantityDraft({});setHeldId(null);setCustomer('');setSearch('');setReceipt(null);setNotice('Give the four-character code to the customer for payment. Medicines are not yet paid or reserved.');await loadHeld();focusSearch();
          }catch(e){setError(e instanceof Error?e.message:'Unable to create invoice')}finally{busyRef.current=false;setBusy(false)}
     };
     const suspend=async()=>{
          if(recoveryRequest.pending||counterRequest.pending||reviewLoading)return;
          if(recoverySourceId){setError('Create the replacement invoice or explicitly clear this recovered basket; it cannot be suspended.');return;}
          if(scanCount.current||busyRef.current||payment.pending||(!cart.length&&!suspension.pending))return;busyRef.current=true;setBusy(true);setError('');
          try{const r=await suspension.execute('pharmacy/sales/held',{heldSaleId:heldId||undefined,priceType,customerName:customer||'Walk-in customer',lines:cart.map(line=>({inventoryItemId:line.inventoryItemId,quantity:line.quantity,priceType}))});if(!r?.success)throw new Error(r?.error?.message||'Suspension needs confirmation. Retry the original request.');
               setCart([]);setQuantityDraft({});setCustomer('');setHeldId(null);setSearch('');payment.setAmount('');payment.setReference('');setNotice('Sale suspended. Stock and payment have not been deducted.');await loadHeld();focusSearch();
          }catch(e){setError(e instanceof Error?e.message:'Unable to suspend sale');}finally{busyRef.current=false;setBusy(false);}
     };
     const recall=async(id:string)=>{
          if(recoverySourceId){setError('Explicitly clear the recovered basket before recalling another sale.');return;}
          if(locked||busyRef.current)return;if(cart.length&&!window.confirm('Replace this basket? Unsaved changes will be lost.'))return;busyRef.current=true;setBusy(true);setError('');
          try{const r=await customFetch('pharmacy/sales/held/'+id);if(!r?.success)throw new Error(r?.error?.message||'Suspended sale unavailable');
               const types=new Set(r.data.lines.map((line:any)=>line.priceType||'retail'));const type=Array.from(types)[0] as PriceType;
               setQuantityDraft({});setPriceType(type);setCart(r.data.lines.map((line:any)=>({...line,salePrice:line.retailPrice??(type==='retail'?line.unitPrice:0),wholesalePrice:line.wholesalePrice??(type==='wholesale'?line.unitPrice:0),availableStock:line.availableStock??line.quantity,dispensableStock:line.dispensableStock,quantity:Number(line.quantity)})));setCustomer(r.data.customerName);setHeldId(id);setReceipt(null);setShowHeld(false);payment.setAmount('');setNotice(types.size>1?'This older suspension used mixed prices. All items now use '+type+' pricing; review the total.':'Suspended sale recalled. Current prices and stock are checked before checkout.');focusSearch();
          }catch(e){setError(e instanceof Error?e.message:'Unable to recall sale');}finally{busyRef.current=false;setBusy(false);}
     };
     const print=async()=>{if(!receipt)return;try{await printPharmacyReceipt(receipt,{name:typeof app?.company==='string'?app.company:app?.company?.name||'PHARMACY',address:app?.company?.address,phone:app?.company?.phonenumber,printedBy:app?.user?.username});}catch(e){setError(e instanceof Error?e.message:'Unable to print receipt');}};
     useEffect(()=>{const keys=(event:KeyboardEvent)=>{if(showMenu||showCollection)return;if(event.key==='F2'){event.preventDefault();if(!busy)setShowInvoice(false);focusSearch();}else if(event.key==='F4'){event.preventDefault();focusAmountOnOpen.current=true;setShowInvoice(true);payPanel.current?.querySelector<HTMLInputElement>('input[type="number"]')?.focus();}else if(event.key==='F8'){event.preventDefault();if(!locked)suspend();}else if(event.key==='F9'){event.preventDefault();if(!locked&&!scanning&&cart.length){if(!showInvoice)setShowInvoice(true);else (document.getElementById('pharmacy-checkout') as HTMLFormElement)?.requestSubmit();}}};window.addEventListener('keydown',keys);return()=>window.removeEventListener('keydown',keys);});
     const pendingInvoice = payment.pending || counterRequest.pending;
     const displayedTotal = cart.length ? total : Number(pendingInvoice?.payload?.expectedTotal || 0);
     const displayedItemCount = cart.length || (Array.isArray(pendingInvoice?.payload?.lines) ? pendingInvoice.payload.lines.length : 0);
     const splitPaid = Object.values(split).reduce((sum, leg) => sum + Number(leg.amount || 0), 0);
     const received = method === 'credit' ? 0 : method === 'split'
          ? Object.values(split).reduce((sum, leg) => sum + Number(leg.received || leg.amount || 0), 0)
          : Number(payment.amount || 0);
     const change = method === 'cash' ? Math.max(0, received - displayedTotal)
          : method === 'split' ? Math.max(0, Number(split.cash.received || split.cash.amount || 0) - Number(split.cash.amount || 0)) : 0;
     const stillDue = Math.max(0, displayedTotal - (method === 'split' ? splitPaid : received));
     if(!counterMode&&!payment.pending)return <main className={styles.page}><h1>Pharmacy checkout</h1>{error?<div role="alert" className="alert alert-danger">{error}<button className="btn btn-outline-secondary ms-2" onClick={()=>window.location.reload()}>Reload checkout</button></div>:<p role="status">Loading this branch's checkout workflow…</p>}</main>;
     const cashierOnly=['pharmacycashier','pharmacyaccountant'].includes(String(app?.user?.role||'').toLowerCase().replace(/[\s_-]/g,''));
     if(separate&&cashierOnly&&!payment.pending)return <main className={styles.page}><header className={styles.header}><div><h1>Cashier payments</h1><p>This branch uses separate attendants and cashiers. Enter the customer's four-character code to take payment.</p></div></header><Link className="btn btn-primary btn-lg" href="/pharmacy/counter">Open counter invoices</Link></main>;
     return <main className={styles.page}>
          {reviewLoading&&<p role="status">Loading invoice review. The original invoice has not been changed.</p>}
          {recoveryRequest.pending&&<section className="alert alert-warning">Basket recovery needs confirmation. Do not start another invoice.<button type="button" className="btn btn-warning ms-2" disabled={busy||!!payment.pending||!!counterRequest.pending||!!suspension.pending} onClick={recoverBasket}>Retry original basket recovery</button></section>}
          {recoveryReview&&<section className={styles.panel} aria-label="Invoice recovery review">
               <h2>Review original invoice {recoveryReview.invoice.code}</h2>
               <p>Original invoice: {recoveryReview.invoice.status}. Original total {money(recoveryReview.invoice.total)}. Current basket total {money(recoveryReview.refreshedTotal)}. No total or stock has been changed.</p>
               <p>Customer: {recoveryReview.invoice.details.customerName}. Patient ID: {recoveryReview.invoice.details.patientId??'None'}. Pricing: {recoveryReview.invoice.details.priceType}.</p>
               <ul>{recoveryReview.lines.map((line:any)=><li key={line.inventoryItemId}>{line.name}: {line.quantity} × {money(line.unitPrice)}. Available: {line.dispensableStock}. {line.issue&&<strong>{line.issue}</strong>}</li>)}</ul>
               {recoveryReview.invoice.details.replacementId?<p>This invoice has already been reissued. {recoveryReview.replacement&&<Link href={`/pharmacy/counter?code=${encodeURIComponent(recoveryReview.replacement.code)}`}>Open replacement {recoveryReview.replacement.invoice_number}</Link>}</p>:
                    !recoveryReview.canRecover?<p>Handoff required: return code {recoveryReview.invoice.code} to {recoveryReview.invoice.attendant_name} or a pharmacy manager. You cannot cancel or reissue this invoice.</p>:
                    ['unpaid','cancelled'].includes(recoveryReview.invoice.status)?<><label className="form-label">Cancellation / recovery reason<input className="form-control" aria-label="Basket recovery reason" value={recoveryReason} disabled={locked} onChange={e=>setRecoveryReason(e.target.value)} minLength={5} maxLength={500}/></label><button type="button" className="btn btn-outline-danger" disabled={locked||(recoveryReview.invoice.status==='unpaid'&&recoveryReason.trim().length<5)} onClick={recoverBasket}>{recoveryReview.invoice.status==='cancelled'?'Recover cancelled invoice basket':'Confirm cancellation and recover basket'}</button></>:<p>This invoice is no longer unpaid. Do not collect another payment.</p>}
          </section>}
          {recoverySourceId&&<section className="alert alert-info" aria-label="Recovered basket"><strong>Recovered basket — review before reissuing</strong><p>Customer: {customer}. Patient ID: {patientId??'None'}. Original {priceType} pricing mode is preserved. Original invoice remains saved as cancelled.</p>{recoveryProblems.length>0&&<ul role="alert">{recoveryProblems.map(({line,issue})=><li key={line.inventoryItemId}>{line.name}: {issue}</li>)}</ul>}</section>}
          <header className={styles.posHeader} aria-label="Point of sale tools">
               <div><h1>Point of sale</h1><span className={styles.checkoutStatus} role="status" aria-live="polite">{notice && !receipt ? notice : separate ? 'Send invoices to cashier' : payment.setup ? payment.setup.day?.status === 'open' && payment.setup.shift ? 'Cashier ready' : 'Cashier setup required' : 'Checking cashier…'}</span></div>
               <div className={styles.actions}>
                    <details className={styles.invoiceLookup}>
                         <summary>Find existing invoice</summary>
                         <form className={styles.collectionSearch} onSubmit={event => {
                              event.preventDefault();
                              if (locked || !collectionSearch.trim()) return;
                              setCollectionLookup({value: collectionSearch.trim(), key: ++collectionRequestKey.current});
                              setShowCollection(true);
                         }}>
                              <label htmlFor="pos-collection-invoice" className="visually-hidden">Find invoice for medication collection</label>
                              <input id="pos-collection-invoice" placeholder="Invoice number / code" maxLength={80} value={collectionSearch} disabled={locked} onChange={event => setCollectionSearch(event.target.value)}/>
                              <button className={styles.menuToggle} disabled={locked || !collectionSearch.trim()}>Find invoice</button>
                         </form>
                    </details>
                    <Link href="/pharmacy/cashier" className={styles.menuToggle}>Cashier & day</Link>
                    <button type="button" className={styles.menuToggle} aria-label="Open POS menu" aria-expanded={showMenu} aria-controls="pharmacy-pos-menu" onClick={() => setShowMenu(true)}><RiMenuLine size={18} aria-hidden="true"/>Menu</button>
               </div>
          </header>
          <Offcanvas id="pharmacy-pos-menu" placement="end" show={showMenu} onHide={()=>setShowMenu(false)} aria-labelledby="pharmacy-pos-menu-title" className={styles.menuDrawer}>
               <Offcanvas.Header closeButton>
                    <div><span className={styles.eyebrow}>PHARMACY · POINT OF SALE</span><Offcanvas.Title as="h2" id="pharmacy-pos-menu-title">Checkout</Offcanvas.Title></div>
               </Offcanvas.Header>
               <Offcanvas.Body>
                    <nav className={styles.menuLinks} aria-label="Point of sale navigation">
                         <Link href="/pharmacy/counter" onClick={()=>setShowMenu(false)}>Counter invoices<RiArrowRightSLine size={18} aria-hidden="true"/></Link>
                         <Link href="/pharmacy/cashier" onClick={()=>setShowMenu(false)}>Cashier & shift<RiArrowRightSLine size={18} aria-hidden="true"/></Link>
                         <Link href="/pharmacy/prescriptions" onClick={()=>setShowMenu(false)}>Prescriptions<RiArrowRightSLine size={18} aria-hidden="true"/></Link>
                         <Link href="/pharmacy/collections" onClick={()=>setShowMenu(false)}>Uncollected invoices<RiArrowRightSLine size={18} aria-hidden="true"/></Link>
                         <button type="button" disabled={locked} onClick={()=>{setShowMenu(false);setShowHeld(!showHeld);loadHeld().catch(e=>setError(e.message));}}>Suspended sales <span className="badge text-bg-secondary">{held.length}</span></button>
                    </nav>
               </Offcanvas.Body>
          </Offcanvas>
          <Offcanvas placement="end" show={showCollection} onHide={()=>{if(!collectionBusy)setShowCollection(false);}} aria-labelledby="pos-collection-title" className={styles.collectionDrawer} backdrop={collectionBusy?'static':true}>
               <Offcanvas.Header closeButton={!collectionBusy}><div><span className={styles.eyebrow}>PHARMACY / POINT OF SALE</span><Offcanvas.Title id="pos-collection-title">Medication collection</Offcanvas.Title><p className={styles.collectionHint}>Review the invoice, confirm pickup and print the receipt.</p></div></Offcanvas.Header>
               <Offcanvas.Body>{showCollection&&<InvoiceCollectionPanel variant="pos" lookupRequest={collectionLookup} onBusyChange={setCollectionBusy}/>}</Offcanvas.Body>
          </Offcanvas>
          {receipt && <section className={styles.completedSale} aria-label="Completed sale">
               <div className={styles.receiptIdentity}><strong>{Number(receipt.outstandingAmount) > 0 ? 'Sale recorded' : 'Payment recorded'}</strong><span title={receipt.receiptNumber}>{receipt.receiptNumber}</span><small>{receipt.customerName || 'Walk-in customer'} · {new Date(receipt.completedAt).toLocaleString('en-GH')}</small></div>
               <dl><div><dt>Sale total</dt><dd>{money(receipt.total)}</dd></div><div><dt>Received</dt><dd>{money(receipt.amountTendered ?? receipt.paidAmount ?? receipt.total)}</dd></div><div><dt>Change</dt><dd>{money(receipt.change || 0)}</dd></div>{Number(receipt.outstandingAmount) > 0 && <div><dt>Outstanding</dt><dd>{money(receipt.outstandingAmount)}</dd></div>}</dl>
               <div className={styles.actions}><button type="button" className="btn btn-sm btn-outline-success" onClick={print}>Print receipt</button><button type="button" className="btn btn-sm btn-success" onClick={() => {setReceipt(null);setNotice('');focusSearch();}}>Next customer</button></div>
          </section>}
          {error&&<div className="alert alert-danger" role="alert">{error}{/financial day|cashier shift|closing limit/i.test(error)&&<div className={styles.actions}><Link href="/pharmacy/cashier">Review cashier &amp; financial day</Link><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {void payment.refresh();setError('');}}>Refresh checkout</button></div>}</div>}{['split','credit'].includes(method)&&accountsLoading&&<p role="status">Loading patient credit accounts…</p>}{['split','credit'].includes(method)&&accountError&&<div className="alert alert-danger" role="alert">{accountError} <button type="button" className="btn btn-link p-0 align-baseline" onClick={()=>setAccountRetry(value=>value+1)}>Retry</button></div>}
          {payment.pending&&<div className="alert alert-warning">Payment confirmation is pending. <button className="btn btn-warning" disabled={busy} onClick={()=>checkout()}>Retry original checkout</button></div>}
          {counterRequest.pending&&<div className="alert alert-warning">Invoice creation needs confirmation. <button className="btn btn-warning" disabled={busy} onClick={generateInvoice}>Retry original invoice</button></div>}
          {invoice&&<section className={styles.receipt}><div><span className="badge text-bg-warning">Awaiting cashier payment</span><h2 style={{fontSize:36,letterSpacing:4}}>{invoice.code}</h2><p>{invoice.invoice_number} · {money(invoice.total)}</p><p>Write only <strong>{invoice.code}</strong> on the customer’s paper. The cashier enters this code to collect payment.</p></div><div className={styles.actions}><Link className="btn btn-primary" href={`/pharmacy/counter?code=${invoice.code}`}>Open invoice</Link><button className="btn btn-outline-secondary" onClick={()=>setInvoice(null)}>Next customer</button></div></section>}
          {suspension.pending&&<div className="alert alert-warning">Sale suspension needs confirmation. <button className="btn btn-warning" disabled={busy} onClick={suspend}>Retry original suspension</button></div>}
          {showHeld&&<section className={styles.suspended}><h2>Suspended sales</h2>{held.length?<div className={styles.heldList}>{held.map(sale=><button key={sale.id} disabled={locked} onClick={()=>recall(sale.id)}><strong>{sale.customerName}</strong><span>{money(sale.total)}</span><small>{new Date(sale.createdAt).toLocaleString('en-GH')} · {sale.lines?.length||0} item(s)</small></button>)}</div>:<p>No suspended sales.</p>}</section>}
          <section className={styles.stockAlerts} data-empty={!stockAlerts.length} aria-label="Low stock medicines">
               <strong>Low stock{stockAlertTotal > 0 ? ` · ${stockAlertTotal}` : ''}</strong>
               {stockLoading ? <span>Checking stock levels…</span> : stockAlertError ? <span>{stockAlertError} <button type="button" onClick={() => setStockRetry(value => value + 1)}>Retry</button></span> : stockAlerts.length ? <>
                    <div className={styles.stockViewport} tabIndex={0} aria-label="Scroll low-stock medicines">
                         <div className={`${styles.stockTrack} ${stockPaused ? styles.stockPaused : ''}`} style={{animationDuration: `${Math.max(24, stockAlerts.length * 6)}s`}}>
                              {[0, 1].map(copy => <div className={styles.stockGroup} key={copy} aria-hidden={copy === 1 ? true : undefined}>{stockAlerts.map(item => <span key={item.inventoryItemId}><b>{item.name}</b> {Number(item.availableStock)} {item.unit || 'units'} left · reorder at {Number(item.minimumStock)}</span>)}</div>)}
                         </div>
                    </div>
                    <button type="button" onClick={() => setStockPaused(value => !value)} aria-label={stockPaused ? 'Resume low stock notices' : 'Pause low stock notices'}>{stockPaused ? 'Resume' : 'Pause'}</button>
                    <Link href="/pharmacy/stock?filter=low">View all</Link>
               </> : <span>No low-stock medicines reported.</span>}
          </section>
          <div className={styles.layout}>
               <section className={styles.basket}>
                    <div className={styles.searchArea}><div className={styles.transaction}><label htmlFor="medicine-search" className={styles.searchLabel}>Search medicine or scan barcode <kbd>F2</kbd>{heldId&&<span className="badge text-bg-info ms-2">Recalled</span>}</label><div className={styles.priceSwitch} role="group" aria-label="Transaction pricing">{(['retail','wholesale'] as PriceType[]).map(type=><button type="button" key={type} aria-pressed={priceType===type} className={priceType===type?styles.selected:''} disabled={locked} onClick={()=>choosePrice(type)}>{type==='retail'?'Retail':'Wholesale'}</button>)}</div></div>
                         <div className={styles.searchBox}><input ref={searchInput} id="medicine-search" autoFocus autoComplete="off" role="combobox" aria-expanded={!!search.trim()} aria-controls="medicine-options" aria-autocomplete="list" aria-activedescendant={items[active]?'medicine-option-'+active:undefined} placeholder="Scan a code, or search and select a medicine" value={search} disabled={locked} onChange={event=>{explicitSelection.current=false;setSearch(event.target.value);setItems([]);setLoading(!!event.target.value.trim());}} onKeyDown={async event=>{if(event.key==='Escape'){setSearch('');setItems([]);}if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();explicitSelection.current=true;setActive(value=>Math.max(0,Math.min(items.length-1,value+(event.key==='ArrowDown'?1:-1))));}if(event.key==='Enter'){event.preventDefault();const term=search.trim();if(!term)return;enqueueScan(term,resultsFor.current===term?items:[],explicitSelection.current?active:null);explicitSelection.current=false;}}}/>
                              {search.trim()&&<div id="medicine-options" role="listbox" className={styles.results}>{loading?<p>Searching…</p>:items.length?items.map((item,index)=><button type="button" role="option" aria-selected={active===index} id={'medicine-option-'+index} key={item.inventoryItemId} className={active===index?styles.highlight:''} disabled={locked} onMouseEnter={()=>setActive(index)} onClick={()=>add(item)}><span><strong>{item.name}</strong><small>{item.sku} · {item.dispensableStock??item.availableStock} available{item.requiresPrescription?' · Prescription required':''}</small></span><span>{unitPrice(item,priceType)>0?money(unitPrice(item,priceType)):'Price not set'} <b>＋</b></span></button>):<p>No medicines found. Try another name or SKU.</p>}</div>}
                         </div>
                    </div>
                    <div className={styles.cartHeading}><h2>Basket <span>{scanning?'Adding scanned medicines…':cart.length + (cart.length === 1 ? ' item' : ' items')}</span></h2><div className={styles.actions}><button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked||!!scanning||!cart.length} onClick={suspend}>Suspend <kbd>F8</kbd></button><button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked||!!scanning||!cart.length} onClick={clear}>Clear basket</button></div></div>
                    {cart.length?<div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Medicine</th><th>Quantity</th><th>Unit price</th><th>Total</th><th/></tr></thead><tbody>{cart.map(line=><tr key={line.inventoryItemId}><td><strong>{line.name}</strong><small>{line.sku}</small></td><td data-label="Quantity"><div className={styles.quantity}><button type="button" disabled={locked} aria-label={'Decrease '+line.name} onClick={()=>setQuantity(line.inventoryItemId,line.quantity-1)}>−</button><input form="pharmacy-checkout" aria-label={'Quantity for '+line.name} type="number" min="0.001" step="0.001" required max={line.dispensableStock??line.availableStock} value={quantityDraft[line.inventoryItemId]??line.quantity} disabled={locked} onChange={event=>{const value=event.target.value;setQuantityDraft(draft=>({...draft,[line.inventoryItemId]:value}));if(Number(value)>0)setQuantity(line.inventoryItemId,Number(value));}} onBlur={()=>setQuantityDraft(draft=>{const next={...draft};delete next[line.inventoryItemId];return next;})} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.currentTarget.blur();focusSearch();}}}/><button type="button" disabled={locked} aria-label={'Increase '+line.name} onClick={()=>setQuantity(line.inventoryItemId,line.quantity+1)}>+</button></div></td><td data-label="Unit price">{money(unitPrice(line,priceType))}</td><td data-label="Total"><strong>{money(lineTotal(line,priceType))}</strong></td><td><button type="button" className={styles.remove} disabled={locked} aria-label={'Remove '+line.name} onClick={()=>setQuantity(line.inventoryItemId,0)}>×</button></td></tr>)}</tbody></table></div>:<div className={`${styles.empty} ${receipt ? styles.afterSale : ''}`}><span>＋</span><h3>Ready for your next customer</h3><p>Search or scan a medicine above. Added items stay here while you continue scanning.</p></div>}

               </section>

          </div>
          {(!receipt || cart.length > 0 || pendingInvoice) && <footer className={styles.checkoutBar} aria-label="Current sale totals">
               <div><span>Total due</span><strong>{money(displayedTotal)}</strong></div>
               {!separate && <>
                    <div><span>Received</span><strong>{money(received)}</strong></div>
                    <div><span>{stillDue > 0 ? 'Still due' : 'Change'}</span><strong>{money(stillDue > 0 ? stillDue : change)}</strong></div>
               </>}
               <span className={styles.basketCount}>{displayedItemCount} {displayedItemCount === 1 ? 'item' : 'items'} · {priceType}</span>
               <button type="button" className="btn btn-success" disabled={busy || reviewLoading || !!scanning || (!cart.length && !payment.pending && !counterRequest.pending)} onClick={() => setShowInvoice(true)}>Review invoice <kbd>F9</kbd></button>
          </footer>}
          <Offcanvas placement="end" show={showInvoice} onHide={() => {if (!busy) {setShowInvoice(false); focusSearch();}}} onExited={focusSearch} onEntered={() => {
                    const selector = focusAmountOnOpen.current ? 'input[type="number"]:not([disabled])' : 'input:not([disabled])';
                    payPanel.current?.querySelector<HTMLInputElement>(selector)?.focus();
                    focusAmountOnOpen.current = false;
               }} aria-labelledby="pos-invoice-title" className={styles.invoiceDrawer} backdrop={busy ? 'static' : true} keyboard={!busy}>
               <Offcanvas.Header closeButton={!busy}><Offcanvas.Title id="pos-invoice-title">{separate ? 'Cashier invoice' : 'Invoice & payment'}</Offcanvas.Title></Offcanvas.Header>
               <Offcanvas.Body>
                    {error && <div role="alert" className="alert alert-danger">{error}</div>}
                    {payment.pending && <div className="alert alert-warning">Payment confirmation pending. <button type="button" className="btn btn-sm btn-warning" disabled={busy} onClick={() => checkout()}>Retry original checkout</button></div>}
                    {counterRequest.pending && <div className="alert alert-warning">Invoice confirmation pending. <button type="button" className="btn btn-sm btn-warning" disabled={busy} onClick={generateInvoice}>Retry original invoice</button></div>}
                    <div className={styles.invoiceColumns}>
                    {cart.length > 0 && <section className={styles.invoiceLines} aria-label="Invoice medicines" tabIndex={0}>
                         <h2>{cart.length} medicine{cart.length === 1 ? '' : 's'}</h2>
                         <ul>{cart.map(line => <li key={line.inventoryItemId}><div><strong>{line.name}</strong><span>{line.quantity} × {money(unitPrice(line, priceType))}</span></div><b>{money(lineTotal(line, priceType))}</b></li>)}</ul>
                    </section>}
                    <form id="pharmacy-checkout" onSubmit={checkout}>
               <aside className={styles.payment} ref={payPanel}>{separate?<><h2>Send to cashier</h2><div className={styles.total}><span>Invoice total</span><strong>{money(displayedTotal)}</strong></div><label className="form-label d-block">Customer (optional)<input className="form-control" maxLength={255} disabled={locked} value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="Walk-in customer"/></label><p>The cashier collects payment using a four-character code. Stock and current prices are checked again at payment.</p><button type="submit" className="btn btn-success btn-lg w-100" disabled={locked||!!scanning||!cart.length}>{busy?'Creating…':'Create cashier invoice'} <kbd>F9</kbd></button><p className={styles.shortcut}>F2 return to search · F9 create invoice</p></>:<><h2>Collect payment</h2><div className={styles.total}><span>Total due</span><strong>{money(displayedTotal)}</strong></div><label className="form-label d-block">Customer (optional)<input className="form-control" maxLength={255} disabled={locked} value={customer} onChange={event=>setCustomer(event.target.value)} placeholder="Walk-in customer"/></label><label className="form-label d-block">Payment method<select className="form-select" value={method} disabled={locked} onChange={event=>{setMethod(event.target.value);payment.setAmount('');}}><option value="cash">Cash</option><option value="mobile_money">Mobile money</option><option value="card">Card</option><option value="split">Split payment / part credit</option><option value="credit">Approved patient credit</option></select></label>{['split','credit'].includes(method)&&<><label className="form-label d-block">Approved patient account {method==='split'?'(required for unpaid remainder)':''}<select className="form-select" required={method==='credit'} disabled={locked} value={accountId} onChange={e=>{setAccountId(e.target.value);const account=accounts.find(a=>Number(a.id)===Number(e.target.value));if(account)setCustomer([account.firstname,account.lastname].filter(Boolean).join(' '));}}><option value="">No credit account</option>{accounts.filter(a=>a.is_active).map(a=><option key={a.id} value={a.id}>{a.firstname} {a.lastname} · Available {money(Math.max(0,Number(a.credit_limit)-Number(a.outstanding)))}</option>)}</select></label>{method==='split'&&<div>{Object.entries(split).map(([key,leg])=><fieldset key={key} className="border rounded p-2 mb-2" disabled={locked}><legend style={{fontSize:12}}>{key.replace('_',' ')}</legend><label className="form-label d-block">Net amount<input className="form-control" type="number" min="0" step="0.01" value={leg.amount} onChange={e=>setSplit(value=>({...value,[key]:{...value[key],amount:e.target.value}}))}/></label>{Number(leg.amount)>0&&(key==='cash'?<label className="form-label d-block">Cash tendered<input className="form-control" type="number" min={Number(leg.amount)} step="0.01" value={leg.received} placeholder={leg.amount} onChange={e=>setSplit(value=>({...value,[key]:{...value[key],received:e.target.value}}))}/></label>:<label className="form-label d-block">Reference<input className="form-control" required maxLength={128} value={leg.reference} onChange={e=>setSplit(value=>({...value,[key]:{...value[key],reference:e.target.value}}))}/></label>)}</fieldset>)}<p>On account: {money(Math.max(0,total-Object.values(split).reduce((sum,leg)=>sum+Number(leg.amount||0),0)))}</p></div>}</>}{!['credit','split'].includes(method)&&<PharmacyPaymentFields payment={payment} method={method} total={displayedTotal} disabled={locked}/>}<button type="button" className="btn btn-outline-secondary w-100 mb-2" disabled={locked||!!scanning||!cart.length||['split','credit'].includes(method)} onClick={()=>payment.setAmount(total.toFixed(2))}>Exact amount</button><button type="submit" className="btn btn-success btn-lg w-100" disabled={locked||!!scanning||!cart.length||!payment.setup?.shift||payment.setup?.day?.status!=='open'||(!['split','credit'].includes(method)&&!payment.setup?.routes?.some((route:any)=>route.method===method))}>{busy?'Processing…':'Complete sale'} <kbd>F9</kbd></button><p className={styles.shortcut}>F2 return to search · F4 amount · F9 pay</p></>}</aside>
                    </form>
                    </div>
               </Offcanvas.Body>
          </Offcanvas>

     </main>;
}
