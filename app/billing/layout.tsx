import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import SmsLayout from "../../components/Layout/SmsLayout";
import PrimeLayout from "../../components/Layout/PrimeLayout";



export default function SMSLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	return (
		<html lang="en">
			<body >
				<Suspense>
					<ApplicationProvider>
						<PrimeLayout>
							{children}
						</PrimeLayout>
					</ApplicationProvider>
				</Suspense>
			</body>
		</html>
	);
}
