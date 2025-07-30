"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DatePickerRange from "../../../../../components/accessories/DatePickerRange";
import {
	handleComments,
	customFetch,
	formatTest,
	generateRandomTextAndNumbers,
	updatePagination,
} from "../../../../../components/Auth/customFetch";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import { useParams, useRouter } from "next/navigation";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import { plsDecryption } from "../../../../../lib/encryption";
import { handleServerSidePatientArchives } from "../../../../../components/serverActions/ActionFiltering";


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

const PatientSpecificArchivesCases = () => {
	const router = useRouter();
	const params = useParams();
	const patientidParam = params?.patientid || "";
	const decryptedPatientId = plsDecryption(patientidParam.toString());
	const [query, setQuery] = useState({ ...DEFAULTVALUES, patientid: patientidParam });
	const [collection, setCollection] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const hasNotFiltered =
		!query.billingid &&
		!query.fullname &&
		!query.from &&
		!query.to;

	const getRange = (value) => {
		const [start, end] = value;
		setQuery({ ...query, from: start || today, to: end || today });
	};

	const getDataArchives = async () => {
		if (decryptedPatientId) {
			const { from, to, billingid, patientid, fullname, page, count } = query;
			const trimmedFullname = fullname ? fullname.trim() : "";
			const params = [
				`from=${encodeURIComponent(from == null ? "" : from)}`,
				`to=${encodeURIComponent(to == null ? "" : to)}`,
				`billingid=${encodeURIComponent(billingid)}`,
				`patientid=${encodeURIComponent(decryptedPatientId)}`,
				`fullname=${encodeURIComponent(trimmedFullname)}`,
				`page=${encodeURIComponent(page)}`,
				`count=${encodeURIComponent(count)}`
			];
			const url = `operations/collection/result?${params.join("&&")}`;
			const response = await customFetch(url);
			const { statusCode, result } = response;
			if (Array.isArray(result) && statusCode === 200) {
				setCollection(result);
			} else {
				setCollection([]);
			}
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
		setQuery({ ...DEFAULTVALUES, patientid: patientidParam, from: today, to: today, count: 10, page: 1 });
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
					<div><b>Test Name:</b> {row.original.test_name || '-'} </div>
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
	}, [decryptedPatientId]);

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
			<h5 className="mx-1 text-capitalize">Patient Specific Archives Cases</h5>
			<div>
				<PrimeTable
					column={columns}
					data={collection}
					filtering={false}
					serverSideFiltering={true}
					urlparams={{
						from: query.from,
						to: query.to,
						patientid: decryptedPatientId,
						billingid: query.billingid,
						fullname: query.fullname,
						isPatientSpecific: true,

					}}
					handleSeverSideProcessing={handleServerSidePatientArchives} />
			</div>
		</div>
	);
};

export default PatientSpecificArchivesCases;