export type BreakdownGroup={key:string;label:string;count:number;amount:number;gross:number;paid:number;balance:number;billIds:number[]};
const cents=(value:any)=>Math.round((Number(value)||0)*100);
function payerSource(value:any){if(!value)return 'Unspecified';const labels:Record<string,string>={self:'Self',organization:'Organization',clinician:'Clinician',nhis:'NHIS',phis:'PHIS'};const parts=[...new Set(String(value).split(',').map(part=>part.trim()).filter(Boolean))].map(part=>labels[part.toLowerCase()]||part);return parts.length>1?`Mixed (${parts.join(', ')})`:parts[0]||'Unspecified';}
export function buildDailySalesBreakdown(loaded:any[],report:any){
 const bills=report?.transactions||(loaded||[]).filter(row=>row.status!=='voided').map(row=>({billingId:Number(row.billingid),date:String(row.billedon||'').slice(0,10),patientName:row.fullname,patientId:row.patientid,source:payerSource(row.registrationType||row.registration_type),gross:Number(row.totalcost)||0,net:Number(row.totalpayable)||0,paid:Number(row.paidamount)||0,outstanding:Number(row.outstanding)||0}));
 const receipts=report?.receipts||[],services=report?.inlineServices||[],expenses=report?.expenses||[];
 const group=(items:any[],key:(r:any)=>string,amount:(r:any)=>any,billId:(r:any)=>number):BreakdownGroup[]=>{const groups=new Map<string,any>();for(const row of items){const label=key(row)||'Unspecified';const entry=groups.get(label)||{key:label,label,count:0,amount:0,gross:0,paid:0,balance:0,ids:new Set<number>()};entry.count++;entry.amount+=cents(amount(row));entry.gross+=cents(row.gross??row.amount);entry.paid+=cents(row.paid);entry.balance+=cents(row.outstanding);if(billId(row))entry.ids.add(Number(billId(row)));groups.set(label,entry);}return [...groups.values()].map(row=>({key:row.key,label:row.label,count:row.count,amount:row.amount/100,gross:row.gross/100,paid:row.paid/100,balance:row.balance/100,billIds:[...row.ids] as number[]})).sort((a,b)=>Math.abs(b.amount)-Math.abs(a.amount)||a.label.localeCompare(b.label));};
 const id=(r:any)=>r.billingId;
 const status=(r:any)=>r.outstanding<=0?'Paid':r.paid>0?'Partially paid':'Unpaid';
 const sources=group(bills,r=>r.source,r=>r.net,id),statuses=group(bills,status,()=>0,id).map(row=>({...row,amount:row.count}));
 const methods=group(receipts,r=>r.method,r=>r.amount,id),credits=group(receipts.filter((r:any)=>r.amount>0),r=>r.method,r=>r.amount,id),cashiers=group(receipts,r=>r.cashier||'Unassigned',r=>r.amount,id);
 const serviceGroups=group(services,r=>r.name,r=>r.amount,id),departments=group(services,r=>r.department,r=>r.amount,id);
 const expenseGroups=group(expenses,r=>r.category,r=>r.amount,()=>0);
 const days=new Map<string,any>();const day=(date:string)=>{if(!days.has(date))days.set(date,{date,billed:0,collected:0,ids:new Set<number>()});return days.get(date);};
 for(const bill of bills){const d=day(String(bill.date).slice(0,10));d.billed+=cents(bill.net);d.ids.add(bill.billingId);}
 for(const receipt of receipts){const d=day(String(receipt.date).slice(0,10));d.collected+=cents(receipt.amount);d.ids.add(receipt.billingId);}
 const trend=[...days.values()].filter(d=>d.date).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({date:d.date,billed:d.billed/100,collected:d.collected/100,billIds:[...d.ids] as number[]}));
 const outstanding=bills.filter((bill:any)=>bill.outstanding>0);
 const outstandingGroups=group(outstanding,r=>r.source,r=>r.outstanding,id);
 return{bills,receipts,services,expenses,sources,statuses,methods,credits,cashiers,serviceGroups,departments,expenseGroups,trend,outstanding,outstandingGroups};
}
