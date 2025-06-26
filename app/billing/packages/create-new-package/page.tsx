
"use client";
import { useState } from "react";
import { customPost } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { toast } from "react-toastify";

interface PackageFormData {
    package_name: string;
}

const CreatePackageForm: React.FC = () => {
    const [formData, setFormData] = useState<PackageFormData>({ package_name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const employeeid = useApplicationSettings().applicationsettings.user.employeeid;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null); // Clear error on input change
    };

    const validateForm = (): string | null => {
        if (!formData.package_name.trim()) {
            return "Package name is required.";
        }
        if (formData.package_name.length > 100) {
            return "Package name cannot exceed 100 characters.";
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            await customPost("packages", "POST", { ...formData, created_by: employeeid });
            toast.success("Package created successfully!");
            setFormData({ package_name: "" });
            setError(null);
        } catch (error: any) {
            const errorMessage = error.message || "Failed to create package. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ package_name: "" });
        setError(null);
    };

    return (
        <div className="package-form-container">
            <style jsx>{`
                .package-form-container {
                    display: flex;
                    justify-content:center;
                    align-items: center;
                    padding: 16px;
                }
                .form-card {
                    background-color: white;
                    padding: 24px;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    width: 100%;
                    max-width: 500px;
                }
                .form-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 24px;
                    text-align: center;
                }
                .form-group {
                    margin-bottom: 16px;
                }
                .form-label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 4px;
                }
                .form-control {
                    width: 100%;
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .form-control:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
                }
                .form-control.is-invalid {
                    border-color: #dc3545;
                }
                .error-message {
                    color: #dc3545;
                    font-size: 12px;
                    margin-top: 4px;
                    display: block;
                }
                .button-group {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .btn.btn-primary {
                    padding: 8px 16px;
                    font-size: 14px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn.btn-primary:hover:not(:disabled) {
                    background-color: #0056b3;
                }
                .btn.btn-primary:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn.btn-secondary {
                    padding: 8px 16px;
                    font-size: 14px;
                    background-color: #6c757d;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .btn.btn-secondary:hover:not(:disabled) {
                    background-color: #5a6268;
                }
                .spinner-border.spinner-border-sm {
                    width: 16px;
                    height: 16px;
                    vertical-align: middle;
                    margin-right: 8px;
                }
                @media (max-width: 576px) {
                    .form-card {
                        padding: 16px;
                    }
                    .button-group {
                        flex-direction: column;
                        gap: 8px;
                    }
                    .btn.btn-primary,
                    .btn.btn-secondary {
                        width: 100%;
                    }
                }
            `}</style>

            <div className="form-card">
                <h3 className="form-title">Create New Package</h3>
                <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
                    <div className="form-group">
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
                            className={`form-control ${error ? "is-invalid" : ""}`}
                            placeholder="Enter package name"
                            aria-describedby={error ? "package_name_error" : undefined}
                            disabled={isSubmitting}
                        />
                        {error && (
                            <span id="package_name_error" className="error-message">
                                {error}
                            </span>
                        )}
                    </div>
                    <div className="button-group">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleReset}
                            disabled={isSubmitting}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            aria-label={isSubmitting ? "Creating package" : "Create package"}
                        >
                            {isSubmitting && (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                            )}
                            {isSubmitting ? "Creating..." : "Create Package"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePackageForm;
