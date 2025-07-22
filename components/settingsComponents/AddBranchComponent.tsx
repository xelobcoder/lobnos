import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { customPost, getInstitutionUsers } from '../Auth/customFetch';
import { BranchType } from '../../app/settings/branches/page';
import { toast } from 'react-toastify';

type Props = {
	update: (
		data: BranchType | null,
		message: string,
		status: string,
		isEdit: boolean
	) => void;
	isEdit?: boolean;
	editdata?: BranchType;
	resetform: () => void;
};

const branchSchema = z.object({
	name: z.string().min(3, 'Branch name must be at least 3 characters'),
	managerid: z.string().min(1, 'Please select a branch manager'),
	email: z.string().email('Invalid email address'),
	contact: z.string()
		.min(10, 'Contact must be 10 digits')
		.max(10, 'Contact must be 10 digits')
		.regex(/^\d+$/, 'Contact must contain only numbers'),
	address: z.string().min(10, 'Address must be at least 10 characters')
});

export default function AddBranchComponent({
	update,
	isEdit = false,
	editdata,
	resetform
}: Props) {
	const { control, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof branchSchema>>({
		resolver: zodResolver(branchSchema),
		defaultValues: {
			name: "",
			managerid: "",
			email: "",
			contact: "",
			address: ""
		}
	});

	const [employees, setEmployees] = React.useState<{ employeeid: string; username: string }[]>([]);

	useEffect(() => {
		getInstitutionUsers(setEmployees);
		if (isEdit && editdata) {  // Add null check
			reset(editdata);
		}
	}, [isEdit, editdata, reset]);

	const onSubmit = async (data: z.infer<typeof branchSchema>) => {
		try {
			// If editing, ensure branchid is available
			if (isEdit && (!editdata || !editdata.branchid)) {
				toast.error("Branch ID is required for editing");
				return;
			}

			// Prepare data for submission
			const submitData = isEdit && editdata 
				? { ...data, branchid: editdata.branchid }
				: data;

			const response = await customPost("branches", isEdit ? "PUT" : "POST", submitData);
			
			// Handle different response formats
			let isSuccess = false;
			let responseMessage = '';
			
			if (isEdit) {
				// For editing: {"status": true}
				isSuccess = response.status === true;
				responseMessage = isSuccess ? "Branch updated successfully!" : "Failed to update branch";
			} else {
				// For creating: {"status": "success", "message": "..."}
				isSuccess = response.status === "success";
				responseMessage = response.message || (isSuccess ? "Branch created successfully!" : "Failed to create branch");
			}
			
			if (isSuccess) {
				toast.success(responseMessage, { autoClose: 500, position: "top-center" });
				
				const branchData: BranchType = {
					...data,
					branchid: isEdit && editdata?.branchid ? editdata.branchid : 0,
					activation: isEdit && editdata?.activation ? editdata.activation : 1,
					date: new Date().toISOString()
				};
				
				update(branchData, responseMessage, "success", isEdit);
			} else {
				toast.error(responseMessage, { autoClose: 1000, position: "top-center" });
				update(null, responseMessage, "error", isEdit);
			}
		} catch (error: any) {
			const errorMessage = error.message || "An error occurred while saving branch";
			toast.error(errorMessage, { autoClose: 1000, position: "top-center" });
			update(null, errorMessage, "error", isEdit);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="d-grid gap-3">
			<div className="form-group">
				<label className="text-primary">Branch Name</label>
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<input
							{...field}
							type="text"
							className={`form-control ${errors.name ? 'is-invalid' : ''}`}
							placeholder="eg. Buipe Branch"
						/>
					)}
				/>
				{errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
			</div>

			<div className="form-group">
				<label className="text-primary">Contact</label>
				<Controller
					name="contact"
					control={control}
					render={({ field }) => (
						<input
							{...field}
							type="tel"
							className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
							placeholder="eg. 0240000000"
							maxLength={10}
							minLength={10}
						/>
					)}
				/>
				{errors.contact && <div className="invalid-feedback">{errors.contact.message}</div>}
			</div>

			<div className="form-group">
				<label className="text-primary">Email</label>
				<Controller
					name="email"
					control={control}
					render={({ field }) => (
						<input
							{...field}
							type="email"
							className={`form-control ${errors.email ? 'is-invalid' : ''}`}
							placeholder="eg. tiifuofficial@gmail.com"
						/>
					)}
				/>
				{errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
			</div>

			<div className="form-group">
				<label className="text-primary">Branch Manager</label>
				<Controller
					name="managerid"
					control={control}
					render={({ field }) => (
						<select
							{...field}
							className={`form-control ${errors.managerid ? 'is-invalid' : ''}`}
						>
							<option value="">Select Branch Manager</option>
							{employees.map((item) => (
								<option key={item.employeeid} value={item.employeeid}>
									{item.username}
								</option>
							))}
						</select>
					)}
				/>
				{errors.managerid && <div className="invalid-feedback">{errors.managerid.message}</div>}
			</div>

			<div className="form-group">
				<label className="text-primary">Address</label>
				<Controller
					name="address"
					control={control}
					render={({ field }) => (
						<textarea
							{...field}
							rows={3}
							className={`form-control ${errors.address ? 'is-invalid' : ''}`}
							placeholder="eg. Tamale Kalpohin Lowcost 30A opposite Jolly Friends Bar"
						/>
					)}
				/>
				{errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
			</div>

			<div className="d-flex gap-2 mt-3">
				<button type="submit" className="btn btn-primary btn-sm">
					Save Information
				</button>
				{isEdit && (
					<button
						type="button"
						onClick={() => {
							reset();
							resetform();
						}}
						className="btn btn-danger btn-sm"
					>
						Stop Editing
					</button>
				)}
			</div>
		</form>
	);
}
