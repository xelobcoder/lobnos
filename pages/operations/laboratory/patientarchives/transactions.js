import { useEffect, useState } from "react";
import { customFetch, formatTest, PrepareResultEntryHeader, printResultNavigator } from "../../../../components/Auth/customFetch";
import LaboratoryLayout from "../../../../components/Layout/LaboratoryLayout";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { MoreVert } from "@mui/icons-material";
import TableDisplay from "../../../../components/accessories/TableDisplay";
import { useSearchParams } from "next/navigation";
import Loader from "../../../../components/accessories/Loader";
import PreviewPatientInformation from "../../../../components/petientsComponent/PreviewPatientInformation";

export default function ResultEntryCompletedDepartmentViewTwo() {
	const [data, setData] = useState([]);
	const ptid = useSearchParams().get("ptid");
	const [loading, setLoading] = useState(true);
	const csvid = useSearchParams().get("csvid");

	const patientid = typeof ptid == "string" && ptid.length > 50 ? ptid.slice(50) : null;
	const billingid = typeof csvid === "string" && csvid.length > 70 ? csvid.slice(70) : null;

	useEffect(() => {
		const getData = async function () {
			try {
				setLoading(true);
				const data = await customFetch(`operation/pendingcases/all?status=completed&&billingid=${billingid}`);
				const { result } = data;
				if (Array.isArray(result) && result.length > 0) {
					setData(result);
				}
			} catch (err) {
				setData([]);
				setLoading(false);
				console.error("Error fetching tests:", err);
			} finally {
				setLoading(false);
			}
		};
		getData();

	}, [billingid]);

	const openSingleResult = (ev, row) => {
		const { billingid, name, id } = row;
		printResultNavigator(null, billingid, { ...row, testid: id, testname: name }, true);
	};

	const openMultipleResult = (ev, row) => {
		const { billingid, name, id, patientid } = row;
		window.open(
			`/registration/result/labReportMultiple?billingid=${billingid}&&testid=${id}&&test=${formatTest(name)}&&patientid=${patientid}`
		);
	};

	const columns = [
		{
			Header: "Client name",
			accessor: "fullname",
		},
		{ Header: "billing id", accessor: "billingid" },
		{
			Header: "patientid",
			accessor: "patientid",
		},
		{
			Header: "age",
			accessor: "age",
		},
		{
			Header: "test",
			accessor: "name",
			Cell: ({ row, value }) => {
				return (
					<div>
						<span className={row.original.ready === "false" ? "text-danger" : ""}>{value}</span>
						<br />
						<span className={`border-bottom border-2 border-dark ${row.original.ready === "false" ? "text-danger" : ""}`}>
							{row.original.department}
						</span>
					</div>
				);
			},
		},
		{
			Header: "clinician",
			accessor: "clinician",
			Cell: function ({ value, row }) {
				const { clinicianName } = row.original;
				return (
					<div>
						<span>{value === 0 ? "Self" : clinicianName}</span>
					</div>
				);
			},
		},
		{
			Header: "organization",
			accessor: "organization",
			Cell: function ({ value, row }) {
				const { organization } = row.original;
				return (
					<div>
						<span>{organization === 0 ? "Direct" : organization}</span>
					</div>
				);
			},
		},
		{
			Header: "actions",
			accessor: "actions",
			Cell: function ({ row }) {
				const { billingid, patientid } = row.original;
				return (
					<Dropdown>
						<Dropdown.Toggle size="sm" variant="outline-primary" id="archives-dropdown">
							<MoreVert />
						</Dropdown.Toggle>
						<Dropdown.Menu>
							<Dropdown.Item
								className="text-primary"
								onClick={(ev) => {
									PrepareResultEntryHeader(row.original);
								}}>
								Result Entry
							</Dropdown.Item>
							<Dropdown.Item
								onClick={(ev) => {
									openSingleResult(ev, row.original);
								}}
								className="text-primary">
								Print Single
							</Dropdown.Item>
							<Dropdown.Item
								onClick={(ev) => {
									openMultipleResult(ev, row.original);
								}}
								className="text-primary">
								Print Bulk
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				);
			},
		},
	];

	if (!patientid) return null;

	if (loading) {
		return <LaboratoryLayout><Loader /></LaboratoryLayout>
	}


	return (
		<LaboratoryLayout>
			<section className="mx-2 p-2">
				{patientid && <PreviewPatientInformation patientid={patientid} />}
				<div className="d-flex justify-content-between">
					<h4>Test for Transaction with Billing Id {billingid}</h4>
				</div>
				<TableDisplay data={data} column={columns} />
			</section>
		</LaboratoryLayout>
	);
}
