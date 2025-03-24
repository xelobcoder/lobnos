import React, { useContext } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { Email, Phone, Cake, Wc, Work, Home, VerifiedUser, ViewAgenda, WhatsApp } from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import { useOperation } from "./ContextOperations/useOperation";

export default function OperationsPatientData() {
  const { operations } = useContext(useOperation);
  const { patientInfo, initDataLoading, showPatientData } = operations;
  const { firstname, lastname, email, dob, age, gender, mobile_number, organization, patientid, activation_status, whatappp, agetype } =
    operations.patientInfo;

  if (initDataLoading) return <h5>Loading............</h5>;

  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names.map((name) => name[0]).join("");
    return initials.toUpperCase();
  };

  if (!showPatientData) return;

  return (
    <>
      <section className="ui">
        <h5 className="d-flex justify-content-center">Basic Patient Data</h5>
        <div>
          <Row>
            <Col className="avatar-container d-flex justify-content-center p-3 text-uppercase d-flex align-content-center">
              <Avatar className=" bg-secondary " alt={`${firstname} ${lastname}`} src="" sx={{ width: 106, height: 106 }}>
                {getInitials(`${firstname} ${lastname}`)}
              </Avatar>
            </Col>
          </Row>
          <Row>
            <Col className="patient-info pointer">
              <Card.Title className="text-uppercase mx-4 bg-primary text-white my-2 text-center ">
                {firstname} {lastname}
              </Card.Title>
              <Card.Text className=" bg-light br-5 mx-3">
                <VerifiedUser /> ID: {patientid}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                <Email color="secondary" /> {email}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                <Phone color="primary" /> {mobile_number}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                <Cake color="warning" /> DOB: {new Date(dob).toLocaleDateString()}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                <Wc /> {gender}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                <Work /> {organization}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                <Home /> Status: {activation_status ? "Active" : "Inactive"}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                {" "}
                <ViewAgenda /> Age: {age} {agetype}
              </Card.Text>
              <Card.Text className=" bg-light br-5 mx-3">
                {" "}
                <WhatsApp color="success" /> {whatappp}
              </Card.Text>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
}
