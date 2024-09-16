import { ViewCarousel } from "@mui/icons-material";

export default function ViewTaxesAppliedToTransaction({ billingid, patientid }) {
    return (<div className="mt-2 col-9">
        <div className="card">
            <div className="card-header d-flex justify-content-between">
                <div className="card-title">
                    <h4>Tax Information</h4>
                </div>
                <div>
                    <button className="btn btn-primary br-0"><ViewCarousel/>view</button>
                </div>
            </div>
            <div className="card-body">
                <input className="custom-input" placeholder="select service here" />
            </div>
        </div>
    </div>)
}