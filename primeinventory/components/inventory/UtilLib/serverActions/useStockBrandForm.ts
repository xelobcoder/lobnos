"use server";

import { revalidatePath } from "next/cache";
import { customPost } from "../../../../Lib/fetcher";
import { AddNewBrandFormProps } from "../../../inventoryTables/AddNewBrandForm";

export async function createNewStockBrandAction(
    creationTarget: AddNewBrandFormProps,
    formdata: FormData
) {
    const { method, stockid, brandid } = creationTarget;
    const brand = formdata.get("brand") as string;
    let pushData;

    try {
        const data = { brand, stockid };
        pushData = await customPost(
            "stock/brands",
            method,
            method === "POST" ? data : { brandid, ...data }
        );
    } catch (err: any) {
        console.log("An Error occured Here");
        return "something wrong occured saving information"
    }
    revalidatePath(`/inventory/stocks/brands?stockid=${stockid}`);



    return pushData;

}
