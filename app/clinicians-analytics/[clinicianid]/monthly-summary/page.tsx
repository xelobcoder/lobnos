import ClinicianAnalyticsCaseSummaryMonthly from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryMonthly";


export default async function Page(props: { params: Promise<{ clinicianid: number }> }) {
    const params = await props.params;
    const { clinicianid } = params;

    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsCaseSummaryMonthly clinicianId={clinicianid} />
        </div>
    );
}