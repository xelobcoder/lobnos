import ClinicianAnalyticsDailyCaseChange from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsDailyCaseChange";


export default async function Page(props: { params: Promise<{ clinicianid: number }> }) {
    const params = await props.params;
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsDailyCaseChange clinicianId={params.clinicianid} />
        </div>
    );
}