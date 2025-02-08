"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface UniqueIdentifiersData {
  fullpatientid: string;
  duplicate_count: number;
}

const UniqueIdentifiers: React.FC = () => {
  const [data, setData] = useState<UniqueIdentifiersData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUniqueIdentifiers = async () => {
      try {
        const result = await customFetch('patient-analytics/unique-identifiers');
        if (Array.isArray(result)) {
          const sortedData = result.sort(
            (a: UniqueIdentifiersData, b: UniqueIdentifiersData) => b.duplicate_count - a.duplicate_count
          );
          const topData = sortedData.slice(0, 10);
          setData(topData);
        } else {
          setError('Unexpected data format received.');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching unique identifiers data');
      } finally {
        setLoading(false);
      }
    };
    fetchUniqueIdentifiers();
  }, []);

  if (loading) return <div>Loading unique identifiers data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h5 className="pls-color my-2 col-5 bg-secondary-subtle br-5 p-3">
        Duplicate Unique Identifiers
      </h5>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="fullpatientid"
              angle={-45}
              textAnchor="end"
              interval={0}
              label={{ value: 'Full Patient ID', position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: 'Duplicate Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "5px", fontSize: "14px" }} />
            <Legend />
            <Bar dataKey="duplicate_count" fill="#4285F4" barSize={40} name="Duplicate Count" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No duplicate unique identifiers data available.</p>
      )}
    </div>
  );
};

export default UniqueIdentifiers;
