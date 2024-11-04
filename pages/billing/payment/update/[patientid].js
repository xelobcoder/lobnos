import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { customData, customFetch, customPost } from '../../../../components/Auth/customFetch';
import PreviewPatientInformation from '../../../../components/petientsComponent/PreviewPatientInformation';
import OutstandingBills from '../../../../components/petientsComponent/OutstandingBill';
import { ToastContainer, toast } from 'react-toastify';
import Loader from '../../../../components/accessories/Loader';
import FrontDeskLayout from '../../../../components/Layout/FrontDeskLayout';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

export default function BillingUpdateClientPaymentHistory() {
	const { patientid } = useRouter().query;
	const { user } = useApplicationSettings().applicationsettings;
	const employeeId = parseInt(user?.employeeid);

	const [paymentInfo, setPaymentInfo] = useState({ amount: 0, paymentMode: null }); // Change paymentMode to hold KeyID
	const [outstandingBills, setOutstandingBills] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [billingOptions, setBillingOptions] = useState([]);

	useEffect(() => {
		if (!patientid) return;

		const fetchBillingData = async () => {
			try {
				setIsLoading(true);
				await customData(`billing/client/bulk/outstanding?patientid=${parseInt(patientid)}`, setOutstandingBills);

				const { data } = await customFetch('paymentmodes');
				setBillingOptions(data || []);
			} catch (err) {
				toast.error('Something went wrong', { autoClose: 5000, position: 'top-center' });
			} finally {
				setIsLoading(false);
			}
		};

		fetchBillingData();
	}, [patientid]);

	const calculateTotalOutstanding = () =>
		outstandingBills.reduce((sum, bill) => sum + bill.outstanding, 0);

	const handlePaymentSubmission = async () => {
		const { amount, paymentMode } = paymentInfo;
		const amountpaid = parseFloat(amount);

		if (amountpaid <= 0 || amountpaid > calculateTotalOutstanding()) {
			return toast.warning('Amount must be greater than 0 and less than or equal to the outstanding bill', { autoClose: 2000, position: 'top-center' });
		}

		if (!paymentMode) {
			return toast.warning('Select a valid payment option', { autoClose: 2000, position: 'top-center' });
		}

		if (patientid && employeeId) {
			const response = await customPost('billing/client/clear/outstandingdebt', 'POST', {
				amountpaid,
				patientid,
				paymentmode: paymentMode,
				employeeid:employeeId,
			});

			const { statusCode, message, status } = response;

			if (statusCode == 200 && status == 'success') {
				toast.success(message);

				// await customData(`billing/client/bulk/outstanding?patientid=${patientid}`, setOutstandingBills);
			} else {
				toast.error(message);
			}
		}
	};

	const renderTransactionHistory = () => {
		if (isLoading) return <Loader />;

		const totalOutstanding = calculateTotalOutstanding();
		const isFreeSelected = paymentInfo.paymentMode === 4; // Check if paymentMode is "free" by KeyID

		return (
			<section className="mt-4">
				<h2 className="text-center pls-color header-content fw-bold bg-body-secondary p-2">
					Transaction History
				</h2>
				<div className="table-responsive">
					<table className="table ttable br-5">
						<thead className="fw-bold bg-secondary-subtle">
							<tr>
								<th>Date</th>
								<th>Billing ID</th>
								<th>Cost Incurred</th>
								<th>Amount Paid</th>
								<th>Discount</th>
								<th>Outstanding</th>
							</tr>
						</thead>
						<tbody>
							{outstandingBills.length === 0 ? (
								<tr>
									<td colSpan="6" className="text-center">No data available</td>
								</tr>
							) : (
								outstandingBills.map((bill, index) => (
									<tr key={index}>
										<td>{new Date(bill.date).toLocaleDateString()} {new Date(bill.date).toLocaleTimeString()}</td>
										<td>{bill.billingid}</td>
										<td>{bill.payable}</td>
										<td>{bill.paid}</td>
										<td>{bill.discount}</td>
										<td className={bill.outstanding > 0 ? 'text-danger' : 'text-primary'}>
											{bill.outstanding}
										</td>
									</tr>
								))
							)}
						</tbody>
						<tfoot>
							<tr>
								<td colSpan="5" className="text-end fw-bold">Total Outstanding:</td>
								<td>{totalOutstanding}</td>
							</tr>
							<tr>
								<td colSpan="5" className="text-end">Payment Amount:</td>
								<td>
									<input
										type="number"
										className="custom-input"
										placeholder="Enter payment amount"
										value={paymentInfo.amount}
										onChange={(e) => setPaymentInfo({ ...paymentInfo, amount: e.target.value })}
									/>
								</td>
							</tr>
							<tr>
								<td colSpan="5" className="text-end">Payment Mode:</td>
								<td>
									<select
										className="custom-input"
										value={paymentInfo.paymentMode || ''}
										onChange={(e) => setPaymentInfo({ ...paymentInfo, paymentMode: parseInt(e.target.value) })} // Store KeyID
									>
										<option value="">Select a payment option</option>
										{billingOptions.map((option, index) => (
											<option key={index} value={option.KeyID}>
												{option.PaymentMode}
											</option>
										))}
									</select>
								</td>
							</tr>
							<tr>
								<td colSpan="6" className="text-end">
									<button
										className="btn btn-primary btn-sm"
										onClick={handlePaymentSubmission}
										disabled={isFreeSelected && totalOutstanding > 0}
									>
										Update Payment
									</button>
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</section>
		);
	};

	return (
		<FrontDeskLayout>
			<ToastContainer position='top-center' className={'text-sm'} theme='colored' />
			<div className="d-lg-flex d-md-flex d-sm-block my-2">
				<div className='col-md-12 col-xl-7 col-sm-12 col-lg-7'>
					<PreviewPatientInformation patientid={patientid} />
				</div>
				<div className='col-md-12 col-xl-4 col-lg-4 col-sm-12 mx-lg-3 my-sm-2 br-0 my-lg-0 my-md-0 my-xl-0'>
					<OutstandingBills total={calculateTotalOutstanding()} />
				</div>
			</div>
			{renderTransactionHistory()}
		</FrontDeskLayout>
	);
}
