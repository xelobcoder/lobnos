import React from 'react';
import ApplicationUsersPage from '../../../components/settingsComponents/ApplicationUserPage';
import { customFetch } from '../../../components/Auth/customFetch';

export default async function Page() {
	let result: any[] = [];
	let errorMessage: string | null = null;
	const query = { count: 10, page: 1, name: '', role: '', email: "", contact: '',sortby:'DESC' };

	const queryParams = new URLSearchParams({
		count: String(query.count),
		page: String(query.page),
		name: query.name,
		sortby: query.sortby || 'DESC',
		email: query.email,
		role: query.role,
		contact: query.contact,
	});

	try {
		const response = await customFetch(`logins?${queryParams.toString()}`);
		if (response?.result && Array.isArray(response?.result)) {
			result = response.result;
		}
	} catch (error) {
		errorMessage = 'Failed to fetch data. Please try again later.';
		return errorMessage && (
			<div className="alert alert-danger" role="alert">
				{errorMessage}
			</div>
		)
	}

	return (
		<ApplicationUsersPage users={result} />
	);
}