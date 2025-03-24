import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { customPost, getDataAndUpdateState } from "../../components/Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, InputGroup, Card, Row, Col } from 'react-bootstrap';

const schema = yup.object().shape({
  name: yup.string().required("Clinician name is required"),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  email: yup.string().email("Invalid email address"),
  organization: yup.number().required("Organization is required"),
  location: yup.string(),
  address: yup.string(),
  occupation: yup.string(),
  image: yup.mixed().required("Image is required").test("fileSize", "Image size is too large", value => !value || value.size <= 5 * 1024 * 1024) // 5MB limit
});

export default function BasicInformationClinician({ method, toast, editing, editid, reset, updateItem }) {
  const [OrganizationList, setOrganization] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [dragging, setDragging] = useState(false);

  const defaultData = {
    id: editid,
    name: "",
    phone: "",
    email: "",
    organization: 0,
    location: "",
    address: "",
    occupation: "",
    image: null,
  };

  const { control, handleSubmit, reset: resetForm, formState: { errors }, setValue } = useForm({
    defaultValues: defaultData,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (editing && editid) {
      setLoading(true);
      getDataAndUpdateState(setData, `clinicians/getclinician?id=${editid}`, true)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            resetForm(data[0]);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          toast.error("Error getting data;");
        });
    }
  }, [editid, editing, resetForm, toast]);

  useEffect(() => {
    getDataAndUpdateState(setOrganization, "organization");
  }, []);

  const onSubmit = async (formData) => {
    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    try {
      const response = await customPost("clinicians", method, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { statusCode, status, message } = response;
      if (statusCode === 200 && status === "success") {
        toast.success(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
        updateItem(formData, 3);
        reset();
      } else {
        toast.error(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Submission failed, please try again.", { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setValue("image", file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setValue("image", file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragging(false);
  };

  const renderingFormView = () => {
    if (isloading) return <Loader />;
    return (
      <Card.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={4}>
              {/* Image Upload */}
              <Form.Group>
                <Form.Label>Upload Image</Form.Label>
                <div
                  style={{
                    height: '300px',
                    width: '100%',
                    border: '2px dashed #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: dragging ? '#f0f0f0' : '#fff',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('fileInput').click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%' }} className="img-thumbnail" />
                  ) : (
                    <span>Drag & drop or click to select an image</span>
                  )}
                </div>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {errors.image && <Form.Text className="text-danger">{errors.image.message}</Form.Text>}
              </Form.Group>
            </Col>
            <Col md={8}>
              {/* Form Fields */}
              <Form.Group className="grid-reg my-2" controlId="formName">
                <Form.Label>Clinician Name</Form.Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <InputGroup>
                      <Form.Control
                        className="custom-input"
                        type="text"
                        placeholder="Enter Clinician Name"
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

              <Form.Group className="grid-reg my-2" controlId="formPhone">
                <Form.Label>Phone Number</Form.Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <InputGroup>
                      <Form.Control
                        className="custom-input"
                        type="tel"
                        placeholder="Enter Phone Number"
                        {...field}
                        isInvalid={!!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone?.message}
                      </Form.Control.Feedback>
                    </InputGroup>
                  )}
                />
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
                      placeholder="Enter Email"
                      {...field}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="grid-reg my-2" controlId="formOrganization">
                <Form.Label>Organization</Form.Label>
                <Controller
                  name="organization"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      className="custom-select"
                      as="select"
                      {...field}
                      isInvalid={!!errors.organization}
                    >
                      <option value="">Select Organization</option>
                      {OrganizationList.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </Form.Control>
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.organization?.message}
                </Form.Control.Feedback>
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
                      placeholder="Enter Location"
                      {...field}
                    />
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
                      placeholder="Enter Address"
                      {...field}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="grid-reg my-2" controlId="formOccupation">
                <Form.Label>Occupation</Form.Label>
                <Controller
                  name="occupation"
                  control={control}
                  render={({ field }) => (
                    <Form.Control
                      className="custom-input"
                      type="text"
                      placeholder="Enter Occupation"
                      {...field}
                    />
                  )}
                />
              </Form.Group>

              <Form.Group className="d-flex justify-content-start mt-3">
                <Button type="submit" variant="primary">
                  Save Clinician
                </Button>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    );
  };

  return (
    <div className="p-3">
      {renderingFormView()}
    </div>
  );
}
