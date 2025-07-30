'use client';
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DatePickerRange from "../../../../components/accessories/DatePickerRange";
import {
	handleComments,
	customFetch,
	updatePagination,
} from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { useRouter } from "next/navigation";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { handleServerSidePatientArchives } from "../../../../components/serverActions/ActionFiltering";

const today = dayjs().format("YYYY-MM-DD");
const DEFAULTVALUES = {
	billingid: "",
	patientid: "",
	fullname: "",
	page: 1,
	count: 10,
	from: today,
	to: today,
};

const PatientArchivesPage = () => {
	const [query, setQuery] = useState(DEFAULTVALUES);
	const [collection, setCollection] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [load, setLoad] = useState(false);
	const router = useRouter();

	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const hasNotFiltered =
		!query.billingid &&
		!query.patientid &&
		!query.fullname &&
		!query.from &&
		!query.to;

	const getRange = (value) => {
		const [start, end] = value;
		setQuery({ ...query, from: start || today, to: end || today });
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
			await getDataArchives();
		} catch (err) {
			setIsLoading(false);
			setCollection([]);
		} finally {
			setIsLoading(false);
		}
	};

	const clearFilters = () => {
		setQuery({ ...DEFAULTVALUES, from: today, to: today, count: 10, page: 1 });
	};

	const columns = [
		{ Header: "Billed On", accessor: "billing_date", Cell: ({ value }) => value ? dayjs(value).format("DD MMM YYYY") : "" },
		{
			Header: "Patient Info",
			accessor: "patientinfo",
			Cell: ({ row }) => (
				<div>
					<div><b>Name:</b> {row.original.fullname}({row.original.patientid})</div>
					<div><b>Gender:</b> {row.original.gender}</div>
				</div>
			),
		},
		{
			Header: "Case Info",
			accessor: "caseinfo",
			Cell: ({ row }) => (
				<div>
					<div><b>Billing ID:</b> {row.original.billingid}</div>
					<div><b>Ascension ID:</b> {row.original.ascensionid}</div>
					<div><b>Test ID:</b> {row.original.testid}</div>
					<div><b>Test Name:</b> {row.original.test_name || '-'}</div>
				</div>
			),
		},
		{
			Header: "Result Info",
			accessor: "resultinfo",
			Cell: ({ row }) => (
				<div>
					<div><b>Entry Date:</b> {row.original.result_entry_date ? dayjs(row.original.result_entry_date).format("DD MMM YYYY, HH:mm") : ""}</div>
					<div><b>Approved By:</b> {row.original.approvedBy || "-"}</div>
					<div><b>Print Count:</b> {row.original.printCount}</div>
				</div>
			),
		},
		{ Header: "Last Updated On", accessor: "lastupdatedon", Cell: ({ value }) => value ? dayjs(value).format("DD MMM YYYY, HH:mm") : "" },

		{
			Header: "Validation Info",
			accessor: "validationinfo",
			Cell: ({ row }) => (
				<div>
					<div><b>Sample Validated On:</b> {row.original.samplevalidatedon ? dayjs(row.original.samplevalidatedon).format("DD MMM YYYY, HH:mm") : ""}</div>
					<div><b>Validated By:</b> {row.original.validatedby || "-"}</div>
					<div><b>Phelobotomist:</b> {row.original.phelobotomist || "-"}</div>
				</div>
			),
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => (
				<button
					onClick={() => {
						router.push(
							`/operations/laboratory/patientarchives/result?testid=${row.original.testid}&patientid=${row.original.patientid}&billingid=${row.original.billingid}`
						);
					}}
					className="btn btn-primary btn-sm"
				>
					View Result
				</button>
			),
		},
	];

	const updatePage = (value) => {
		updatePagination(value, setQuery, query);
	};

	useEffect(() => {
		getDataArchives();
	}, []);



	return (
		<div>
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
					<DatePickerRange
						getRange={getRange}
						start={query.from}
						end={query.to}
					/>
				</div>
				<div>
					<button
						className="btn btn-success "
						onClick={(e) => {
							submitData();
						}}
					>
						Search
					</button>
					<button
						onClick={(ev) => {
							clearFilters();
						}}
						className="btn mx-2 btn-secondary "
					>
						Clear Filter
					</button>
				</div>
			</section>
			<h5 className="mx-1 text-capitalize">Archives</h5>
			<div>
				<PrimeTable
					column={columns}
					data={collection}
					filtering={false}
					serverSideFiltering={true}
					handleSeverSideProcessing={handleServerSidePatientArchives} />
			</div>
		</div>
	);
};

export default PatientArchivesPage;
