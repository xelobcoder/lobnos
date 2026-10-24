import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export type PharmacyReferralSlip = {
 prescriptionId?: string; patientId: number; clinicianId?: number; referredAt: string;
 items: Array<{drugName:string; quantityRemaining:number; dose:string|null; frequency:string|null; duration:string|null; route:string|null; dosageInstructions:string|null}>;
};
export function buildPharmacyReferralPdf(slip:PharmacyReferralSlip,patientName?:string) {
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a5'});
 const width=pdf.internal.pageSize.getWidth(),margin=12,usable=width-2*margin;
 pdf.setProperties({title:'External pharmacy referral',subject:'Outstanding prescription medicines'});
 pdf.setFillColor(25,60,78);pdf.rect(0,0,width,27,'F');
 pdf.setTextColor(255);pdf.setFont('helvetica','bold');pdf.setFontSize(16);pdf.text('PHARMACY REFERRAL',margin,13);
 pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.text('External dispensing request',margin,20);
 pdf.setTextColor(35);let y=36;
 const text=(value:string,size=10,bold=false)=>{pdf.setFontSize(size);pdf.setFont('helvetica',bold?'bold':'normal');const lines=pdf.splitTextToSize(value,usable);pdf.text(lines,margin,y);y+=lines.length*size*0.3528*1.25+3;};
 if(patientName)text('Patient: '+patientName,11,true);
 text('Patient ID: '+slip.patientId,10,!patientName);
 text('Issued: '+new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Accra'}).format(new Date(slip.referredAt))+' (Ghana)',9);
 if(slip.prescriptionId)text('Prescription reference: '+slip.prescriptionId,8);
 if(slip.clinicianId)text('Prescriber ID: '+slip.clinicianId,8);
 y+=2;text('Please present this slip at another pharmacy for the outstanding medicines listed below.',10);
 autoTable(pdf,{
 startY:y+1,margin:{left:margin,right:margin,top:15,bottom:25},
 head:[['MEDICINE AND PRESCRIBED DIRECTIONS','QUANTITY']],
 body:slip.items.map((item,index)=>{
 const details=[item.dose?'Dose: '+item.dose:null,item.frequency?'Frequency: '+item.frequency:null,item.route?'Route: '+item.route:null,item.duration?'Duration: '+item.duration:null,item.dosageInstructions?'Instructions: '+item.dosageInstructions:null].filter(Boolean);
 return [(index+1)+'. '+item.drugName+'\n\n'+(details.length?details.join('\n'):'Directions not recorded - confirm with prescriber.'),String(item.quantityRemaining)];
 }),
 theme:'grid',styles:{font:'helvetica',fontSize:9,cellPadding:4,lineColor:[220,226,230],lineWidth:0.2,textColor:[35,45,55],overflow:'linebreak',valign:'top'},
 headStyles:{fillColor:[25,60,78],textColor:255,fontSize:8,fontStyle:'bold'},
 columnStyles:{0:{cellWidth:usable-25},1:{cellWidth:25,halign:'center',fontStyle:'bold',fontSize:11}},
 alternateRowStyles:{fillColor:[246,249,250]},rowPageBreak:'avoid',
 });
 const pages=pdf.getNumberOfPages();
 for(let page=1;page<=pages;page++){
 pdf.setPage(page);const height=pdf.internal.pageSize.getHeight();pdf.setDrawColor(210);pdf.line(margin,height-20,width-margin,height-20);
 pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(90);
 pdf.text('Quantities shown are the remaining amounts to be supplied.',margin,height-15);
 pdf.text('Dispense against the original prescription where required.',margin,height-11);
 pdf.text('Page '+page+' of '+pages,width-margin,height-6,{align:'right'});
 }
 return pdf;
}
