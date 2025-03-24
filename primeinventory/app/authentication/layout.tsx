import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import "../../styles/global.css"
import '../../styles/login.css'
export const metadata = {
	title: 'login',
	description: 'Authentication Prime Inventory System',
}
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body
				className="vh-100 bg-body-secondary"
			>
				<div>
					<h4 className="text-white bg-dark p-4">Prime Inventory System</h4>
				</div>
				<div className='' style={{ marginTop: "50px" }}>
					{children}
				</div>
				<div>
					<footer className="text-center mt-4">
						<small>Copyright Prime Inventory System Version 0.0.1</small>
					</footer>
				</div>
			</body>
		</html>
	);
}
