import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { OrganizationMainLinks } from "../../components/Layout/links/categories/OraganizationLinks";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import MAIN_LAYOUT from "../../components/Layout/MainLayout";



export default function SMSLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	return (
		<Suspense>
			<ApplicationProvider >
				<MAIN_LAYOUT>
					<PrimeLayout links={OrganizationMainLinks}>
					{children}
				</PrimeLayout>
				</MAIN_LAYOUT>
			</ApplicationProvider>
		</Suspense>
	);
}
