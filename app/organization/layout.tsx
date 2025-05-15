import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { OrganizationMainLinks } from "../../components/Layout/links/categories/OraganizationLinks";



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
