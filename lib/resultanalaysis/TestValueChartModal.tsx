"use client"
import React, { useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { customFetch } from '../../components/Auth/customFetch';
import { RiAlertLine as RiAlertLineIcon } from '@remixicon/react';

const SHADCN_ACCENT = "#3B82F6"; // blue-500
const SHADCN_MUTED_FOREGROUND = "#64748B"; // slate-500
const SHADCN_BORDER = "#E2E8F0"; // slate-200
const SHADCN_TOOLTIP_BG = "#FFFFFF";
const SHADCN_TOOLTIP_FG = "#0F172A"; // slate-900

interface ChartData {
    date: string;
    value: number;
    field: string;
}

interface ApiDetails {
    id: number;
    testid: number;
    name: string;
    field: string | null;
    value: string;
    hasunits: number;
    units: string;
    plan: string;
    plain: string;
    ordering: number;
    isValueTracked: number;
    textReference: string;
    upperlimit: string;
    lowerlimit: string;
    category: string | null;
    options: string;
    undercategory: number;
    categoryid: number | null;
    valueAlert: string | null;
    alert: string | null;
}

interface ApiResult {
    id: number;
    field: string;
    ascensionid: number;
    billingid: number;
    patientid: number;
    testid: number;
    value: string;
    originalvalue: string;
    created_on: string;
    updated_on: string;
    employeeid: number;
    entrymode: string;
    fieldid: number;
}

interface ApiResponse {
    details: ApiDetails;
    results: ApiResult[];
}

interface TestValueChartModalProps {
    show: boolean;
    onHide: () => void;
    constraints: {
        fieldid: number;
        testid: number;
        year: number;
        month: number;
        employeeid: number;
        field: string
    }
}

const TestValueChartModal: React.FC<TestValueChartModalProps> = ({
    show,
    onHide,
    constraints
}) => {
    const { testid, fieldid, year, month, employeeid, field } = constraints;
    const [minValue, setMinValue] = React.useState(0);
    const [maxValue, setMaxValue] = React.useState(1);
    const [chartData, setChartData] = React.useState<ChartData[]>([]);
    const [belowMinCount, setBelowMinCount] = React.useState(0);
    const [aboveMaxCount, setAboveMaxCount] = React.useState(0);

    const onMinValueChange = (value: number) => {
        setMinValue(value);
    };

    const onMaxValueChange = (value: number) => {
        setMaxValue(value);
    };

    const endpoint = `result/analysis/test/resultvalues/resultfields?fieldid=${fieldid}&testid=${testid}&&year=${year}&&month=${month}&&employeeid=${employeeid}`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data: ApiResponse = await customFetch(endpoint);
                if (data && data.details && data.results) {
                    if (data.details.plan === 'limits') {
                        setMinValue(Number(data.details.lowerlimit));
                        setMaxValue(Number(data.details.upperlimit));
                    }
                   if (Array.isArray(data.results) && data.results.length > 0) {
                     // Assuming 'created_on' is the date and 'value' is the value for the chart
                     const formattedData: ChartData[] = data.results.map(item => ({
                        date: new Date(item.created_on).toLocaleDateString(), // Format date as needed
                        value: Number(item.originalvalue), // Use originalvalue as per user's data structure
                        field: item.field
                    }));
                    setChartData(formattedData);

                    // Calculate counts below min and above max
                    const min = data.details.plan === 'limits' ? Number(data.details.lowerlimit) : minValue;
                    const max = data.details.plan === 'limits' ? Number(data.details.upperlimit) : maxValue;

                    const below = formattedData.filter(item => item.value < min).length;
                    const above = formattedData.filter(item => item.value > max).length;

                    setBelowMinCount(below);
                    setAboveMaxCount(above);

                   }
                }
            } catch (err) {
                console.error("Error fetching chart data:", err);
                // Handle error appropriately, maybe set chartData to empty array
                setChartData([]);
            }
        };

        if (show && fieldid) { // Fetch data only when modal is shown and fieldid is available
            fetchData();
        }
    }, [show, fieldid, endpoint])

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="xl"
        >
            <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
                <Modal.Title className=" fs-4 font-semibold "> {field} Analysis</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <div className="row">
                        <div className="col-md-6 flex items-center gap-2">
                            <label className="form-label">Min Value Threshold</label>
                            <input
                                type="number"
                                className="form-control px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={minValue}
                                onChange={(e) => onMinValueChange(Number(e.target.value))}
                            />
                        </div>
                        <div className="col-md-6 flex items-center gap-2">
                            <label className="form-label">Max Value Threshold</label>
                            <input
                                type="number"
                                className="form-control px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={maxValue}
                                onChange={(e) => onMaxValueChange(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded relative" role="alert">
                    <small>
                        Values outside thresholds are highlighted. Adjust min/max values to analyze different ranges.
                    </small>
                </div>
              <div className='d-flex justify-content-between mt-2 mb-2'>
              <div className="mt-3 p-2 bg-light border border-warning rounded d-flex align-items-center">
                    <RiAlertLineIcon className="text-warning me-2" />
                    <span className="text-warning fw-semibold">
                        {belowMinCount} values below minimum threshold
                    </span>
                </div>

                <div className="mt-3 p-2 bg-light border border-danger rounded d-flex align-items-center">
                    <RiAlertLineIcon className="text-danger me-2" />
                    <span className="text-danger fw-semibold">
                        {aboveMaxCount} values above maximum threshold
                    </span>
                </div>
              </div>

                <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={SHADCN_BORDER} />
                            <XAxis dataKey="date"
                                stroke={SHADCN_BORDER}
                                tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                tickLine={{ stroke: SHADCN_BORDER }}
                            />
                            <YAxis domain={[minValue, maxValue]}
                                stroke={SHADCN_BORDER}
                                tick={{ fill: SHADCN_MUTED_FOREGROUND, fontSize: 12 }}
                                tickLine={{ stroke: SHADCN_BORDER }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: SHADCN_TOOLTIP_BG, borderRadius: '0.5rem', borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
                                labelStyle={{ color: SHADCN_TOOLTIP_FG, marginBottom: '4px', fontWeight: '500' }}
                                itemStyle={{ color: SHADCN_MUTED_FOREGROUND }}
                                cursor={{ stroke: SHADCN_BORDER, strokeDasharray: '3 3' }}
                            />
                            <Legend wrapperStyle={{ color: SHADCN_MUTED_FOREGROUND, fontSize: '12px', paddingTop: '10px' }} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={SHADCN_ACCENT}
                                strokeWidth={2}
                                dot={{ r: 3, fill: SHADCN_ACCENT }}
                                activeDot={{ r: 5, stroke: SHADCN_ACCENT, fill: SHADCN_TOOLTIP_BG, strokeWidth: 2 }}
                                name={field}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default TestValueChartModal;