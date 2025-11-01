import ClinicianCasesVerseTotalCases from "../../../../components/analytics/clinicians-analytics/ClinicianCasesVerseTotalCases";

export default function Page({ params }: { params: { clinicianid: number } }) {
    return (
        <div className="container-fluid p-3">
            <ClinicianCasesVerseTotalCases clinicianId={params.clinicianid} />
        </div>
    );
}