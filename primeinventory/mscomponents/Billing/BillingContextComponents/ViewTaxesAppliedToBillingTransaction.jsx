import { useEffect, useState } from "react";
import { ViewCarousel } from "@mui/icons-material";
import { customFetch } from "../../Auth/customFetch";

export default function ViewTaxesAppliedToTransaction({ billingid, patientid }) {
    const [taxesList, setTaxesList] = useState([]);

    const fetchTaxes = async () => {
        const response = await customFetch('application/tax', 'GET');
        if (response.status === "success") {
            const filteredTaxes = response.result
                .filter(tax => tax.apply === "Yes")
                .map(tax => ({
                    id: tax.id,
                    name: tax.name,
                    valuePercentage: tax.value,
                    apply: tax.apply
                }));
            setTaxesList(filteredTaxes);
        } else {
            console.error("Failed to fetch taxes");
        }
    };

    useEffect(() => {
        fetchTaxes();
    }, []);

    return (
        <div className="mt-2">
            <div className="card">
                <div className="card-header d-flex justify-content-between">
                    <div className="card-title">
                        <h4>Tax Information</h4>
                    </div>
                    <div>
                        <button className="btn btn-primary br-0">
                            <ViewCarousel /> View
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {taxesList.length > 0 ? (
                        <table className="table mt-4">
                            <thead>
                                <tr>
                                    <th>Tax Name</th>
                                    <th>Percentage</th>
                                    <th>Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxesList.map((tax) => (
                                    <tr key={tax.id}>
                                        <td>{tax.name}</td>
                                        <td>{tax.valuePercentage}%</td>
                                        <td>{tax.apply}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div>No applicable taxes found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
