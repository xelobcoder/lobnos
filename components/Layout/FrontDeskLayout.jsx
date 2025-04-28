import {
	RiTeamLine,
	RiListCheck2Line,
	RiShoppingBagLine
} from '@remixicon/react';


export default function FrontDeskLayout({ children }) {
	const sideLinks = [
		{ title: "registration", link: "/registration", icon: <RiRegisteredLine /> },
		{ title: "customers", link: "/customers", icon: <RiUserLine /> },
		{ title: "Billing", link: "/billing/patientid", icon: <RiMoneyDollarCircleLine /> },
		{ title: "customers vital sign", link: "/customers/recordVitalSigns", icon: <RiHeartPulseLine /> },
		{ title: "billing", link: "/billing/payment", icon: <RiMoneyDollarCircleLine /> },
		{
			title: "sales",
			link: "/billing/salessummary",
			icon: <RiBarChartBoxLine />,
			subLinks: [
				{ title: "Day summary", link: "/billing/salessummary/daily", icon: <RiBarChartBoxLine /> },
				{ title: "sales summary", link: "/billing/salessummary", icon: <RiBarChartBoxLine /> }
			],
		},
		{ title: 'test price list', link: '/pricelist', icon: <RiShoppingBagLine /> },
		{ title: 'Appointments', link: '/appointments', icon: <RiCalendarCheckLine /> },
		{ title: 'Refund Billed Client', link: '/billing/refund', icon: <RiRefund2Line /> },
		{ title: "Organization", link: "/organization", icon: <RiBuildingLine /> },
		{ title: "Clinicians", link: "/clinician", icon: <RiTeamLine /> },
		{ title: "Result", link: "/registration/ready", icon: <RiListCheck2Line /> }
	]
	return (
		<div>
			{children}
		</div>
	)
}