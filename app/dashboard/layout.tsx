import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { DoashBoardMainLinks } from "../../components/Layout/links/categories/DashboardLinks";



export default function SMSLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <Suspense>
            <ApplicationProvider>
                <PrimeLayout links={DoashBoardMainLinks}>
                    {children}
                </PrimeLayout>
            </ApplicationProvider>
        </Suspense>
    );
}
