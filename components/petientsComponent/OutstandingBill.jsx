import { currencyFormatter } from "../Auth/customFetch";

export default function OutstandingBills({ total }) {
  return (
    <div className="col-12 pls-color heightedBorder">
      <div className="list-group  br-0">
        <div className="list-group-item bg-secondary-subtle fw-bold text-center">
          Total Outstanding Debt
        </div>
        <div className="list-group-item text-danger d-flex justify-content-center align-items-center p-4">
          <h1 className="mb-0">{currencyFormatter.format(total) || 'Loading...'}</h1>
        </div>
      </div>
    </div>
  );
}
