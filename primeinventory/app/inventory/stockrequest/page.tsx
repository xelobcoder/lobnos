import React from "react";
import { customFetch } from "../../../Lib/fetcher";
import DepartmentSummaryPendingView from "../../../components/inventory/stocks/DepartmentSummaryView";
import { DepartmentSummaryPendingItem } from "../../../components/interfaces/departmentInterface";


export default async function StockRequestPage() {
    let departments: DepartmentSummaryPendingItem[] = []
    const response = await customFetch(`departments/requisitions/summary`);
    departments = response.result;



    return (
        <React.Fragment>
            <div className="d-flex justify-content-between mx-2">
                <div >
                    <h4>Department Pending Requisitions</h4>
                </div>
            </div>
            <section>
                <DepartmentSummaryPendingView data={departments} />
            </section>
        </React.Fragment>
    )
}