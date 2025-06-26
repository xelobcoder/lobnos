import ClinicianAnalyticsDailyCaseChange from "../../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsDailyCaseChange";

export default function Page({ params }: { params: { clinicianid: number } }) {
    return (
        <div className="container-fluid p-3">
            <ClinicianAnalyticsDailyCaseChange clinicianId={params.clinicianid} />
        </div>
    );
}