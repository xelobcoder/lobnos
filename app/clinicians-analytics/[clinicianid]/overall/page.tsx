
import ClinicianOverallAnalytics from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsOverallTotal";
import { customFetch } from "../../../../components/Auth/customFetch";


export default async function Page({ params }: { params: { clinicianid: number } }) {
    let analyticData = {};
    const response = await customFetch(`clinician/anal/overall/${params.clinicianid}`);
    if (response?.success) {
        analyticData = response?.data[0];
    }
    return (
        <div className="container-fluid p-3">
            <ClinicianOverallAnalytics clinicianId={params.clinicianid} analyticsData={analyticData as any} />
        </div>
    );
}