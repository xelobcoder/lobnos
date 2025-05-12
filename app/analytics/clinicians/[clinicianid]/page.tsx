import ClinicianAnalyticsCaseSummaryDaily from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryDailyRecent";
import ClinicianAnalyticsCaseSummaryMonthly from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryMonthly";
import ClinicianAnalyticsCaseSummaryYearly from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsCaseSummaryYearly";
import ClinicianAnalyticsDailyCaseChange from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsDailyCaseChange";
import ClinicianAnalyticsMonthlyTotals from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsMonthlyTotals";
import ClinicianOverallAnalytics from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsOverallTotal";
import ClinicianAnalyticsYearlyTotals from "../../../../components/analytics/clinicians-analytics/ClinicianAnalyticsYearlyTotals";
import ClinicianCasesVerseTotalCases from "../../../../components/analytics/clinicians-analytics/ClinicianCasesVerseTotalCases";
import { customFetch } from "../../../../components/Auth/customFetch";

export default async function Page({ params }: { params: { clinicianid: number } }) {
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

            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-6">
                    <div className="h-100">
                        <ClinicianAnalyticsMonthlyTotals clinicianId={clinicianid} />
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="h-100">
                        <ClinicianAnalyticsYearlyTotals clinicianId={clinicianid} />
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-6">
                    <div className="h-100">
                        <ClinicianCasesVerseTotalCases clinicianId={clinicianid} />
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="h-100">
                        <ClinicianAnalyticsCaseSummaryMonthly clinicianId={clinicianid} />
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-6">
                    <div className="h-100">
                        <ClinicianAnalyticsCaseSummaryYearly clinicianId={clinicianid} />
                    </div>
                </div>
                <div className="col-12 col-xl-6">
                    <div className="h-100">
                        <ClinicianAnalyticsCaseSummaryDaily clinicianId={clinicianid} />
                    </div>
                </div>
            </div>

            <div>
                < ClinicianAnalyticsDailyCaseChange clinicianId={clinicianid} />
            </div>
        </div>
    );
}