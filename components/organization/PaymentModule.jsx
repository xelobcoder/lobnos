import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/router";
import { customFetch, customPost, organizationPaymentDefault } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { ToastContainer, toast } from "react-toastify";
import { Button, Form, Card } from 'react-bootstrap';

const schema = yup.object().shape({
  module: yup.string().required("Payment method is required"),
  commission: yup.number().positive("Commission must be a positive number").required("Commission is required"),
  momo: yup.string().when("module", {
    is: "momo",
    then: yup.string().matches(/^[0-9]{10}$/, "MoMo number must be 10 digits").required("MoMo number is required"),
  }),
  momoname: yup.string().when("module", {
    is: "momo",
    then: yup.string().required("MoMo account name is required"),
  }),
  account: yup.string().when("module", {
    is: "bank",
    then: yup.string().required("Account number is required"),
  }),
  bankname: yup.string().when("module", {
    is: "bank",
    then: yup.string().required("Bank name is required"),
  }),
  branch: yup.string().when("module", {
    is: "bank",
    then: yup.string().required("Branch is required"),
  }),
  accountname: yup.string().when("module", {
    is: "bank",
    then: yup.string().required("Account name is required"),
  }),
});

export default function PaymentModule({ organizationid }) {
  const [data, setData] = useState(organizationPaymentDefault);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: data,
    resolver: yupResolver(schema),
  });

  const getPaymentData = useCallback(async (organizationid) => {
    if (organizationid) {
      const response = await customFetch(`organization/payment?id=${organizationid}`);
      const { statusCode, status, result } = response;
      if (statusCode === 200 && status === "success" && result.length > 0) {
        setData(result[0]);
        reset(result[0]);
      }
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    if (organizationid) {
      getPaymentData(organizationid);
    }
  }, [organizationid, getPaymentData]);

  const onSubmit = async (formData) => {
    let pushResponse = await customPost(`organization/update/payment`, "PUT", { organizationid, ...formData });
    const { status, statusCode, message } = pushResponse;
    if (status === "success" && statusCode === 200) {
      toast.success(message, { autoClose: 500, position: 'top-center' });
    } else {
      toast.error(message, { autoClose: 3000, position: 'top-center' });
    }
  };

  const selectedModule = watch("module");

  const renderingPayment = () => {
    if (loading) return <Loader />;

    return (
      <Card className="bg-white p-4">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="grid-reg my-2" controlId="formModule">
              <Form.Label>Payment Method</Form.Label>
              <Controller
                name="module"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    as="select"
                    className="custom-input"
                    {...field}
                    isInvalid={!!errors.module}
                  >
                    <option value="">Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank transfer</option>
                    <option value="momo">Mobile Money</option>
                  </Form.Control>
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.module?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="grid-reg my-2" controlId="formCommission">
              <Form.Label>
                Commission <span className="label-helper">in percentage (e.g., 10%)</span>
              </Form.Label>
              <Controller
                name="commission"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    type="number"
                    className="custom-input"
                    {...field}
                    isInvalid={!!errors.commission}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.commission?.message}
              </Form.Control.Feedback>
            </Form.Group>

            {selectedModule === "momo" && (
              <>
                <Form.Group className="grid-reg my-2" controlId="formMomo">
                  <Form.Label>MoMo Account Number</Form.Label>
                  <Controller
                    name="momo"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="tel"
                        className="custom-input"
                        {...field}
                        isInvalid={!!errors.momo}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.momo?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formMomoName">
                  <Form.Label>MoMo Account Name</Form.Label>
                  <Controller
                    name="momoname"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        className="custom-input"
                        {...field}
                        isInvalid={!!errors.momoname}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.momoname?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            {selectedModule === "bank" && (
              <>
                <Form.Group className="grid-reg my-2" controlId="formAccount">
                  <Form.Label>Account Number</Form.Label>
                  <Controller
                    name="account"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        className="custom-input"
                        {...field}
                        isInvalid={!!errors.account}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.account?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formBankName">
                  <Form.Label>Bank Name</Form.Label>
                  <Controller
                    name="bankname"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        className="custom-input"
                        {...field}
                        isInvalid={!!errors.bankname}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.bankname?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formBranch">
                  <Form.Label>Branch</Form.Label>
                  <Controller
                    name="branch"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        className="custom-input"
                        {...field}
                        isInvalid={!!errors.branch}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.branch?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formAccountName">
                  <Form.Label>Account Name</Form.Label>
                  <Controller
                    name="accountname"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        type="text"
                        className="custom-input"
                        {...field}
                        isInvalid={!!errors.accountname}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.accountname?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            <Form.Group className="d-flex justify-content-start mt-3">
              <Button type="submit" variant="primary">
                Submit
              </Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div>
      <ToastContainer theme="colored" />
      {renderingPayment()}
    </div>
  );
}
