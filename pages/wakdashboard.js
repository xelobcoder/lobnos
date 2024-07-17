import React, { useState } from 'react';
import { Form, Button, Col, Row, Container, ListGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ApplicationHeader from '../components/Layout/HeaderNav';

const Dashboard = () => {
  const [customDateInit, setCustomDateInit] = useState({ date_of_record1: null, date_of_record2: null });
  const [showSummary, setShowSummary] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showCashBook, setShowCashBook] = useState(false);

  const handleDateChange = (date, field) => {
    setCustomDateInit({ ...customDateInit, [field]: date });
  };

  const loadAllData = () => {
    // Logic to load all data
  };

  const toggleSection = (setter) => () => {
    setter(prevState => !prevState);
  };

  // Dummy data
  const ListOfRevenueValue = "$5000";
  const ListOfExpensesValue = "$2000";
  const ListOfBalanceValue = "$3000";
  const ListOfCurrentRequestPaid = "$1000";
  const ListOfCurrentRetailPaid = "$500";
  const ListOfPreviousArrearsPaid = "$200";
  const ListOfRevenueInArrearsCount = 10;
  const ListOfRevenueInArrearsValue = "$1000";
  const ListOfRevenueInArrearsPaidValue = "$300";
  const ListOfRegistrationCount = 50;
  const ListOfRegistrationCountM = 30;
  const ListOfRegistrationCountF = 20;
  const ListOfInternalRegCount = 25;
  const ListOfInternalRegCountM = 15;
  const ListOfInternalRegCountF = 10;
  const ListOfExternalRegCount = 25;
  const ListOfExternalRegCountM = 15;
  const ListOfExternalRegCountF = 10;

  return (
    <div>
      <ApplicationHeader />
      <h5 className="flex-row-start">MTR12 Dashboard</h5>

      <div className="flex-row-end align-items-end">
        <div className="flex-row gap-0 pt-4">
          <Container className="flex-row gap-0">
            <Form>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3" controlId="txt1">
                    <Form.Control type="text" placeholder="Type your search here" onChange={() => { /* Add your logic */ }} />
                    <Form.Label>Type your search here</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <DatePicker
                      selected={customDateInit.date_of_record1}
                      onChange={(date) => handleDateChange(date, 'date_of_record1')}
                      className="form-control"
                      placeholderText="Date1"
                    />
                    <Form.Label>Date1</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <DatePicker
                      selected={customDateInit.date_of_record2}
                      onChange={(date) => handleDateChange(date, 'date_of_record2')}
                      className="form-control"
                      placeholderText="Date2"
                    />
                    <Form.Label>Date2</Form.Label>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Button className="form-control" onClick={loadAllData}>Load data</Button>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Container>
        </div>
      </div>

      <hr />

      <Container fluid className="ps-lg-3 pe-lg-3 ">
        <ListGroup horizontal className="d-sm-flex ">
          <ListGroup.Item>
            <Button className="flex-row-start p-4 " onClick={toggleSection(setShowSummary)}>
              {showSummary ? 'Hide Summary' : 'Show Summary'}
            </Button>
          </ListGroup.Item>
          <ListGroup.Item>
            <Button className="flex-row-start p-4 " onClick={toggleSection(setShowChart)}>
              {showChart ? 'Hide Chart' : 'Show Chart'}
            </Button>
          </ListGroup.Item>
          <ListGroup.Item>
            <Button className="flex-row-start p-4 " onClick={toggleSection(setShowRefund)}>
              {showRefund ? 'Hide Refund' : 'Show Refund'}
            </Button>
          </ListGroup.Item>
          <ListGroup.Item>
            <Button className="flex-row-start p-4 " onClick={toggleSection(setShowRequest)}>
              {showRequest ? 'Hide Request' : 'Show Request'}
            </Button>
          </ListGroup.Item>
          <ListGroup.Item>
            <Button className="flex-row-start p-4 " onClick={toggleSection(setShowCashBook)}>
              {showCashBook ? 'Hide Cash Book' : 'Show Cash Book'}
            </Button>
          </ListGroup.Item>
        </ListGroup>
      </Container>

      {showSummary && (
        <Container fluid>
          <div className="dashboard patient">
            <Container className="d-sm-flex">
              {/* Financial Summary */}
              <Container fluid>
                <ListGroup horizontal className="d-sm-flex">
                  <ListGroup.Item>
                    Total Revenue: <strong className="alert-secondary">{ListOfRevenueValue}</strong><br />
                    Total Expenses: <strong className="alert-secondary">{ListOfExpensesValue}</strong><br />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Balance: <strong className="alert-secondary">{ListOfBalanceValue}</strong><br />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Current Request Paid:<br />
                    Medical Request: <strong className="alert-secondary">{ListOfCurrentRequestPaid}</strong><br />
                    Retail: <strong className="alert-secondary">{ListOfCurrentRetailPaid}</strong><br />
                    Previous Arrears Paid: <strong className="alert-secondary">{ListOfPreviousArrearsPaid}</strong><br />
                  </ListGroup.Item>
                </ListGroup>
              </Container>
              {/* Request Arrears */}
              <Container fluid>
                <ListGroup horizontal className="d-sm-flex">
                  <ListGroup.Item>
                    Total In Arrears Count: <strong className="alert-secondary">{ListOfRevenueInArrearsCount}</strong><br />
                    Total In Arrears Value: <strong className="alert-secondary">{ListOfRevenueInArrearsValue}</strong><br />
                    Total In Arrears Paid Value: <strong className="alert-secondary">{ListOfRevenueInArrearsPaidValue}</strong><br />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong className="ps-1">New Patient Registration:</strong><br />
                    Total New Patient: <strong className="alert-secondary">{ListOfRegistrationCount}</strong><br />
                    Male: <strong className="alert-secondary">{ListOfRegistrationCountM}</strong><br />
                    Female: <strong className="alert-secondary">{ListOfRegistrationCountF}</strong><br />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong className="ps-1">Registrations Internal:</strong><br />
                    Total Internal: <strong className="alert-secondary">{ListOfInternalRegCount}</strong><br />
                    Male: <strong className="alert-secondary">{ListOfInternalRegCountM}</strong><br />
                    Female: <strong className="alert-secondary">{ListOfInternalRegCountF}</strong><br />
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong className="ps-1">Registrations External:</strong><br />
                    Total External: <strong className="alert-secondary">{ListOfExternalRegCount}</strong><br />
                    Male: <strong className="alert-secondary">{ListOfExternalRegCountM}</strong><br />
                    Female: <strong className="alert-secondary">{ListOfExternalRegCountF}</strong><br />
                  </ListGroup.Item>
                </ListGroup>
              </Container>
            </Container>
          </div>
          <hr />
        </Container>
      )}
    </div>
  );
};

export default Dashboard;
