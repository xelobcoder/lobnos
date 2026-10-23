import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { PhlebotomyLinks } from "../../../components/Layout/links/categories/PhlebotomyLinks";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";






export default function PhelobotomyLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <Suspense>
            <ApplicationProvider>
                <MAIN_LAYOUT>
                    <PrimeLayout links={PhlebotomyLinks}>
                        {children}
                    </PrimeLayout>
                </MAIN_LAYOUT>
            </ApplicationProvider>
        </Suspense>
    );
}
