'use client';
import Select from 'react-select';
import { reactSelectCustomStyles } from '../../../../components/Auth/customFetch';
import { record, rowsOf, text } from '../../../../lib/pharmacyAccounting';
import { useResource } from './api';
import { ResourceState } from './common';

/** Match the established react-select human-name pickers; only authenticated server records are selectable. */
export default function SupplierPicker({value,onChange}:{value:string;onChange:(id:string,name:string)=>void}) {
  const resource=useResource<unknown>('pharmacy/suppliers',true);
  const rows=rowsOf(resource.data);
  const invalid=resource.data!=null&&(!Array.isArray(resource.data)&&!Array.isArray(record(resource.data).items)||rows.some(row=>!['number','string'].includes(typeof row.id)||!String(row.id).trim()||typeof row.name!=='string'||!row.name.trim()));
  const error=resource.error||(invalid?'The supplier directory returned invalid identifiers or names. Refresh before selecting a supplier.':'');
  const options=invalid?[]:rows.map(row=>({value:text(row.id),label:text(row.name)}));
  return <div><ResourceState loading={resource.loading} error={error} retry={resource.refresh}/><Select
    inputId="accounting-supplier" instanceId="accounting-supplier" name="supplier" aria-label="Search supplier by name"
    styles={reactSelectCustomStyles} options={options} value={options.find(option=>option.value===value)||null}
    onChange={option=>onChange(option?.value||'',option?.label||'')} isSearchable isClearable required
    isLoading={resource.loading} isDisabled={resource.loading||!!error}
    placeholder="Search supplier name…" noOptionsMessage={()=>error?'Supplier retrieval failed':'No matching suppliers in the returned directory'}
  /></div>;
}
