import { useEffect, useState } from "react";
import LaboratoryLayout from "../../../../components/Layout/LaboratoryLayout";
import DatePickerRange from "../../../../components/accessories/DatePickerRange";
import {
	handleComments,
	customFetch,
	formatTest,
	generateRandomTextAndNumbers,
	updatePagination,
} from "../../../../components/Auth/customFetch";
import { Clear, Search } from "@mui/icons-material";
import TableDisplay from "../../../../components/accessories/TableDisplay";
import Pagination from "../../../../components/accessories/pagination";
import { useRouter } from "next/navigation";
import Loader from "../../../../components/accessories/Loader";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

const DEFAULTVALUES = {
	billingid: "",
	patientid: "",
	fullname: "",
	page: 1,
	count: 10,
	from: null,
	to: null,
};

const PatientArchivesPage = () => {
	const [query, setQuery] = useState(DEFAULTVALUES);
	const [collection, setCollection] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [load, setLoad] = useState(false);
	const router = useRouter();

	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const hasNotFiltered = !query.billingid && !query.patientid && !query.fullname && !query.from && !query.to;

	const getRange = (value) => {
		const [start, end] = value;
		setQuery({ ...query, from: start, to: end });
	};

	const getDataArchives = async () => {
		const { from, to, billingid, patientid, fullname, page, count } = query;
		const response = await customFetch(
			`operations/collection/result?from=${from == null ? "" : from}&&to=${to == null ? "" : to
			}&&billingid=${billingid}&&patientid=${patientid}&&fullname=${fullname}&&page=${page}&&count=${count}`
		);
		const { statusCode, result } = response;
		if (Array.isArray(result) && statusCode === 200) {
			setCollection(result);
		} else {
			setCollection([]);
		}
	};

	const submitData = async () => {
		if (hasNotFiltered) return;
		try {
			setIsLoading(true);
			getDataArchives();
		} catch (err) {
			setIsLoading(false);
			setCollection([]);
		} finally {
			setIsLoading(false);
		}
	};

	const clearFilters = () => {
		setQuery({ ...DEFAULTVALUES, from: null, to: null, count: 10, page: 1 });
	};

	const renderNewTab = (item, patientid) => {
		const { name, billingid, testid } = item;
		window.open(
			`viewtwo/resultentry?testid=${parseInt(testid)}&&testname=${formatTest(name)}&&employeeid=${parseInt(
				employeeid
			)}&&billingid=${parseInt(billingid)}&&patientid=${parseInt(patientid)}&&view=single`
		);
	};

	const columns = [
		{
			Header: "Date",
			accessor: "billing_date",
			Cell: ({ value }) => new Date(value).toLocaleDateString(),
		},
		{
			Header: "Patient ID",
			accessor: "patientid",
			Cell: ({ row }) => <div>{row.original.patientid}</div>,
		},
		{
			Header: "Fullname",
			accessor: "fullname",
			Cell: ({ row }) => (
				<>
					<div>{row.original.fullname}</div>
				</>
			),
		},
		{
			Header: "Billing ID",
			accessor: "billingid",
			Cell: ({ row }) => <div>{row.original.billingid}</div>,
		},
		{
			Header: "sample ascension id",
			accessor: "ascensionid",
		},
		{
			Header: "Gender",
			accessor: "gender",
			Cell: ({ row }) => <div>{row.original.gender}</div>,
		},
		{
			Header: "details",
			accessor: "",
			Cell: ({ row }) => {
				return (
					<div>
						<button
							onClick={(ev) => {
								router.push(
									`/operations/laboratory/patientarchives/transactions?ptid=${generateRandomTextAndNumbers(50)}${row.original.patientid}&&csvid=${generateRandomTextAndNumbers(70)}${row.original.billingid}`
								);
							}}
							className="btn btn-secondary">
							view details
						</button>
					</div>
				);
			},
		},
	];

	const updatePage = (value) => {
		updatePagination(value, setQuery, query);
	};

	useEffect(() => {
		getDataArchives();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query.page]);

	const rendering = () => {
		if (isLoading) {
			return <Loader />;
		}

		if (collection.length == 0) {
			return <h4 className="alert alert-info p-3 text-capitalize">filtered to continue </h4>;
		} else {
			return (
				<div>
					<TableDisplay column={columns} data={collection} showpage={false} exporters={false} />
					<div className="d-flex justify-content-center">
						<Pagination page={query.page} load={setLoad} updateFunction={updatePage} />
					</div>
				</div>
			);
		}
	};

	return (
		<LaboratoryLayout>
			<section className="grid-5">
				<div className="mx-2">
					<input
						placeholder="Billing Id"
						className="custom-input"
						id="billingid"
						value={query.billingid}
						onChange={(e) => handleComments(e, query, "billingid", setQuery)}
					/>
				</div>
				<div className="mx-2">
					<input
						placeholder="Patient Id"
						className="custom-input"
						value={query.patientid}
						id="patientid"
						onChange={(e) => handleComments(e, query, "patientid", setQuery)}
					/>
				</div>
				<div className="mx-2">
					<input
						placeholder="Fullname"
						className="custom-input"
						value={query.fullname}
						id="fullname"
						onChange={(e) => handleComments(e, query, "fullname", setQuery)}
					/>
				</div>
				<div>
					<DatePickerRange getRange={getRange} start={query.from} end={query.to} />
				</div>
				<div>
					<button
						className="btn btn-success "
						onClick={(e) => {
							submitData();
						}}>
						<Search /> Search
					</button>
					<button
						onClick={(ev) => {
							clearFilters();
						}}
						className="btn mx-2 btn-secondary ">
						<Clear /> Clear Filter
					</button>
				</div>
			</section>
			<h5 className="mx-1 text-capitalize">Completed /Archived cases</h5>
			{rendering()}
		</LaboratoryLayout>
	);
};

export default PatientArchivesPage;
