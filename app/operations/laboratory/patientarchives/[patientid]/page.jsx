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
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import { plsDecryption } from "../../../../../lib/encryption";
import { handleServerSidePatientArchives } from "../../../../../components/serverActions/ActionFiltering";
import BillingPagePatientInformation from "../../../../../components/Billing/BillingContextComponents/PersonalInfoView";
import { RiUserFill } from "@remixicon/react";


const DEFAULTVALUES = {
	billingid: "",
	patientid: "",
	fullname: "",
	page: 1,
	count: 10,
	from: null,
	to: null,
};

const PatientSpecificArchivesCases = () => {
	const [patientInformation, setPatientInformation] = useState({});
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const fullname = searchParams.get("fullname") || "";
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
		setQuery({ ...query, from: start || null, to: end || null });
	};

	const getDataArchives = async () => {
		if (decryptedPatientId) {
			try {
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
			} catch (err) {
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


	const handleBrowserView = (data) => {
		const { testid, test_name, patientid, ascensionid, billingid } = data;
		const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
		const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;
		const url = `csvid=${csvid}&&testid=${testid}&&testname=${test_name}&&ptid=${ptid}&&target=70,50&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=`;
		window.open(`/result/labreport/4?${url}`);
	};


	const clearFilters = () => {
		setQuery({ ...DEFAULTVALUES, patientid: patientidParam, from: null, to: null, count: 10, page: 1 });
	};

	const columns = [
		{ Header: "Billed On", accessor: "billing_date", Cell: ({ value }) => value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : "" },
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
					<div><b>Validated By:</b> {
						Array.isArray(row.original.validators) && row.original.validators.length > 0
							? row.original.validators.map((v, idx) => (
								<span key={v.employeeid || idx} className="badge bg-secondary me-1">{v.username}</span>
							))
							: (row.original.validatedby || "-")
					}</div>
				</div>
			),
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => (
				<button
					onClick={() => {
						handleBrowserView(row.original);
					}}
					className="btn btn-primary btn-sm"
				>
					View Result
				</button>
			),
		},
	];




	return (
		<div>
			<div className="bg-secondary-subtle rounded-3 shadow-sm p-3 mb-4">
				<div className="d-flex align-items-center">
					<RiUserFill className="me-2 text-capitalize" />
					<span className="ms-2 text-capitalize ">
						{fullname}
					</span>
				</div>
			</div>
			<div className="row g-3 align-items-end">
				<div className="col">
					<input
						placeholder="Billing Id"
						className="custom-input"
						id="billingid"
						value={query.billingid}
						onChange={(e) => handleComments(e, query, "billingid", setQuery)}
					/>
				</div>
				<div className="col">
					<DatePickerRange
						getRange={getRange}
						start={query.from}
						end={query.to}
					/>
				</div>
				<div className="col-auto">
					<button
						className="btn btn-success"
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
						className="btn mx-2 btn-secondary"
					>
						Clear Filter
					</button>
				</div>
			</div>
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