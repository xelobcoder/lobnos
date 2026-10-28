"use client";
import React,{useMemo} from 'react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import styles from './AccountingTable.module.css';
type Props=React.ComponentProps<typeof PrimeTable>;
// Keep PrimeTable's paging, exports, sorting, filters and action renderers; adapt its report presentation only.
export default function AccountingTable(props:Props){
 const columns=useMemo(()=>props.column.map((column:any)=>{
  const key=String(column.accessor||'');
  const numeric=column.align==='right'||column.accountingNumeric===true||/^(?:amount|balance|openingBalance|closingBalance|debits?|credits?|total|value|quantity|unitCost|revenue|expenses?|profit|netProfit|grossProfit|costOfSales|operatingExpenses|outstanding|paid|payable|current|days30|days60|days90|over90|\d{4}-\d{2})$/i.test(key);
  if(!numeric)return column;
  const Header=column.Header,Cell=column.Cell;
  return {...column,Header:(context:any)=><span data-accounting-number="true">{typeof Header==='function'?<Header {...context}/>:Header}</span>,Cell:(context:any)=><div data-accounting-number="true">{Cell?<Cell {...context}/>:context.value??'—'}</div>};
 }),[props.column]);
 return <div className={styles.tableView} data-accounting-table="true"><PrimeTable {...props} column={columns}/></div>;
}
