import { redirect } from 'next/navigation';


export default async function Page({params}:{params:Promise<{stage:string}>}){const {stage}=await params;redirect('/operations/laboratory/outsourced-cases?stage='+(stage==='resolved'?'completed':'open'));}
