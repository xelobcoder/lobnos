import { Suspense } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../../styles/globals.css";
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import { ApplicationProvider } from "../../components/Auth/useApplicationContext";
import LaboratoryLayout from "../../components/Layout/LaboratoryLayout";



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
						<LaboratoryLayout>
							{children}
					   </LaboratoryLayout>
                         </ApplicationProvider>
                    </Suspense>
               </body>
          </html>
     );
}
