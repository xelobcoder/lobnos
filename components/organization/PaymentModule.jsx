import React, { useCallback, useEffect, useState } from "react";
import { customFetch, customPost, organizationPaymentDefault } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { ToastContainer, toast } from "react-toastify";
import { Button, Form, Card } from 'react-bootstrap';

export default function PaymentModule({ organizationid }) {
  const [data, setData] = useState(organizationPaymentDefault);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(organizationPaymentDefault);

  // Fetch payment data
  const getPaymentData = useCallback(async (organizationid) => {
    if (organizationid) {
      try {
        const result = await customFetch(`organization/payment?id=${organizationid}`);
        if (Array.isArray(result) && result.length > 0) {
          setData(result[0]);
          setFormData(result[0]);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (organizationid) {
      getPaymentData(organizationid);
    }
  }, [organizationid, getPaymentData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };


  const validateForm = () => {
    let formErrors = {};
    let isValid = true;


    if (!formData.module) {
      formErrors.module = "Payment method is required";
      isValid = false;
    }
    if (!formData.commission || isNaN(formData.commission) || formData.commission <= 0) {
      formErrors.commission = "Commission must be a positive number";
      isValid = false;
    }

    if (formData.module === "momo") {
      if (!formData.momo || !/^[0-9]{10}$/.test(formData.momo)) {
        formErrors.momo = "MoMo number must be 10 digits";
        isValid = false;
      }
      if (!formData.momoname) {
        formErrors.momoname = "MoMo account name is required";
        isValid = false;
      }
    } else if (formData.module === "bank") {
      if (!formData.account) {
        formErrors.account = "Account number is required";
        isValid = false;
      }
      if (!formData.bankname) {
        formErrors.bankname = "Bank name is required";
        isValid = false;
      }
      if (!formData.branch) {
        formErrors.branch = "Branch is required";
        isValid = false;
      }
      if (!formData.accountname) {
        formErrors.accountname = "Account name is required";
        isValid = false;
      }
    }

    setErrors(formErrors);
    return isValid;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const pushResponse = await customPost(`organization/update/payment`, "PUT", { organizationid, ...formData });
        const { status, statusCode, message } = pushResponse;
        if (status === true) {
          toast.success('updated successfully');
        } else {
          toast.error('something wrong occured');
        }
      } catch (err) {
        toast.error("An error occurred");
      }
    }
  };

  // Render form
  const renderingPayment = () => {
    if (loading) return <Loader />;

    return (
      <Card className="bg-white p-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="grid-reg my-2" controlId="formModule">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control
                as="select"
                className="custom-input"
                name="module"
                value={formData.module}
                onChange={handleInputChange}
                isInvalid={!!errors.module}
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank transfer</option>
                <option value="momo">Mobile Money</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                {errors.module}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="grid-reg my-2" controlId="formCommission">
              <Form.Label>
                Commission <span className="label-helper">in percentage (e.g., 10%)</span>
              </Form.Label>
              <Form.Control
                type="number"
                className="custom-input"
                name="commission"
                value={formData.commission}
                onChange={handleInputChange}
                isInvalid={!!errors.commission}
              />
              <Form.Control.Feedback type="invalid">
                {errors.commission}
              </Form.Control.Feedback>
            </Form.Group>

            {formData.module === "momo" && (
              <>
                <Form.Group className="grid-reg my-2" controlId="formMomo">
                  <Form.Label>MoMo Account Number</Form.Label>
                  <Form.Control
                    type="tel"
                    className="custom-input"
                    name="momo"
                    value={formData.momo}
                    onChange={handleInputChange}
                    isInvalid={!!errors.momo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.momo}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formMomoName">
                  <Form.Label>MoMo Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    name="momoname"
                    value={formData.momoname}
                    onChange={handleInputChange}
                    isInvalid={!!errors.momoname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.momoname}
                  </Form.Control.Feedback>
                </Form.Group>
              </>
            )}

            {formData.module === "bank" && (
              <>
                <Form.Group className="grid-reg my-2" controlId="formAccount">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    name="account"
                    value={formData.account}
                    onChange={handleInputChange}
                    isInvalid={!!errors.account}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.account}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formBankName">
                  <Form.Label>Bank Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    name="bankname"
                    value={formData.bankname}
                    onChange={handleInputChange}
                    isInvalid={!!errors.bankname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.bankname}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formBranch">
                  <Form.Label>Branch</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    isInvalid={!!errors.branch}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.branch}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="grid-reg my-2" controlId="formAccountName">
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    name="accountname"
                    value={formData.accountname}
                    onChange={handleInputChange}
                    isInvalid={!!errors.accountname}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.accountname}
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
      <ToastContainer theme="colored" className='text-sm' position="top-center" autoClose={2000} />
      {renderingPayment()}
    </div>
  );
}
