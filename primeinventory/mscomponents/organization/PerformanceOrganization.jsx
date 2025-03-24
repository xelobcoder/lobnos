import { currencyFormatter } from "../Auth/customFetch";

export default function PerformanceOrganization({ data ,title}) {
  const { discountedAmount, payable, referedCases, commissionRate } = data;


  return (
    <>
     <div className={`my-2 border br-7 pointer`} style={{display:'grid',gridTemplateColumns:'100%',fontSize:'14px'}}>
        <span className='modal-color p-2 fw-bold  border text-capitalize lims-text-color border-bottom'> {title }</span>
        <span className='bg-white grid-100'>
          <span className="border-bottom p-2 text-capitalize">sales Amt: {currencyFormatter.format(payable)}</span>
          <span className="border-bottom p-2 text-capitalize">discount: {currencyFormatter.format(discountedAmount)}</span>
          <span className="border-bottom p-2 text-capitalize">commission: {currencyFormatter.format(commissionRate)}</span>
        </span>
      </div>
    </>
  )
}