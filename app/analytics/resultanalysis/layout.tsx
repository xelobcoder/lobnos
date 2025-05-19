import { Suspense } from "react";
import { ApplicationProvider } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from "../../../components/Layout/PrimeLayout";
import Link from "next/link";

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
            <PrimeLayout links={[]}>
              <Link className="btn btn-link text-sm pls-label text-decoration-underline px-4" href={'/analytics/resultanalysis/alltest'}>
               All Test
              </Link>
              {children}
            </PrimeLayout>
          </ApplicationProvider>
        </Suspense>
      </body>
    </html>
  );
}
