import React from 'react';
import VitalSignLineChart from './VitalSignLineChart';

export default function VitalSignCharts({ groupedVitalSigns, date, generateChartData }) {
    const charts = [
        {
            dataKey: 'temperature',
            title: 'Temperature',
            color: 'hsl(220 70% 50%)',
            unit: '°C',
            icon: '🌡️'
        },
        {
            dataKey: 'pulse',
            title: 'Pulse Rate',
            color: 'hsl(340 70% 50%)',
            unit: 'bpm',
            icon: '💗'
        },
        {
            dataKey: 'respiration',
            title: 'Respiration Rate',
            color: 'hsl(160 70% 50%)',
            unit: 'breaths/min',
            icon: '🫁'
        },
        {
            dataKey: 'spo2',
            title: 'SpO2',
            color: 'hsl(280 70% 50%)',
            unit: '%',
            icon: '🫂'
        },
        {
            dataKey: 'bp',
            title: 'Blood Pressure',
            color: 'hsl(40 70% 50%)',
            unit: 'mmHg',
            icon: '🩺'
        }
    ];

    return (
        <div className="container-fluid p-4">
            <h3 className="mb-4 text-secondary">Vital Signs for {date}</h3>
            <div className="row g-4">
                {charts.map((chart, index) => (
                    <div key={chart.dataKey} 
                         className={`${index === charts.length - 1 ? 'col-12' : 'col-md-6'}`}>
                        <div className="card h-100 border-0">
                            <div className="card-header bg-transparent border-0 d-flex align-items-center">
                                <span className="fs-4 me-2">{chart.icon}</span>
                                <h5 className="mb-0">{chart.title}</h5>
                                <span className="ms-2 text-muted">({chart.unit})</span>
                            </div>
                            <div className="card-body">
                                <VitalSignLineChart
                                    data={generateChartData(groupedVitalSigns[date], chart.dataKey)}
                                    title={chart.title}
                                    dataKey={chart.dataKey}
                                    strokeColor={chart.color}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
