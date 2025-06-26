'use client'
import React, { useEffect, useState } from "react";
import {
	RiGift2Line,
	RiInformationLine,
	RiPercentLine,
	RiHashtag,
	RiCalendarEventLine,
	RiCheckboxCircleLine,
	RiCloseCircleLine,
	RiToggleLine
} from "@remixicon/react";
import { Card } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
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
	const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, reset } = useForm({
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
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	const onSubmit = async (data) => {
		setError("");
		setSuccess("");
		try {
			const requestData = {
				...data,
			};
			const requestUrl = 'promo-codes';
			const response: { status: boolean , error: string,id?:number } = await customPost(requestUrl, 'POST', requestData);
			if (response.status === true) {
				toast.success( "Promo code created successfully!");
				reset();
			} else {
				toast.error(response.error || "Failed to create promo code.");
			}
		} catch (err) {
			setError("Failed to create promo code.");
			toast.error("Failed to create promo code.");
		}
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
		<div className="py-4">
			<Card  >
				<Card.Header style={{ fontSize: 22, fontWeight: 600 }} className="d-flex justify-content-between align-items-center">
					<span>Create Promo Code</span>
					<a href="/settings/promos/promo-codes" className="btn btn-outline-secondary btn-sm">
						View Promo Codes List
					</a>
				</Card.Header>
				<Card.Body className="p-4">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="row g-3">
							{/* Left column */}
							<div className="col-md-6">
								<div className="mb-3">
									<label className="form-label">Code *</label>
									<input {...register("code")} className="form-control" maxLength={100} placeholder="E.g. SUMMER2025" />
									{errors.code && <div className="text-danger small">{errors.code.message}</div>}
								</div>
								<div className="mb-3">
									<label className="form-label">Description</label>
									<textarea {...register("description")} className="form-control" placeholder="Describe the promo or campaign" />
									{errors.description && <div className="text-danger small">{errors.description.message}</div>}
								</div>
								<div className="mb-3">
									<label className="form-label">Max Uses</label>
									<input {...register("max_uses")} className="form-control" type="number" min={1} placeholder="Optional" />
									{errors.max_uses && <div className="text-danger small">{errors.max_uses.message}</div>}
								</div>
								<div className="mb-3">
									<label className="form-label">Valid From *</label>
									<input {...register("valid_from")} className="form-control" type="datetime-local" />
									{errors.valid_from && <div className="text-danger small">{errors.valid_from.message}</div>}
								</div>
							</div>
							{/* Right column */}
							<div className="col-md-6">
								<div className="mb-3">
									<label className="form-label">Discount Type *</label>
									<select {...register("discount_type")} className="form-select">
										<option value="flat">Flat</option>
										<option value="percentage">Percentage</option>
									</select>
									{errors.discount_type && <div className="text-danger small">{errors.discount_type.message}</div>}
								</div>
								<div className="mb-3">
									<label className="form-label">Discount Value *</label>
									<input {...register("discount_value")} className="form-control" type="number" min={0} step="0.01" placeholder="E.g. 10 or 20.50" />
									{errors.discount_value && <div className="text-danger small">{errors.discount_value.message}</div>}
								</div>
								<div className="mb-3">
									<label className="form-label">Valid To</label>
									<input {...register("valid_to")} className="form-control" type="datetime-local" />
									{errors.valid_to && <div className="text-danger small">{errors.valid_to.message}</div>}
								</div>
								<div className="mb-3 form-check ps-0">
									<input {...register("is_active")} className="form-check-input ms-1" type="checkbox" id="is_active" />
									<label className="form-check-label ms-4" htmlFor="is_active">Active</label>
									{errors.is_active && <div className="text-danger small">{errors.is_active.message}</div>}
								</div>
							</div>
						</div>
						{error && <div className="alert alert-danger d-flex align-items-center mt-3">{error}</div>}
						{success && <div className="alert alert-success d-flex align-items-center mt-3">{success}</div>}
						<div className="d-flex justify-content-end mt-2">
							<button className="btn btn-primary px-3 py-1 d-flex align-items-center gap-2" type="submit" style={{ fontSize: 14, height: 32 }} disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Create Promo Code"}
							</button>
						</div>
					</form>
				</Card.Body>
			</Card>
		</div>
	);
}
