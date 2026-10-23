import ClinicianOverallAnalytics from "../../../components/analytics/clinicians-analytics/ClinicianAnalyticsOverallTotal";
import { customFetch } from "../../../components/Auth/customFetch";




export default async function Page(props: { params: Promise<{ clinicianid: number }> }) {
    const params = await props.params;
    const { clinicianid } = params;
    let analyticData = {};
    const response = await customFetch(
        `clinician/anal/overall/${clinicianid}`
    );
    if (response?.success) {
        analyticData = response?.data[0];
    }

    return (
        <div className="container-fluid p-3">
            <div className="row mb-4">
                <div className="col-12">
                    <ClinicianOverallAnalytics
                        clinicianId={clinicianid}
                        analyticsData={analyticData as any}
                    />
                </div>
            </div>
        </div>
    );
}