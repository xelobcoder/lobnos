import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import TableDisplay from '../../../accessories/TableDisplay';
import DebitableBrandBatch from './_DebitableTable';
import CardRacks from '../../../accessories/CardRack';
import { inventorySettings } from '../../Util';

interface DispatchStockAccordionListProps {
	data: any[];
	departmentid: number;
	invsettings: any;
	passToast: (message: string, type: 'success' | 'error') => void;
	removeItem: (id: number) => void;
}

export default function DispatchStockAccordionList({
	data,
	departmentid,
	invsettings,
	passToast,
	removeItem,
}: DispatchStockAccordionListProps) {
	const [autoDeduct, setAutdeduct] = useState<boolean>(invsettings.stocksAutoDeduct || true);
	const [showModal, setShowModal] = useState(false);
	const [loadDebitable, setLoadDebitable] = useState(false);
	const [selectedData, setSelectedData] = useState<any>(null);
	const [manuallyLogging, setManuallyLogging] = useState(false);


	const handleRowClick = (rowData: any) => {
		setSelectedData(rowData);
		setLoadDebitable(true);
		setShowModal(true);
		setAutdeduct(inventorySettings.stocksAutoDeduct)
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setLoadDebitable(false);
	};

	const handleSwitchChange = (ev) => {
		setManuallyLogging(!manuallyLogging);
		setAutdeduct(ev.target.checked)
	};

	const columns = [
		{
			Header: 'Department',
			accessor: 'name',
			isMenu: true,
		},
		{
			Header: 'Date',
			accessor: 'date',
			Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
		},
		{
			Header: 'Total Store Qty',
			accessor: 'quantity',
		},
		{
			Header: 'Req. Qty',
			accessor: 'quantity_requested',
		},
		{
			Header: 'App. Qty',
			accessor: 'quantity_approved',
		},
		{
			Header: 'Status',
			accessor: 'status',
			Cell: ({ value }: { value: string }) => <span className="btn btn-success btn-sm">{value}</span>,
		},
		{
			Header: 'Actions',
			accessor: 'actions',
			Cell: ({ row }: { row: any }) => (
				<Button variant="primary" className="btn btn-sm" onClick={() => handleRowClick(row.original)}>
					View Debitable
				</Button>
			),
		},
	];

	return (
		<>
			<TableDisplay column={columns} data={data} handleSeverSideProcessing={null} filtering={false} />

			<Modal show={showModal} onHide={handleCloseModal} size="xl" style={{ zIndex: 9999 }}>
				<Modal.Header className="bg-secondary-subtle" closeButton>
					<Modal.Title>Debitable Brand Batch</Modal.Title>
				</Modal.Header>
				<Modal.Body className="bg-white text-sm">
					<div className="my-4 d-flex justify-content-between">
						<div className="col-3">
							<CardRacks
								header={<h6>Amount Approved</h6>}
								body={<h1>{selectedData?.quantity_approved}</h1>}
							/>
						</div>
						<div>
							<Form.Switch
								style={{ height: '30px' }}
								checked={manuallyLogging}
								onChange={(ev) => { handleSwitchChange(ev) }}
								label={manuallyLogging ? 'Manually log quantity' : 'Auto-select quantity'}
							/>
						</div>
					</div>

					<DebitableBrandBatch
						departmentid={departmentid}
						autodeduct={autoDeduct}
						selectedData={selectedData}
						stockid={selectedData?.stockid}
						data={selectedData}
						disabled={false}
						getDebitable={loadDebitable}
						manuallyLogging={manuallyLogging}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button className="btn btn-sm" variant="danger" onClick={handleCloseModal}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
