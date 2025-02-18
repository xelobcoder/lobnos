import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import { plsEncryption } from '../../../lib/encryption';



export default function UserList({ users, handleDelete, activateUser, updateRefresh }) {
	const navigateTo = useRouter();

	const columns = [
		{
			Header: "username",
			accessor: "username",
			Cell: function ({ row, value }) {
				return (
					<div className='grid-100'>
						<span>{value}</span>
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
				)
			}
		},
		{
			Header: "email", accessor: "email"
		},
		{
			Header: "Role",
			accessor: "role",
		},
		{ Header: 'assigned Branch', accessor: 'branchname' },
		{
			Header: "permissions",
			Cell: function ({ row }) {
				const { original } = row;
				const { employeeid, username, role } = original;
				return (
					<div>
						<Link className='border-bottom border-2 border-dark'
							href={`/authentication/permissions?employeeid=${employeeid}&&username=${username}&&role=${role}`}>
							update permissions
						</Link>
						<br />
						<Link href={`/authentication/loginhistory/${plsEncryption(employeeid.toString())}`} className='border-bottom border-2 border-dark'>view login history</Link >
					</div>
				);
			},
		},
		{
			Header: "Action",
			Cell: function ({ row }) {
				const { original } = row;
				const { employeeid, activation } = original;
				return (
					<div>
						<button
							className='btn btn-info btn-sm text-capitalize'
							onClick={() => { navigateTo.push(`/authentication/register?employeeid=${employeeid}`) }}
						>
							edit
						</button >
						<button
							className='btn btn-sm btn-danger text-capitalize mx-1'
							onClick={() => handleDelete(employeeid)}
						>
							delete
						</button >
						<button
							className={`${activation === 1 ? "btn btn-danger" : "btn btn-success"} btn-sm text-capitalize`}
							onClick={() => activateUser(employeeid, activation, updateRefresh)}
						>
							{activation === 1 ? "deactivate" : "  activate"}
						</button >
					</div>
				);
			},
		},
	];



	return (
		<div>
			<PrimeTable column={columns} data={users} serverSideFiltering={true} filtering={false} handleSeverSideProcessing={null} />
		</div>
	)
}
