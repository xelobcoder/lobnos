import { useEffect, useState } from "react";
import UltrasoundLayout from "../../../../../components/Layout/ImagingLayout";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Link from "next/link";
import TableDisplay from '../../../../../components/accessories/TableDisplay';
import { updatePagination } from "../../../../../components/Auth/customFetch";
import Pagination from '../../../../../components/accessories/pagination';
import ShowTableCount from "../../../../../components/operations/Laboratory/ShowCountTable";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";

export default function UltrasoundTemplatesList() {
	const { applicationsettings } = useApplicationSettings();
	const { employeeid } = applicationsettings.user;

	const [isLoading, setLoading] = useState(true);
	const [templateList, setTemplateList] = useState([]);
	const [query, setQuery] = useState({ count: 10, page: 1 });
	const [error, setError] = useState(null);

	useEffect(() => {
		if (employeeid) {
			const fetchData = async () => {
				try {
					setLoading(true);
					const data = await customFetch(
						`result/entry/ultrasound/templates/list?page=${query.page}&count=${query.count}&employeeid=${employeeid}`
					);
					if (Array.isArray(data)) {
						setTemplateList(data);
					}
				} catch (err) {
					console.error("Error fetching data:", err);
					setError("Failed to load data.");
					setTemplateList([]);
				} finally {
					setLoading(false);
				}
			};
			fetchData();
		}
	}, [employeeid, query]);

	const columns = [
		{
			Header: 'Name',
			accessor: 'name',
		},
		{
			Header: "Ultrasound Name",
			accessor: 'ultrasoundname'
		},
		{
			Header: 'Body Part',
			accessor: 'associatedbodypart',
		},
		{
			Header: 'Created On',
			accessor: 'createdOn',
			Cell: ({ value }) => new Date(value).toLocaleString(),
		},
		{
			Header: 'Visibility',
			accessor: 'visibletoAll',
			Cell: ({ value }) => (
				<span className={`badge bg-${value ? "success" : "secondary"}`}>
					{value ? "Visible to All" : "Restricted"}
				</span>
			),
		},
		{
			Header: 'Actions',
			accessor: 'keyid',
			Cell: ({ value }) => (
				<Link href={`/operations/imaging/ultrasound/templates?isEdit=true&&templateid=${value}`} className="underline">
					Edit
				</Link>
			),
		},
	];

	const updateFunction = (value) => {
		updatePagination(value, setQuery, query);
	};

	if (!employeeid) return null;

	if (isLoading) {
		return (
			<UltrasoundLayout>
				<div className="text-center heightedBorder p-2 bg-secondary-subtle">
					Loading Data.......................
				</div>
			</UltrasoundLayout>
		);
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<UltrasoundLayout>
			<div>
				<h5 className="heightedBorder p-2 my-2 bg-body-secondary">Ultrasound Templates</h5>
				<ShowTableCount queryParams={query} setQueryParams={setQuery} />
				<div className="table-container">
					<TableDisplay
						column={columns}
						data={templateList}
						showpage={false}
						styling="ttable table"
					/>
				</div>
				<div className="d-flex justify-content-center">
					<Pagination
						load={setLoading} page={query.page}
						updateFunction={updateFunction}
					/>
				</div>
			</div>
		</UltrasoundLayout>
	);
}
