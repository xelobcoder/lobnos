import { AssignmentInd, House, Payment } from "@mui/icons-material"
import MainLayout from "../Layout/MainLayout"
import { ListGroup } from "react-bootstrap"
import { useRouter } from "next/navigation"
import { FinancialDataKeys } from "./FinancialSummaryKeys";
import { useState } from "react";

export default function DashBoardLayoutSales({ children }) {
	const router = useRouter();
	const [activeKey, setActiveKey] = useState(null);
	const sidebarLinks = [
		{ title: "Sales", link: "/dashboard", icon: <AssignmentInd /> },
		{ title: "Organization", link: "/dashboard/organization", icon: <House /> },
		{ title: "Expense", link: "/expense/expenseslist", icon: <Payment /> },
	]



	return (
		<MainLayout sideLinks={sidebarLinks} >
			<div style={{ display: 'grid', gridTemplateColumns: '20% 75%', gridGap: '10px' }} className="p-2">
				<div>
					<ListGroup>
						{FinancialDataKeys.map((item, index) => <ListGroup.Item onClick={(ev) => { setActiveKey(item.key); router.push(`/dashboard/${item.key}`) }} className={`text-capitalize pointer ${activeKey == item.key ? "active" : ""} text-sm`} key={index}>{item.label}</ListGroup.Item>)}
					</ListGroup>
				</div>
				<div>
					{children}
				</div>
			</div>
		</MainLayout>
	)
}
