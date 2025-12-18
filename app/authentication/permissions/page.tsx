"use client";
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { customerRepresentative, scientistPermission, phelobotomy, administrator, managerPermission, sonographerPermission } from '../../../components/Auth/Roles/permissions';
import { LabPermissions } from '../../../types/permissions';
import Loader from '../../../components/accessories/Loader';
import PagesAccessView from '../../../components/Auth/Roles/PagesAccessView';
import { toast } from 'react-toastify';
export default function PermissionsOfUsers() {
	const userid = useSearchParams()?.get("employeeid");
	const username = useSearchParams()?.get("username");
	const role = useSearchParams()?.get("role");
	const [clientPermissions, setClientPermissions] = useState<LabPermissions | null>(null);
	const [previous, setPrevious] = useState(false);
	const [isloading, setLoading] = useState(true);


	const updateUserInfo = useCallback(() => {
		if (role == 'phelobotomist') {
			setClientPermissions(phelobotomy)
		} else if (role == 'customer service representative') {
			setClientPermissions(customerRepresentative)
		} else if (role == 'labscientist') {
			setClientPermissions(scientistPermission)
		} else if (role == 'sonographer') {
			setClientPermissions(sonographerPermission)
		} else if (role == 'manager') {
			setClientPermissions(managerPermission)
		} else {
			setClientPermissions(administrator)
		}
	}, [role]);

	// get user permission data
	const getUserPermissions = useCallback(async function () {
		try {
			if (userid) {
				setLoading(true);
				const response = await customFetch(`user/permissions?permissions=${userid}`);
				const { permissions } = response;
				const keysPresent = Object.keys(permissions);
				if (keysPresent.length === 0) {
					updateUserInfo();
				} else {
					setClientPermissions(permissions);
				}
				setPrevious(true);
				setLoading(false);
			}
		} catch (err) {
			updateUserInfo();
			setLoading(false);
		}
	}, [userid, updateUserInfo])


	useEffect(() => {
		getUserPermissions();
	}, [getUserPermissions])




	// handle checkbox Changes 

	const handleChange = (ev, target, setTarget) => {
		const { name, checked } = ev.target;

		// Handle nested permissions (e.g., "patientManagement.registerPatient")
		if (name.includes('.')) {
			const [group, permission] = name.split('.');
			setTarget({
				...target,
				[group]: {
					...target[group],
					[permission]: checked
				}
			});
		} else {
			// Handle flat permissions (backward compatibility)
			setTarget({ ...target, [name]: checked });
		}
	}

	const handlePageAccess = (ev, target, setTarget) => {
		const { name, checked } = ev.target;
		setTarget({
			...target, pageAccess: {
				...target.pageAccess,
				[name]: checked
			}
		});
	}


	const handleSubmitPermission = async (ev, target) => {
		ev.preventDefault();
		try {
			if (userid) {
				const response = await customPost(`user/permissions?id=${parseInt(userid)}`, 'PUT', target);
				if (response.statusCode === 200) {
					toast.success(response.message)
				}
			}
		} catch (err) {
			alert(err.message)
		}
	}



	if (isloading) return <Loader />

	if (!clientPermissions) return <div>No permissions data available</div>



	return (
		<div>
			<div className='p-4'>
				<h4>
					Permissions of {username} with role of a/an <span className='text-capitalize'>{role}</span>
				</h4>
			</div>
			<hr/>
			<div>
				<div
					className="bg-opacity-50 mx-2 p-2"
					style={{ fontSize: "14px" }}>
					Default permissions are <strong>based on the role</strong>,
					however changes can be made to suit administrative purposes
				</div>
				<hr />
				<PagesAccessView
					data={clientPermissions}
					changeEvent={setClientPermissions}
					handler={handleChange}
					target={clientPermissions}
					pageAcesshandler={handlePageAccess}
					role={role ?? 'administrator'}
				/>
				<hr />
				<div className='mx-4'>
					<button className='btn btn-success btn-sm mt-2'
						onClick={(ev) => handleSubmitPermission(ev, clientPermissions)}>
						update permissions
					</button>
				</div>
			</div>
		</div>
	);
}