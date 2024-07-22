import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/router";
import { customFetch, customPost } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, Card } from 'react-bootstrap';

const schema = yup.object().shape({
  name: yup.string().required("Contact person name is required"),
  email: yup.string().email("Invalid email address").required("Email is required"),
  mobile: yup.string().matches(/^[0-9]{10}$/, "Mobile number must be 10 digits").required("Mobile number is required"),
});

export default function ContactPerson() {
  const router = useRouter();
  const organizationid = router.query.id;
  const defaultData = { name: "", email: "", mobile: "" };
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: defaultData,
    resolver: yupResolver(schema),
  });

  const contactDetails = useCallback(async () => {
    try {
      if (organizationid) {
        setLoading(true);
        const response = await customFetch(`organization/contactperson?id=${organizationid}`);
        const { status, statusCode, result } = response;
        if (statusCode === 200 && status === "success" && result.length > 0) {
          setData(result[0]);
          reset(result[0]);
        }
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  }, [organizationid, reset]);

  useEffect(() => {
    contactDetails();
  }, [organizationid, contactDetails]);

  const onSubmit = async (formData) => {
    const postResponse = await customPost(`organization/update/contact`, "PUT", formData);
    const { statusCode, status, message } = postResponse;
    if (statusCode === 200 && status === "success") {
      alert(message);
    }
  };

  const renderingContact = () => {
    if (loading) return <Loader />;

    return (
      <Card className="bg-white p-4">
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="grid-reg my-2" controlId="formName">
              <Form.Label>Contact Person</Form.Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    className="custom-input"
                    type="text"
                    placeholder="Contact Person"
                    {...field}
                    isInvalid={!!errors.name}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="grid-reg my-2" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    className="custom-input"
                    type="email"
                    placeholder="Contact Email"
                    {...field}
                    isInvalid={!!errors.email}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="grid-reg my-2" controlId="formMobile">
              <Form.Label>Mobile Number</Form.Label>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <Form.Control
                    className="custom-input"
                    type="tel"
                    inputMode="tel"
                    placeholder="Mobile Number"
                    {...field}
                    isInvalid={!!errors.mobile}
                  />
                )}
              />
              <Form.Control.Feedback type="invalid">
                {errors.mobile?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="d-flex justify-content-start mt-3">
              <Button type="submit" variant="primary">
                Save Changes
              </Button>
            </Form.Group>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  return <section>{renderingContact()}</section>;
}
