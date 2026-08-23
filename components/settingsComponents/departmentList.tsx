import { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { RiEditLine, RiDeleteBinLine } from '@remixicon/react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import dayjs from 'dayjs';


interface DepartmentItem {
	id: number;
	department: string;
	departmentManager: string;
	date?: string;
	employeeid?: number;
}

interface DepartmentListProps {
	data: DepartmentItem[];
	handleDelete: (id: number) => Promise<boolean>;
	handleEdit: (department: DepartmentItem) => void;
}

export default function DepartmentList({ data, handleDelete, handleEdit }: DepartmentListProps) {
	const [deletingId, setDeletingId] = useState<number | null>(null);

	const handleDeleteWithFeedback = (id: number) => {
		setDeletingId(id);
		try {
			handleDelete(id)
				.catch(error => {
					console.error('Error during department deletion:', error);
				})
				.finally(() => {
					setDeletingId(null);
				});
		} catch (error) {
			console.error('Unexpected error initiating delete operation:', error);
			setDeletingId(null);
		}
	};

	const columns = [
		{
			Header: 'Department',
			accessor: 'department',
			Cell: ({ value }: { value: string }) => <span className="fw-semibold">{value}</span>,
		},
		{
			Header: 'Department Manager',
			accessor: 'departmentManager',
			Cell: ({ value }: { value?: string }) => value || 'Not Assigned',
		},
		{
			Header: 'Created Date',
			accessor: 'date',
			Cell: ({ value }: { value?: string }) => {
				return value ? dayjs(value).format('YYYY-MM-DD HH:mm') : 'N/A';
			}
		},
		{
			Header: 'Actions',
			id: 'actions',
			disableSortBy: true,
			Cell: ({ row }: { row: { original: DepartmentItem } }) => (
				<div className="d-flex gap-2">
					<Button
						variant="outline-primary"
						size="sm"
						className="d-flex align-items-center"
						onClick={() => handleEdit(row.original)}
					>
						<RiEditLine size={16} className="me-1" /> Edit
					</Button>
					<Button
						variant="outline-danger"
						size="sm"
						className="d-flex align-items-center"
						onClick={() => handleDeleteWithFeedback(row.original.id)}
						disabled={deletingId === row.original.id}
					>
						{deletingId === row.original.id ? (
							<>
								<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
								<span>Deleting...</span>
							</>
						) : (
							<>
								<RiDeleteBinLine size={16} className="me-1" /> Delete
							</>
						)}
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="table-responsive">
			<PrimeTable
				data={data || []}
				serverSideFiltering={false}
				handleSeverSideProcessing={() => { }}
				column={columns}
				filtering={true}
			/>
		</div>
	);
}
