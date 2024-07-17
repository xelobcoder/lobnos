import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'next/image';

export default function CompanyProfile() {
  const defaultdata = {
    name: '',
    email: '',
    phonenumber: '',
    motto: '',
    address: '',
    website: '',
    street: '',
    alternativeNumber: ''
  };

  const [companydata, setcompanyData] = useState(defaultdata);
  const [selectedImage, setSelectedImages] = useState(null);

  const handleData = async (ev) => {
    try {
      const Okay = Object.keys(companydata).filter(e => companydata[e] === '');
      const rightMobile = companydata.phonenumber.length === 10 && companydata.phonenumber[0] === '0';
      if (Okay.length === 0 && rightMobile) {
        let turn = await customPost('settings/companyprofile', 'POST', companydata);
        if (turn?.status === 'success') {
          setcompanyData(defaultdata);
          alert('Updated successfully');
        }
      } else {
        if (!rightMobile) {
          alert('Incorrect Phone Number');
        } else {
          alert(`${Okay.join(', ')} field inputs are required`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedImages(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${process.env.BASEURL}/settings/companyprofile/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('File uploaded successfully');
      } else {
        console.error('Error uploading file:', response.statusText);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch('settings/companyprofile');
        setcompanyData(response);

        const imageResponse = await fetch(`${process.env.BASEURL}/settings/companyprofile/images`);
        if (imageResponse.ok) {
          const imageBlob = await imageResponse.blob();
          setSelectedImages(URL.createObjectURL(imageBlob));
        } else {
          console.error('Error fetching image:', imageResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <MainSettingsLayoutView>
      <Card>
        <Card.Header style={{ backgroundColor: 'whitesmoke' }}>
          <h4 className='text-capitalize'>Upload Company Information</h4>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row >
              <Form.Group as={Col} controlId="formGridName">
                <Form.Label >Name</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  value={companydata.name}
                  onChange={(e) => setcompanyData({ ...companydata, name: e.target.value })}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridEmail">
                <Form.Label >Email</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="email"
                  value={companydata.email}
                  onChange={(e) => setcompanyData({ ...companydata, email: e.target.value })}
                />
              </Form.Group>
            </Row>

            <Row >
              <Form.Group as={Col} controlId="formGridAddress">
                <Form.Label >Address</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  value={companydata.address}
                  onChange={(e) => setcompanyData({ ...companydata, address: e.target.value })}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridMotto">
                <Form.Label >Motto</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  value={companydata.motto}
                  onChange={(e) => setcompanyData({ ...companydata, motto: e.target.value })}
                />
              </Form.Group>
            </Row>

            <Row >
              <Form.Group as={Col} controlId="formGridPhoneNumber">
                <Form.Label >Phone Number</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="tel"
                  value={companydata.phonenumber}
                  maxLength={10}
                  onChange={(e) => setcompanyData({ ...companydata, phonenumber: e.target.value })}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridStreet">
                <Form.Label >Street</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  value={companydata.street}
                  onChange={(e) => setcompanyData({ ...companydata, street: e.target.value })}
                />
              </Form.Group>
            </Row>

            <Row >
              <Form.Group as={Col} controlId="formGridAltNumber">
                <Form.Label >Alternative Number</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  value={companydata.alternativeNumber}
                  onChange={(e) => setcompanyData({ ...companydata, alternativeNumber: e.target.value })}
                />
              </Form.Group>

              <Form.Group as={Col} controlId="formGridWebsite">
                <Form.Label >Website</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  value={companydata.website}
                  onChange={(e) => setcompanyData({ ...companydata, website: e.target.value })}
                />
              </Form.Group>
            </Row>

            <Row >
              <Form.Group as={Col} controlId="formGridImage">
                <Form.Label >Upload Images</Form.Label>
                <div {...getRootProps({ className: 'dropzone' })} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}>
                  <input {...getInputProps()} />
                  {selectedImage ? (
                    <Image src={selectedImage} width='100' height='500' alt="Preview" style={{ width: '100%', height: '500px' }} />
                  ) : (
                    <p>Drag & drop an image here, or click to select an image</p>
                  )}
                </div>
              </Form.Group>
            </Row>
          </Form>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary" onClick={handleData}>
            Save Information
          </Button>
        </Card.Footer>
      </Card>
    </MainSettingsLayoutView>
  );
}
