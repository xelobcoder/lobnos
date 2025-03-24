import React from 'react'
import { customPost } from '../../../../../Lib/fetcher';


const get_stock_p_order = async (stockid, records = 5) => {
  if (!stockid) return;
  const pushResponse = await customPost('inventory/analytics/purchasetoconsume', 'POST', { stockid, records });
  return pushResponse;
}
export default async function InventoryPurchasesFlow({ searchParams }: {
  searchParams: Promise<{
    stockid: number
  }>
}) {
  const data = await get_stock_p_order(5, 20);
  console.log(data)
  try {

  }
  catch (err) {

  }


  return (
    <div>

    </div>
  )
}
