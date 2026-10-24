import jsPDF from 'jspdf';
type Company={name:string;address?:string;phone?:string;printedBy?:string};
export function pharmacyReceiptPdf(receipt:any,company:Company){
     const measuring=new jsPDF({unit:'mm',format:[80,297]});measuring.setFontSize(8);
     const rows=(receipt.lines||[]).map((line:any)=>({...line,wrapped:measuring.splitTextToSize(String(line.name),64)}));
     const height=Math.max(150,115+rows.reduce((sum:number,line:any)=>sum+line.wrapped.length*4+8,0));
     const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:[80,Math.min(3000,height)]});let y=10;const left=7,right=73;
     const text=(value:string,size=8,bold=false,center=false)=>{pdf.setFont('times',bold?'bold':'normal');pdf.setFontSize(size);const lines=pdf.splitTextToSize(value,66);for(const line of lines){if(y>pdf.internal.pageSize.getHeight()-12){pdf.addPage();y=10;}pdf.text(line,center?40:left,y,center?{align:'center'}:undefined);y+=size>9?5:4;}};
     const rule=()=>{pdf.setDrawColor(130);pdf.setLineDashPattern([1,1],0);pdf.line(left,y,right,y);y+=5;};
     text(company.name,11,true,true);if(company.address)text(String(company.address),7,false,true);if(company.phone)text('Tel: '+company.phone,7,false,true);y+=3;
     text('PHARMACY SALES RECEIPT',9,true,true);rule();text('Receipt: '+receipt.receiptNumber,7);text(new Date(receipt.completedAt).toLocaleString('en-GH'),7);text('Customer: '+(receipt.customerName||'Walk-in customer'),7);
     const types=[...new Set(rows.map((line:any)=>line.priceType||'retail'))];text('Pricing: '+types.join(' / '),7);rule();
     for(const line of rows){text(String(line.name),8,true);pdf.setFont('times','normal');pdf.setFontSize(8);pdf.text(String(line.quantity)+' x '+Number(line.unitPrice).toFixed(2),left,y);pdf.text(Number(line.lineTotal).toFixed(2),right,y,{align:'right'});y+=7;}
     rule();text('TOTAL (GHS): '+Number(receipt.total).toFixed(2),10,true);text('Amount received: '+Number(receipt.amountTendered??receipt.total).toFixed(2));text('Change: '+Number(receipt.change||0).toFixed(2));if(Number(receipt.outstandingAmount)>0)text('ON ACCOUNT / DUE: '+Number(receipt.outstandingAmount).toFixed(2),9,true);text('Payment: '+String(receipt.paymentMethod).replaceAll('_',' '));if(receipt.paymentReference)text('Reference: '+receipt.paymentReference,7);rule();text('Thank you for your business!',8,true,true);text('Please retain this receipt for your records.',7,false,true);if(company.printedBy)text('Printed by: '+company.printedBy,7,false,true);
     return pdf;
}
export function printPharmacyReceipt(receipt:any,company:Company){const pdf=pharmacyReceiptPdf(receipt,company);pdf.autoPrint();const url=URL.createObjectURL(pdf.output('blob'));const viewer=window.open(url,'_blank');setTimeout(()=>URL.revokeObjectURL(url),60000);if(!viewer)throw new Error('Allow popups to open the 80 mm receipt for printing.');}
