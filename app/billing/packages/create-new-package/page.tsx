"use client";

import { useState } from "react";
import { customPost } from "../../../../components/Auth/customFetch";
import PackagesTable from "../../../../components/Billing/packages/PackagesList";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { toast } from "react-toastify";


interface PackageFormData {
    package_name: string;
}

const CreatePackageForm: React.FC = () => {
    const [formData, setFormData] = useState<PackageFormData>({ package_name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const employeeid = useApplicationSettings().applicationsettings.user.employeeid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await customPost("packages", "POST", { ...formData, created_by: employeeid });
            toast.success("Package created successfully!");
            setFormData({ package_name: "" });
        } catch (error) {
            toast.error("Failed to create package. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="package_name" className="form-label">
                        Package Name
                    </label>
                    <input
                        type="text"
                        id="package_name"
                        name="package_name"
                        value={formData.package_name}
                        onChange={handleChange}
                        required
                        className="custom-input"
                        placeholder="Enter package name"
                    />
                </div>
                <div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            "Create Package"
                        )}
                    </button>
                </div>
            </form>
            <PackagesTable />
        </div>
    );
};

export default CreatePackageForm;
