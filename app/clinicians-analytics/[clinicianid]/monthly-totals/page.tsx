import ClinicianAnalyticsMonthlyTotals from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsMonthlyTotals";


export default async function Page(props: { params: Promise<{ clinicianid: number }> }) {
    const params = await props.params;
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsMonthlyTotals clinicianId={params.clinicianid} />
        </div>
    );
}