import { useState, useEffect } from "react";
import { createNewStockBrandAction } from "../inventory/UtilLib/serverActions/useStockBrandForm";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { toast } from "react-toastify";

export interface AddNewBrandFormProps {
    method: "POST" | "PUT",
    brandid: number,
    stockid: number,
    brand: string
}

interface FormInputs {
    brand: string;
}

export default function AddNewBrandForm({ method, brandid, stockid, brand }: AddNewBrandFormProps) {
    const [pending, setPending] = useState(false);
    const [editableBrand, setEditableBrand] = useState(brand || "");

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormInputs>({
        defaultValues: {
            brand: editableBrand,
        },
    });

    useEffect(() => {
        // If the brand prop changes, update the state
        setEditableBrand(brand);
    }, [brand]);

    const creationTarget = { method, brandid, stockid } as AddNewBrandFormProps;

    const onSubmit: SubmitHandler<FormInputs> = async (data) => {
        setPending(true);
        const formdata = new FormData();
        formdata.append("brand", data.brand);

        try {
            const response = await createNewStockBrandAction(creationTarget, formdata);
            const { statusCode, message, status } = response;
            if (statusCode === 200 && status === "success") {
                toast.success(message, { autoClose: 500 });
            }
            setPending(false);
        } catch (error) {
            setPending(false);
            console.log(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="my-2 mx-3">
                <label>Brand Name</label>
                <Controller
                    name="brand"
                    control={control}
                    rules={{ required: "Brand is required" }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="custom-input"
                            type="text"
                            value={editableBrand}
                            onChange={(e) => {
                                setEditableBrand(e.target.value); // Update the state when the input changes
                                field.onChange(e); // Update the react-hook-form state
                            }}
                            required
                        />
                    )}
                />
                {errors.brand && <div className="text-danger">{errors.brand.message}</div>}

                <button
                    type="submit"
                    className="btn btn-primary btn-sm mt-2"
                    disabled={pending}
                >
                    {pending ? "Saving..." : "Save Brand"}
                </button>
            </div>
        </form>
    );
}
