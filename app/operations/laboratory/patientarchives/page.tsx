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
	ascensionid: "",
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
	const [searchFieldType, setSearchFieldType] = useState<"patientid" | "billingid" | "ascensionid" | "fullname" | "date">("patientid");
	const [searchValue, setSearchValue] = useState("");
	const [showFilter, setShowFilter] = useState(false);
	const router = useRouter();

	const { user } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const hasNotFiltered =
		!searchValue &&
		!query.from &&
		!query.to;

	const getRange = (value) => {
		const [start, end] = value;
		setQuery({ ...query, from: start || "", to: end || "" });
	};

	const getDataArchives = async () => {
		const { from, to, billingid, patientid, fullname, ascensionid, page, count } = query;
		const response = await customFetch(
			`operations/collection/result?from=${from == null ? "" : from}&&to=${to == null ? "" : to
			}&&billingid=${billingid}&&ascensionid=${ascensionid}&&patientid=${patientid}&&fullname=${fullname}&&page=${page}&&count=${count}`
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
				<div className="bg-warning p-2 rounded">
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
						<div className="d-flex justify-content-between">
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
									const encodedPatientId = encodeURIComponent(patientid || "");
									window.open(`/operations/laboratory/patientarchives/${plsEncryption(encodedPatientId)}?isOpenSideBarShow=false`,
										'_blank',
									);
								}}
							>
								<RiCodeView /> View Patient Archive
							</button>
						</div>
					</>
				);
			},
		},
	];

	useEffect(() => {
		getDataArchives();
	}, []);



	return (
		<div>
			{/* Filter Toggle Button */}
			<div className="mb-3">
				<button
					className="btn btn-outline-primary"
					onClick={() => setShowFilter(!showFilter)}
				>
					{showFilter ? 'Hide Filters' : 'Show Filters'}
				</button>
			</div>

			{/* Filter Section */}
			{showFilter && (
				<div className="border rounded p-4 mb-4 bg-white border-light" >
					<div className="row g-3 align-items-end">
						{/* Search Field Type Selector */}
						<div className="col-lg-2 col-md-6">
							<label htmlFor="searchFieldType" className="form-label fw-semibold">Search By</label>
							<select
								id="searchFieldType"
								className="form-select custom-select"
								value={searchFieldType}
								onChange={(e) => {
									setSearchFieldType(e.target.value as "patientid" | "billingid" | "ascensionid" | "fullname" | "date");
									setSearchValue("");
									// Reset query fields
									setQuery({
										...query,
										patientid: "",
										billingid: "",
										ascensionid: "",
										fullname: ""
									});
								}}
							>
								<option value="patientid">Patient ID</option>
								<option value="billingid">Billing ID</option>
								<option value="ascensionid">Ascension ID</option>
								<option value="fullname">Patient Name</option>
								<option value="date">Date Range</option>
							</select>
						</div>

						{/* Search Input - Always show */}
						<div className="col-lg-3 col-md-6">
							<label htmlFor="searchInput" className="form-label fw-semibold">
								{searchFieldType === "patientid" && "Enter Patient ID"}
								{searchFieldType === "billingid" && "Enter Billing ID"}
								{searchFieldType === "ascensionid" && "Enter Ascension ID"}
								{searchFieldType === "fullname" && "Enter Patient Name"}
								{searchFieldType === "date" && "Search"}
							</label>
							<input
								id="searchInput"
								placeholder="Search..."
								className="form-control custom-input"
								value={searchValue}
								onChange={(e) => {
									setSearchValue(e.target.value);
									setQuery({
										...query,
										[searchFieldType]: e.target.value
									});
								}}
							/>
						</div>

						{/* Date Range Filter - Show only if date is selected */}
						{searchFieldType === "date" && (
							<div className="col-lg-3 col-md-6">
								<label className="form-label fw-semibold">Select Date Range</label>
								<DatePickerRange
									getRange={getRange}
									start={query.from}
									end={query.to}
								/>
							</div>
						)}

						{/* Action Buttons */}
						<div className="col-lg-4 col-md-12">
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
										setSearchValue("");
										setSearchFieldType("patientid");
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
			)}

			<PrimeTable
				column={columns}
				data={collection}
				filtering={false}
				serverSideFiltering={true}
				handleSeverSideProcessing={handleServerSidePatientArchives}
			/>
		</div>
	);
};

export default PatientArchivesPage;
