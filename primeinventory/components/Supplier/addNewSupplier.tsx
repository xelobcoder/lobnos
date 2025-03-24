"use client";
import React, { useState, useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { regions } from "../../Lib/regions";
import { defaultSupplierdata, pushNewSupplierInformation } from "./util";
import { toast, ToastContainer } from "react-toastify";
import { SupplierFormValues } from "../../app/purchasemanagement/suppliers/newsuppliers/page";

interface SupplierFormProps {
      supplierid: number | null;
      isEditing: boolean;
      supplierInformation: null | SupplierFormValues;
}

const schema = yup.object().shape({
      name: yup.string().required("Name is required"),
      address: yup.string().optional(),
      email: yup
            .string()
            .email("Invalid email format")
            .required("Email is required"),
      phonenumber: yup
            .string()
            .length(10, "Phone number must be exactly 10 digits")
            .matches(/^\d{10}$/, "Phone number must contain only digits")
            .required("Phone number is required"),
      region: yup.string().optional(),
      contactperson: yup.string().optional(),
});

const ADD_NEW_SUPPLIER: React.FC<SupplierFormProps> = ({
      supplierid,
      isEditing,
      supplierInformation,
}) => {
      const {
            register,
            setValue,
            handleSubmit,
            reset: resetForm,
            formState: { errors },
      } = useForm<SupplierFormValues>({
            resolver: yupResolver(schema),
            defaultValues: defaultSupplierdata,
      });

      const [loading, setLoading] = useState(false);

      useEffect(() => {
            resetForm(supplierInformation as SupplierFormValues);
      }, [isEditing, supplierid]);

      const onSubmit = async (data: SupplierFormValues) => {
            try {
                  setLoading(true);
                  type responseType = {
                        status: boolean;
                        statusCode?: number;
                        message?: string;
                  };

                  const method = isEditing ? "PUT" : "POST";
                  const response = (await pushNewSupplierInformation(
                        method,
                        data,
                        supplierid as number
                  )) as responseType | boolean

                  if (typeof response === "boolean") {
                        toast.error("Something went wrong");
                  } else if (typeof response.status == "string" && !response.statusCode) {
                        toast.error(response.status || "Operation failed");
                  }
                  else if (method === "POST" && response.status === true) {
                        toast.success("Operation successful");
                        resetForm();
                  } else if (method === "PUT" && response.status && response.statusCode === 200) {
                        toast.success(response.message || "Operation successful");
                        resetForm();
                  } else {
                        toast.error("Operation failed");
                  }
            } catch (error) {
                  console.error("Error submitting form:", error);
                  toast.error("Submission failed");
            } finally {
                  setLoading(false);
            }
      };

      const renderingView = () => {
            return (
                  <div>
                        <div className="d-flex justify-content-between">
                              <h5>{isEditing ? "Update Supplier Information" : "Add New Supplier"}</h5>
                              {isEditing && (
                                    <button
                                          onClick={() => resetForm(defaultSupplierdata)}
                                          className="btn btn-danger btn-sm"
                                    >
                                          Reset
                                    </button>
                              )}
                        </div>
                        <hr />
                        <form onSubmit={handleSubmit(onSubmit)}>
                              {[
                                    { label: "Name", name: "name", type: "text", required: true },
                                    { label: "Email", name: "email", type: "email", required: true },
                                    { label: "Phone Number", name: "phonenumber", type: "tel", required: true },
                                    { label: "Address", name: "address", type: "text", required: false },
                              ].map(({ label, name, type, required }) => (
                                    <div key={name} className="form-group my-2  d-block d-lg-flex">
                                          <label className="my-1 col-1" htmlFor={name}>
                                                {label}
                                          </label>
                                          <input
                                                className="custom-input"
                                                type={type}
                                                {...register(name as keyof SupplierFormValues)}
                                                placeholder={label}
                                          />
                                          {errors[name as keyof SupplierFormValues] && (
                                                <small className="text-danger">
                                                      {errors[name as keyof SupplierFormValues]?.message}
                                                </small>
                                          )}
                                    </div>
                              ))}
                              <div className="form-group my-2 d-block d-lg-flex">
                                    <label className="my-1 col-1 " htmlFor="region">
                                          Region
                                    </label>
                                    <select
                                          className="custom-select"
                                          {...register("region")}
                                    >
                                          <option value="">Select region</option>
                                          {regions.map((item, index) => (
                                                <option key={index} value={item}>
                                                      {item}
                                                </option>
                                          ))}
                                    </select>
                                    {errors.region && (
                                          <small className="text-danger">{errors.region.message}</small>
                                    )}
                              </div>
                              <div className="form-group my-2 d-flex mt-2">
                                    <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
                                          {loading ? (
                                                <>
                                                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                      {isEditing ? "Updating..." : "Adding..."}
                                                </>
                                          ) : (
                                                isEditing ? "Update Supplier Information" : "Add New Supplier"
                                          )}
                                    </button>
                              </div>
                        </form>
                  </div>
            );
      };

      return (
            <div className="p-2">
                  <ToastContainer theme="colored" position="top-center" className="text-sm" />
                  {renderingView()}
            </div>
      );
};

export default ADD_NEW_SUPPLIER;
