import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { DoashBoardMainLinks } from "../../components/Layout/links/categories/DashboardLinks";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";



export default function SMSLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <Suspense>
            <ApplicationProvider>
                <MAIN_LAYOUT>
                    <PrimeLayout links={DoashBoardMainLinks}>
                        {children}
                    </PrimeLayout>
                </MAIN_LAYOUT>
            </ApplicationProvider>
        </Suspense>
    );
}
