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
import { RiCodeView } from "@remixicon/react";
import { plsEncryption } from "../../../../lib/encryption";

const DEFAULTVALUES = {
	billingid: "",
	patientid: "",
	fullname: "",
	page: 1,
	count: 10,
	from: "",
	to: "",
};

const generateRandomTextAndNumbers = (length) => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

const handleBrowserView = (data) => {
	const { testid, testname, billingid, ascensionid, patientid } = data;
	const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
	const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;
	const url = `csvid=${csvid}&&testid=${testid}&&testname=${testname}&&ptid=${ptid}&&target=70,50&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=&&isScan=false&&testname=${testname}&&ptid=TKUGSzyQHfg7e9rkp39sXF8Q96cRWYLMVi4NztxwpIgM8JVJWU3380&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&target=70%2C50&&password=&&isBrowserPrintout=1&&tenantId=`;
	window.open(`/result/labreport/4?${url}`, '_blank');
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
		setQuery({ ...query, from: start || "", to: end || "" });
	};

	const getDataArchives = async () => {
		const { from, to, billingid, patientid, fullname, page, count } = query;
		const response = await customFetch(
			`operations/collection/result?from=${from == null ? "" : from}&&to=${to == null ? "" : to
			}&&billingid=${billingid}&&ascensionid=${patientid}&&fullname=${fullname}&&page=${page}&&count=${count}`
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
		setQuery({ ...DEFAULTVALUES, from: "", to: "", count: 10, page: 1 });
	};

	const columns = [
		{
			Header: "Billed On",
			accessor: "billing_date",
			Cell: ({ value }) => value ? dayjs(value).format("DD MMM YYYY, hh:mm A") : ""
		},
		{
			Header: "Patient Info",
			accessor: "patientinfo",
			Cell: ({ row }) => {
				const { fullname, patientid, gender } = row.original;
				return (
					<div>
						<div><b>Name:</b> {fullname}</div>
						<div><b>Patient ID:</b> {patientid}</div>
						<div><b>Gender:</b> {gender}</div>
					</div>
				);
			},
		},
		{
			Header: "Test Info",
			accessor: "testinfo",
			Cell: ({ row }) => (
				<div>
					<div><b>Test Name:</b> {row.original.test_name}</div>
					<div><b>Test ID:</b> {row.original.testid}</div>
					<div><b>Ascension ID:</b> {row.original.ascensionid}</div>
				</div>
			),
		},
		{
			Header: "Approval Status",
			accessor: "approvalstatus",
			Cell: ({ row }) => {
				const { isapproved, approvedBy } = row.original;
				return (
					<div>
						<div><b>Status:</b>
							<span className={`badge ms-1 ${isapproved ? 'bg-success' : 'bg-warning'}`}>
								{isapproved ? 'Approved' : 'Pending'}
							</span>
						</div>
						{approvedBy && <div><b>Approved By:</b> {approvedBy}</div>}
					</div>
				);
			},
		},
		{
			Header: "Print Count",
			accessor: "printCount",
			Cell: ({ value }) => value || 0
		},
		{
			Header: "Last Updated",
			accessor: "lastupdatedon",
			Cell: ({ value }) => value ? dayjs(value).format("DD MMM YYYY, HH:mm") : ""
		},
		{
			Header: "Validation Info",
			accessor: "validationinfo",
			Cell: ({ row }) => {
				const { samplevalidatedon, validatedby, validators } = row.original;
				return (
					<div>
						<div><b>Sample Validated On:</b> {samplevalidatedon ? dayjs(samplevalidatedon).format("DD MMM YYYY, HH:mm") : ""}</div>
						<div><b>Validated By:</b> {
							Array.isArray(validators) && validators.length > 0
								? validators.map((v, idx) => (
									<span key={v.employeeid || idx} className="badge bg-secondary me-1">{v.username}</span>
								))
								: (validatedby || "-")
						}</div>
					</div>
				);
			},
		},
		{
			Header: "Actions",
			accessor: "actions",
			Cell: ({ row }) => {
				const { billingid, testid, test_name, ascensionid, patientid, fullname } = row.original;

				return (
					<>
						<button
							onClick={() => handleBrowserView({
								testid,
								testname: test_name,
								patientid,
								ascensionid,
								billingid
							})}
							className="btn btn-primary btn-sm mx-1"
						>
							View Result
						</button>
						<button
							title="View Patient Archive"
							className="btn btn-info btn-sm mx-1"
							onClick={() => {
								const encryptedId = encodeURIComponent(billingid);
								const encodedPatientId = encodeURIComponent(patientid || "");
								const encodedFullname = encodeURIComponent(fullname || "");
								window.open(`/operations/laboratory/patientarchives/${plsEncryption(encryptedId)}?patientid=${encodedPatientId}&fullname=${encodedFullname}`);
							}}
						>
							<RiCodeView />
						</button>
					</>
				);
			},
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
			{/* Filter Section */}
			<div className="card mb-4">
				<div className="card-header">
					<h5 className="mb-0">Search Patient Archives</h5>
				</div>
				<div className="card-body">
					<div className="row g-3 align-items-end">
						{/* ID Filters Row */}
						<div className="col-lg-2 col-md-6">
							<label htmlFor="billingid" className="form-label fw-semibold">Billing ID</label>
							<input
								placeholder="Enter Billing ID"
								className="form-control"
								id="billingid"
								value={query.billingid}
								onChange={(e) => handleComments(e, query, "billingid", setQuery)}
							/>
						</div>
						<div className="col-lg-2 col-md-6">
							<label htmlFor="patientid" className="form-label fw-semibold">Ascension ID</label>
							<input
								placeholder="Enter Ascension ID"
								className="form-control"
								value={query.patientid}
								id="patientid"
								onChange={(e) => handleComments(e, query, "patientid", setQuery)}
							/>
						</div>

						{/* Name Filter */}
						<div className="col-lg-3 col-md-6">
							<label htmlFor="fullname" className="form-label fw-semibold">Patient Name</label>
							<input
								placeholder="Enter Full Name"
								className="form-control"
								value={query.fullname}
								id="fullname"
								onChange={(e) => handleComments(e, query, "fullname", setQuery)}
							/>
						</div>

						{/* Date Range Filter */}
						<div className="col-lg-3 col-md-6">
							<label className="form-label fw-semibold">Date Range</label>
							<div>
								<DatePickerRange
									getRange={getRange}
									start={query.from}
									end={query.to}
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="col-lg-2 col-md-12">
							<div className="d-flex gap-2">
								<button
									className="btn btn-success flex-fill"
									onClick={(e) => {
										submitData();
									}}
									disabled={isLoading}
								>
									{isLoading ? 'Searching...' : 'Search'}
								</button>
								<button
									onClick={(ev) => {
										clearFilters();
									}}
									className="btn btn-outline-secondary flex-fill"
									disabled={isLoading}
								>
									Clear
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Results Section */}
			<div className="card">
				<div className="card-header">
					<h5 className="mb-0">Patient Archives Results</h5>
				</div>
				<div className="card-body p-0">
					<PrimeTable
						column={columns}
						data={collection}
						filtering={false}
						serverSideFiltering={true}
						handleSeverSideProcessing={handleServerSidePatientArchives}
					/>
				</div>
			</div>
		</div>
	);
};

export default PatientArchivesPage;
