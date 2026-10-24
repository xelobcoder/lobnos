import jsPDF from 'jspdf';
export type PharmacyReferralSlip = {
 patientName?:string; company?:{name?:string;address?:string;street?:string;phonenumber?:string;alternativenumber?:string;email?:string;website?:string}; reprint?:boolean; prescriptionId?: string; patientId: number; clinicianId?: number; referredAt: string;
 items: Array<{drugName:string; quantityRemaining:number; dose:string|null; frequency:string|null; duration:string|null; route:string|null; dosageInstructions:string|null}>;
};
/** Matches the 80 mm pharmacy POS paper, with black-only thermal printing. */
export function buildPharmacyReferralPdf(slip:PharmacyReferralSlip,patientName?:string,logo?:string) {
 const measure=new jsPDF({unit:'mm',format:[80,200]});
 const blocks:Array<{text?:string;image?:string;size:number;quantity?:string;bold?:boolean;center?:boolean;rule?:boolean;lines?:string[];height?:number}>=[];
 const text=(text:string,size=7.5,bold=false,center=false)=>blocks.push({text,size,bold,center});
 const rule=()=>blocks.push({size:0,rule:true});
 const company=slip.company;
 if(logo)blocks.push({image:logo,size:0,height:14});
 if(company?.name)text(company.name,10,true,true);
 const address=[company?.address,company?.street].filter(Boolean).filter((value,index,array)=>array.indexOf(value)===index).join(', ');
 if(address)text(address,7,false,true);
 if(company?.phonenumber)text('Tel: '+company.phonenumber,7,false,true);
 if(company?.alternativenumber)text('Other: '+company.alternativenumber,7,false,true);
 if(company?.email)text(company.email,7,false,true);
 if(company?.website)text(company.website,7,false,true);
 if(company?.name)rule();
 text('PHARMACY REFERRAL',11,true,true);if(slip.reprint)text('REPRINT / CUSTOMER COPY',8,true,true);text('External dispensing request',8,false,true);rule();
 if(slip.patientName||patientName)text('Patient: '+(slip.patientName||patientName),9,true);
 text('Patient ID: '+slip.patientId);
 text('Date: '+new Intl.DateTimeFormat('en-GB',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Accra'}).format(new Date(slip.referredAt)));
 if(slip.prescriptionId)text('Prescription: '+slip.prescriptionId,7);
 if(slip.clinicianId)text('Prescriber ID: '+slip.clinicianId,8);
 rule();text('Please present this slip at another pharmacy for the medicines below.',8);rule();
 blocks.push({text:'MEDICINE',quantity:'QTY',size:7,bold:true});
 slip.items.forEach((item,index)=>{
 blocks.push({text:(index+1)+'. '+item.drugName,size:8,bold:true,quantity:item.quantityRemaining>0?String(item.quantityRemaining):'Assess'});
 const directions=[item.dose,item.frequency,item.duration,item.route].filter(Boolean).join(' | ');
 if(directions)text(directions,7);
 if(item.dosageInstructions)text('Instructions: '+item.dosageInstructions,7);
 });
 rule();
 text('Dispense against the original prescription where required.',7.5,false,true);
 for(const block of blocks){if(block.image)continue;measure.setFont('helvetica',block.bold?'bold':'normal');measure.setFontSize(block.size||8);block.lines=block.rule?[]:measure.splitTextToSize(block.text||'',block.quantity?56:70);block.height=block.rule?4.5:block.lines!.length*(block.size*0.3528*1.25)+0.8;}
 const height=Math.min(280,Math.max(65,blocks.reduce((sum,b)=>sum+b.height!,0)+18));
 const pdf=new jsPDF({unit:'mm',format:[80,height]});pdf.setProperties({title:'Pharmacy referral receipt',subject:'Outstanding prescription medicines'});let y=6;
 for(const block of blocks){
 if(y+block.height!>height-8){pdf.addPage([80,height]);y=8;}
 if(block.image){const properties=pdf.getImageProperties(block.image);const scale=Math.min(30/properties.width,12/properties.height);const w=properties.width*scale,h=properties.height*scale;pdf.addImage(block.image,'PNG',(80-w)/2,y,w,h);y+=block.height!;continue;}
 if(block.rule){pdf.setDrawColor(100);pdf.setLineWidth(0.15);pdf.line(5,y,75,y);y+=block.height!;continue;}
 pdf.setTextColor(0);pdf.setFont('helvetica',block.bold?'bold':'normal');pdf.setFontSize(block.size);
 const lineHeight=block.size*0.3528*1.25;
 let first=true;
 for(const line of block.lines!){if(y+lineHeight>height-8){pdf.addPage([80,height]);y=8;}pdf.text(line,block.center?40:5,y,{align:block.center?'center':'left'});if(first&&block.quantity)pdf.text(block.quantity,75,y,{align:'right'});first=false;y+=lineHeight;}
 y+=0.8;
 }
 if(pdf.getNumberOfPages()>1)for(let page=1;page<=pdf.getNumberOfPages();page++){pdf.setPage(page);pdf.setFontSize(7);pdf.text('Page '+page+' of '+pdf.getNumberOfPages(),40,height-3,{align:'center'});}
 return pdf;
}
