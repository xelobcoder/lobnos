import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Button } from '@mui/material'
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import { customData } from '../../../../components/Auth/customFetch'
import { DeleteForever } from '@mui/icons-material';
import TableDisplay from '../../../../components/accessories/TableDisplay'
import InventoryClass from '../../../../components/Auth/inventory'
import { ProgressBar } from 'react-bootstrap'
import Loader from '../../../../components/accessories/Loader'
import DepartmentInventoryLayout from '../../../../components/inventory/departments/DepartmentInventoryLayout';
export default function ReceiveStocksDepartmentLevel() {
	const departmentId = useRouter().query.id;
	const [stocks, setStocks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [btndisabled, setBtnDisabled] = useState(null);
	const inventory = new InventoryClass();

	const columns = [
		{
			Header: 'Date Requested',
			accessor: 'date',
			Cell: ({ row }) => <div>{row.original.date.slice(0, 10)}</div>,
		},
		{
			Header: 'Name',
			accessor: 'name',
		},
		{
			Header: 'Unit',
			accessor: 'comsumptionunit',
		},
		{
			Header: 'Qty Requested',
			accessor: 'quantity_requested',
		},
		{
			Header: 'brand',
			accessor: 'brand'
		},
		{ Header: 'lot number', accessor: 'batchnumber' },
		{
			Header: 'Status',
			accessor: 'status',
			Cell: ({ row }) => (
				<div>
					<ProgressBar variant={'success'} title='almost done.90% through' now={90} />
				</div>
			),
		},
		{
			Header: 'Qty Approved',
			accessor: 'quantity_approved',
			Cell: ({ row }) => (
				<>
					{row.original.quantity_approved == null ? (
						<div className='-lims-text-color'>Not yet</div>
					) : (
						row.original.quantity_approved
					)}
				</>
			),
		},
		{
			Header: 'Supplied Qty',
			accessor: 'quantityReceived',
			Cell: ({ row }) => (
				<>
					{
						row.original.status === 'approved' &&
						<input type='number' className='custom-input'
							onChange={(e) => inventory.handleReceiveField(e, row.original.id, stocks)}
							placeholder='Enter quantity supplied' />
					}
				</>
			),
		},
		{
			Header: 'Action',
			accessor: 'action',
			Cell: ({ row }) => (
				<>
					{
						row.original.status === 'received' ? null : (

							row.original.quantity_approved == null ? (
								<Button variant='contained' color='error' size='small' startIcon={<DeleteForever />}>
									Delete
								</Button>
							) : (
								<div>
									<Button variant='contained' color='success'
										disabled={btndisabled === row.original.id}
										onClick={(e) => inventory.handleReceivedButton(e, row.original.id, departmentId, setStocks, stocks, setBtnDisabled)}
										size='small' startIcon={<CallReceivedIcon />}>
										Received
									</Button>
								</div>
							)

						)
					}
				</>
			),
		},
	];

	const getReceivingStocks = useCallback(async () => {
		try {
			setLoading(true);
			customData(`departments/requisitions?id=${departmentId}&&type=receiving`, setStocks); setLoading(false);
		}
		catch (err) {
			setLoading(false);
			setStocks([]);
		}
	}, [departmentId])

	useEffect(() => { if (departmentId) { getReceivingStocks(); } }, [departmentId, getReceivingStocks]);


	const renderer = () => {
		if (loading) return <Loader />
		else return <TableDisplay data={stocks} column={columns} />
	}


	return (
		<DepartmentInventoryLayout>
			<h4>Stocks awaiting department validation</h4>
			{renderer()}
		</DepartmentInventoryLayout>
	)
}
