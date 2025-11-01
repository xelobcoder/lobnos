import ClinicianAnalyticsCaseSummaryMonthly from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryMonthly";

export default function Page({ params }: { params: { clinicianid: number } }) {
    const { clinicianid } = params;

    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsCaseSummaryMonthly clinicianId={clinicianid} />
        </div>
    );
}