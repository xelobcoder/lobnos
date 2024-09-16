import { ViewCarouselTwoTone } from "@mui/icons-material";

export default function ServicesProvidedToPatientBilling({ billingid, patientid }) {
    return (<div className="mt-2 col-9">
        <div className="card">
            <div className="card-header d-flex justify-content-between">
                <div className="card-title">
                    <h4>Services Information</h4>
                </div>
                <div>
                    <button className="btn btn-primary br-0"><ViewCarouselTwoTone/> view</button>
                </div>
            </div>
            <div className="card-body">
                <input className="custom-input" placeholder="select service here" />
            </div>
        </div>
    </div>)
}