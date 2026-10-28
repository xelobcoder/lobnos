import {roleWorkspace} from './roleNavigationPolicy';
export function smsCapabilities(role:unknown){
 const key=roleWorkspace(role);
 const owner=['admin','superadmin'].includes(key),manage=owner||key==='manager';
 return {read:manage||key==='crm',send:manage||key==='crm',manage,setup:owner};
}
export const smsStatusLabels:Record<string,string>={pending:'Queued',queued:'Queued',processing:'Processing',scheduled:'Scheduled',submitting:'Submitting',retrying:'Submitting',sent:'Submitted (legacy)',submitted:'Submitted',delivered:'Delivered',partialfailed:'Partially failed',failed:'Failed',unknown:'Needs review',cancelled:'Cancelled'};
export const smsStatusColors:Record<string,string>={pending:'secondary',queued:'secondary',processing:'info',scheduled:'info',submitting:'info',retrying:'info',sent:'primary',submitted:'primary',delivered:'success',partialfailed:'warning',failed:'danger',unknown:'warning',cancelled:'secondary'};
export function smsError(error:any,fallback:string){return typeof error?.error==='string'?error.error:typeof error?.message==='string'?error.message:fallback;}
