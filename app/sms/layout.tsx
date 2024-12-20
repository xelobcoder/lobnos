import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import SmsLayout from "../../components/Layout/SmsLayout";



export default function SMSLayout({
     children,
}: {
     children: React.ReactNode;
}) {

     return (
          <html lang="en">
               <body>
                    <Suspense>
                         <ApplicationProvider>
                              <SmsLayout>
                                   {children}
                              </SmsLayout>
                         </ApplicationProvider>
                    </Suspense>
               </body>
          </html>
     );
}
