import ClinicianAnalyticsMonthlyTotals from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsMonthlyTotals";

export default function Page({ params }: { params: { clinicianid: number } }) {
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsMonthlyTotals clinicianId={params.clinicianid} />
        </div>
    );
}