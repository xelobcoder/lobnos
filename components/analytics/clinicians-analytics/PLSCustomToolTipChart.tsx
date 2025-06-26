import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface CustomTooltipData {
    clinicianCases: number;
    otherCases: number;
    totalCases: number;
    percentage: string;
    month: string;
}

const PLSCustomToolTipChart = ({
    active,
    payload,
    label
}: TooltipProps<ValueType, NameType>) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as CustomTooltipData;
    const clinicianCases = payload[0].value as number;
    const otherCases = (payload[1]?.value as number) || 0;
    const totalCases = clinicianCases + otherCases;
    const percentage = ((clinicianCases / totalCases) * 100).toFixed(1);

    const tooltipStyles = {
        container: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            fontSize: '0.75rem'
        },
        header: {
            borderBottom: '1px solid #eee',
            paddingBottom: '4px',
            marginBottom: '4px',
            fontWeight: 600,
            color: '#333'
        },
        content: {
            color: '#666',
            lineHeight: '1.4'
        },
        clinicianValue: {
            color: '#36A2EB',
            fontWeight: 500
        },
        otherValue: {
            color: '#FF6384',
            fontWeight: 500
        },
        totalValue: {
            fontWeight: 500
        },
        contributionSection: {
            marginTop: '4px',
            paddingTop: '4px',
            borderTop: '1px solid #eee',
            color: '#2196F3',
            fontWeight: 600
        }
    } as const;

    return (
        <div style={tooltipStyles.container}>
            <div style={tooltipStyles.header}>
                {label}
            </div>
            <div style={tooltipStyles.content}>
                <div>
                    Clinician Cases: <span style={tooltipStyles.clinicianValue}>{clinicianCases}</span>
                </div>
                <div>
                    Other Cases: <span style={tooltipStyles.otherValue}>{otherCases}</span>
                </div>
                <div>
                    Total Cases: <span style={tooltipStyles.totalValue}>{totalCases}</span>
                </div>
                <div style={tooltipStyles.contributionSection}>
                    Contribution: {percentage}%
                </div>
            </div>
        </div>
    );
};

export default PLSCustomToolTipChart;