"use client"
import { useCallback, useEffect, useState } from "react";
import AddNewBrandForm from './AddNewBrandForm'
import StockBrandListViewComponent from "./StockBrandListViewComponent"
import { ToastContainer, toast } from "react-toastify";
import { customPost } from "../../Lib/fetcher";
import { getDataAndUpdateState } from "../inventory/Util";
import Loader from "../accessories/Loader";
import RacKCard from "../accessories/CardRack";
export interface StockBrandListProps {
    id: number;
    stockname: number;
}

export type BrandType = {
    brandid: number;
    stockid: string;
    brand: string;
    created_on: string; updated_on: string | null
}
interface EditingState {
    edit: boolean;
    data: Pick<BrandType, 'brandid' | "brand">
}



export default function StockBrandList({ id, stockname }: StockBrandListProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [brands, setBrands] = useState<BrandType[]>([]);
    const [editing, setEditing] = useState<EditingState>({ edit: false, data: { brandid: 0, brand: '' } });

    const getBrands = useCallback(async () => {
        getDataAndUpdateState({ setfxn: setBrands, endpoint: `stock/brands?stockid=${id}` })
            .then(() => setLoading(false))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (id) {
            getBrands();
        }
    }, [getBrands, id]);

    const updateBrand = async (ev: React.FormEvent, brand: string, httpMethod: "POST" | "PUT") => {
        ev.preventDefault();
        if (!id) {
            window.history.back();
            return;
        }
        if (brand.length === 0) {
            toast.error("Please fill the field with the brand name", { autoClose: 3000 });
            return;
        }
        const pushData = await customPost(
            "stock/brands",
            httpMethod,
            httpMethod === "POST" ? { brand, stockid: id } : brand
        );
        const { statusCode, message, status } = pushData;
        if (statusCode === 200 && status === "success") {
            toast.success(message, { autoClose: 500 });
            getBrands();
        }
    };

    const onEdit = (brand: BrandType) => {
        if (!brand) return;
        setEditing({ edit: true, data: brand });
    };

    const onDelete = async (data: BrandType) => {
        const { brandid, stockid } = data;
        if (!brandid || !stockid) return;
        setLoading(true);
        const pushDelete = await customPost("stock/brands", "DELETE", { brandid, stockid });
        const { statusCode, message, status } = pushDelete;
        if (statusCode === 200 && status === "success") {
            toast.success(message, { autoClose: 500 });
            const updatedBrands = brands.filter(
                (item) => !(item.brandid === brandid && item.stockid === stockid)
            );
            setBrands(updatedBrands);
            setLoading(false);
            return;
        }
        toast.error(message, { autoClose: 500 });
        setLoading(false);
    };

    if (loading) return <Loader />

    return (
        <>
            <ToastContainer />
            <section className="d-lg-flex">
                <div className="list-group col-12 col-lg-6">
                    <RacKCard
                        header={<h5 className="text-uppercase">{stockname} Brands</h5>}
                        body={
                            <StockBrandListViewComponent
                                onEdit={onEdit}
                                onDelete={onDelete}
                                brands={brands}
                            />
                        }
                    />
                </div>
                <div className="col-6  col-12 col-lg-6 mx-lg-2">
                    <RacKCard
                        header={<h5 className="text-uppercase">Add new Brand</h5>}
                        style={{ height: "max-content" }}
                        body={<AddNewBrandForm
                            stockid={id}
                            brand={editing.data.brand || ""}
                            method={editing.edit ? 'PUT' : 'POST'}
                            brandid={editing.data.brandid} />}
                    />
                </div>
            </section>
        </>
    );
}
