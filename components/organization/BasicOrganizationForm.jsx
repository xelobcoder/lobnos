import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { regions, organizationDefaultBasicInfo, handleResponse, customFetch, customPost, validateFormData } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, InputGroup, Card } from 'react-bootstrap';


const schema = yup.object().shape({
    name: yup.string().required("Organization name is required"),
    location: yup.string(),
    street: yup.string(),
    mobile: yup.string()
        .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
        .required("Mobile number is required"),
    address: yup.string(),
    email: yup.string().email("Invalid email address"),
    website: yup.string().url("Invalid URL"),
    gpsmapping: yup.string(),
    region: yup.string(),
});

export default function OrganizationBasicForm({ organizationid }) {
    const [data, setData] = useState(organizationDefaultBasicInfo);
    const [message, setMessage] = useState("Add new organization");
    const [isloading, setLoading] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: organizationDefaultBasicInfo,
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (organizationid) {
            setMessage("Update organization basic information");
            getOrganizationData();
        }
    }, [organizationid]);

    const getOrganizationData = useCallback(() => {
        setLoading(true);
        customFetch(`organization/basic?id=${organizationid}`)
            .then((response) => {
                const { statusCode, status, result } = response;
                if (statusCode === 200 && status === "success") {
                    setData(result[0]);
                    reset(result[0]);
                }
                setLoading(false);
            })
            .catch(() => {
                setData(organizationDefaultBasicInfo);
                alert("Error getting data;");
                setLoading(false);
            });
    }, [organizationid, reset]);

    const onSubmit = async (formData) => {
        if (!organizationid) {
            validateFormData(formData, false, ["name", "mobile"], "new/organizations", handleResponse);
        } else {
            const updateInfo = await customPost("organization/update/basic", "PUT", formData);
            alert(updateInfo?.message);
        }
    };

    const renderingFormView = () => {
        if (isloading) return <Loader />;
        return (
            <Card className="bg-white p-4">
                <Card.Header className="bg-secondary text-white">
                    <h5>{message}</h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Form.Group className="grid-reg my-2" controlId="formName">
                            <Form.Label>Organization name</Form.Label>
                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <InputGroup>
                                        <Form.Control
                                            className="custom-input"
                                            type="text"
                                            placeholder="Organization name"
                                            {...field}
                                            isInvalid={!!errors.name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.name?.message}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formLocation">
                            <Form.Label>Location</Form.Label>
                            <Controller
                                name="location"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="Location"
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formStreet">
                            <Form.Label>Street name</Form.Label>
                            <Controller
                                name="street"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="Street name"
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formMobile">
                            <Form.Label>Mobile number</Form.Label>
                            <Controller
                                name="mobile"
                                control={control}
                                render={({ field }) => (
                                    <InputGroup>
                                        <Form.Control
                                            className="custom-input"
                                            type="tel"
                                            inputMode="tel"
                                            placeholder="0595964565"
                                            {...field}
                                            isInvalid={!!errors.mobile}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.mobile?.message}
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formAddress">
                            <Form.Label>Address</Form.Label>
                            <Controller
                                name="address"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="Kalpohin lowcost 30A"
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        type="email"
                                        placeholder="mylab@ymail.com"
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formWebsite">
                            <Form.Label>Website</Form.Label>
                            <Controller
                                name="website"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="mylab.com"
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formGpsMapping">
                            <Form.Label>GPS Address</Form.Label>
                            <Controller
                                name="gpsmapping"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        type="text"
                                        placeholder="NS-1004-383"
                                        {...field}
                                    />
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="grid-reg my-2" controlId="formRegion">
                            <Form.Label>Region</Form.Label>
                            <Controller
                                name="region"
                                control={control}
                                render={({ field }) => (
                                    <Form.Control
                                        className="custom-input"
                                        as="select"
                                        {...field}
                                    >
                                        <option value="">Select a region</option>
                                        {regions.map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </Form.Control>
                                )}
                            />
                        </Form.Group>

                        <Form.Group className="d-flex justify-content-start mt-3">
                            <Button type="submit" variant="primary">
                                Save Organization
                            </Button>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>
        );
    };

    return (
        <div className="p-3">
            {renderingFormView()}
        </div>
    );
}
