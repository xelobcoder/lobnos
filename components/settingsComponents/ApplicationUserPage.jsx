"use client"
import { useState } from 'react'
import UserList from '../Auth/Roles/userList'
import { activateInstitutionUser, customPost, updatePagination } from '../Auth/customFetch'
import { RiTeamLine, RiUserAddLine } from '@remixicon/react'
import { useRouter } from 'next/navigation';



export default function ApplicationUsersPage({ users }) {
	const [currentUsers,setCurrentUsers] = useState(users||[])
	const [advanced, setAdvanced] = useState(false);
	const [filters, setFiltering] = useState({ name: '', role: '', email: "", contact: '' });
	const router = useRouter();

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
				router.refresh();
			}
		}
	}






	return (
		<div className='container-fluid'>
			<div className='d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3'>
				<div className='d-flex align-items-center gap-3'>
					<RiTeamLine className="text-primary" size={24} />
					<h2 className='h4 mb-0 text-primary'>Employee Management</h2>
				</div>

				<div className='d-flex gap-3'>
					<button
						className='btn btn-primary btn-sm d-flex align-items-center gap-2'
						onClick={() => router.push('/authentication/register')}
					>
						<RiUserAddLine size={18} />
						Add New Employee
					</button>
				</div>
			</div>

			<UserList
				users={currentUsers}
				handleDelete={handleDelete}
				activateUser={activateInstitutionUser}
				setCurrentUsers
				updatePage={updatePage}
				filters={filters}
				showfiltering={advanced} />
		</div>
	)
}


