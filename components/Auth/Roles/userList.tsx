import { useRouter } from 'next/navigation';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { plsEncryption } from '../../../lib/encryption';
import { buildLoginQueryServerSide } from '../../serverActions/ActionFiltering';
import { Dropdown, ButtonGroup } from 'react-bootstrap';
import { MoreVertOutlined } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar'; 

export default function UserList({ users, handleDelete, activateUser, updateRefresh, filters }) {
	const navigateTo = useRouter();

	const columns = [
		{
			Header: "Icon",
			accessor: "", 
			Cell: function ({ row}) {
				const initials = row.original.username
					.split(' ')
					.map((name) => name[0])
					.join('')
					.toUpperCase();

				return (
					<Avatar sx={{ bgcolor: '#3f51b5',padding:'30px' }}> 
						{initials} 
					</Avatar>
				);
			},
			width: 80, 
		},
		{
			Header: "Username",
			accessor: "username",
			Cell: function ({ row, value }) {
				return (
					<div className='grid-100'>
						<span className='text-capitalize'>{value}</span>
						{row.original.activation === 1 ? (
							<div className="text-success">
								{">>"} ( active)
							</div>
						) : (
							<div className="text-danger">
								{">>"} (inactive)
							</div>
						)}
					</div>
				);
			}
		},
		{ Header: "Email", accessor: "email" },
		{ Header: "Role", accessor: "role" },
		{ Header: 'Assigned Branch', accessor: 'branchname' },
		{
			Header: "Action",
			Cell: function ({ row }) {
				const { original } = row;
				const { employeeid, username, role, activation } = original;
				return (
					<Dropdown as={ButtonGroup}>
						<Dropdown.Toggle variant="link" size="sm">
							<MoreVertOutlined fontSize="small" />
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item className='pls-color border-bottom-1' onClick={() => navigateTo.push(`/authentication/register?employeeid=${employeeid}`)}>
								Edit
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' onClick={() => handleDelete(employeeid)}>
								Delete
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' onClick={() => activateUser(employeeid, activation, updateRefresh)}>
								{activation === 1 ? "Deactivate" : "Activate"}
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' href={`/authentication/permissions?employeeid=${employeeid}&&username=${username}&&role=${role}`}>
								Update Permissions
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' href={`/authentication/loginhistory/${plsEncryption(employeeid.toString())}`}>
								View Login History
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' href={`/appointments/attendance/preference-shift/${plsEncryption(employeeid.toString())}`}>
								View/create Preferred Shifts
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				);
			},
		},
	];

	return (
		<div>
			<PrimeTable column={columns} data={users}
				serverSideFiltering={true}
				urlparams={filters}
				filtering={false} handleSeverSideProcessing={buildLoginQueryServerSide} />
		</div>
	);
}