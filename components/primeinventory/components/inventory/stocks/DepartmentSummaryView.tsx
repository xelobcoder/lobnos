import Link from "next/link";
import CardRacks from "../../accessories/CardRack";
import { DepartmentSummaryPendingItem } from "../../interfaces/departmentInterface";
export default function DepartmentSummaryPendingView({ data }: { data: any[] }) {
	return (
		<div className={data.length == 0 ? "" : "d-flex "}>
			{data.length > 0 ? (
				data.map((item: DepartmentSummaryPendingItem, index) => {
					return (
						<div className="col-4 mx-2" key={index}>
							<CardRacks
								key={item?.departmentid}
								header={<h5 className="m-0">{item.department}</h5>}
								body={<Link className=" text-decoration-none text-dark" href={`/inventory/stockrequest/${item.departmentid}`}><h1 className="mx-3 ">{item?.pending}</h1></Link>}
							/>
						</div>
					);
				})
			) : (
				<div className="alert alert-info mx-2">
					<h3>No Pending Requisitions</h3>
				</div>
			)}
		</div>
	);
}
