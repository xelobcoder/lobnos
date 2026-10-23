import ClinicianAnalyticsYearlyTotals from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsYearlyTotals";


export default async function Page(props: { params: Promise<{ clinicianid: number }> }) {
    const params = await props.params;
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsYearlyTotals clinicianId={params.clinicianid} />
        </div>
    );
}