import '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../../../../styles/global.css';
import '../../../../node_modules/react-toastify/dist/ReactToastify.min.css';
import ApplicationHeader from '../../../../components/accessories/ApplicationHeader';
import { DepartmentSidebarLinks } from '../../../../Lib/DepartmentSidebarLinks';
import { Suspense } from 'react';
import { ApplicationProvider } from '../../../../components/application/ApplicationContextProvider';


export default async function RootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ departmentid: number }>
}) {
    const { departmentid } = await params;
    return (
        <html>
            <body className='app-divider'>
                <Suspense>
                    <ApplicationProvider>
                        <ApplicationHeader sidebarLinks={DepartmentSidebarLinks(departmentid)}>
                            {children}
                        </ApplicationHeader>
                    </ApplicationProvider>
                </Suspense>
            </body>
        </html>
    );
}
