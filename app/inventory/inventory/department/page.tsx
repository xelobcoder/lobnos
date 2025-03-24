import Link from "next/link";
import { DepartmentList } from "../../../components/interfaces/departmentInterface";

export default async function DepartmentRequisitionHomepage() {
	let departmentList: DepartmentList[] = [];
	let error: string | null = null;

	try {
		const response = await fetch(`http://localhost:5000/api/v1/departments`);
		const res = await response.json();
		const { status, data, statusCode } = res;

		if (status === "success" && statusCode === 200) {
			departmentList = data;
		}
	} catch (err: unknown) {
		error = err instanceof Error ? err.message : "An unknown error occurred.";
	}

	if (error) {
		return (
			<div className="container p-5">
				<h3>Error</h3>
				<div className="alert alert-danger">{error}</div>
			</div>
		);
	}

	if (departmentList.length === 0) {
		return (
			<div className="container p-5">
				<h3>No Departments Found</h3>
			</div>
		);
	}

	return (
		<div className="container p-5">
			<h3>Departments</h3>
			<div className="list-group">
				{departmentList.map((item, index) => (
					<div
						key={index}
						className="list-group-item d-flex justify-content-between"
					>
						<span>{item.department}</span>
						<span className="btn btn-sm btn-primary">
							<Link
								href={`/departments/inventory/${item.id}`}
								className="text-white text-decoration-none"
							>
								Visit
							</Link>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
