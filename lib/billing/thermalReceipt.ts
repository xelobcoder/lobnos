import jsPDF from 'jspdf';
import JsBarcode from 'jsbarcode';
const amount=(value:any)=>Number.isFinite(Number(value))?Number(value):0;
export function labReceiptViewModel(data:any){
    const bill=data.billing||{},patient=data.patient||{},company=data.companyInfo||{};
    const value=(upper:string,lower:string)=>company[upper]||company[lower]||'';
    const paid=amount(bill.paid),total=amount(bill.payable??bill.totalcost),outstanding=amount(bill.outstanding??Math.max(0,total-paid));
    const nhis=Number(bill.billingSource)===4||String(bill.billingSource||'').toLowerCase().includes('nhis')||(data.services||[]).some((s:any)=>Number(s.isNHIS)===1||Number(s.categoryTrackId)===4);
    return {company:{name:value('NAME','name')||'Laboratory',address:[value('ADDRESS','address'),value('STREET','street')].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(', '),phone:[value('PHONENUMBER','phonenumber'),value('ALTERNATIVENUMBER','alternativenumber')].filter(Boolean).join(' / '),email:value('EMAIL','email'),website:value('WEBSITE','website')},
        number:String(data.receiptNumber||data.receiptId||`BILL-${bill.billingid}`),billId:bill.billingid,code:data.cashierCode||'',
        patientName:patient.fullname||[patient.firstname,patient.middlename,patient.lastname].filter(Boolean).join(' ')||patient.fullpatientid||String(patient.patientid||''),
        patientId:patient.fullpatientid||patient.patientid,date:data.generatedAt||bill.billedon,
        title:nhis?'NHIS CLAIM':paid<=0&&outstanding>0?'UNPAID INVOICE':outstanding>0?'PART PAYMENT RECEIPT':'PAYMENT RECEIPT',nhis,total,paid,outstanding,
        discount:amount(bill.discount),tax:amount(bill.amountIncurredDueTax),refunded:amount(bill.totalrefunded),writeoff:amount(bill.writeoff),
        lines:(data.services||[]).map((s:any)=>({id:s.serviceid,name:s.test_report_title||s.service_name||s.name||'Service',quantity:1,total:amount(s.totalpayable??s.totalcost)})),
        methods:[...new Set((data.paymenthistory||[]).map((p:any)=>p.PaymentMode).filter(Boolean))].join(' / ')};
}
export async function receiptLogoDataUrl(url:string){
    if(!url)return undefined;
    try{return await new Promise<string|undefined>(resolve=>{const image=new Image();image.crossOrigin='anonymous';const timer=setTimeout(()=>resolve(undefined),5000);image.onload=()=>{clearTimeout(timer);try{const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d')!.drawImage(image,0,0);resolve(canvas.toDataURL('image/png'))}catch{resolve(undefined)}};image.onerror=()=>{clearTimeout(timer);resolve(undefined)};image.src=url})}catch{return undefined}
}
/** Pharmacy-style layout, using the saved laboratory amounts without recalculating charges. */
export function labThermalReceiptPdf(data:any,options:{logo?:string;printedBy?:string}={}){
    const m=labReceiptViewModel(data);
    const render=(pdf:jsPDF)=>{
        let y=6;const left=7,right=73,width=66;
        const room=(height:number)=>{if(y+height>pdf.internal.pageSize.getHeight()-6){pdf.addPage();y=7}};
        const text=(value:string,size=8,bold=false,center=false)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);const lines=pdf.splitTextToSize(String(value),width);for(const line of lines){room(4);pdf.text(line,center?40:left,y,center?{align:'center'}:undefined);y+=size>9?4.5:3.4}};
        const rule=()=>{room(5);pdf.setDrawColor(130);pdf.setLineDashPattern([1,1],0);pdf.line(left,y,right,y);y+=4};
        const pair=(label:string,value:string,bold=false)=>{room(4.5);pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(bold?9:8);pdf.text(label,left,y);pdf.text(value,right,y,{align:'right'});y+=4.5};
        if(options.logo){try{const image=pdf.getImageProperties(options.logo),scale=Math.min(28/image.width,12/image.height),w=image.width*scale,h=image.height*scale;pdf.addImage(options.logo,image.fileType,(80-w)/2,y,w,h);y+=h+5}catch{/* Text header remains printable without a usable logo. */}}
        text(m.company.name,11,true,true);if(m.company.address)text(m.company.address,7,false,true);if(m.company.phone)text('Tel: '+m.company.phone,7,false,true);if(m.company.email)text(m.company.email,7,false,true);if(m.company.website)text(m.company.website,7,false,true);y+=2;text(m.title,9,true,true);if(m.code)text('CASHIER CODE: '+m.code,11,true,true);rule();text('Receipt: '+m.number,7);text('Bill: #'+m.billId,7);if(m.date)text(new Date(m.date).toLocaleString('en-GH'),7);text('Patient: '+m.patientName,8,true);if(m.patientId)text('Patient ID: '+m.patientId,7);rule();
        const tableHeader=()=>{room(5);pdf.setFont('helvetica','bold');pdf.setFontSize(7);pdf.text('ITEM',left,y);pdf.text('QTY',45,y,{align:'right'});pdf.text('RATE',59,y,{align:'right'});pdf.text('TOTAL',right,y,{align:'right'});y+=5};tableHeader();
        for(const line of m.lines){pdf.setFont('helvetica','normal');pdf.setFontSize(7);const wrapped=pdf.splitTextToSize(line.name,31);if(y+wrapped.length*3.2+3>pdf.internal.pageSize.getHeight()-6){pdf.addPage();y=7;tableHeader();}pdf.setFont('helvetica','normal');for(let i=0;i<wrapped.length;i++)pdf.text(wrapped[i],left,y+i*3.2);pdf.text('1',45,y,{align:'right'});pdf.text(line.total.toFixed(2),59,y,{align:'right'});pdf.text(line.total.toFixed(2),right,y,{align:'right'});y+=Math.max(1,wrapped.length)*3.2+2;}
        rule();pair('TOTAL (GHS)',m.total.toFixed(2),true);if(m.discount)pair('Discount',m.discount.toFixed(2));if(m.tax)pair('Tax included',m.tax.toFixed(2));pair('Paid / covered',m.paid.toFixed(2));pair(m.nhis?'Insurance claim':'Amount due (GHS)',m.outstanding.toFixed(2),true);if(m.refunded)pair('Refunded',m.refunded.toFixed(2));if(m.writeoff)pair('Waived',m.writeoff.toFixed(2));if(m.methods)text('Payment: '+m.methods,7);if(options.printedBy)text('Printed by: '+options.printedBy,7);
        if(typeof document!=='undefined'){room(22);rule();const canvas=document.createElement('canvas');JsBarcode(canvas,m.number,{format:'CODE128',displayValue:false,height:35,margin:0,width:1});pdf.addImage(canvas.toDataURL('image/png'),'PNG',left,y,width,10);y+=13;text(m.number,6,false,true);}
        rule();text('Thank you for choosing '+m.company.name+'.',7,false,true);return y;
    };
    const measure=new jsPDF({unit:'mm',format:[80,1200]});const end=render(measure),height=measure.getNumberOfPages()>1?1200:Math.max(85,end+7);
    const pdf=new jsPDF({unit:'mm',format:[80,height]});render(pdf);return pdf;
}
