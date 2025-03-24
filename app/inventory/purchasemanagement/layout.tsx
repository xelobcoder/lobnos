import ApplicationHeader from '../../components/accessories/ApplicationHeader'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../../styles/global.css'
import "../../node_modules/react-toastify/dist/ReactToastify.min.css"
import { Suspense } from 'react'
import { sidebarLinks } from '../../Lib/inventorySideLinks'
import { ApplicationProvider } from '../../components/application/ApplicationContextProvider'






export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html >
            <body  className='app-divider'>
                <ApplicationProvider>
                    <Suspense>
                        <ApplicationHeader sidebarLinks={sidebarLinks}>
                            {children}
                        </ApplicationHeader>
                    </Suspense>
                </ApplicationProvider>
            </body>
        </html>
    )
}


