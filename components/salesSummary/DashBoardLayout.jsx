import { RiUser3Line, RiHome2Line, RiMoneyDollarCircleLine } from "@remixicon/react";
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
			title: "Sales", link: "/dashboard", icon: <RiUser3Line />, subLinks: [
				...FinancialDataKeys.map((item, index) => {
					return {
						title: item.label.toUpperCase(),
						link: `/dashboard/sales/${item.key}`,
						icon: <RiMoneyDollarCircleLine />,
					};
				}),
			],
		},
		{ title: "Organization", link: "/dashboard/organization", icon: <RiHome2Line /> },
		{ title: "Expense", link: "/expense/expenseslist", icon: <RiMoneyDollarCircleLine /> },
		{ title: "Result Analysis", link: "/dashboard/resultanalysis", icon: <RiMoneyDollarCircleLine /> },
	];


	return (
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
	);
}
