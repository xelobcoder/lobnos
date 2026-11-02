'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { InventoryControlSnapshot } from '../../../../lib/pharmacyAccounting';
import { useResource } from './api';
import { DataTable, DateText, Feedback, Money, ResourceState, styles, SummaryMetrics } from './common';
import { downloadAccountingExport } from './exports';
import { Register } from './Registers';

export function InventoryReconciliation() {
  const resource=useResource<InventoryControlSnapshot>('inventory/reconciliation');
  const [page,setPage]=useState(1),[error,setError]=useState(''),[exporting,setExporting]=useState(false);
  const data=resource.data,rows=data?.rows||[],pages=Math.max(1,Math.ceil(rows.length/25)),current=Math.min(page,pages);
  async function exportSnapshot(format:'pdf'|'xlsx') {
    if(!data)return;
    setError('');setExporting(true);
    try {
      await downloadAccountingExport(format,'Pharmacy inventory control reconciliation',{
        rows:data.rows.map(row=>({...row})),
        metadata:{columns:['itemId','name','sku','quantity','unitCost','value'],totals:{
          stockValue:data.stockValue,inventoryControl:data.inventoryControl,difference:data.difference,balanced:data.balanced,
          ...Object.fromEntries(data.controls.map(control=>[`Control ${control.account}`,control.balance])),
        }},
      },`Current-only snapshot ${data.asOf}; branch ${data.branchid}; difference ${data.difference}; reconciled ${data.balanced}. No historical date is inferred.`);
    }catch(e){setError(e instanceof Error?e.message:'Inventory reconciliation export failed.');}
    finally{setExporting(false);}
  }
  return <section className={styles.card}><h2>Weighted-average stock vs inventory control</h2><p>Current-only, per-medicine weighted-average valuation compared with posted inventory. This endpoint is a current snapshot, not historical valuation.</p><ResourceState {...resource} retry={resource.refresh}/><Feedback error={error}/>
    {data&&<><p>Snapshot: <DateText value={data.asOf}/> · Branch {data.branchid}</p><p>{data.policy}</p>
      {data.balanced?<p role="status" className="alert alert-success">The server reports the current stock valuation reconciled to posted inventory control.</p>:<div role="alert" className="alert alert-warning"><strong>Inventory is not reconciled.</strong> Stock valuation differs from posted inventory control by <Money value={data.difference}/>. Investigate the source evidence before relying on inventory statements.</div>}
      <SummaryMetrics metrics={[{title:'Current stock value',value:data.stockValue,subtitle:'Per-medicine weighted-average valuation',variant:'primary'},{title:'Posted inventory control',value:data.inventoryControl,subtitle:'Posted source-book control',variant:'info'},{title:'Difference',value:data.difference,subtitle:data.balanced?'Reconciled by the server':'Investigate source evidence',variant:data.balanced?'success':'warning'}]}/>
      <h3>Posted asset controls</h3><p>Quarantined, transit and pending-return assets remain separate controls. Their balances are not silently included in available stock valuation.</p><DataTable rows={data.controls.map(control=>({...control}))} columns={['account','balance']}/>
      <h3 className="mt-4">Per-medicine valuation evidence</h3><p>{rows.length} medicines · displayed page {current} of {pages}</p><DataTable rows={rows.slice((current-1)*25,current*25).map(row=>({...row}))} columns={['itemId','name','sku','quantity','unitCost','value']}/>
      <div className={`${styles.actions} mt-3 d-print-none`}><button type="button" className="btn btn-outline-secondary" disabled={current===1} onClick={()=>setPage(current-1)}>Previous</button><button type="button" className="btn btn-outline-secondary" disabled={current>=pages} onClick={()=>setPage(current+1)}>Next</button><button type="button" className="btn btn-outline-secondary" disabled={resource.loading} onClick={()=>resource.refresh()}>Refresh current snapshot</button><button type="button" className="btn btn-outline-secondary" disabled={exporting} onClick={()=>exportSnapshot('xlsx')}>Excel · full current snapshot</button><button type="button" className="btn btn-outline-secondary" disabled={exporting} onClick={()=>exportSnapshot('pdf')}>PDF · full current snapshot</button><button type="button" className="btn btn-outline-secondary" onClick={()=>window.print()}>Print displayed reconciliation</button></div>
      <h3 className="mt-4">Correction policy</h3><p>{data.correctionPolicy}</p><p>No automatic balancing journal is generated here. Use the approved source stock or financial adjustment workflow.</p></>}
  </section>;
}
export default function InventoryAccounting() {
  return <><p>Operational quantities remain in <Link href="/pharmacy/stock">Stock levels</Link>; inventory adjustments are not manual expenses.</p><InventoryReconciliation/><h2>Inventory valuation register</h2><Register endpoint="inventory"/></>;
}
