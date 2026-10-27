'use client';
import React,{useEffect,useRef,useState} from 'react';
import LabThermalReceipt from '../receipts/LabThermalReceipt';
import {customFetch,customPost,currencyFormatter} from '../../Auth/customFetch';
import {useApplication} from '../../Auth/useApplicationContext';
import useCompanyImageUrl from '../../Auth/useCompanyImageUrl';
import styles from './ModernWorkflow.module.css';

export default function ModernReceipt({billingId}:{billingId:number}){
    const application=useApplication();
    const logo=useCompanyImageUrl();
    const [data,setData]=useState<any>(null),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
    const [format,setFormat]=useState<'pos'|'a4'>('pos'),[message,setMessage]=useState('');
    const [printHtml,setPrintHtml]=useState<string|null>(null),[printing,setPrinting]=useState(false);
    const receipt=useRef<HTMLElement>(null),frame=useRef<HTMLIFrameElement>(null);
    useEffect(()=>{let active=true;setError('');setData(null);customFetch(`billing/client/generate/receipt?billingid=${billingId}&employeeid=${application?.user?.employeeid}`).then((response:any)=>{if(!active)return;if(response?.status!=='success'||!response?.data)throw new Error(response?.message||'Unable to load the saved receipt');if(Number(response.data.billing?.billingid)!==billingId)throw new Error('The receipt does not match this bill');setData(response.data);}).catch((failure:any)=>{if(active)setError(failure.message||'Unable to load receipt');});return()=>{active=false;};},[billingId,application?.user?.employeeid,attempt]);
    const print=()=>{
        if(!receipt.current||printing)return;setPrinting(true);setMessage('');
        const thermal=format==='pos';
        setPrintHtml(`<!doctype html><html><head><meta charset="utf-8"><title>Receipt</title><style>
            @page{size:${thermal?'80mm auto':'A4'};margin:${thermal?'4mm':'12mm'}}
            body{margin:0;color:#111;background:white;font:${thermal?'12px':'14px'} Arial,sans-serif}
            article{max-width:${thermal?'72mm':'185mm'};margin:auto;overflow-wrap:anywhere}
            header{text-align:center;padding:6px 0}header img{max-width:105px;max-height:45px;object-fit:contain}h2{font-size:17px;margin:6px 0}h3{font-size:13px;margin:10px 0}p{margin:3px 0}
            section,footer,table{border-top:1px dashed #888;padding:9px 0}dl div,li{display:flex;justify-content:space-between;gap:12px;padding:6px 0}dt,dd{margin:0}ul{list-style:none;padding:0}li>span{display:grid;gap:4px}small{font-size:11px}strong{font-weight:700}li,tr{break-inside:avoid}button{display:none}
            table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:11px}th,td{text-align:right;vertical-align:top;padding:5px 2px;overflow-wrap:anywhere}th:first-child,td:first-child{text-align:left;width:44%}th:nth-child(2){width:10%}th:nth-child(3),th:nth-child(4){width:23%}section>p:has(>span),section>p:has(>strong+strong){display:flex;justify-content:space-between;gap:10px}footer{text-align:center;font-size:11px}
        </style></head><body>${receipt.current.outerHTML}</body></html>`);
    };
    const readyToPrint=async()=>{const printWindow=frame.current?.contentWindow;if(!printWindow)return;await Promise.all(Array.from(printWindow.document.images).map(image=>image.decode?.().catch(()=>{})));printWindow.onafterprint=()=>{setPrinting(false);setPrintHtml(null);setMessage('Print dialogue closed. The saved receipt remains available for reprinting.');if(data?.receiptId)void customPost(`receipt/update/printed?employeeid=${application?.user?.employeeid}`,'POST',{receiptId:data.receiptId,employeeid:application?.user?.employeeid,printed_at:new Date().toISOString()}).then((response:any)=>{if(response?.status!=='success'&&response?.status!==true)setMessage('Receipt prepared. The print log could not be updated; you can retry printing.');});};try{printWindow.focus();printWindow.print();}catch{setPrinting(false);setError('The print document could not be opened. Please retry.');}};
    if(error)return <section className={styles.receiptPanel}><div role="alert" className={styles.error}>{error}</div><button type="button" className={styles.secondary} onClick={()=>setAttempt(attempt+1)}>Retry receipt</button></section>;
    if(!data)return <section className={styles.receiptPanel} role="status">Loading the saved receipt…</section>;
    const company=data.companyInfo||{},patient=data.patient||{},bill=data.billing||{};
    const fullName=[patient.firstname,patient.middlename,patient.lastname].filter(Boolean).join(' ');
    return <div className={styles.receiptWorkspace}>
        <aside className={styles.receiptActions} aria-label="Receipt printing"><h2>Receipt & printing</h2><p>The receipt below uses the saved transaction. Select your paper format, then print.</p><div className={styles.paymentTypes} role="group" aria-label="Receipt format"><button type="button" aria-pressed={format==='pos'} onClick={()=>setFormat('pos')}><strong>POS receipt</strong><span>80 mm thermal paper</span></button><button type="button" aria-pressed={format==='a4'} onClick={()=>setFormat('a4')}><strong>A4 receipt</strong><span>Full-page paper</span></button></div><button type="button" className={styles.primary} disabled={printing} onClick={print}>{printing?'Preparing print…':'Print receipt'}</button>{message&&<p role="status">{message}</p>}</aside>
        <section className={styles.receiptPreview} aria-label="Receipt preview">{format==='pos'?<LabThermalReceipt receiptRef={receipt} data={data} logo={logo||undefined} printedBy={application?.user?.username}/>:<article ref={receipt} className={styles.a4Receipt}>
            <header>{logo&&<img src={logo} alt="Company logo"/>}<h2>{company.NAME||company.name||'Laboratory receipt'}</h2><p>{company.ADDRESS||company.address}</p><p>{[company.PHONENUMBER||company.phonenumber,company.EMAIL||company.email].filter(Boolean).join(' · ')}</p></header>
            <section><h3>Payment receipt</h3><dl><div><dt>Receipt</dt><dd>{data.receiptNumber||data.receiptId}</dd></div><div><dt>Bill</dt><dd>#{bill.billingid}</dd></div><div><dt>Patient</dt><dd>{fullName||patient.fullpatientid||patient.patientid}</dd></div><div><dt>Date</dt><dd>{bill.billedon?new Date(bill.billedon).toLocaleString():data.generatedAt?new Date(data.generatedAt).toLocaleString():''}</dd></div></dl></section>
            <ul>{(data.services||[]).map((service:any,index:number)=><li key={service.serviceid||index}><span><strong>{service.test_report_title||service.service_name||service.name}</strong><small>Paid {currencyFormatter.format(Number(service.paidamount||0))}</small></span><strong>{currencyFormatter.format(Number(service.totalpayable||0))}</strong></li>)}</ul>
            <footer><dl><div><dt>Amount payable</dt><dd><strong>{currencyFormatter.format(Number(bill.payable||0))}</strong></dd></div><div><dt>Paid</dt><dd>{currencyFormatter.format(Number(bill.paid||0))}</dd></div><div><dt>Outstanding</dt><dd>{currencyFormatter.format(Number(bill.outstanding??bill.balance??0))}</dd></div></dl><p>Thank you for choosing {company.NAME||company.name||'our laboratory'}.</p></footer>
        </article>}</section>
        {printHtml&&<iframe ref={frame} title="Receipt print document" srcDoc={printHtml} onLoad={()=>void readyToPrint()} className={styles.printFrame}/>}
    </div>;
}
