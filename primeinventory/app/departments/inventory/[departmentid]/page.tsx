import DepartmentStockLevel from '../../../../components/inventory/departmentStockLevel';
import { customFetch } from '../../../../Lib/fetcher';
type AuthMini = {
	username: string,
	employeeid: number,
	role: string
}
export default async function DepartmentalStockLevelCustom({ params }: { params: Promise<{ departmentid: number } >}) {
	const { departmentid } = await params
	let stocks = [];

	if (departmentid) {
		const response = await customFetch(`departments/stocks?id=${departmentid}`);
		const { result } = response;
		stocks = result;
	}


	const user: AuthMini = { username: 'tiifu', employeeid: 3, role: 'admin' }

	if (stocks.length == 0) return <div className='p-3 heightedBorder bg-secondary-subtle '>No Stocks Available</div>


	return (
		<div>
			<DepartmentStockLevel auth={user} datasource={stocks || []} departmentId={departmentid} />
		</div>
	)
}
