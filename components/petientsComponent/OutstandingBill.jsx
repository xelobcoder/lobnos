import { currencyFormatter } from "../Auth/customFetch"
export default function OutstandingBills({ total, count }) {
  return (
    <div className="list-group  br-0 pls-color heightedBorder">
      <div className="list-group-item bg-secondary-subtle fw-bold">Total Outstanding Debt</div>
      <div className="list-group-item text-danger p-4 d-flex justify-content-center ">
        <h1> {currencyFormatter.format(total) || 'loading'}</h1>
      </div>
    </div>

  )
}
