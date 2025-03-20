import { AssignmentInd, House, Payment } from "@mui/icons-material";
import MainLayout from "../Layout/MainLayout";
import { ListGroup } from "react-bootstrap";
import { useRouter, useSearchParams } from "next/navigation";
import { FinancialDataKeys } from "./FinancialSummaryKeys";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashBoardLayoutSales({ children }) {
	const router = useRouter();
	const targetKey = useSearchParams().get("targetKey");
	const [activeKey, setActiveKey] = useState(null);

	useEffect( () => {setActiveKey(targetKey)},[targetKey])

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
		{ title: "Result Analysis", link: "/dashboard/resultanalysis", icon: <Payment /> },
	];


	return (
		<MainLayout sideLinks={sidebarLinks}>
			<div className="d-flex flex-column flex-lg-row">
				<div className="d-none  d-lg-flex col-lg-2 col-xl-2">
					<ListGroup className="br-0 ">
						{FinancialDataKeys.map((item, index) => (
							<ListGroup.Item key={index}  className={`text-uppercase pointer pls-color  overflow-grow whitespace-nowrap  ${activeKey == index ? "active text-white" : ""} text-sm`}>
								<Link 
									className={activeKey == index ? "text-white" : ""}
									key={index}
									href={`/dashboard/sales/${item.key}?targetKey=${index}`}>
									
									{item.label}
								</Link>
							</ListGroup.Item>
						))}
					</ListGroup>
				</div>
				<div className="col-12 col-lg-10 p-2">
					{children}
				</div>
			</div>
		</MainLayout>
	);
}
