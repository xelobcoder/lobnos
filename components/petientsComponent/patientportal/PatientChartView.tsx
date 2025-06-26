import AnalyticsSummaryCards from './AnalyticsSummaryCards';
import TrendsAnalytics from './TrendsAnalytics';
import LifetimeAnalytics from './LifetimeAnalytics';

interface PatientChartViewProps {
    patientid: number;
}

export default function PatientChartView({ patientid }: PatientChartViewProps) {
    return (
        <div className="p-2 p-sm-3">
            <div className="mb-3">
                <LifetimeAnalytics patientid={patientid} />
            </div>
            <div className="mb-3">
                <AnalyticsSummaryCards patientid={patientid} />
            </div>
            <div className="mb-3">
                <TrendsAnalytics patientid={patientid} />
            </div>
        </div>
    );
}