import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import BillingModuleLayout from "../../components/Layout/BillingModuleLayout";
import PrimeToast from "../../components/accessories/PrimeToast";
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
					<PrimeToast />
					<BillingModuleLayout>
						{children}
					</BillingModuleLayout>
				</MAIN_LAYOUT>
			</ApplicationProvider>
		</Suspense>
	);
}
