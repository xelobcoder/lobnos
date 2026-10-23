import ClinicianAnalyticsCaseSummaryDaily from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryDailyRecent";




export default async function Page(props: { params: Promise<{ clinicianid: number }> }) {
    const params = await props.params;
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsCaseSummaryDaily clinicianId={params.clinicianid} />
        </div>
    );
}