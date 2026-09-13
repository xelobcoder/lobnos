import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { currencyFormatter, customFetch } from "../../../Auth/customFetch";
import { RiHandCoinLine, RiCheckboxCircleLine, RiAlarmWarningLine, RiBankCardLine } from '@remixicon/react';

type PaymentMode = {
	KeyID: string;
	PaymentMode: string;
};

type refundInformation = {
	refundableAmount: number;
	message: string;
};

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
		name?: string;
		cost: number;
		amountIncurredDueTax: number;
		discount: number;
		serviceid: number;
		totalcost: number;
		billingid: number;
	};
	cashIssuedOut: boolean;
	setRefundableAmount: (value: number) => {};
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
		setSelectedPaymentMode(e.target.value || null);
	};

	const handleRefundAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = parseFloat(e.target.value);
		setRefundAmount(isNaN(val) ? 0 : val);
	};

	useEffect(() => {
		if (show && serviceid && billingid) {
			setLoading(true);
			customFetch(`billing/previous/refund/update/verification/cashout?billingid=${billingid}&&serviceid=${serviceid}`)
				.then((response) => {
					const { refundableAmount, message } = response || {};
					let _refundableAmount = parseFloat(refundableAmount || 0);
					if (isNaN(_refundableAmount)) _refundableAmount = 0;
					setRefundInformation({ refundableAmount: _refundableAmount, message: message || '' });
					setRefundableAmount(_refundableAmount);
					if (!refundAmount || refundAmount <= 0) {
						setRefundAmount(_refundableAmount);
					}
					_refundableAmount > 0 ? setIsDisabled(false) : setIsDisabled(true);
					setLoading(false);
				})
				.catch((error) => {
					console.log(error);
					setLoading(false);
				});
		}
	}, [show, billingid, serviceid]);

	return (
		<Modal show={show} backdrop='static' onHide={onClose} animation={false} size="lg" className="topSheetDialog">
			<Modal.Header closeButton className="border-bottom pb-2">
				<Modal.Title className="d-flex align-items-center gap-2 text-primary fw-semibold fs-5">
					<RiHandCoinLine size={24} /> Refund Cash-Out & Disbursement
				</Modal.Title>
			</Modal.Header>

			{loading ? (
				<Modal.Body className="py-5 text-center">
					<Spinner animation="border" variant="primary" className="mb-2" />
					<p className="text-muted text-sm mb-0">Verifying refundable balance from system...</p>
				</Modal.Body>
			) : (
				<Modal.Body className="p-4">
					{/* Service Summary Card */}
					<div className="card border-0 bg-light-subtle rounded-3 p-3 mb-3 border-start border-4 border-primary shadow-sm">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<div className="text-muted text-xs fw-medium text-uppercase mb-1">Approved Service Item</div>
								<h6 className="fw-bold mb-1 text-dark">{item.name || 'Billed Service'}</h6>
								<div className="text-muted text-xs d-flex gap-3">
									<span>Service ID: <strong className="text-body">#{serviceid || '-'}</strong></span>
									<span>Billing ID: <strong className="text-body">#{billingid || '-'}</strong></span>
								</div>
							</div>
							<div className="text-end">
								<div className="text-muted text-xs fw-medium text-uppercase mb-1">Total Cost</div>
								<div className="fs-5 fw-bold text-primary">
									{currencyFormatter.format(Number(item.totalcost || item.cost) || 0)}
								</div>
							</div>
						</div>
					</div>

					{/* Alert if backend returns warning/error message */}
					{refundInformation.message && (
						<Alert variant="warning" className="d-flex align-items-center gap-2 mb-3 text-xs py-2 px-3">
							<RiAlarmWarningLine size={18} className="flex-shrink-0" />
							<div>{refundInformation.message}</div>
						</Alert>
					)}

					{isDisabled && !refundInformation.message && (
						<Alert variant="info" className="d-flex align-items-center gap-2 mb-3 text-xs py-2 px-3">
							<RiAlarmWarningLine size={18} className="flex-shrink-0" />
							<div>This service item has no remaining refundable balance available for cash out.</div>
						</Alert>
					)}

					{/* Max Refundable Box */}
					<div className="card border-0 bg-success-subtle p-3 rounded-3 mb-3">
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<div className="text-success-emphasis text-xs fw-semibold text-uppercase">Verified Refundable Balance</div>
								<small className="text-muted">Maximum amount eligible to be disbursed</small>
							</div>
							<div className="fs-4 fw-bold text-success">
								{currencyFormatter.format(refundInformation.refundableAmount)}
							</div>
						</div>
					</div>

					<div className="row g-3">
						{/* Payment Mode Selection */}
						<div className="col-md-12">
							<label htmlFor="selectedPaymentMode" className="form-label fw-medium text-xs text-uppercase mb-1">
								Disbursement Payment Method <span className="text-danger">*</span>
							</label>
							<div className="input-group">
								<span className="input-group-text bg-light text-muted">
									<RiBankCardLine size={18} />
								</span>
								<select
									id="selectedPaymentMode"
									className="form-select form-select-md"
									disabled={isDisabled || loading}
									value={selectedPaymentMode || ''}
									onChange={handlePaymentModeChange}
								>
									<option value="">-- Select Payment Mode --</option>
									{paymentModes.map((mode) => (
										<option key={mode.KeyID} value={mode.KeyID}>
											{mode.PaymentMode}
										</option>
									))}
								</select>
							</div>
						</div>

						{/* Refund Amount Input */}
						<div className="col-md-12">
							<label htmlFor="cashOutAmount" className="form-label fw-medium text-xs text-uppercase mb-1">
								Disbursement Cash-Out Amount <span className="text-danger">*</span>
							</label>
							<div className="input-group">
								<span className="input-group-text bg-light text-muted fw-bold"></span>
								<input
									id="cashOutAmount"
									className="form-control form-control-md"
									type="number"
									step="0.01"
									min="0"
									disabled={isDisabled || loading}
									placeholder="Enter disbursement amount"
									value={refundAmount || ''}
									onChange={handleRefundAmountChange}
								/>
								<Button
									variant="outline-secondary"
									size="sm"
									disabled={isDisabled || loading}
									onClick={() => setRefundAmount(refundInformation.refundableAmount)}
									className="px-3"
								>
									Fill Max Balance
								</Button>
							</div>
						</div>
					</div>
				</Modal.Body>
			)}

			<Modal.Footer className="border-top pt-2">
				<Button variant="light" className="px-4" onClick={onClose} disabled={cashIssuedOut}>
					Cancel
				</Button>
				<Button
					variant="success"
					className="px-4 fw-semibold d-flex align-items-center gap-1"
					onClick={onConfirm}
					disabled={cashIssuedOut || isDisabled || loading || !selectedPaymentMode || refundAmount <= 0}
				>
					{cashIssuedOut ? (
						<>
							<Spinner size="sm" className="me-1" /> Processing Cash-Out...
						</>
					) : (
						<>
							<RiCheckboxCircleLine size={18} /> Confirm & Issue Cash-Out
						</>
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}