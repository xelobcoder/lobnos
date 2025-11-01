import ClinicianAnalyticsCaseSummaryDaily from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryDailyRecent";


export default function Page({ params }: { params: { clinicianid: number } }) {
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsCaseSummaryDaily clinicianId={params.clinicianid} />
        </div>
    );
}