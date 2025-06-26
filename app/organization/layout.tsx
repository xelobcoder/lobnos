import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { OrganizationMainLinks } from "../../components/Layout/links/categories/OraganizationLinks";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';



export default function SMSLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	return (
		<Suspense>
			<ApplicationProvider >
				<PrimeLayout links={OrganizationMainLinks}>
					{children}
				</PrimeLayout>
			</ApplicationProvider>
		</Suspense>
	);
}
