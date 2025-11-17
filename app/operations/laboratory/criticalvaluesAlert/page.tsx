'use client'
import { useEffect, useState } from "react";
import { customFetch } from "../../../../components/Auth/customFetch";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import { useRouter } from "next/navigation";
import { RiCalendar2Line, RiFileList2Line, RiFlaskLine, RiAlertLine, RiChatQuoteLine, RiEyeLine } from "@remixicon/react";
import { handleServerCriticalValues } from "../../../../components/serverActions/ActionFiltering";
import LoadingCard from "../../../../components/accessories/loadingcard";

type CriticalValue = {
	fullname: string;
	constraints: string[];
	billingid: number;
	createdon: string;
};

export default function CriticalValuesAlert() {
	const [criticalValues, setCriticalValues] = useState<CriticalValue[]>([]);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [loadQuery, setLoadQuery] = useState<{ page: number; count: number }>({ page: 1, count: 10 });
	const [load, setLoad] = useState<boolean>(false);
	const router = useRouter();

	const getCriticaValues = async () => {
		setLoading(true);
		customFetch(`result/criticalvalues/logging/paginated?count=10&&page=1`)
			.then((response) => {
				if (response && Array.isArray(response.data)) {
					setCriticalValues(response.data);
					setLoading(false);
				}
			})
			.catch((err) => {
				setLoading(false);
				alert("something wrong occured loading data");
			})
			.finally(() => setLoading(false))
	}

	useEffect(() => {
		getCriticaValues();
	}, [])


	const columns = [
		{
			Header: (
				<span>
					<RiCalendar2Line size={18} style={{ verticalAlign: "middle", color: "#1976d2", marginRight: 4 }} />
					Date
				</span>
			),
			accessor: "createdOn",
			Cell: ({ value }) => new Date(value).toLocaleString(),
		},
		{
			Header: (
				<span>
					<RiFileList2Line size={18} style={{ verticalAlign: "middle", color: "#1976d2", marginRight: 4 }} />
					BillingID
				</span>
			),
			accessor: "billingid",
		},
		{
			Header: (
				<span>
					<RiFlaskLine size={18} style={{ verticalAlign: "middle", color: "#1976d2", marginRight: 4 }} />
					Test
				</span>
			),
			accessor: "testname",
		},
		{
			Header: (
				<span>
					<RiAlertLine size={18} style={{ verticalAlign: "middle", color: "#d32f2f", marginRight: 4 }} />
					Constraint Type
				</span>
			),
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
			Header: (
				<span>
					<RiChatQuoteLine size={18} style={{ verticalAlign: "middle", color: "#b26a00", marginRight: 4 }} />
					Remarks
				</span>
			),
			accessor: "statement",
			Cell: ({ value }) => (
				<span style={{
					background: "#fffbe6",
					color: "#b26a00",
					borderLeft: "4px solid #ffd600",
					padding: "6px 10px",
					display: "block"
				}}>
					{value}
				</span>
			),
		},
		{
			Header: (
				<span>
					<RiEyeLine size={18} style={{ verticalAlign: "middle", color: "#1976d2", marginRight: 4 }} />
					View
				</span>
			),
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
			Header: (
				<span>
					<RiEyeLine size={18} style={{ verticalAlign: "middle", color: "#43a047", marginRight: 4 }} />
					Seen
				</span>
			),
			id: "seen",
			Cell: ({ row }) => (
				<button
					className="br-5 border-primary border-1 p-2"
					style={{ display: "flex", alignItems: "center", gap: 4, background: "#e8f5e9", color: "#388e3c" }}
					onClick={() => handleSeen(row.original.crkeyId)}
				>
					<RiEyeLine size={18} style={{ color: "#43a047" }} />
					Seen
				</button>
			)
		}
	]

	const handleSeen = (crkeyId: number) => {
		alert(`Marked alert with ID ${crkeyId} as seen!`);
	}

	const handleViewMore = (crKeyId: number) => {
		if (crKeyId && typeof crKeyId == "number") {
			router.push(`/operations/laboratory/criticalvaluesAlert/critical-value-event/${crKeyId}`)
		}
	}

	const rowClassName = (row) => {
		return row.original.statement.toString().length > 0 ? "bg-danger" : "bg-success";
	}

	if (isLoading) {
		return <LoadingCard />
	}



	return (
		<>
			<div>
				<h5 >
					<span>
						Critical Value Alerts
					</span>
				</h5>
				<PrimeTable
					column={columns} data={criticalValues}
					filtering={true}
					handleSeverSideProcessing={handleServerCriticalValues}
					serverSideFiltering={true}
				/>
			</div>

		</>
	)
}




