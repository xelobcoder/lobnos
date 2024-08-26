import React, { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import { getStatusClass, NORMAL_RANGES } from './dataActions/vitalsigns';
import VitalSignLineChart from './VitalSignLineChart';

export default function VitalSignCustomerListInformation({ searchParams }) {
    const { patientid } = searchParams;
    const [vitalSigns, setVitalSigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    async function getPatientVitalSigns(patientid, fromDate, toDate) {
        if (!patientid) return;
        try {
            let url = `customers/vitalsigns/create?patientid=${patientid}&count=50&page=1`;
            if (fromDate && toDate) {
                url += `&filterFrom=${fromDate}&filterTo=${toDate}`;
            }
            const response = await customFetch(url);
            setVitalSigns(response.vitalSigns);
        } catch (err) {
            console.error('Error fetching vital signs:', err);
            setError(`Failed to fetch vital signs: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPatientVitalSigns(patientid, filterFrom, filterTo);
    }, [patientid]);

    const handleFilterChange = (e) => {
        if (e.target.name === 'filterFrom') {
            setFilterFrom(e.target.value);
        } else if (e.target.name === 'filterTo') {
            setFilterTo(e.target.value);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        getPatientVitalSigns(patientid, filterFrom, filterTo);
    };

    const groupByDate = (vitalSigns) => {
        return vitalSigns.reduce((acc, vitalSign) => {
            const date = new Date(vitalSign.date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(vitalSign);
            return acc;
        }, {});
    };

    const groupedVitalSigns = groupByDate(vitalSigns);

    const generateChartData = (vitalSigns, dataKey) => {
        return vitalSigns.map(vitalSign => ({
            time: new Date(vitalSign.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            [dataKey]: vitalSign[dataKey]
        }));
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="px-3 mt-4">
            <div className="bg-secondary-subtle p-3 rounded mb-2">
                <form onSubmit={handleFilterSubmit}>
                    <div className="d-flex col-6">
                        <div>
                            <input
                                className="form-control"
                                type="date"
                                placeholder="from"
                                name="filterFrom"
                                value={filterFrom}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <input
                                className="form-control mx-2"
                                type="date"
                                placeholder="to"
                                name="filterTo"
                                value={filterTo}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div>
                            <button className="btn btn-secondary mx-3" type="submit">
                                Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="table-responsive">
                {Object.keys(groupedVitalSigns).map(date => (
                    <div key={date}>
                        <h5 className="my-3">Date: {date}</h5>
                        <div className='grid-70-30'>
                           <div>
                                <table className="table table-bordered billing-cart-table">
                                    <thead>
                                        <tr>
                                            <th>SR NO</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Blood Pressure</th>
                                            <th>Pulse</th>
                                            <th>SpO2</th>
                                            <th>Respiration</th>
                                            <th>Temperature</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {groupedVitalSigns[date].map((vitalSign, index) => {
                                            const [systolic, diastolic] = vitalSign.bp.split('/').map(Number);
                                            const time = new Date(vitalSign.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                            const dateFormatted = new Date(vitalSign.date).toLocaleDateString('en-US');

                                            return (
                                                <tr key={vitalSign.vitalsignid}>
                                                    <td>{index + 1}</td>
                                                    <td>{dateFormatted}</td>
                                                    <td>{time}</td>
                                                    <td className={`${getStatusClass(systolic, NORMAL_RANGES.bloodPressure.systolic)} ${getStatusClass(diastolic, NORMAL_RANGES.bloodPressure.diastolic)}`}>
                                                        {vitalSign.bp}
                                                    </td>
                                                    <td className={getStatusClass(vitalSign.pulse, NORMAL_RANGES.pulse)}>
                                                        {vitalSign.pulse}
                                                    </td>
                                                    <td className={getStatusClass(vitalSign.spo2, NORMAL_RANGES.spo2)}>
                                                        {vitalSign.spo2}
                                                    </td>
                                                    <td>
                                                        {vitalSign.respiration}
                                                    </td>
                                                    <td className={getStatusClass(vitalSign.temperature, NORMAL_RANGES.temperature)}>
                                                        {vitalSign.temperature}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                           </div>
                        
                            <div style={{marginTop:'-26px'}}>
                                <VitalSignLineChart
                                    data={generateChartData(groupedVitalSigns[date], 'temperature')}
                                    title={`Temperature Trends for ${date}`}
                                    dataKey="temperature"
                                    strokeColor="#8884d8"
                                />
                                <VitalSignLineChart
                                    data={generateChartData(groupedVitalSigns[date], 'pulse')}
                                    title={`Pulse Trends for ${date}`}
                                    dataKey="pulse"
                                    strokeColor="#82ca9d"
                                />
                                <VitalSignLineChart
                                    data={generateChartData(groupedVitalSigns[date], 'respiration')}
                                    title={`Respiration Trends for ${date}`}
                                    dataKey="respiration"
                                    strokeColor="#ff7300"
                                />
                                <VitalSignLineChart
                                    data={generateChartData(groupedVitalSigns[date], 'spo2')}
                                    title={`SpO2 Trends for ${date}`}
                                    dataKey="spo2"
                                    strokeColor="#387908"
                                />
                                <VitalSignLineChart
                                    data={generateChartData(groupedVitalSigns[date], 'bp')}
                                    title={`Blood Pressure Trends for ${date}`}
                                    dataKey="bp"
                                    strokeColor="#8884d8"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
