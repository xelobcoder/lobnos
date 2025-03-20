"use client"
import { useState } from 'react'
import UserList from '../Auth/Roles/userList'
import { activateInstitutionUser, getInstitutionUsers, customPost, updatePagination, handleChangeWithState } from '../Auth/customFetch'



export default function ApplicationUsersPage({ users }) {
	const [advanced, setAdvanced] = useState(false);
	const [filters, setFiltering] = useState({ name: '', role: '', email: "", contact: '' });

	const updatePage = (value) => {
		if (value === pagequery.page) return;
		updatePagination(value, setPageQuery, pagequery)
	}


	const handleDelete = async (id) => {
		const confirm = window.confirm('Are you sure you want to delete this user?');
		if (confirm) {
			const response = await customPost(`logins`, 'DELETE', { id });
			const { statusCode, message, result } = response;
			if (statusCode === 200) {
				alert(message);
			}
		}
	}



	const updateFilering = (ev) => {
		const { name } = ev.target;
		handleChangeWithState(ev, name, setFiltering, filters);
	}


	const initFilteringUsers = (ev) => {
		ev.preventDefault();
		const { name, email, role, contact } = filters;
		if (Object.values(filters).some((item, index) => { return item.toString().length > 0 })) {
			let endpoint = `logins?count=${pagequery.count}&&page=${pagequery.page}&&name=${name}&&email=${email}&&role=${role}&&contact=${contact}`;
			getInstitutionUsers(setUser, endpoint, setLoading);
		}
	}



	return (
		<div className='container-fluid'>
			<div className='d-flex justify-content-between pls-label'>
				<h4 className=' bg-secondary-subtle p-2 br-5 pls-label'>Employee List</h4>
			</div>

			<UserList
				users={users}
				handleDelete={handleDelete}
				activateUser={activateInstitutionUser}
				updatePage={updatePage}
				filters={filters}
				showfiltering={advanced} />
		</div>
	)
}


