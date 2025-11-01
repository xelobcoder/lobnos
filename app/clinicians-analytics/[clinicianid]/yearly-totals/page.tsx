import ClinicianAnalyticsYearlyTotals from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsYearlyTotals";

export default function Page({ params }: { params: { clinicianid: number } }) {
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsYearlyTotals clinicianId={params.clinicianid} />
        </div>
    );
}