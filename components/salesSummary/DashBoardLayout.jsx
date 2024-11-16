import { AssignmentInd, House, Payment } from "@mui/icons-material";
import MainLayout from "../Layout/MainLayout";
import { ListGroup } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FinancialDataKeys } from "./FinancialSummaryKeys";
import { useState } from "react";

export default function DashBoardLayoutSales({ children }) {
	const router = useRouter();
	const [activeKey, setActiveKey] = useState(null);

	const sidebarLinks = [
		{
			title: "Sales", link: "/dashboard", icon: <AssignmentInd />, subLinks: [
				...FinancialDataKeys.map((item, index) => {
					return {
						title: item.label.toUpperCase(),
						link: `/dashboard/sales/${item.key}`,
						icon: <Payment />,
					};
				}),
			],
		},
		{ title: "Organization", link: "/dashboard/organization", icon: <House /> },
		{ title: "Expense", link: "/expense/expenseslist", icon: <Payment /> },
	];

	return (
		<MainLayout sideLinks={sidebarLinks}>
			<div className="d-flex flex-column flex-lg-row p-2">
				<div className="d-none d-lg-flex col-lg-2 col-xl-2">
					<ListGroup>
						{FinancialDataKeys.map((item, index) => (
							<ListGroup.Item
								onClick={(ev) => {
									setActiveKey(item.key);
									router.push(`/dashboard/sales/${item.key}`);
								}}
								className={`text-capitalize pointer ${activeKey === item.key ? "active" : ""} text-sm`}
								key={index}
							>
								{item.label}
							</ListGroup.Item>
						))}
					</ListGroup>
				</div>
				<div className="col-12 col-lg-10 mx-3">
					{children}
				</div>
			</div>
		</MainLayout>
	);
}
