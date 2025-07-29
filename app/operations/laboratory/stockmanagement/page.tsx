

'use client';
import React, { useEffect, useState } from 'react';
import StockManagementCompo from '../../../../components/inventory/limsConnection/StockManagementCompo';
import { customFetch } from '../../../../components/Auth/customFetch';
import dayjs from 'dayjs';

const StockManagementPage = () => {
    const [data, setData] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await customFetch(
                    `operations/ascension/staging?operationsStaging=COMPLETED` +
                    `&&dateFrom=${selectedDate}` +
                    `&&dateEnd=${selectedDate}` +
                    `&&searchString=` +
                    `&&page=1` +
                    `&&count=10` +
                    `&&isUltrasound=false` +
                    `&&employeeid=3`
                );
                if (Array.isArray(result)) {
                    setData(result);
                } else {
                    setData([]);
                }
            } catch (err) {
                setData([]);
            }
        };
        fetchData();
    }, [selectedDate]);

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <label htmlFor="date-picker" style={{ marginRight: 8 }}>Select Date:</label>
                <input
                    id="date-picker"
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                />
            </div>
            <StockManagementCompo ascensionList={data} />
        </div>
    );
};

export default StockManagementPage;
