"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import Loader from "../../../accessories/Loader";
import { customFetch, customPost } from "../../../../Lib/fetcher";
import { toast } from "react-toastify";
import NoDataAvailable from "../../../accessories/NoDataAvailable";
import { useApplication } from "../../../application/ApplicationContextProvider";

interface Brand {
	brand: string;
	batchnumber: string;
	storeQty: number;
	availableQty?: number;
	currentQty?: number;
	quantity: number;
	served: number;
	deficit?: number;
}

interface DebitableBrandBatchProps {
	data: {
		quantity_approved: string;
	};
	autodeduct: boolean;
	disabled: boolean;
	getDebitable: boolean;
	departmentid: number;
	manuallyLogging: boolean;
	stockid: string;
	selectedData: any;
}

export default function DebitableBrandBatch({
	data,
	autodeduct,
	disabled,
	getDebitable,
	departmentid,
	selectedData,
	manuallyLogging,
	stockid,
}: DebitableBrandBatchProps) {
	const [brands, setBrands] = useState<Brand[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [deficit, setDeficit] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const EMPLOYEEID = useApplication().employeeid;
	
	const stocksServed = async (t: any[]) => {
		if (Array.isArray(t) && t.length > 0) {
			const resource = {
				data: t,
				approvedQty: selectedData?.quantity_approved,
				requisitionid: selectedData?.id,
				departmentid,
				employeeid: EMPLOYEEID
			};
			const endpoint = `store/departments/requisitions/serve`;
			const pushResponse = await customPost(endpoint, 'POST', resource);
			const { status, message } = pushResponse;
			if (status == 'failed') {
				toast.error(message);
			} else {
				toast.success(message || "stock item served successfully");
			}
		}
	};

	const autoDebit = useCallback(
		(stockbrands: Brand[]) => {
			const approvedQuantity = parseInt(data.quantity_approved);
			let remainder = approvedQuantity;

			const availableBrands = stockbrands.filter((item) => item.quantity > 0);

			if (availableBrands.length > 0) {
				const updatedBrands = availableBrands.map((item) => {
					const brandBatchQty = parseInt(item.storeQty.toString());
					const served = autodeduct
						? Math.min(remainder, brandBatchQty)
						: item.served || 0;
					const deficit = brandBatchQty - served;
					remainder -= autodeduct ? served : 0;

					return {
						...item,
						served,
						availableQty: brandBatchQty,
						currentQty: brandBatchQty - served,
						deficit,
					};
				});
				setBrands(updatedBrands);
				setDeficit(remainder);
			}
		},
		[data.quantity_approved, autodeduct]);

	useEffect(() => {
		if (getDebitable) {
			setIsLoading(true);
			customFetch(
				`store/departments/requisitions/serve/supply?departmentid=${departmentid}&&stockid=${stockid}`
			)
				.then((response: any) => {
					setIsLoading(false);
					if (response?.status === "success") {
						autoDebit(response.result);
					} else {
						setError("Failed to fetch data.");
					}
				})
				.catch((err) => {
					setIsLoading(false);
					setBrands([]);
					setError("Error fetching debitable brands. Try again.");
					console.error(err);
				});
		}
	}, [departmentid, stockid, getDebitable, autoDebit]);

	const handleInputChange = (index: number, value: string) => {
		const updatedBrands = [...brands];
		let totalServed = updatedBrands.reduce(
			(sum, brand, idx) =>
				idx === index
					? sum + Math.max(0, parseInt(value) || 0)
					: sum + (brand.served || 0),
			0
		);

		// Ensure total served does not exceed the approved quantity
		const approvedQuantity = parseInt(data.quantity_approved);
		if (totalServed > approvedQuantity) {
			alert(
				"Total served quantity exceeds the approved quantity. Please adjust."
			);
			return;
		}

		const parsedValue = Math.min(
			Math.max(0, parseInt(value) || 0),
			updatedBrands[index].availableQty!
		);

		updatedBrands[index].served = parsedValue;
		updatedBrands[index].currentQty =
			updatedBrands[index].availableQty! - updatedBrands[index].served;

		setBrands(updatedBrands);


		totalServed = updatedBrands.reduce(
			(sum, brand) => sum + (brand.served || 0),
			0
		);
		setDeficit(Math.max(0, approvedQuantity - totalServed));
	};

	if (isLoading) return <Loader />;


	if(brands.length === 0) return <NoDataAvailable message="No stocks available to serve "/>

	return (
		<div>
			{error && (
				<Alert variant="danger" className="text-sm p-2">
					{error}
				</Alert>
			)}
			<Alert variant="info" className="text-sm p-2">
				<Alert.Heading className="text-sm">Information</Alert.Heading>
				<hr />
				<p className="text-sm">
					Only brands with a quantity greater than 0 are shown.
				</p>
			</Alert>
			<h4>Amount Remaining: {deficit}</h4>
			<Table className="ttable table" responsive>
				<thead className="bg-warning">
					<tr>
						<th>Brand</th>
						<th>Batch Number</th>
						<th>Store Qty</th>
						<th>Available Qty</th>
						<th>Current Qty</th>
						<th>Amount Served</th>
					</tr>
				</thead>
				<tbody>
					{brands
						.filter((row) => row.availableQty && row.availableQty > 0)
						.map((row, index) => (
							<tr key={row.batchnumber}>
								<td>{row.brand}</td>
								<td>{row.batchnumber}</td>
								<td>{row.storeQty}</td>
								<td>{row.availableQty}</td>
								<td>{row.currentQty}</td>
								<td>
									<input
										type="number"
										className="custom-input"
										disabled={autodeduct || disabled || manuallyLogging}
										value={row.served || 0}
										min={0}
										max={row.availableQty}
										onChange={(e) =>
											handleInputChange(index, e.target.value)
										}
									/>
								</td>
							</tr>
						))}
				</tbody>
			</Table>
			<Button
				onClick={() => stocksServed(brands)}
				variant="primary"
				className="btn btn-sm"
				disabled={deficit! > 0 || brands.length === 0}
			>
				Save Changes
			</Button>
		</div>
	);
}
