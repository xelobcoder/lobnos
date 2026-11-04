import { useRouter } from 'next/navigation';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { plsEncryption } from '../../../lib/encryption';
import { buildLoginQueryServerSide } from '../../serverActions/ActionFiltering';
import { Dropdown, ButtonGroup } from 'react-bootstrap';
import {
	RiMoreFill,
	RiUser3Line,
	RiPencilLine,
	RiDeleteBinLine,
	RiToggleLine,
	RiShieldKeyholeLine,
	RiHistoryLine,
	RiCalendarEventLine
} from '@remixicon/react';


interface StaffUser {employeeid: number; username: string; login_username?: string; activation: number; email?: string; role: string; branchname?: string}
export default function UserList({ users, handleDelete, activateUser, updateRefresh, filters, setCurrentUsers }: {users: StaffUser[]; handleDelete: (id: number) => void; activateUser: (id: number, activation: number, setUsers: React.Dispatch<React.SetStateAction<StaffUser[]>>) => void; updateRefresh?: () => void; filters: object; setCurrentUsers: React.Dispatch<React.SetStateAction<StaffUser[]>>}) {
	const navigateTo = useRouter();

	const columns = [
		{
			Header: "Icon",
			accessor: "",
			Cell: function ({ row }: {row: {original: StaffUser}}) {
				return (
					<span className="bg-primary rounded-circle p-2">
						<RiUser3Line className="text-white fs-5" />
					</span>
				);
			},
			width: 80,
		},
		{
			Header: "Username(Employee ID)",
			accessor: "username",
			Cell: function ({ row, value }: {row: {original: StaffUser}; value: string}) {
				return (
					<div className='grid-100'>
						<span className='text-capitalize'>{value}</span>
						{row.original.activation === 1 ? (
							<div className="text-success">
								{">>"} ( active)({row.original.employeeid})
							</div>
						) : (
							<div className="text-danger">
								{">>"} (inactive)({row.original.employeeid})
							</div>
						)}
					</div>
				);
			}
		},
		{
			Header: "Login Username",
			accessor: "loginUsername",
			Cell: function ({ row, value }: {row: {original: StaffUser}; value: string}) {
				return <span className="fw-semibold">{value || row.original.login_username || 'Not generated'}</span>;
			}
		},
		{ Header: "Email", accessor: "email" },
		{ Header: "Role", accessor: "role" },
		{ Header: 'Assigned Branch', accessor: 'branchname' },
		{
			Header: "Action",
			Cell: function ({ row }: {row: {original: StaffUser}}) {
				const { original } = row;
				const { employeeid, username, role, activation } = original;
				return (
					<Dropdown as={ButtonGroup}>
						<Dropdown.Toggle variant="link" size="sm">
							<RiMoreFill style={{ fontSize: '1.25rem', color: '#6c757d' }} />
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item className='pls-color border-bottom-1' onClick={() => navigateTo.push(`/authentication/register?employeeid=${employeeid}`)}>
								<div className="d-flex align-items-center gap-2">
									<RiPencilLine className="fs-5" />
									Edit
								</div>
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' onClick={() => handleDelete(employeeid)}>
								<div className="d-flex align-items-center gap-2">
									<RiDeleteBinLine className="fs-5" />
									Delete
								</div>
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' onClick={() => {
								activateUser(employeeid, activation, setCurrentUsers)
								window.location.reload()
							}}>
								<div className="d-flex align-items-center gap-2">
									<RiToggleLine className="fs-5" />
									{activation === 1 ? "Deactivate" : "Activate"}
								</div>
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' href={`/authentication/permissions?employeeid=${employeeid}&&username=${username}&&role=${role}`}>
								<div className="d-flex align-items-center gap-2">
									<RiShieldKeyholeLine className="fs-5" />
									Update Permissions
								</div>
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' href={`/authentication/loginhistory/${plsEncryption(employeeid.toString())}`}>
								<div className="d-flex align-items-center gap-2">
									<RiHistoryLine className="fs-5" />
									View Login History
								</div>
							</Dropdown.Item>
							<Dropdown.Item className='pls-color border-bottom-1' href={`/appointments/attendance/preference-shift/${plsEncryption(employeeid.toString())}`}>
								<div className="d-flex align-items-center gap-2">
									<RiCalendarEventLine className="fs-5" />
									View/create Preferred Shifts
								</div>
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