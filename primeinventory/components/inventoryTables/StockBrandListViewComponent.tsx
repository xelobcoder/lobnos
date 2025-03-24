import React from "react";
import { BrandType } from "./StocksBrandList";


interface StockBrandListViewComponentProps {
    brands: BrandType[] | undefined;
    onDelete: (brand: BrandType) => void;
    onEdit: (brand: BrandType) => void;
}

const StockBrandListViewComponent: React.FC<StockBrandListViewComponentProps> = ({
    brands,
    onDelete,
    onEdit,
}) => {
    if (!brands || !Array.isArray(brands) || brands.length === 0) {
        return <div className="alert alert-info text-center">No Brand Available</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover text-sm table-bordered align-middle">
                <thead>
                    <tr>
                        <th>Date Added</th>
                        <th>Brand</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {brands.map((item) => (
                        <tr key={item.brandid}>
                            <td className="text-sm text-capitalize">{new Date(item.created_on).toLocaleDateString()}</td>
                            <td className="text-sm text-capitalize">{item.brand}</td>
                            <td className="text-sm text-capitalize">
                                <button
                                    className="btn btn-sm btn-outline-primary mx-1"
                                    onClick={() => onEdit(item)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-danger mx-1"
                                    onClick={() => onDelete(item)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockBrandListViewComponent;
