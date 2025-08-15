import type React from "react"
import type { Metadata } from "next"
import './global.css'
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import PrimeLayout from "../../components/Layout/PrimeLayout"
import { Suspense } from "react"
import { ApplicationProvider } from "../../components/Auth/useApplicationContext"
import MAIN_LAYOUT from "../../components/Layout/MainLayout";

export const metadata: Metadata = {
    title: "HR LIMS System",
    description: "Human Resources Laboratory Information Management System",
    generator: "v0.dev",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <Suspense>
            <ApplicationProvider>
                <MAIN_LAYOUT>
                    <PrimeLayout links={[]}>
                        {children}
                    </PrimeLayout>
                </MAIN_LAYOUT>
            </ApplicationProvider>
        </Suspense>
    )
}
