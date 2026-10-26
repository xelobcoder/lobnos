'use client';
import { useRef, useState } from 'react';
import CommissionAssignmentForm from '../../../../../../components/Commission/Admin/CommissionAssignmentForm';
import CommissionAssignmentList from '../../../../../../components/Commission/Admin/CommissionAssignmentList';
import type { CommissionAssignment } from '../../../../../../lib/commission/commissionApi';
import s from '../../../../../../components/Commission/Admin/CommissionAssignments.module.css';
import ui from '../../../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import { RiGroupLine, RiAddLine } from '@remixicon/react';
const initial={type:'all',name:'',status:'all'};
export default function CommissionAssignmentsPage(){
 const [editor,setEditor]=useState<{assignment?:CommissionAssignment}|null>(null),[draft,setDraft]=useState(initial),[filters,setFilters]=useState(initial),[revision,setRevision]=useState(0),[notice,setNotice]=useState('');
 const heading=useRef<HTMLHeadingElement>(null);
 const open=(assignment?:CommissionAssignment)=>{setNotice('');setEditor({assignment});requestAnimationFrame(()=>heading.current?.focus())};
 return <main className={`${ui.workspace} ${s.page}`}><header className={`${ui.header} ${s.header}`}><div className={ui.heading}><span className={ui.icon} aria-hidden="true"><RiGroupLine size={24}/></span><div><span className={ui.eyebrow}>COMMISSION MANAGEMENT</span><h1 ref={heading} tabIndex={-1}>{editor?(editor.assignment?'Edit assignment':'New assignment'):'Commission assignments'}</h1><p>{editor?'Choose a configuration, its recipients and when it applies.':'Control which commission configuration applies to each clinician, organization or system-wide scope.'}</p></div></div>{!editor&&<button type="button" className={ui.primary} onClick={()=>open()}><RiAddLine size={19} aria-hidden="true"/>New assignment</button>}</header>
 {notice&&<div role="status" className="alert alert-success">{notice}</div>}
 {editor?<CommissionAssignmentForm key={editor.assignment?.id||'new'} assignmentId={editor.assignment?.id} onCancel={()=>setEditor(null)} onSaved={()=>{setEditor(null);setRevision(v=>v+1);setNotice('Assignment changes saved.')}}/>:<>
 <form className={s.filters} onSubmit={e=>{e.preventDefault();setFilters({...draft,name:draft.name.trim()});setRevision(v=>v+1)}}><label>Scope<select aria-label="Scope" className="form-select" value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}><option value="all">All scopes</option><option value="clinician">Clinicians</option><option value="organization">Organizations</option><option value="system">System-wide</option></select></label><label className={s.search}>Recipient name<input type="search" className="form-control" placeholder="Search clinicians or organizations" value={draft.name} maxLength={100} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Availability<select aria-label="Availability" className="form-select" value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}><option value="all">Enabled and disabled</option><option value="active">Enabled</option><option value="inactive">Disabled</option></select></label><div className={s.actions}><button type="submit" className={ui.primary}>Apply filters</button><button type="button" className={ui.secondary} onClick={()=>{setDraft(initial);setFilters(initial);setRevision(v=>v+1)}}>Clear filters</button></div></form>
 <CommissionAssignmentList onEdit={open} onDelete={()=>{setRevision(v=>v+1);setNotice('Assignment deleted.')}} refreshTrigger={revision} filterType={filters.type} filterName={filters.name} status={filters.status}/>
 <details className={s.guide}><summary>How matching and priority work</summary><p>Assignments must be enabled and within their validity dates. Recipient-specific matches are considered before system-wide fallback; commission defaults are used when no assignment matches. Within matching candidates, higher priority wins. Use a priority from 1 to 10.</p><p>Review the selected configuration’s calculation rules before assigning it. New assignments replace previously enabled assignments for the same recipient.</p></details></>}
 </main>
}
