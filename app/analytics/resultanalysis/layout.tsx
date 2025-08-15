import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import Link from "next/link";
import MAIN_LAYOUT from "../../../components/Layout/MainLayout";

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
            <MAIN_LAYOUT>
              <PrimeLayout links={[]}>
                <Link className="btn btn-link text-sm pls-label text-decoration-underline px-4" href={'/analytics/resultanalysis/alltest'}>
                  All Test
                </Link>
                {children}
              </PrimeLayout>
            </MAIN_LAYOUT>
          </ApplicationProvider>
        </Suspense>
      </body>
    </html>
  );
}
