import React from "react";
import { customFetch } from "../../../../Lib/fetcher";
import NoDataAvailable from "../../../../components/accessories/NoDataAvailable";
import DepartmentalStockRequestServing from "../../../../components/inventory/stocks/stockRequest/DepartmentalRequestList";


export default async function StockRequestDepartmentPageMainStore({ params }: { params: Promise<{ departmentid: number }> }) {
    const { departmentid } = await params;
    let requisitions = []

    try {
        const response = await customFetch(`store/departments/requisitions?id=${departmentid}&&type=pending`);
        requisitions = response?.result;
    } catch (err) {
        requisitions = []
    }


    if (requisitions.length == 0) {
        return <NoDataAvailable />
    }

    return (
        <React.Fragment>
            <div className="d-flex justify-content-between mx-2">
                <div >
                    <h4 className=" text-decoration-underline">Department Pending Requisitions</h4>
                </div>
            </div>
            <section>
                <DepartmentalStockRequestServing departmentid={departmentid} data={requisitions} />
            </section>
        </React.Fragment>
    )
}