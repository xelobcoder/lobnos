import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import TestActions from "../../../../components/settingsComponents/TestActions";
import { useRouter } from "next/navigation";

export default function TestListDisplay() {
	const [data, setData] = useState([]);
	const [isLoading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		customFetch('testpanel/list/bulk')
			.then((response) => {
				setData(response?.data);
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
				setData([]);
			});
	}, []);

	const deleteCustomTest = async (item) => {
		const { id } = item;
		if (!id) return;
		const confirmation = confirm(`Are you sure you want to delete this test? This will delete all information associated with the test.`);
		if (confirmation) {
			const response = await customPost(`testpanel/list?testid=${id}`, 'DELETE', {});
			if (response.status === "success") {
				setLoading(true);
				setData((prev) => prev.filter((a) => a.id !== id));
				setLoading(false);
			}
		}
	};

	const columns = [
		{
			Header: 'Name',
			accessor: 'name',
			Cell: ({ row, value }) => <span>{value} {row.original.shorttext ? `(${row.original.shorttext})` : ""}</span>
		},
		{
			Header: 'Price',
			accessor: 'price',
		},
		{
			Header: 'Sample Qty',
			accessor: 'qty_required',
			Cell: ({ row, value }) => <div>{value} {row.original.unit}</div>
		},
		{
			Header: 'Action',
			accessor: 'action',
			Cell: ({ row }) => {
				const { id } = row.original;
				return <TestActions id={id} row={row} deleteCustomTest={deleteCustomTest} />;
			}
		}
	];

	const renderingView = () => {
		if (isLoading) return <Loader />;
		return (
			<section>
				<div className="d-flex justify-content-end mx-2">
					<button onClick={() => router.push("/settings/testpanel/testlist/fieldcreator")} className="btn btn-secondary btn-sm mx-2">
						test field creator
					</button>
					<button onClick={() => router.push("/settings/testpanel/testlist/createcustomtest")} className="btn btn-dark btn-sm text-capitalize">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
							<path d="M13.0001 10.9999L22.0002 10.9997L22.0002 12.9997L13.0001 12.9999L13.0001 21.9998L11.0001 21.9998L11.0001 12.9999L2.00004 13.0001L2 11.0001L11.0001 10.9999L11 2.00025L13 2.00024L13.0001 10.9999Z"></path>
						</svg> new test
					</button>
				</div>
				<div>
					<PrimeTable
						serverSideFiltering={true}
						filtering={false} initpageSize={100} showpage={false} column={columns} data={data} />
				</div>
			</section>
		);
	};

	return (
		<MainSettingsLayoutView>
			{renderingView()}
		</MainSettingsLayoutView>
	);
}
