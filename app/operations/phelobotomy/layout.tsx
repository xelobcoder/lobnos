import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import { PhlebotomyLinks } from "../../../components/Layout/links/categories/PhlebotomyLinks";



export default function PhelobotomyLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <Suspense>
            <ApplicationProvider>
                <PrimeLayout links={PhlebotomyLinks}>
                    {children}
                </PrimeLayout>
            </ApplicationProvider>
        </Suspense>
    );
}
