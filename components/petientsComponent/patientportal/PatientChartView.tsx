import AnalyticsSummaryCards from './AnalyticsSummaryCards';
import TrendsAnalytics from './TrendsAnalytics';

interface PatientChartViewProps {
  patientid: number;
}

export default function PatientChartView({ patientid }: PatientChartViewProps) {
  return (
    <div className="p-3">
      <AnalyticsSummaryCards patientid={patientid} />
      <TrendsAnalytics patientid={patientid} />
    </div>
  );
}