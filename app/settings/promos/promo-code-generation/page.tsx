'use client'
import React, { useEffect, useState, useRef } from "react";
import ui from "../../../../components/settings/SettingsWorkspace.module.css";
import { RiCouponLine, RiFileTextLine, RiHashtag, RiCalendarEventLine, RiPercentLine, RiMoneyDollarCircleLine, RiTimeLine, RiCheckboxCircleLine } from "@remixicon/react";
import { customPost } from "../../../../components/Auth/customFetch";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const promoSchema = z.object({
	code: z.string().min(1, "Code is required").max(100),
	description: z.string().optional(),
	campaign_id: z.union([z.string(), z.number()]).nullable().optional(),
	discount_type: z.enum(["flat", "percentage"]),
	discount_value: z.union([z.string(), z.number()]).refine(val => Number(val) > 0, { message: "Discount value must be greater than 0" }),
	max_uses: z.union([z.string(), z.number()]).optional(),
	is_active: z.boolean(),
	valid_from: z.string().min(1, "Valid from is required"),
	valid_to: z.string().optional(),
});

export default function PromoCodeGenerationForm() {
	const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, reset } = useForm<z.input<typeof promoSchema>>({
		resolver: zodResolver(promoSchema),
		defaultValues: {
			code: "",
			description: "",
			campaign_id: null,
			discount_type: "flat",
			discount_value: "",
			max_uses: "",
			is_active: true,
			valid_from: "",
			valid_to: "",
		},
	});
	const saveLock=useRef(false);
    const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	const onSubmit = async (data: z.infer<typeof promoSchema>) => {
        if(saveLock.current)return;
        if(data.valid_to && data.valid_to < data.valid_from){setError("Valid to must follow valid from.");return;}
        if(data.discount_type==="percentage" && Number(data.discount_value)>100){setError("Percentage discounts cannot exceed 100%.");return;}
        saveLock.current=true;
		setError("");
		setSuccess("");
		try {
			const requestData = {
				...data,
			};
			const requestUrl = 'promo-codes';
			const response: { status: boolean, error: string, id?: number } = await customPost(requestUrl, 'POST', requestData);
			if (response.status === true) {
				setSuccess("Promo code created successfully!");
				reset();
			} else {
				setError(response.error || "Failed to create promo code.");
			}
		} catch (err) {
			setError("Failed to create promo code.");
			} finally {saveLock.current=false;}
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			const params = new URLSearchParams(window.location.search);
			const campaignId = params.get("campaignId");
			let campaignIdNumber: number | null = null;
			if (campaignId && !isNaN(Number(campaignId))) {
				campaignIdNumber = Number(campaignId);
			}
			setValue("campaign_id", campaignIdNumber as any);
		}
	}, [setValue]);

	return (
		<div className={ui.workspace}>
			<div className="border border-1 br-5 bg-white p-4">
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h4 className="mb-0 fw-bold">Create Promo Code</h4>
					<a href="/settings/promos/promo-codes" className="btn btn-outline-secondary btn-sm">
						View Promo Codes List
					</a>
				</div>
				<form onSubmit={handleSubmit(onSubmit)}><fieldset disabled={isSubmitting}>
					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiCouponLine size={16} className="me-2" />
							Code *
						</label>
						<div >
							<input {...register("code")} className="form-control" maxLength={100} placeholder="E.g. SUMMER2025" aria-label="Promo Code" />
							{errors.code && <div className="text-danger small">{errors.code.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiFileTextLine size={16} className="me-2" />
							Description
						</label>
						<div >
							<textarea {...register("description")} className="form-control" placeholder="Describe the promo or campaign" aria-label="Description" />
							{errors.description && <div className="text-danger small">{errors.description.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiHashtag size={16} className="me-2" />
							Max Uses
						</label>
						<div >
							<input {...register("max_uses")} className="form-control" type="number" min={1} placeholder="Optional" aria-label="Max Uses" />
							{errors.max_uses && <div className="text-danger small">{errors.max_uses.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiCalendarEventLine size={16} className="me-2" />
							Valid From *
						</label>
						<div >
							<input {...register("valid_from")} className="form-control" type="datetime-local" aria-label="Valid From" />
							{errors.valid_from && <div className="text-danger small">{errors.valid_from.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiPercentLine size={16} className="me-2" />
							Discount Type *
						</label>
						<div >
							<select {...register("discount_type")} className="form-select" aria-label="Discount Type">
								<option value="flat">Flat</option>
								<option value="percentage">Percentage</option>
							</select>
							{errors.discount_type && <div className="text-danger small">{errors.discount_type.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiMoneyDollarCircleLine size={16} className="me-2" />
							Discount Value *
						</label>
						<div >
							<input {...register("discount_value")} className="form-control" type="number" min={0} step="0.01" placeholder="E.g. 10 or 20.50" aria-label="Discount Value" />
							{errors.discount_value && <div className="text-danger small">{errors.discount_value.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiTimeLine size={16} className="me-2" />
							Valid To
						</label>
						<div >
							<input {...register("valid_to")} className="form-control" type="datetime-local" aria-label="Valid To" />
							{errors.valid_to && <div className="text-danger small">{errors.valid_to.message}</div>}
						</div>
					</div>

					<div className="form-row grid-reg mb-3">
						<label className="pls-label">
							<RiCheckboxCircleLine size={16} className="me-2" />
							Active
						</label>
						<div >
							<div className="form-check">
								<input {...register("is_active")} className="form-check-input" type="checkbox" id="is_active" aria-label="Is Active" />
								<label className="form-check-label ms-2" htmlFor="is_active">Active</label>
							</div>
							{errors.is_active && <div className="text-danger small">{errors.is_active.message}</div>}
						</div>
					</div>

					{error && <div role="alert" className="alert alert-danger d-flex align-items-center mt-3">{error}</div>}
					{success && <div role="status" className="alert alert-success d-flex align-items-center mt-3">{success}</div>}

					<div className="form-row grid-reg mt-4">
						<div>
							<button className="btn btn-primary d-flex" type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Create Promo Code"}
							</button>
						</div>
					</div>
				</fieldset></form>
			</div>
		</div>
	);
}
