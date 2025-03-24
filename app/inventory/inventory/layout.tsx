import ApplicationHeader from '../../components/accessories/ApplicationHeader'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../../node_modules/react-toastify/dist/ReactToastify.min.css';
import '../../styles/global.css'
import { sidebarLinks } from '../../Lib/inventorySideLinks'
import { Suspense } from 'react'
import { ApplicationProvider } from '../../components/application/ApplicationContextProvider';





export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html>
			<body className='app-divider'>
				<Suspense>
					<ApplicationProvider>
						<ApplicationHeader sidebarLinks={sidebarLinks}>
							{children}
						</ApplicationHeader>
					</ApplicationProvider>
				</Suspense>
			</body>
		</html>
	)
}


