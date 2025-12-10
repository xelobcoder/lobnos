import React, { useEffect, useState } from "react";
import { Alert, Button, ListGroup, Modal, Spinner } from "react-bootstrap";
import { currencyFormatter, customFetch } from "../../../Auth/customFetch";

type PaymentMode = {
	KeyID: string;
	PaymentMode: string;
};


type refundInformation = {
	refundableAmount: number;
	message: string;
}

type ModalComponentProps = {
	show: boolean;
	onClose: () => void;
	onConfirm: () => void;
	refundAmount: number;
	setRefundAmount: (amount: number) => void;
	paymentModes: PaymentMode[];
	selectedPaymentMode: string | null;
	setSelectedPaymentMode: (mode: string | null) => void;
	item: {
		cost: number;
		amountIncurredDueTax: number;
		discount: number;
		serviceid: number;
		totalcost: number;
		billingid: number;
	};
	cashIssuedOut: boolean;
	setRefundableAmount: (value: number) => {}
};

export default function RefundServiceShowDetailModal({
	show,
	onClose,
	onConfirm,
	refundAmount,
	setRefundAmount,
	setRefundableAmount,
	paymentModes,
	selectedPaymentMode,
	setSelectedPaymentMode,
	item,
	cashIssuedOut
}: ModalComponentProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [refundInformation, setRefundInformation] = useState<refundInformation>({ refundableAmount: 0, message: '' });
	const [isDisabled, setIsDisabled] = useState<boolean>(true);
	const { serviceid, billingid } = item;

	const handlePaymentModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedPaymentMode(e.target.value);
	};

	const handleRefundAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRefundAmount(parseFloat(e.target.value));
	};


	useEffect(() => {
		if (serviceid && billingid) {
			setLoading(true);
			customFetch(`billing/previous/refund/update/verification/cashout?billingid=${billingid}&&serviceid=${serviceid}`).then((response) => {
				const { refundableAmount, message } = response;
				let _refundableAmount = parseFloat(refundableAmount);
				setRefundInformation({ refundableAmount: _refundableAmount, message });
				setRefundableAmount(_refundableAmount);
				_refundableAmount > 0 ? setIsDisabled(false) : setIsDisabled(true);
				setLoading(false);
			}).catch((error) => {
				console.log(error);
				setLoading(false);
			});
		}
	}, [billingid, serviceid]);





	return (
		<Modal show={show} backdrop='static' onHide={onClose}>
			<Modal.Header className="bg-secondary-subtle" closeButton>
				<Modal.Title>Refund Cash-out</Modal.Title>
			</Modal.Header>
			{
				loading ?
					<div>loading .............</div>
					:
					<Modal.Body>
						<ListGroup className="pls-color">
							{/* <ListGroup.Item className="bg-body-tertiary">
								Amount Incurred Due To Taxes: {currencyFormatter.format(item.amountIncurredDueTax)}
							</ListGroup.Item>
							<ListGroup.Item className="bg-body-tertiary">
								Discount: {currencyFormatter.format(item.discount)}
							</ListGroup.Item> */}
						</ListGroup>
						{refundInformation.message && <Alert dismissible variant="danger" className=" my-2 pls-color ">{refundInformation.message}</Alert>}
						<div className="my-2 br-5 border border-1 py-2 px-3">Amount to Refund: {currencyFormatter.format(refundInformation.refundableAmount)}</div>
						<select
							className="form-select form-select-sm my-2"
							disabled={isDisabled || loading}
							value={selectedPaymentMode || ''}
							onChange={handlePaymentModeChange}
						>
							<option value="">Select Refund Mode Here</option>
							{paymentModes.map((mode) => (
								<option key={mode.KeyID} value={mode.KeyID}>
									{mode.PaymentMode}
								</option>
							))}
						</select>
						<input
							className="form-control form-control-sm my-2"
							type="number"
							disabled={isDisabled || loading}
							placeholder="Amount Refunded"
							value={ refundAmount }
							onChange={handleRefundAmountChange}
						/>
					</Modal.Body>
			}
			<Modal.Footer>
				<Button variant="outline-danger" size="sm" className="btn" onClick={onClose}>
					Close
				</Button>
				<Button variant="outline-primary" size="sm" className="btn" onClick={onConfirm} disabled={cashIssuedOut || isDisabled || loading}>
					{cashIssuedOut && <Spinner size="sm" />} Confirm Refund
				</Button>
			</Modal.Footer>
		</Modal>
	);
}