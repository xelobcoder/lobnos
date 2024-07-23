import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { customPost, getDataAndUpdateState, handleChangeWithState } from "../../components/Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form } from 'react-bootstrap';

// Define the Yup schema for validation
const schema = yup.object().shape({
  name: yup.string().required("Clinician name is required"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Phone number must be 10 digits").required("Phone number is required"),
  email: yup.string().email("Invalid email address"),
  organization: yup.number(),
  location: yup.string(),
  address: yup.string(),
  occupation: yup.string()
});

export default function BasicInformationClinician({ method, toast, editing, editid, reset, updateItem }) {
  const [OrganizationList, setOrganization] = useState([]);
  const [isloading, setLoading] = useState(false);

  const defaultData = {
    id: editid,
    name: "",
    phone: "",
    email: "",
    organization: 0,
    location: "",
    address: "",
    occupation: "",
  };

  const { control, handleSubmit, reset: resetForm, formState: { errors } } = useForm({
    defaultValues: defaultData,
    resolver: yupResolver(schema),
  });

  const getClientForEdit = (originaldata) => {
    resetForm(originaldata);
  };

  const setDefault = () => {
    resetForm(defaultData);
  };

  const handleFormSubmit = async (data) => {
    const handleResponse = function (response) {
      const { statusCode, status, message } = response;
      if (statusCode === 200 && status === "success") {
        toast.success(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
        updateItem(data, 3);
        setDefault();
      } else {
        toast.error(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
      }
    };
    const response = await customPost("clinicians", method, data);
    handleResponse(response);
    reset();
  };

  useEffect(() => {
    if (editing && editid) {
      setLoading(true);
      getDataAndUpdateState(setData, `clinicians/getclinician?id=${editid}`, true)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            getClientForEdit(data[0]);
            setLoading(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
  }, [editid, editing]);

  useEffect(() => {
    getDataAndUpdateState(setOrganization, "organization");
  }, []);

  const renderingView = () => {
    if (isloading) return <Loader />;
    return (
      <Form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
        <div>
          <Form.Group className="grid-reg my-3" controlId="name">
            <Form.Label>Clinician Name</Form.Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder="Enter Clinician Name"
                    {...field}
                    isInvalid={!!errors.name}

                  />

                  <Form.Control.Feedback type="invalid">
                    {errors.name?.message}
                  </Form.Control.Feedback>

                </div>
              )}
            />

          </Form.Group>

          <Form.Group className="grid-reg my-3" controlId="phone">
            <Form.Label>Phone Number</Form.Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div>
                  <Form.Control
                    type="tel"
                    className="custom-input"
                    placeholder="Enter Phone Number"
                    maxLength={10}
                    minLength={10}
                    {...field}
                    isInvalid={!!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </div>
              )}
            />

          </Form.Group>

          <Form.Group className="grid-reg my-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="email"
                  className="custom-input"
                  placeholder="Enter Email"
                  {...field}
                  isInvalid={!!errors.email}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="grid-reg my-3" controlId="organization">
            <Form.Label>Organization</Form.Label>
            <Controller
              name="organization"
              control={control}
              render={({ field }) => (
                <Form.Control
                  as="select"
                  className="custom-select"
                  {...field}
                  isInvalid={!!errors.organization}
                >
                  <option value="">Select Organization</option>
                  {OrganizationList.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Form.Control>
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.organization?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="grid-reg my-3" controlId="location">
            <Form.Label>Location</Form.Label>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  className="custom-input"
                  placeholder="Enter Location"
                  {...field}
                  isInvalid={!!errors.location}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.location?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="grid-reg my-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <Form.Control
                  type="text"
                  className="custom-input"
                  placeholder="Enter Address"
                  {...field}
                  isInvalid={!!errors.address}
                />
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="grid-reg my-3" controlId="occupation">
            <Form.Label>Occupation</Form.Label>
            <Controller
              name="occupation"
              control={control}
              render={({ field }) => (
                <Form.Control
                  as="select"
                  className="custom-select"
                  {...field}
                  isInvalid={!!errors.occupation}
                >
                  <option value="">Select occupation</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="therapist">Therapist</option>
                  <option value="other">Other</option>
                </Form.Control>
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.occupation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </div>
        <Button type="submit" variant="primary" className="btn-sm mt-2">
          Submit
        </Button>
      </Form>
    );
  };

  return <>{renderingView()}</>;
}
