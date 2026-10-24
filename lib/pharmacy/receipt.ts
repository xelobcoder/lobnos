import {customFetch} from '../../components/Auth/customFetch';
import {getRequestContext} from '../../components/serverActions/requestHeaders';
import {companyImageUrl} from '../companyImage';
import jsPDF from 'jspdf';
type Company={name:string;address?:string;phone?:string;email?:string;website?:string;logo?:string;printedBy?:string};
export function pharmacyReceiptPdf(receipt:any,company:Company){
     const measuring=new jsPDF({unit:'mm',format:[80,297]});measuring.setFontSize(8);
     const rows=(receipt.lines||[]).map((line:any)=>({...line,wrapped:measuring.splitTextToSize(String(line.name),64)}));
     const height=Math.max(85,85+rows.reduce((sum:number,line:any)=>sum+line.wrapped.length*3.2+6,0));
     const render=(pdf:jsPDF)=>{let y=7;const left=7,right=73;
     const text=(value:string,size=8,bold=false,center=false)=>{pdf.setFont('times',bold?'bold':'normal');pdf.setFontSize(size);const lines=pdf.splitTextToSize(value,66);for(const line of lines){if(y>pdf.internal.pageSize.getHeight()-12){pdf.addPage();y=7;}pdf.text(line,center?40:left,y,center?{align:'center'}:undefined);y+=size>9?4.5:3.2;}};
     const rule=()=>{pdf.setDrawColor(130);pdf.setLineDashPattern([1,1],0);pdf.line(left,y,right,y);y+=4;};
     if(company.logo){const image=pdf.getImageProperties(company.logo);const scale=Math.min(28/image.width,12/image.height);const w=image.width*scale,h=image.height*scale;pdf.addImage(company.logo,'PNG',(80-w)/2,y,w,h);y+=h+3;}
     text(company.name,11,true,true);if(company.address)text(String(company.address),7,false,true);if(company.phone)text('Tel: '+company.phone,7,false,true);if(company.email)text(company.email,7,false,true);if(company.website)text(company.website,7,false,true);y+=3;
     text('PHARMACY SALES RECEIPT',9,true,true);if(receipt.reprint)text('REPRINT / CUSTOMER COPY',8,true,true);if(receipt.status&&receipt.status!=='completed')text('STATUS: '+String(receipt.status).toUpperCase(),9,true,true);rule();text('Receipt: '+receipt.receiptNumber,7);text(new Date(receipt.completedAt).toLocaleString('en-GH'),7);text((receipt.patientName?'Patient: ':'Customer: ')+(receipt.patientName||receipt.customerName||'Walk-in customer'),8,true);
     const types=[...new Set(rows.map((line:any)=>line.priceType||'retail'))];text('Pricing: '+types.join(' / '),7);rule();
     for(const line of rows){text(String(line.name),8,true);pdf.setFont('times','normal');pdf.setFontSize(8);pdf.text(String(line.quantity)+' x '+Number(line.unitPrice).toFixed(2),left,y);pdf.text(Number(line.lineTotal).toFixed(2),right,y,{align:'right'});y+=5;}
     rule();text('TOTAL (GHS): '+Number(receipt.total).toFixed(2),10,true);text('Amount received: '+Number(receipt.amountTendered??receipt.total).toFixed(2));text('Change: '+Number(receipt.change||0).toFixed(2));if(Number(receipt.outstandingAmount)>0)text('ON ACCOUNT / DUE: '+Number(receipt.outstandingAmount).toFixed(2),9,true);text('Payment: '+String(receipt.paymentMethod).replaceAll('_',' '));if(receipt.paymentReference)text('Reference: '+receipt.paymentReference,7);rule();text('Thank you for your business!',8,true,true);text('Please retain this receipt for your records.',7,false,true);if(company.printedBy)text('Printed by: '+company.printedBy,7,false,true);
     return y;
     };
     const measured=render(new jsPDF({unit:'mm',format:[80,3000]}));
     const pdf=new jsPDF({unit:'mm',format:[80,Math.min(3000,Math.max(65,measured+18))]});render(pdf);return pdf;
}
export async function printPharmacyReceipt(receipt:any,company:Company){
 const viewer=window.open('','_blank');if(!viewer)throw new Error('Allow popups to print the receipt.');
 try{
  if(receipt.saleId||receipt.id){const r=await customFetch('pharmacy/sales/'+(receipt.saleId||receipt.id));if(!r?.success)throw new Error(r?.error?.message||'Unable to load receipt details');receipt={...receipt,patientName:r.data.patientName,company:r.data.company};}
  const profile=receipt.company||{};company={...company,name:profile.name||company.name,address:[profile.address,profile.street].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(', ')||company.address,phone:[profile.phonenumber,profile.alternativenumber].filter(Boolean).join(' / ')||company.phone,email:profile.email,website:profile.website};
  const context=await getRequestContext(),url=companyImageUrl(context.tenantId);
  if(url){try{company.logo=await new Promise<string>((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image conversion failed');ctx.drawImage(img,0,0);resolve(canvas.toDataURL('image/png'));}catch(e){reject(e);}};img.onerror=()=>reject(Error('Logo unavailable'));img.src=url;});}catch{ /* Print configured text even if the facility has no logo. */ }}
  const pdf=pharmacyReceiptPdf(receipt,company);pdf.autoPrint();const blob=URL.createObjectURL(pdf.output('blob'));viewer.location.href=blob;setTimeout(()=>URL.revokeObjectURL(blob),60000);
 }catch(e){viewer.close();throw e;}
}
