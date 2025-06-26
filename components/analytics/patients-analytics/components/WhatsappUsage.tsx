"use client";

import React, { useState, useEffect } from 'react';
import { customFetch } from '../../../Auth/customFetch';

interface WhatsAppUsageData {
	whatsapp_users: number;
}

const WhatsAppUsage: React.FC = () => {
	const [data, setData] = useState<WhatsAppUsageData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchWhatsAppUsage = async () => {
			try {
				const result = await customFetch('patient-analytics/whatsapp-usage');
				if (Array.isArray(result) && result.length > 0) {
					setData(result[0]);
				} else if (result && typeof result === 'object' && 'whatsapp_users' in result) {
					setData(result);
				} else {
					setError('Unexpected data format received.');
				}
			} catch (err) {
				console.error(err);
				setError('Error fetching WhatsApp usage data');
			} finally {
				setLoading(false);
			}
		};
		fetchWhatsAppUsage();
	}, []);

	if (loading) {
		return <div>Loading WhatsApp usage data...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div className="pls-color my-2 col-5  br-5 p-3">

			{data ? (
				<div className='list-group'>
					<div className='list-group-item bg-secondary-subtle '>WhatsApp Usage</div>
					<div className='list-group-item'>Total WhatsApp Users: <strong>{data.whatsapp_users}</strong></div>
				</div>
			) : (
				<p>No WhatsApp usage data available.</p>
			)}
		</div>
	);
};

export default WhatsAppUsage;
