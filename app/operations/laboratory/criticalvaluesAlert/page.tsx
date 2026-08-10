'use client'
import { useEffect, useState } from "react";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import PrimeTableV2 from "../../../../components/accessories/Datatables/PrimeTableV2";
import { useRouter } from "next/navigation";
import { RiEyeLine } from "@remixicon/react";
import { handleServerCriticalValues } from "../../../../components/serverActions/ActionFiltering";
import LoadingCard from "../../../../components/accessories/loadingcard";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

type CriticalValue = {
	crkeyId: number;
	billingid: number;
	testid: number;
	constraint_type: string;
	statement: string;
	createdOn: string;
	createdBy: number;
	isSeen: string | null;
	isSeenBy: number | null;
	ascensionid: number;
	testname: string;
	patientInfo?: {
		patientid: number;
		fullpatientid: string;
		patientName: string;
		designation: string;
	};
};

type QueryStatus = "all" | "seen" | "unseen";

export default function CriticalValuesAlert() {
	const [criticalValues, setCriticalValues] = useState<CriticalValue[]>([]);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [queryStatus, setQueryStatus] = useState<QueryStatus>("all");
	const employeeid = useApplication()?.user?.employeeid;
	const router = useRouter();

	const getCriticaValues = async () => {
		setLoading(true);
		try {
			const statusQuery = queryStatus === "all" ? "" : `&&status=${queryStatus}`;
			const response = await customFetch(`result/criticalvalues/logging/paginated?count=10&&page=1${statusQuery}`);
			setCriticalValues(Array.isArray(response?.data) ? response.data : []);
		} catch (_err) {
			alert("something wrong occured loading data");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getCriticaValues();
	}, [queryStatus])


	const columns = [
		{
			Header: "Date",
			accessor: "createdOn",
			Cell: ({ value }) => (value ? new Date(value).toLocaleString() : "-"),
		},
		{
			Header: "Patient",
			id: "patientName",
			Cell: ({ row }) => row.original?.patientInfo?.patientName || "-",
		},
		{
			Header: "BillingID",
			accessor: "billingid",
		},
		{
			Header: "Test",
			accessor: "testname",
		},
		{
			Header: "Constraint Type",
			accessor: "constraint_type",
			Cell: ({ value }) => (
				<span style={{
					color: value === "greater" ? "#d32f2f" : "#1976d2",
					fontWeight: 600,
					textTransform: "capitalize"
				}}>
					{value}
				</span>
			),
		},
		{
			Header: "Remarks",
			accessor: "statement",
			Cell: ({ value }) => (
				<span style={{
					background: "#fffbe6",
					color: "#b26a00",
					borderLeft: "4px solid #ffd600",
					padding: "6px 10px",
					display: "block",
					textOverflow: "ellipsis",
					overflow: "hidden",
					whiteSpace: "nowrap",
					maxWidth: "200px"
				}}>
					{value}
				</span>
			),
		},
		{
			Header: "View",
			id: "view",
			Cell: ({ row }) => (
				<button className="br-5 border-success border-1 p-2"
					onClick={() => handleViewMore(row.original.crkeyId)}
					style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}
				>
					<RiEyeLine size={18} style={{ color: "#1976d2" }} />
					View More
				</button>
			)
		},
		{
			Header: "Seen",
			id: "seen",
			Cell: ({ row }) => (
				<button
					className="br-5 border-primary border-1 p-2"
					style={{ display: "flex", alignItems: "center", gap: 4, background: "#e8f5e9", color: "#388e3c" }}
					disabled={Boolean(row.original.isSeen)}
					onClick={() => handleSeen(row.original.crkeyId)}
				>
					<RiEyeLine size={18} style={{ color: "#43a047" }} />
					{row.original.isSeen ? "Seen" : "Mark Seen"}
				</button>
			)
		}
	]

	const handleSeen = async (crkeyId: number) => {
		try {
			const endpoint = `result/criticalvalues/logging/${crkeyId}/markasseen?employeeid=${employeeid}`;
			const response = await customPost(endpoint, 'PUT', { employeeId: employeeid });
			const { status } = response || {};
			if (status === "success" || status == true) {
				alert("Marked as seen successfully");
				getCriticaValues();
			} else {
				alert("Failed to mark as seen");
			}
		} catch (error) {
			alert("An error occurred while marking as seen");
		}
	}

	const handleViewMore = (crKeyId: number) => {
		if (crKeyId && typeof crKeyId == "number") {
			router.push(`/operations/laboratory/criticalvaluesAlert/critical-value-event/${crKeyId}`)
		}
	}

	if (isLoading) {
		return <LoadingCard />
	}



	return (
		<>
			<div>
				<div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
					<h5 className="mb-0">
						<span>Critical Value Alerts</span>
					</h5>
					<div className="d-flex align-items-center gap-2">
						<label htmlFor="critical-status-filter" className="mb-0 fw-semibold">Status</label>
						<select
							id="critical-status-filter"
							className="form-select form-select-sm"
							style={{ width: "150px" }}
							value={queryStatus}
							onChange={(e) => setQueryStatus(e.target.value as QueryStatus)}
						>
							<option value="all">All</option>
							<option value="seen">Seen</option>
							<option value="unseen">Unseen</option>
						</select>
					</div>
				</div>
				<PrimeTableV2
					column={columns} data={criticalValues}
					filtering={true}
					handleSeverSideProcessing={handleServerCriticalValues}
					serverSideFiltering={true}
					urlparams={queryStatus === "all" ? {} : { status: queryStatus }}
					tableId="critical-values-alert-table"
				/>
			</div>

		</>
	)
}




