import { currencyFormatter, limsfetch } from "../../../Lib/fetcher";
export default async function PreviewTestInformation({ testId }) {
    const isLoading = false;
    let testInformation = {}
    if (testId) {
        testInformation = await limsfetch(`gettestpanel/edit?id=${testId}`)
    }




    if (isLoading || !testId) {
        return (
            <div className="heightedBorder pls-color p-2 bg-secondary-subtle d-flex justify-content-center">
                {"<"}Loading Test Information...{">"}
            </div>
        );
    }

    return (
        <div>
            <ul className="list-group m-0 pls-color">
                <li className="list-group-item bg-secondary-subtle fw-bold">
                    Test Name: {testInformation?.name} ({testInformation?.shorttext})
                </li>

                <div className="list-group-item">
                    <div className="d-flex flex-column flex-md-row justify-content-between">
                        <span>Department: {testInformation?.department}</span>
                        <span>Price: {currencyFormatter.format(testInformation?.price)}</span>
                    </div>
                </div>

                <div className="list-group-item">
                    <div className="d-flex flex-column flex-md-row justify-content-between">
                        <span>Test Cost: {currencyFormatter.format(testInformation?.testcost)}</span>
                        <span>Sample Quantity: {testInformation?.qty_required} {testInformation?.unit}</span>
                    </div>
                </div>

                <div className="list-group-item">
                    <div className="d-flex flex-column flex-md-row justify-content-between">
                        <span>Sample Container: {testInformation?.sample_container}</span>
                        <span>Department Manager: {testInformation?.departmentManager}</span>
                    </div>
                </div>

                <div className="list-group-item">
                    <div className="d-flex flex-column flex-md-row justify-content-between">
                        <span>Outsourced: {testInformation?.isoutsourced ? "Yes" : "No"}</span>
                    </div>
                </div>
            </ul>
        </div>
    );
}
