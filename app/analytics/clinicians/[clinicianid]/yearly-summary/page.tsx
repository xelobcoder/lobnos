import ClinicianAnalyticsCaseSummaryMonthly from "../../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryMonthly";

export default function Page({ params }: { params: { clinicianid: number } }) {
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsCaseSummaryMonthly clinicianId={params.clinicianid} />
        </div>
    );
}