import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import PrimeLayout from "../../components/Layout/PrimeLayout";
import { ApplicationSettingsLinks } from "../../components/Layout/links/categories/ApplicationSettingsLinks";
import PrimeToast from "../../components/accessories/PrimeToast";



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
            <PrimeLayout links={ApplicationSettingsLinks}>
              <PrimeToast/>
              {children}
            </PrimeLayout>
          </ApplicationProvider>
        </Suspense>
      </body>
    </html>
  );
}
