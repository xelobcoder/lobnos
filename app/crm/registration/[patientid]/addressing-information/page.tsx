"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Addressing from '../../../../../components/registration/Addressing';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { registrationFields } from '../../../../../components/registration/fields/Util';
import { toast } from 'react-toastify';

export default function PageAddressingInformation() {
	const { patientid } = useParams();
	const id = patientid ? Number(patientid) : undefined;
	const [defaultData, setDefaultData] = useState<any>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) {
			setLoading(false);
			return;
		}

		const fetchData = async () => {
			try {
				const response = await customFetch(`register/addressinginformation?patientid=${id}`);
				if (response && Number(response.statusCode) === 200 && response.status === "success" && response.result && Object.keys(response.result).length > 0) {
					setDefaultData(response.result || {});
				} else {
					console.error('Failed to load addressing information', response);
					setDefaultData({});
				}
			} catch (error) {
				console.error('Failed to load addressing information', error);
				setDefaultData({});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return <div className="container-fluid px-4 py-3">Loading address information...</div>;
	}

	if (!id) {
		return <div className="container-fluid px-4 py-3">No patient selected.</div>;
	}

	return (
		<div className="container-fluid px-4 py-3 border br-5 border-opacity-10 bg-white">
			<Addressing
				toast={toast}
				patientid={id}
				defaultData={defaultData}
				fields={registrationFields.addressingInformation}
			/>
		</div>
	);
}
