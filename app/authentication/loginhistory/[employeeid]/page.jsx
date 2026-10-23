import PrimeBreadcrumb from "../../../../components/accessories/PrimeBreadCrumb";
import { customFetch } from "../../../../components/Auth/customFetch";
import ApplicationUserLoginHx from '../../../../components/settingsComponents/ApllicationUserLoginHx'
import { plsDecryption } from "../../../../lib/encryption";




export default async function ApplicationLoginHistory({ params }) {
	const { employeeid } = await params
	const decryptedEmployeeid = employeeid ? parseInt(plsDecryption(employeeid.toString())) : null;
	let history = []

	const data = await customFetch(`security/users/getlogin/history?page=1&&count=10&&employeeid=${decryptedEmployeeid}`);
	if (data && Array.isArray(data)) {
		history = data;
	}


	return (
		<div>
			<div className="p-2 br-5 bg-secondary-subtle pls-label fw-bold text-capitalize d-flex justify-content-between">
				<div className="mt-2 mx-2">
					login history
				</div>
				<div>
					<PrimeBreadcrumb links={[{ label: 'Employee Records', href: "/authentication/users" }]} />
				</div>
			</div>
			<ApplicationUserLoginHx history={history} employeeid={decryptedEmployeeid} />
		</div>
	);
}