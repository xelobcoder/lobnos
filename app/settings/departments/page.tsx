"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { customPost, getDepartment } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import DepartmentList from '../../../components/settingsComponents/departmentList';
import Add_department from '../../../components/settingsComponents/department';


interface DepartmentItem {
	id: number;
	department: string;
	departmentManager: string;
	date?: string;
	employeeid?: number;
}

interface DepartmentResponse {
	statusCode: number;
	status: string;
	message: string;
	data: DepartmentItem[];
}

export default function Department() {
	const [key, setKey] = useState('department_list');
	const [department, setDepartments] = useState<DepartmentItem[]>([]);

	const router = useRouter();

	useEffect(() => {
		getDepartment(setDepartments)
	}, [])

	const handleDelete = (id: number) => {
		return new Promise<boolean>((resolve, reject) => {
			const deleteDepartment = async () => {
				try {
					let response = await customPost('departments', 'DELETE', { id });
					const { status, message } = response;
					if (status === 'success') {
						toast.success(message, { autoClose: 3000 });
						setDepartments(department.filter((item) => item.id !== id));
						resolve(true);
					} else {
						toast.error(message, { autoClose: 3000 });
						reject(new Error(message || 'Failed to delete department'));
					}
				} catch (error) {
					console.error('Error deleting department:', error);
					toast.error('An error occurred while deleting the department', { autoClose: 3000 });
					reject(error);
				}
			};

			let confirm = window.confirm('Are you sure you want to delete this department?');
			if (!confirm) {
				resolve(false);
				return;
			}

			deleteDepartment();
		});
	}

	const handleEdit = (details: DepartmentItem) => {
		const { department, departmentManager, employeeid, id } = details;
		setKey('add_department');
		router.push(`/settings/departments?tab=edit&&id=${id}&&employeeid=${employeeid}&&department=${department}&&departmentManager=${departmentManager}`)
	}

	return (
		<div>
			<Add_department />
			<div className='my-3'>
				<DepartmentList data={department} handleDelete={handleDelete} handleEdit={handleEdit} />
			</div>
		</div>
	);
}


