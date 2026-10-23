import { Suspense } from "react";
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { EmailMainLinks } from "../../components/Layout/links/categories/EmailAppLinks";
import MAIN_LAYOUT from "../../components/Layout/MainLayout";






export default function EmailLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <Suspense>
            <ApplicationProvider>
                <MAIN_LAYOUT>
                    <PrimeLayout links={EmailMainLinks}>
                        {children}
                    </PrimeLayout>
                </MAIN_LAYOUT>
            </ApplicationProvider>
        </Suspense>
    );
}
